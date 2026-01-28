<?php
// ====================================================
// CONTROLADOR DE TRANSACCIONES (PHP VERSION)
// Version: 3.1 - CRUD Operations with PDO
// Archivo: api/controllers/TransaccionesController.php
// Última modificación: 2024-11-10
// ====================================================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/AuthController.php';

class TransaccionesController {

    // Constantes SQL para cálculo de pagos
    const SQL_FECHA_CORTE_ACTUAL = "
        LEAST(
            LAST_DAY(CURDATE()),
            DATE_FORMAT(CURDATE(), CONCAT('%Y-%m-', LPAD(DAY(a.fecha_inscripcion), 2, '0')))
        )
    ";

    const SQL_PROXIMO_PAGO = "
        CASE
            WHEN CURDATE() >= " . self::SQL_FECHA_CORTE_ACTUAL . "
            THEN LEAST(
                LAST_DAY(DATE_ADD(CURDATE(), INTERVAL 1 MONTH)),
                DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), CONCAT('%Y-%m-', LPAD(DAY(a.fecha_inscripcion), 2, '0')))
            )
            ELSE " . self::SQL_FECHA_CORTE_ACTUAL . "
        END
    ";

    // Obtener todas las transacciones con filtros
    public static function getTransacciones() {
        AuthController::requireAuth();

        try {
            $tipo = $_GET['tipo'] ?? null;
            $empresa_id = $_GET['empresa_id'] ?? null;
            $socio = $_GET['socio'] ?? null;
            $fechaInicio = $_GET['fechaInicio'] ?? null;
            $fechaFin = $_GET['fechaFin'] ?? null;
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 1000;

            $query = "
                SELECT
                    t.*,
                    e.nombre as nombre_empresa
                FROM transacciones t
                LEFT JOIN empresas e ON t.empresa_id = e.id
                WHERE 1=1
            ";
            $params = [];

            // Filtros
            if ($tipo && in_array($tipo, ['G', 'I'])) {
                $query .= ' AND t.tipo = ?';
                $params[] = $tipo;
            }

            if ($empresa_id) {
                $query .= ' AND t.empresa_id = ?';
                $params[] = $empresa_id;
            }

            if ($socio) {
                $query .= ' AND t.socio LIKE ?';
                $params[] = "%$socio%";
            }

            if ($fechaInicio) {
                $query .= ' AND t.fecha >= ?';
                $params[] = $fechaInicio;
            }

            if ($fechaFin) {
                $query .= ' AND t.fecha <= ?';
                $params[] = $fechaFin;
            }

            $query .= ' ORDER BY t.fecha DESC, t.id DESC';

            // Paginación
            $offset = ($page - 1) * $limit;
            $query .= ' LIMIT ? OFFSET ?';
            $params[] = (int)$limit;
            $params[] = (int)$offset;

            $transacciones = executeQuery($query, $params);

            // Contar total
            $countQuery = "SELECT COUNT(*) as total FROM transacciones t WHERE 1=1";
            $countParams = array_slice($params, 0, -2);

            if ($tipo && in_array($tipo, ['G', 'I'])) $countQuery .= ' AND t.tipo = ?';
            if ($empresa_id) $countQuery .= ' AND t.empresa_id = ?';
            if ($socio) $countQuery .= ' AND t.socio LIKE ?';
            if ($fechaInicio) $countQuery .= ' AND t.fecha >= ?';
            if ($fechaFin) $countQuery .= ' AND t.fecha <= ?';

            $totalCount = executeQuery($countQuery, $countParams);

            echo json_encode([
                'success' => true,
                'data' => $transacciones,
                'pagination' => [
                    'page' => (int)$page,
                    'limit' => (int)$limit,
                    'total' => (int)$totalCount[0]['total'],
                    'pages' => ceil($totalCount[0]['total'] / $limit)
                ]
            ]);

        } catch (Exception $e) {
            error_log("Error al obtener transacciones: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno del servidor'
            ]);
        }
    }

    // Crear nueva transacción
    public static function createTransaccion() {
        $user = AuthController::requireAuth();

        // Security: Only allow authorized roles to create transactions
        $authorizedRoles = ['admin', 'editor', 'escuela@rockstarskull.com'];
        if (!in_array($user['rol'], $authorizedRoles) && $user['email'] !== 'escuela@rockstarskull.com') {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'No tienes permisos para crear transacciones'
            ]);
            return;
        }

        try {
            $input = json_decode(file_get_contents('php://input'), true);

            $fecha = $input['fecha'] ?? null;
            $concepto = $input['concepto'] ?? null;
            $empresa_id = $input['empresa_id'] ?? null;
            $forma_pago = $input['forma_pago'] ?? null;
            $cantidad = $input['cantidad'] ?? null;
            $precio_unitario = $input['precio_unitario'] ?? null;
            $tipo = $input['tipo'] ?? null;

            // Validaciones
            if (!$fecha || !$concepto || !$empresa_id || !$forma_pago || !$cantidad || !$precio_unitario || !$tipo) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Faltan campos requeridos'
                ]);
                return;
            }

            if (!in_array($tipo, ['G', 'I'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Tipo debe ser G (gasto) o I (ingreso)'
                ]);
                return;
            }

            // FIX: Use the socio from the input, fallback to the user's name
            $socio = $input['socio'] ?? $user['nombre'];
            $created_by = $user['id'];

            $query = "
                INSERT INTO transacciones (
                    fecha, concepto, socio, empresa_id, forma_pago,
                    cantidad, precio_unitario, tipo, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ";

            $insertId = executeInsert($query, [
                $fecha, $concepto, $socio, $empresa_id, $forma_pago,
                $cantidad, $precio_unitario, $tipo, $created_by
            ]);

            // Actualizar fecha_ultimo_pago si es un pago de alumno
            if ($tipo === 'I' && $concepto && $empresa_id == 1) {
                self::actualizarFechaUltimoPago($concepto, $fecha);
            }

            // Obtener la transacción recién creada
            $nuevaTransaccion = executeQuery("
                SELECT t.*, e.nombre as nombre_empresa
                FROM transacciones t
                LEFT JOIN empresas e ON t.empresa_id = e.id
                WHERE t.id = ?
            ", [$insertId]);

            error_log("✅ " . ($tipo === 'G' ? 'Gasto' : 'Ingreso') . " creado: $concepto - $" . ($cantidad * $precio_unitario));

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => ($tipo === 'G' ? 'Gasto' : 'Ingreso') . ' registrado exitosamente',
                'data' => $nuevaTransaccion[0]
            ]);

        } catch (Exception $e) {
            error_log("Error al crear transacción: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno del servidor'
            ]);
        }
    }

    // Actualizar transacción
    public static function updateTransaccion($id) {
        $user = AuthController::requireAuth();

        try {
            $input = json_decode(file_get_contents('php://input'), true);

            $fecha = $input['fecha'] ?? null;
            $concepto = $input['concepto'] ?? null;
            $empresa_id = $input['empresa_id'] ?? null;
            $forma_pago = $input['forma_pago'] ?? null;
            $cantidad = $input['cantidad'] ?? null;
            $precio_unitario = $input['precio_unitario'] ?? null;
            $tipo = $input['tipo'] ?? null;

            // Verificar que la transacción existe
            // Allow admin and viewer roles to bypass created_by check
            $bypassCreatedByCheck = in_array($user['rol'], ['admin', 'viewer']);
            $queryCheck = $bypassCreatedByCheck
                ? 'SELECT * FROM transacciones WHERE id = ?'
                : 'SELECT * FROM transacciones WHERE id = ? AND created_by = ?';
            $paramsCheck = $bypassCreatedByCheck ? [$id] : [$id, $user['id']];

            $existeTransaccion = executeQuery($queryCheck, $paramsCheck);

            if (empty($existeTransaccion)) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Transacción no encontrada'
                ]);
                return;
            }

            $query = $bypassCreatedByCheck
                ? "UPDATE transacciones SET
                    fecha = ?, concepto = ?, empresa_id = ?, forma_pago = ?,
                    cantidad = ?, precio_unitario = ?, tipo = ?
                WHERE id = ?"
                : "UPDATE transacciones SET
                    fecha = ?, concepto = ?, empresa_id = ?, forma_pago = ?,
                    cantidad = ?, precio_unitario = ?, tipo = ?
                WHERE id = ? AND created_by = ?";

            $queryParams = $bypassCreatedByCheck
                ? [$fecha, $concepto, $empresa_id, $forma_pago, $cantidad, $precio_unitario, $tipo, $id]
                : [$fecha, $concepto, $empresa_id, $forma_pago, $cantidad, $precio_unitario, $tipo, $id, $user['id']];

            executeUpdate($query, $queryParams);

            // Actualizar fecha_ultimo_pago si es un pago de alumno
            if ($tipo === 'I' && $concepto && $empresa_id == 1) {
                self::actualizarFechaUltimoPago($concepto, $fecha);
            }

            error_log("✅ Transacción $id actualizada por {$user['nombre']}");

            echo json_encode([
                'success' => true,
                'message' => 'Transacción actualizada exitosamente'
            ]);

        } catch (Exception $e) {
            error_log("Error al actualizar transacción: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno del servidor'
            ]);
        }
    }

    // Eliminar transacción
    public static function deleteTransaccion($id) {
        $user = AuthController::requireAuth();

        try {
            // Allow admin and viewer roles to bypass created_by check
            $bypassCreatedByCheck = in_array($user['rol'], ['admin', 'viewer']);
            $queryCheck = $bypassCreatedByCheck
                ? 'SELECT concepto, tipo FROM transacciones WHERE id = ?'
                : 'SELECT concepto, tipo FROM transacciones WHERE id = ? AND created_by = ?';
            $paramsCheck = $bypassCreatedByCheck ? [$id] : [$id, $user['id']];

            $existeTransaccion = executeQuery($queryCheck, $paramsCheck);

            if (empty($existeTransaccion)) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Transacción no encontrada'
                ]);
                return;
            }

            $deleteQuery = $bypassCreatedByCheck
                ? 'DELETE FROM transacciones WHERE id = ?'
                : 'DELETE FROM transacciones WHERE id = ? AND created_by = ?';
            $deleteParams = $bypassCreatedByCheck ? [$id] : [$id, $user['id']];

            executeUpdate($deleteQuery, $deleteParams);

            error_log("✅ Transacción eliminada: {$existeTransaccion[0]['concepto']} ({$existeTransaccion[0]['tipo']})");

            echo json_encode([
                'success' => true,
                'message' => 'Transacción eliminada exitosamente'
            ]);

        } catch (Exception $e) {
            error_log("Error al eliminar transacción: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno del servidor'
            ]);
        }
    }

    // Obtener resumen de transacciones
    public static function getResumen() {
        AuthController::requireAuth();

        try {
            $empresa_id = $_GET['empresa_id'] ?? null;
            $fechaInicio = $_GET['fechaInicio'] ?? null;
            $fechaFin = $_GET['fechaFin'] ?? null;

            $whereClause = 'WHERE 1=1';
            $params = [];

            if ($empresa_id) {
                $whereClause .= ' AND empresa_id = ?';
                $params[] = $empresa_id;
            }

            if ($fechaInicio) {
                $whereClause .= ' AND fecha >= ?';
                $params[] = $fechaInicio;
            }

            if ($fechaFin) {
                $whereClause .= ' AND fecha <= ?';
                $params[] = $fechaFin;
            }

            $resumenQuery = "
                SELECT
                    CASE
                        WHEN tipo = 'I' THEN 'ingresos'
                        WHEN tipo = 'G' THEN 'gastos'
                    END as categoria,
                    SUM(total) as total_monto,
                    COUNT(*) as cantidad
                FROM transacciones $whereClause
                GROUP BY tipo
            ";

            $resultados = executeQuery($resumenQuery, $params);

            $resumen = [
                'ingresos' => 0,
                'gastos' => 0,
                'balance' => 0,
                'total_transacciones' => 0
            ];

            foreach ($resultados as $row) {
                if ($row['categoria'] === 'ingresos') {
                    $resumen['ingresos'] = floatval($row['total_monto'] ?? 0);
                    $resumen['total_transacciones'] += $row['cantidad'] ?? 0;
                } else if ($row['categoria'] === 'gastos') {
                    $resumen['gastos'] = floatval($row['total_monto'] ?? 0);
                    $resumen['total_transacciones'] += $row['cantidad'] ?? 0;
                }
            }

            $resumen['balance'] = $resumen['ingresos'] - $resumen['gastos'];

            echo json_encode([
                'success' => true,
                'data' => $resumen,
                'filtros_aplicados' => [
                    'empresa_id' => $empresa_id ?? null,
                    'fecha_inicio' => $fechaInicio ?? null,
                    'fecha_fin' => $fechaFin ?? null
                ]
            ]);

        } catch (Exception $e) {
            error_log("Error al obtener resumen: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno del servidor'
            ]);
        }
    }

    // Obtener empresas
    public static function getEmpresas() {
        AuthController::requireAuth();

        try {
            $empresas = executeQuery(
                'SELECT id, nombre, tipo_negocio FROM empresas WHERE activa = TRUE ORDER BY nombre'
            );

            echo json_encode([
                'success' => true,
                'data' => $empresas
            ]);

        } catch (Exception $e) {
            error_log("Error al obtener empresas: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno del servidor'
            ]);
        }
    }

    // Obtener lista de alumnos
    public static function getAlumnos() {
        AuthController::requireAuth();

        try {
            error_log("👥 Obteniendo lista completa de alumnos...");

            $empresa_id = $_GET['empresa_id'] ?? 1;
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 10;
            $estatus = $_GET['estatus'] ?? null;
            $maestro_id = $_GET['maestro_id'] ?? null;
            $clase = $_GET['clase'] ?? null;

            $offset = ((int)$page - 1) * (int)$limit;

            $whereClause = 'WHERE a.empresa_id = ? AND a.nombre NOT LIKE ?';
            $params = [$empresa_id, '[ELIMINADO]%'];

            if ($estatus) {
                $whereClause .= ' AND a.estatus = ?';
                $params[] = $estatus;
            }

            if ($maestro_id) {
                if (is_numeric($maestro_id)) {
                    $whereClause .= ' AND a.maestro_id = ?';
                    $params[] = $maestro_id;
                } else {
                    $whereClause .= ' AND m.nombre = ?';
                    $params[] = $maestro_id;
                }
            }

            if ($clase) {
                $whereClause .= ' AND a.clase = ?';
                $params[] = $clase;
            }

            $alumnos = executeQuery("
                SELECT
                    a.id,
                    a.nombre,
                    a.edad,
                    a.telefono,
                    a.email,
                    a.clase,
                    a.tipo_clase,
                    a.horario,
                    a.fecha_inscripcion,
                    a.fecha_ultimo_pago,
                    a.promocion,
                    COALESCE(a.precio_mensual, 0) as precio_mensual,
                    a.forma_pago,
                    a.domiciliado,
                    a.estatus,
                    COALESCE(m.nombre, 'Sin asignar') as maestro
                FROM alumnos a
                LEFT JOIN maestros m ON a.maestro_id = m.id
                $whereClause
                ORDER BY a.nombre
                LIMIT ? OFFSET ?
            ", array_merge($params, [(int)$limit, (int)$offset]));

            $countResult = executeQuery("
                SELECT COUNT(*) as total
                FROM alumnos a
                LEFT JOIN maestros m ON a.maestro_id = m.id
                $whereClause
            ", $params);

            $total = $countResult[0]['total'];
            $totalPages = ceil($total / (int)$limit);

            error_log("✅ " . count($alumnos) . " alumnos obtenidos (página $page de $totalPages)");

            echo json_encode([
                'success' => true,
                'data' => $alumnos,
                'pagination' => [
                    'current_page' => (int)$page,
                    'total_pages' => $totalPages,
                    'total_records' => (int)$total,
                    'records_per_page' => (int)$limit,
                    'has_next' => (int)$page < $totalPages,
                    'has_prev' => (int)$page > 1
                ]
            ]);

        } catch (Exception $e) {
            error_log("Error obteniendo alumnos: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Crear un nuevo alumno
     * POST /alumnos
     */
    public static function createAlumno() {
        $user = AuthController::requireAuth();

        // Solo admins o escuela@rockstarskull.com pueden crear alumnos
        if (!in_array($user['rol'], ['admin']) && $user['email'] !== 'escuela@rockstarskull.com') {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No tienes permisos para crear alumnos.']);
            return;
        }

        try {
            $input = json_decode(file_get_contents('php://input'), true);

            error_log("➕ Creando nuevo alumno por usuario: " . $user['email']);
            error_log("📥 Datos recibidos: " . json_encode($input));

            // Validar campo obligatorio
            if (empty($input['nombre'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'El nombre del alumno es obligatorio']);
                return;
            }

            $nombre = trim($input['nombre']);
            $edad = isset($input['edad']) ? (int)$input['edad'] : null;
            $telefono = $input['telefono'] ?? null;
            $email = $input['email'] ?? null;
            $fecha_inscripcion = $input['fecha_inscripcion'] ?? date('Y-m-d');
            $clase = $input['clase'] ?? null;
            $tipo_clase = $input['tipo_clase'] ?? 'Individual';
            $maestro_id = !empty($input['maestro_id']) ? (int)$input['maestro_id'] : null;
            $horario = $input['horario'] ?? null;
            $estatus = $input['estatus'] ?? 'Activo';
            $promocion = $input['promocion'] ?? null;
            $precio_mensual = isset($input['precio_mensual']) ? (float)$input['precio_mensual'] : null;
            $forma_pago = $input['forma_pago'] ?? null;
            $domiciliado = !empty($input['domiciliado']) ? 1 : 0;
            $titular_domicilado = $input['titular_domicilado'] ?? null;
            $empresa_id = $input['empresa_id'] ?? 1;

            executeQuery("
                INSERT INTO alumnos (
                    nombre, edad, telefono, email, fecha_inscripcion,
                    clase, tipo_clase, maestro_id, horario, estatus,
                    promocion, precio_mensual, forma_pago, domiciliado,
                    titular_domicilado, empresa_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ", [
                $nombre, $edad, $telefono, $email, $fecha_inscripcion,
                $clase, $tipo_clase, $maestro_id, $horario, $estatus,
                $promocion, $precio_mensual, $forma_pago, $domiciliado,
                $titular_domicilado, $empresa_id
            ]);

            // Obtener el alumno recién creado
            $nuevoAlumno = executeQuery("
                SELECT
                    a.id, a.nombre, a.edad, a.telefono, a.email,
                    a.clase, a.tipo_clase, a.horario, a.fecha_inscripcion,
                    a.fecha_ultimo_pago, a.promocion, a.precio_mensual,
                    a.forma_pago, a.domiciliado, a.titular_domicilado,
                    a.estatus,
                    COALESCE(m.nombre, 'Sin asignar') as maestro
                FROM alumnos a
                LEFT JOIN maestros m ON a.maestro_id = m.id
                WHERE a.id = LAST_INSERT_ID()
            ");

            error_log("✅ Alumno creado: $nombre");

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Alumno registrado exitosamente',
                'data' => !empty($nuevoAlumno) ? $nuevoAlumno[0] : null
            ]);

        } catch (Exception $e) {
            error_log("❌ Error creando alumno: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error interno del servidor',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Eliminar (soft delete) un alumno
     * DELETE /alumnos/{id}
     */
    public static function deleteAlumno($id) {
        $user = AuthController::requireAuth();

        // Solo admins o escuela@rockstarskull.com pueden eliminar alumnos
        if ($user['rol'] !== 'admin' && $user['email'] !== 'escuela@rockstarskull.com') {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No tienes permisos para eliminar alumnos']);
            return;
        }

        try {
            error_log("🗑️ Eliminando alumno ID: $id por usuario: " . $user['email']);

            // Verificar que el alumno existe
            $alumno = executeQuery("SELECT id, nombre FROM alumnos WHERE id = ?", [$id]);

            if (empty($alumno)) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Alumno no encontrado']);
                return;
            }

            $nombreOriginal = $alumno[0]['nombre'];

            // Soft delete: renombrar con prefijo [ELIMINADO]
            executeQuery("
                UPDATE alumnos SET
                    nombre = CONCAT('[ELIMINADO] ', nombre),
                    estatus = 'Baja'
                WHERE id = ?
            ", [$id]);

            error_log("✅ Alumno eliminado (soft): $nombreOriginal (ID: $id)");

            echo json_encode([
                'success' => true,
                'message' => "Alumno \"$nombreOriginal\" eliminado exitosamente"
            ]);

        } catch (Exception $e) {
            error_log("❌ Error eliminando alumno: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error interno del servidor',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Actualizar datos de un alumno
     * PUT /alumnos/{id}
     */
    public static function updateAlumno($id) {
        $user = AuthController::requireAuth();

        // Security: Only admins or escuela@rockstarskull.com can update students
        $allowedRoles = ['admin', 'escuela@rockstarskull.com'];
        if (!in_array($user['rol'], $allowedRoles) && $user['email'] !== 'escuela@rockstarskull.com') {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No tienes permisos para actualizar alumnos.']);
            return;
        }

        try {
            $input = json_decode(file_get_contents('php://input'), true);

            error_log("✏️ Actualizando alumno ID: $id por usuario: " . $user['email']);
            error_log("📥 Datos recibidos: " . json_encode($input));

            // Validar que el alumno existe
            $alumnoExistente = executeQuery("
                SELECT id, nombre FROM alumnos WHERE id = ?
            ", [$id]);

            if (empty($alumnoExistente)) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Alumno no encontrado'
                ]);
                return;
            }

            // Construir query UPDATE dinámicamente
            $fields = [];
            $params = [];

            if (isset($input['nombre'])) {
                $fields[] = 'nombre = ?';
                $params[] = $input['nombre'];
            }
            if (isset($input['edad'])) {
                $fields[] = 'edad = ?';
                $params[] = $input['edad'];
            }
            if (isset($input['telefono'])) {
                $fields[] = 'telefono = ?';
                $params[] = $input['telefono'];
            }
            if (isset($input['email'])) {
                $fields[] = 'email = ?';
                $params[] = $input['email'];
            }
            if (isset($input['fecha_inscripcion'])) {
                $fields[] = 'fecha_inscripcion = ?';
                $params[] = $input['fecha_inscripcion'];
            }
            if (isset($input['clase'])) {
                $fields[] = 'clase = ?';
                $params[] = $input['clase'];
            }
            if (isset($input['tipo_clase'])) {
                $fields[] = 'tipo_clase = ?';
                $params[] = $input['tipo_clase'];
            }
            if (isset($input['maestro_id'])) {
                $fields[] = 'maestro_id = ?';
                $params[] = $input['maestro_id'] ?: null;
            }
            if (isset($input['horario'])) {
                $fields[] = 'horario = ?';
                $params[] = $input['horario'];
            }
            if (isset($input['estatus'])) {
                $fields[] = 'estatus = ?';
                $params[] = $input['estatus'];
            }
            if (isset($input['promocion'])) {
                $fields[] = 'promocion = ?';
                $params[] = $input['promocion'];
            }
            if (isset($input['precio_mensual'])) {
                $fields[] = 'precio_mensual = ?';
                $params[] = $input['precio_mensual'];
            }
            if (isset($input['forma_pago'])) {
                $fields[] = 'forma_pago = ?';
                $params[] = $input['forma_pago'];
            }
            if (isset($input['domiciliado'])) {
                $fields[] = 'domiciliado = ?';
                $params[] = $input['domiciliado'] ? 1 : 0;
            }
            if (isset($input['titular_domicilado'])) {
                $fields[] = 'titular_domicilado = ?';
                $params[] = $input['titular_domicilado'];
            }
            // Compatibilidad con nombre_domiciliado (legacy)
            if (isset($input['nombre_domiciliado'])) {
                $fields[] = 'titular_domicilado = ?';
                $params[] = $input['nombre_domiciliado'];
            }

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'No hay campos para actualizar'
                ]);
                return;
            }

            // Agregar ID al final de params
            $params[] = $id;

            $query = "UPDATE alumnos SET " . implode(', ', $fields) . " WHERE id = ?";

            executeQuery($query, $params);

            // Obtener alumno actualizado
            $alumnoActualizado = executeQuery("
                SELECT
                    a.id,
                    a.nombre,
                    a.edad,
                    a.telefono,
                    a.email,
                    a.clase,
                    a.tipo_clase,
                    a.horario,
                    a.fecha_inscripcion,
                    a.fecha_ultimo_pago,
                    a.promocion,
                    a.precio_mensual,
                    a.forma_pago,
                    a.domiciliado,
                    a.titular_domicilado,
                    a.estatus,
                    COALESCE(m.nombre, 'Sin asignar') as maestro
                FROM alumnos a
                LEFT JOIN maestros m ON a.maestro_id = m.id
                WHERE a.id = ?
            ", [$id]);

            error_log("✅ Alumno actualizado: " . $input['nombre']);

            echo json_encode([
                'success' => true,
                'message' => 'Alumno actualizado exitosamente',
                'data' => $alumnoActualizado[0]
            ]);

        } catch (Exception $e) {
            error_log("❌ Error actualizando alumno: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error interno del servidor',
                'message' => $e->getMessage()
            ]);
        }
    }

    // Helper: Actualizar fecha último pago
    private static function actualizarFechaUltimoPago($concepto, $fecha) {
        try {
            error_log("💰 Intentando actualizar fecha_ultimo_pago...");

            $match = [];
            if (preg_match('/(?:Mensualidad\s+clase\s+de\s+\w+\s+)?[GI]\s+(.+?)(?:\s*,|$)/i', $concepto, $match)) {
                $nombreExtraido = trim($match[1]);
                error_log("👤 Nombre extraído: $nombreExtraido");

                $alumnos = executeQuery("
                    SELECT id, nombre
                    FROM alumnos
                    WHERE empresa_id = 1
                        AND (
                            nombre = ?
                            OR REPLACE(nombre, '  ', ' ') = ?
                        )
                    LIMIT 1
                ", [$nombreExtraido, $nombreExtraido]);

                if (empty($alumnos)) {
                    $alumnos = executeQuery("
                        SELECT id, nombre
                        FROM alumnos
                        WHERE empresa_id = 1
                            AND nombre LIKE ?
                        ORDER BY
                            CASE
                                WHEN nombre = ? THEN 1
                                WHEN nombre LIKE CONCAT(?, '%') THEN 2
                                ELSE 3
                            END
                        LIMIT 1
                    ", ["%$nombreExtraido%", $nombreExtraido, $nombreExtraido]);
                }

                if (!empty($alumnos)) {
                    $alumnoId = $alumnos[0]['id'];
                    $alumnoNombre = $alumnos[0]['nombre'];

                    executeUpdate("
                        UPDATE alumnos
                        SET fecha_ultimo_pago = ?
                        WHERE id = ?
                    ", [$fecha, $alumnoId]);

                    error_log("✅ fecha_ultimo_pago actualizada para: $alumnoNombre -> $fecha");
                } else {
                    error_log("⚠️ No se encontró alumno con nombre: \"$nombreExtraido\"");
                }
            }
        } catch (Exception $e) {
            error_log("❌ Error actualizando fecha_ultimo_pago: " . $e->getMessage());
        }
    }

    // Métodos helpers para gastos e ingresos
    public static function getGastos() {
        $_GET['tipo'] = 'G';
        self::getTransacciones();
    }

    public static function getIngresos() {
        $_GET['tipo'] = 'I';
        self::getTransacciones();
    }

    public static function createGasto() {
        $input = json_decode(file_get_contents('php://input'), true);
        $input['tipo'] = 'G';
        file_put_contents('php://input', json_encode($input));
        self::createTransaccion();
    }

    public static function createIngreso() {
        $input = json_decode(file_get_contents('php://input'), true);
        $input['tipo'] = 'I';
        file_put_contents('php://input', json_encode($input));
        self::createTransaccion();
    }

    // ============================================================
    // DASHBOARD ESPECÍFICO - ENDPOINTS PARA ALUMNOS
    // ============================================================

    /**
     * Obtener estadísticas completas de alumnos para el dashboard
     * Incluye: total, activos, bajas, distribución por clase y maestro, métricas
     */
    public static function getDashboardAlumnos() {
        AuthController::requireAuth();

        try {
            error_log("📊 Obteniendo estadísticas de dashboard alumnos...");

            $empresa_id = $_GET['empresa_id'] ?? 1;

            // 1. ESTADÍSTICAS GENERALES
            $statsQuery = "
                SELECT
                    COUNT(*) as total_alumnos,
                    SUM(CASE WHEN estatus = 'Activo' THEN 1 ELSE 0 END) as alumnos_activos,
                    SUM(CASE WHEN estatus = 'Baja' THEN 1 ELSE 0 END) as alumnos_bajas
                FROM alumnos
                WHERE empresa_id = ?
                    AND nombre NOT LIKE '[ELIMINADO]%'
            ";
            $stats = executeQuery($statsQuery, [$empresa_id]);
            $estadisticas = [
                'total_alumnos' => (int)($stats[0]['total_alumnos'] ?? 0),
                'alumnos_activos' => (int)($stats[0]['alumnos_activos'] ?? 0),
                'alumnos_bajas' => (int)($stats[0]['alumnos_bajas'] ?? 0)
            ];

            // 2. DISTRIBUCIÓN POR CLASE
            $clasesQuery = "
                SELECT
                    clase,
                    COUNT(*) as total_alumnos,
                    SUM(CASE WHEN estatus = 'Activo' THEN 1 ELSE 0 END) as activos,
                    SUM(CASE WHEN estatus = 'Baja' THEN 1 ELSE 0 END) as inactivos
                FROM alumnos
                WHERE empresa_id = ?
                    AND nombre NOT LIKE '[ELIMINADO]%'
                    AND clase IS NOT NULL
                    AND clase != ''
                GROUP BY clase
                ORDER BY total_alumnos DESC
            ";
            $distribucion_clases = executeQuery($clasesQuery, [$empresa_id]);

            // 3. DISTRIBUCIÓN POR MAESTRO - Contadores de alumnos
            $maestrosQuery = "
                SELECT
                    COALESCE(m.nombre, 'Sin asignar') as maestro,
                    COALESCE(a.clase, 'Sin clase') as especialidad,
                    SUM(CASE WHEN a.estatus = 'Activo' THEN 1 ELSE 0 END) as alumnos_activos,
                    SUM(CASE WHEN a.estatus = 'Baja' THEN 1 ELSE 0 END) as alumnos_bajas
                FROM alumnos a
                LEFT JOIN maestros m ON a.maestro_id = m.id
                WHERE a.empresa_id = ?
                    AND a.nombre NOT LIKE '[ELIMINADO]%'
                GROUP BY m.nombre, a.clase
                HAVING alumnos_activos > 0 OR alumnos_bajas > 0
                ORDER BY alumnos_activos DESC, maestro
            ";
            $distribucion_maestros = executeQuery($maestrosQuery, [$empresa_id]);

            // 3b. INGRESOS REALES desde transacciones (suma de pagos históricos)
            $ingresosQuery = "
                SELECT
                    t.socio as maestro,
                    al.estatus,
                    SUM(t.total) as total_ingresos
                FROM transacciones t
                INNER JOIN alumnos al ON t.concepto LIKE CONCAT('% ', al.nombre)
                WHERE t.concepto LIKE 'Mensualidad Clases%'
                    AND t.empresa_id = ?
                    AND al.empresa_id = ?
                GROUP BY t.socio, al.estatus
            ";
            $ingresos = executeQuery($ingresosQuery, [$empresa_id, $empresa_id]);

            // Crear mapa de ingresos por maestro
            $ingresosMap = [];
            foreach ($ingresos as $ing) {
                $maestro = $ing['maestro'];
                if (!isset($ingresosMap[$maestro])) {
                    $ingresosMap[$maestro] = ['activos' => 0, 'bajas' => 0];
                }
                if ($ing['estatus'] === 'Activo') {
                    $ingresosMap[$maestro]['activos'] = (float)$ing['total_ingresos'];
                } else {
                    $ingresosMap[$maestro]['bajas'] = (float)$ing['total_ingresos'];
                }
            }

            // Agregar ingresos reales a la distribución de maestros
            foreach ($distribucion_maestros as &$maestro) {
                $nombre = $maestro['maestro'];
                $maestro['ingresos_activos'] = $ingresosMap[$nombre]['activos'] ?? 0;
                $maestro['ingresos_bajas'] = $ingresosMap[$nombre]['bajas'] ?? 0;
            }
            unset($maestro);

            // 4. MÉTRICAS ESPECÍFICAS DE ROCKSTARSKULL
            $metricasQuery = "
                SELECT
                    SUM(CASE WHEN tipo_clase = 'Grupal' AND estatus = 'Activo' THEN 1 ELSE 0 END) as clases_grupales,
                    SUM(CASE WHEN tipo_clase = 'Individual' AND estatus = 'Activo' THEN 1 ELSE 0 END) as clases_individuales,
                    -- Al corriente: pagó este mes o pagó mes anterior y aún no vence periodo actual
                    SUM(CASE
                        WHEN estatus = 'Activo' AND (
                            DATE_FORMAT(fecha_ultimo_pago, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
                            OR (
                                DATE_FORMAT(fecha_ultimo_pago, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')
                                AND CURDATE() <= DATE_ADD(
                                    LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)),
                                    INTERVAL 5 DAY
                                )
                            )
                        ) THEN 1 ELSE 0 END
                    ) as alumnos_corriente,
                    -- Pendientes: todos los activos que NO están al corriente
                    SUM(CASE
                        WHEN estatus = 'Activo' AND NOT (
                            DATE_FORMAT(fecha_ultimo_pago, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
                            OR (
                                DATE_FORMAT(fecha_ultimo_pago, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')
                                AND CURDATE() <= DATE_ADD(
                                    LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)),
                                    INTERVAL 5 DAY
                                )
                            )
                        ) THEN 1 ELSE 0 END
                    ) as alumnos_pendientes
                FROM alumnos
                WHERE empresa_id = ?
                    AND nombre NOT LIKE '[ELIMINADO]%'
            ";
            $metricas = executeQuery($metricasQuery, [$empresa_id]);
            $metricas_rockstar = [
                'clases_grupales' => (int)($metricas[0]['clases_grupales'] ?? 0),
                'clases_individuales' => (int)($metricas[0]['clases_individuales'] ?? 0),
                'alumnos_corriente' => (int)($metricas[0]['alumnos_corriente'] ?? 0),
                'alumnos_pendientes' => (int)($metricas[0]['alumnos_pendientes'] ?? 0)
            ];

            error_log("✅ Estadísticas calculadas: " . json_encode($estadisticas));

            echo json_encode([
                'success' => true,
                'data' => [
                    'total_alumnos' => $estadisticas['alumnos_activos'], // Solo activos en el contador principal
                    'estadisticas' => $estadisticas,
                    'distribucion_clases' => $distribucion_clases,
                    'distribucion_maestros' => $distribucion_maestros,
                    'metricas_rockstar' => $metricas_rockstar
                ]
            ]);

        } catch (Exception $e) {
            error_log("❌ Error obteniendo estadísticas de alumnos: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener alertas de pagos (próximos a vencer y vencidos)
     * Basado en la lógica homologada de periodo de gracia
     */
    public static function getDashboardAlertasPagos() {
        AuthController::requireAuth();

        try {
            error_log("🔔 Obteniendo alertas de pagos...");

            $empresa_id = $_GET['empresa_id'] ?? 1;

            // Obtener todos los alumnos activos con información de pagos
            $alumnosQuery = "
                SELECT
                    id,
                    nombre,
                    clase,
                    estatus,
                    fecha_inscripcion,
                    fecha_ultimo_pago,
                    precio_mensual
                FROM alumnos
                WHERE empresa_id = ?
                    AND nombre NOT LIKE '[ELIMINADO]%'
                ORDER BY nombre
            ";
            $alumnos = executeQuery($alumnosQuery, [$empresa_id]);

            $proximos_vencer = [];
            $vencidos = [];

            // Calcular estado de pago para cada alumno usando lógica homologada
            foreach ($alumnos as $alumno) {
                // Saltar alumnos dados de baja
                if ($alumno['estatus'] === 'Baja') {
                    continue;
                }

                $estado = self::calcularEstadoPagoHomologado($alumno);

                if ($estado['status'] === 'upcoming') {
                    $proximos_vencer[] = [
                        'id' => $alumno['id'],
                        'nombre' => $alumno['nombre'],
                        'clase' => $alumno['clase'] ?? 'Sin clase',
                        'estatus' => $alumno['estatus'],
                        'dias_restantes' => $estado['dias'],
                        'fecha_vencimiento' => $estado['fecha_corte']
                    ];
                } elseif ($estado['status'] === 'overdue') {
                    $vencidos[] = [
                        'id' => $alumno['id'],
                        'nombre' => $alumno['nombre'],
                        'clase' => $alumno['clase'] ?? 'Sin clase',
                        'estatus' => $alumno['estatus'],
                        'dias_vencido' => abs($estado['dias']),
                        'fecha_vencimiento' => $estado['fecha_corte']
                    ];
                }
            }

            error_log("✅ Alertas calculadas: " . count($proximos_vencer) . " próximos, " . count($vencidos) . " vencidos");

            echo json_encode([
                'success' => true,
                'data' => [
                    'proximos_vencer' => $proximos_vencer,
                    'vencidos' => $vencidos,
                    'total_alertas' => count($proximos_vencer) + count($vencidos)
                ]
            ]);

        } catch (Exception $e) {
            error_log("❌ Error obteniendo alertas de pagos: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Calcular estado de pago homologado (lógica idéntica al frontend)
     * Retorna: ['status' => 'current|upcoming|overdue', 'dias' => int, 'fecha_corte' => string]
     */
    private static function calcularEstadoPagoHomologado($alumno) {
        try {
            $hoy = new DateTime();
            $hoy->setTime(0, 0, 0);

            // Obtener fecha de inscripción
            $fechaInscripcion = new DateTime($alumno['fecha_inscripcion']);
            $diaCorte = (int)$fechaInscripcion->format('d');

            // Calcular fecha de corte del mes ACTUAL
            $fechaCorteActual = new DateTime($hoy->format('Y-m-') . str_pad($diaCorte, 2, '0', STR_PAD_LEFT));
            $fechaCorteActual->setTime(0, 0, 0);

            // Si el día no existe en el mes (ej: 31 en febrero), usar último día del mes
            if ((int)$fechaCorteActual->format('d') !== $diaCorte) {
                $fechaCorteActual = new DateTime($hoy->format('Y-m-t'));
                $fechaCorteActual->setTime(0, 0, 0);
            }

            // Calcular periodo de pago: 3 días antes hasta 5 días después
            $inicioPeriodoPago = clone $fechaCorteActual;
            $inicioPeriodoPago->modify('-3 days');

            $finPeriodoGracia = clone $fechaCorteActual;
            $finPeriodoGracia->modify('+5 days');

            // Verificar si estamos en el periodo de pago
            $enPeriodoPago = ($hoy >= $inicioPeriodoPago && $hoy <= $finPeriodoGracia);

            // Verificar pagos
            $fechaUltimoPago = $alumno['fecha_ultimo_pago'] ? new DateTime($alumno['fecha_ultimo_pago']) : null;

            $pagoEsteMes = $fechaUltimoPago &&
                $fechaUltimoPago->format('Y-m') === $hoy->format('Y-m');

            $mesAnterior = clone $hoy;
            $mesAnterior->modify('-1 month');
            $pagoMesAnterior = $fechaUltimoPago &&
                $fechaUltimoPago->format('Y-m') === $mesAnterior->format('Y-m');

            // REGLA 1: Si pagó ESTE MES → Al corriente
            if ($pagoEsteMes) {
                return [
                    'status' => 'current',
                    'dias' => $hoy->diff($finPeriodoGracia)->days,
                    'fecha_corte' => $fechaCorteActual->format('Y-m-d')
                ];
            }

            // REGLA 2: Si NO pagó mes anterior → VENCIDO
            // CORRECCIÓN: Calcular días desde cuando realmente venció (no desde el mes actual)
            if (!$pagoMesAnterior) {
                $diasVencido = 0;

                if ($fechaUltimoPago) {
                    // Calcular el mes siguiente al último pago (cuando debió pagar)
                    $mesSiguienteAlPago = clone $fechaUltimoPago;
                    $mesSiguienteAlPago->modify('+1 month');

                    // Fecha de corte del mes donde debió pagar
                    $fechaCorteDeuda = new DateTime($mesSiguienteAlPago->format('Y-m-') . str_pad($diaCorte, 2, '0', STR_PAD_LEFT));
                    $fechaCorteDeuda->setTime(0, 0, 0);

                    // Ajustar si el día no existe en ese mes
                    if ((int)$fechaCorteDeuda->format('d') !== $diaCorte) {
                        $fechaCorteDeuda = new DateTime($mesSiguienteAlPago->format('Y-m-t'));
                        $fechaCorteDeuda->setTime(0, 0, 0);
                    }

                    // Fin de gracia de cuando debió pagar (+5 días)
                    $finGraciaDeuda = clone $fechaCorteDeuda;
                    $finGraciaDeuda->modify('+5 days');

                    // Días vencidos desde el fin de gracia real
                    if ($hoy > $finGraciaDeuda) {
                        $diasVencido = $hoy->diff($finGraciaDeuda)->days;
                    }
                } else {
                    // Sin pagos registrados, calcular desde inscripción + 1 mes + 5 días gracia
                    $primerVencimiento = clone $fechaInscripcion;
                    $primerVencimiento->modify('+1 month +5 days');

                    if ($hoy > $primerVencimiento) {
                        $diasVencido = $hoy->diff($primerVencimiento)->days;
                    }
                }

                return [
                    'status' => 'overdue',
                    'dias' => $diasVencido,
                    'fecha_corte' => $fechaCorteActual->format('Y-m-d')
                ];
            }

            // REGLA 3: Pagó mes anterior Y estamos en periodo → PRÓXIMO A VENCER
            if ($pagoMesAnterior && $enPeriodoPago) {
                return [
                    'status' => 'upcoming',
                    'dias' => $hoy->diff($finPeriodoGracia)->days,
                    'fecha_corte' => $fechaCorteActual->format('Y-m-d')
                ];
            }

            // REGLA 4: Pagó mes anterior Y ya pasó periodo → VENCIDO
            if ($pagoMesAnterior && $hoy > $finPeriodoGracia) {
                return [
                    'status' => 'overdue',
                    'dias' => $hoy->diff($finPeriodoGracia)->days,
                    'fecha_corte' => $fechaCorteActual->format('Y-m-d')
                ];
            }

            // REGLA 5: Pagó mes anterior Y aún no inicia periodo → AL CORRIENTE
            if ($pagoMesAnterior && $hoy < $inicioPeriodoPago) {
                return [
                    'status' => 'current',
                    'dias' => $hoy->diff($inicioPeriodoPago)->days,
                    'fecha_corte' => $fechaCorteActual->format('Y-m-d')
                ];
            }

            // Por defecto: Al corriente
            return [
                'status' => 'current',
                'dias' => 0,
                'fecha_corte' => $fechaCorteActual->format('Y-m-d')
            ];

        } catch (Exception $e) {
            error_log("❌ Error calculando estado de pago para " . $alumno['nombre'] . ": " . $e->getMessage());
            return [
                'status' => 'current',
                'dias' => 0,
                'fecha_corte' => null
            ];
        }
    }

    // ============================================================
    // NUEVOS ENDPOINTS AGREGADOS v3.1.5
    // ============================================================

    /**
     * Obtener historial de pagos de un alumno por nombre
     * GET /alumnos/{nombre}/historial-pagos?meses=12
     */
    public static function getHistorialPagosAlumno($nombreAlumno) {
        AuthController::requireAuth();

        $meses = isset($_GET['meses']) ? (int)$_GET['meses'] : null;

        try {
            // Decodificar nombre si viene URL-encoded
            $nombreAlumno = urldecode($nombreAlumno);

            error_log("🔍 Buscando historial de pagos para: $nombreAlumno");

            // Construir query usando LIKE para buscar el nombre en el concepto
            // El concepto tiene formato: "Mensualidad clase de [instrumento] [G/I] [Nombre Alumno]"
            // Buscamos el nombre al final del concepto con LIKE
            $query = "
                SELECT
                    id,
                    concepto,
                    (cantidad * precio_unitario) as total,
                    fecha,
                    tipo,
                    empresa_id
                FROM transacciones
                WHERE tipo = 'I'
                AND (
                    concepto LIKE CONCAT('%', ?, '%')
                    OR concepto LIKE CONCAT('% ', ?)
                    OR concepto LIKE CONCAT('%[GI] ', ?)
                )
                AND empresa_id = 1
            ";

            $params = [$nombreAlumno, $nombreAlumno, $nombreAlumno];

            // Si se especifica meses, filtrar
            if ($meses) {
                $query .= " AND fecha >= DATE_SUB(NOW(), INTERVAL ? MONTH)";
                $params[] = $meses;
            }

            $query .= " ORDER BY fecha DESC";

            $pagos = executeQuery($query, $params);

            error_log("✅ Pagos encontrados: " . count($pagos));

            echo json_encode([
                'success' => true,
                'data' => $pagos,
                'alumno' => $nombreAlumno,
                'total_pagos' => count($pagos)
            ]);

        } catch (Exception $e) {
            error_log("❌ Error obteniendo historial de pagos: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error al obtener historial',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener rango de fechas de transacciones
     * GET /transacciones/rango-fechas
     */
    public static function getRangoFechas() {
        AuthController::requireAuth();

        try {
            $query = "
                SELECT
                    MIN(fecha) as fecha_minima,
                    MAX(fecha) as fecha_maxima
                FROM transacciones
            ";

            $result = executeQuery($query);

            echo json_encode([
                'success' => true,
                'data' => $result[0]
            ]);

        } catch (Exception $e) {
            error_log("Error obteniendo rango de fechas: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error al obtener rango de fechas',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener conteo de transacciones
     * GET /transacciones/count
     */
    public static function getCount() {
        AuthController::requireAuth();

        try {
            $query = "
                SELECT
                    COUNT(*) as total,
                    COUNT(CASE WHEN tipo = 'I' THEN 1 END) as ingresos,
                    COUNT(CASE WHEN tipo = 'G' THEN 1 END) as gastos
                FROM transacciones
            ";

            $result = executeQuery($query);

            echo json_encode([
                'success' => true,
                'data' => $result[0]
            ]);

        } catch (Exception $e) {
            error_log("Error obteniendo conteo: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error al obtener conteo',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Reporte de gastos reales
     * GET /reportes/gastos-reales?empresa=&ano=2025&mes=&tipo=
     */
    public static function getReporteGastosReales() {
        AuthController::requireAuth();

        try {
            $empresa = $_GET['empresa'] ?? '';
            $ano = $_GET['ano'] ?? '';
            $mes = $_GET['mes'] ?? '';
            $tipo = $_GET['tipo'] ?? '';

            $whereConditions = [];
            $params = [];

            if (!empty($ano)) {
                $whereConditions[] = "YEAR(fecha) = ?";
                $params[] = (int)$ano;
            }

            if (!empty($empresa)) {
                $whereConditions[] = "empresa_id = ?";
                $params[] = (int)$empresa;
            }

            if (!empty($mes)) {
                $whereConditions[] = "MONTH(fecha) = ?";
                $params[] = (int)$mes;
            }

            if (!empty($tipo)) {
                $whereConditions[] = "tipo = ?";
                $params[] = $tipo;
            }

            $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

            $query = "
                SELECT
                    concepto,
                    total,
                    fecha,
                    tipo,
                    empresa_id
                FROM transacciones
                $whereClause
                ORDER BY fecha DESC
            ";

            $transacciones = executeQuery($query, $params);

            // Calcular totales
            $totalIngresos = 0;
            $totalGastos = 0;

            foreach ($transacciones as $t) {
                if ($t['tipo'] === 'I') {
                    $totalIngresos += floatval($t['total']);
                } else {
                    $totalGastos += floatval($t['total']);
                }
            }

            echo json_encode([
                'success' => true,
                'data' => $transacciones,
                'resumen' => [
                    'total_ingresos' => $totalIngresos,
                    'total_gastos' => $totalGastos,
                    'balance' => $totalIngresos - $totalGastos,
                    'total_transacciones' => count($transacciones)
                ]
            ]);

        } catch (Exception $e) {
            error_log("Error en reporte gastos reales: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error generando reporte',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Reporte de balance general
     * GET /reportes/balance-general?empresa=&ano=2025&mes=
     */
    public static function getReporteBalanceGeneral() {
        AuthController::requireAuth();

        try {
            $empresa = $_GET['empresa'] ?? '';
            $ano = $_GET['ano'] ?? '';
            $mes = $_GET['mes'] ?? '';

            $whereConditions = [];
            $params = [];

            if (!empty($ano)) {
                $whereConditions[] = "YEAR(fecha) = ?";
                $params[] = (int)$ano;
            }

            if (!empty($empresa)) {
                $whereConditions[] = "empresa_id = ?";
                $params[] = (int)$empresa;
            }

            if (!empty($mes)) {
                $whereConditions[] = "MONTH(fecha) = ?";
                $params[] = (int)$mes;
            }

            $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

            $query = "
                SELECT
                    SUM(CASE WHEN tipo = 'I' THEN total ELSE 0 END) as total_ingresos,
                    SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END) as total_gastos,
                    COUNT(CASE WHEN tipo = 'I' THEN 1 END) as count_ingresos,
                    COUNT(CASE WHEN tipo = 'G' THEN 1 END) as count_gastos
                FROM transacciones
                $whereClause
            ";

            $result = executeQuery($query, $params);
            $data = $result[0];

            $totalIngresos = floatval($data['total_ingresos']);
            $totalGastos = floatval($data['total_gastos']);
            $balance = $totalIngresos - $totalGastos;

            echo json_encode([
                'success' => true,
                'data' => [
                    'total_ingresos' => $totalIngresos,
                    'total_gastos' => $totalGastos,
                    'balance' => $balance,
                    'count_ingresos' => (int)$data['count_ingresos'],
                    'count_gastos' => (int)$data['count_gastos']
                ]
            ]);

        } catch (Exception $e) {
            error_log("Error en balance general: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error generando balance',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Reporte de balance general v2 - Con inversión por socio y estado de cuenta
     * GET /reportes/balance-general-v2?empresa=&ano=&mes=
     *
     * Socios inversores: Marco Delgado, Hugo Vazquez, Antonio Razo
     * Estado de cuenta por forma de pago: TPV->Mercado Pago, Transferencia->Inbursa, Efectivo->Caja Fuerte
     */
    public static function getReporteBalanceGeneralV2() {
        AuthController::requireAuth();

        try {
            $empresa = $_GET['empresa'] ?? '';
            $ano = $_GET['ano'] ?? '';
            $mes = $_GET['mes'] ?? '';

            // Construir cláusula WHERE para filtros
            $whereConditions = [];
            $params = [];

            if (!empty($ano)) {
                $whereConditions[] = "YEAR(fecha) = ?";
                $params[] = (int)$ano;
            }

            if (!empty($empresa)) {
                $whereConditions[] = "empresa_id = ?";
                $params[] = (int)$empresa;
            }

            if (!empty($mes)) {
                $whereConditions[] = "MONTH(fecha) = ?";
                $params[] = (int)$mes;
            }

            $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

            // ============================================================
            // 1. INVERSIÓN POR SOCIO (Gastos - Abonos recibidos)
            // Inversión neta = Gastos del socio - Ingresos (abonos) que recibió
            // ============================================================
            $sociosInversores = ['Marco Delgado', 'Hugo Vazquez', 'Antonio Razo'];
            $sociosPlaceholders = implode(',', array_fill(0, count($sociosInversores), '?'));

            // Construir cláusula WHERE base para socios
            $sociosWhereClause = $whereClause;
            if (!empty($whereClause)) {
                $sociosWhereClause .= " AND socio IN ($sociosPlaceholders)";
            } else {
                $sociosWhereClause = "WHERE socio IN ($sociosPlaceholders)";
            }

            $sociosParams = array_merge($params, $sociosInversores);

            // Calcular inversión neta: Gastos - Abonos (solo ingresos con concepto que contiene 'abono')
            // Los ingresos de mensualidades de clases NO se restan, solo los abonos/transferencias
            $sociosQuery = "
                SELECT
                    socio,
                    SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END) as total_gastos,
                    SUM(CASE WHEN tipo = 'I' AND LOWER(concepto) LIKE '%abono%' THEN total ELSE 0 END) as total_abonos,
                    SUM(CASE WHEN tipo = 'G' THEN total ELSE 0 END) -
                    SUM(CASE WHEN tipo = 'I' AND LOWER(concepto) LIKE '%abono%' THEN total ELSE 0 END) as inversion_neta,
                    MAX(fecha) as ultima_actualizacion
                FROM transacciones
                $sociosWhereClause
                GROUP BY socio
                ORDER BY inversion_neta DESC
            ";

            $sociosResult = executeQuery($sociosQuery, $sociosParams);

            // Calcular total de inversión y porcentajes
            $totalInversion = 0;
            foreach ($sociosResult as $socio) {
                $totalInversion += floatval($socio['inversion_neta']);
            }

            $socios = [];
            foreach ($sociosResult as $socio) {
                $inversionNeta = floatval($socio['inversion_neta']);
                $socios[] = [
                    'socio' => $socio['socio'],
                    'inversion' => $inversionNeta,
                    'gastos' => floatval($socio['total_gastos']),
                    'abonos' => floatval($socio['total_abonos']),
                    'porcentaje' => $totalInversion > 0 ? ($inversionNeta / $totalInversion) * 100 : 0,
                    'ultima_actualizacion' => $socio['ultima_actualizacion']
                ];
            }

            // ============================================================
            // 2. ESTADO DE CUENTA (Reglas específicas por cuenta)
            // ============================================================
            // MERCADO PAGO:
            //   (+) Ingresos: TPV
            //   (-) Gastos: TPV, Mercado Pago
            //   (-) Gastos por Transferencia con concepto: Clases, Limpieza, Quincena, TotalPlay, Renta, Meta Ads, Pago Nov, Mantenimiento, Comisiones TPV
            //
            // INBURSA:
            //   (+) Ingresos: Transferencia, CTIM
            //   (-) Gastos por Transferencia con concepto: Honorarios, Prestamo
            //   (-) Gastos de Symbiot Technologies (empresa_id=2) - fueron devueltos a Marco Delgado
            //
            // CAJA FUERTE EFECTIVO:
            //   (+) Ingresos: Efectivo
            //   (-) Gastos: Efectivo
            // ============================================================

            // Conceptos de gastos que se pagan desde Mercado Pago aunque sean por transferencia
            $conceptosMercadoPago = ['clases', 'limpieza', 'quincena', 'totalplay', 'renta', 'meta ads', 'pago nov', 'mantenimiento', 'comisiones tpv'];
            // Nota: Gastos por transferencia que NO coinciden con conceptosMercadoPago van a Inbursa por defecto
            // (incluye: Honorarios, Prestamo, y cualquier otro concepto)

            // Query para obtener todas las transacciones con sus detalles (incluyendo empresa_id)
            $cuentasQuery = "
                SELECT
                    tipo,
                    forma_pago,
                    LOWER(concepto) as concepto_lower,
                    total,
                    empresa_id
                FROM transacciones
                $whereClause
            ";

            $transacciones = executeQuery($cuentasQuery, $params);

            // Inicializar cuentas
            $mercadoPago = ['ingresos' => 0, 'gastos' => 0];
            $inbursa = ['ingresos' => 0, 'gastos' => 0];
            $cajaFuerte = ['ingresos' => 0, 'gastos' => 0];

            foreach ($transacciones as $tx) {
                $tipo = $tx['tipo'];
                $formaPago = $tx['forma_pago'];
                $concepto = $tx['concepto_lower'];
                $monto = floatval($tx['total']);
                $empresaId = intval($tx['empresa_id']);

                if ($tipo === 'I') {
                    // INGRESOS
                    if ($formaPago === 'TPV' || $formaPago === 'Mercado Pago') {
                        $mercadoPago['ingresos'] += $monto;
                    } elseif ($formaPago === 'Transferencia' || $formaPago === 'CTIM') {
                        $inbursa['ingresos'] += $monto;
                    } elseif ($formaPago === 'Efectivo') {
                        $cajaFuerte['ingresos'] += $monto;
                    }
                } else {
                    // GASTOS

                    // Regla especial: Gastos de Symbiot Technologies (empresa_id=2) van a Inbursa
                    // (fueron devueltos a Marco Delgado desde Inbursa)
                    if ($empresaId === 2) {
                        $inbursa['gastos'] += $monto;
                        continue;
                    }

                    // Reglas para RockstarSkull (empresa_id=1)
                    if ($formaPago === 'TPV' || $formaPago === 'Mercado Pago') {
                        // Gastos TPV/Mercado Pago van a Mercado Pago
                        $mercadoPago['gastos'] += $monto;
                    } elseif ($formaPago === 'Transferencia') {
                        // Gastos por transferencia: determinar cuenta según concepto
                        $esConceptoMercadoPago = false;
                        foreach ($conceptosMercadoPago as $conceptoMP) {
                            if (strpos($concepto, $conceptoMP) !== false) {
                                $esConceptoMercadoPago = true;
                                break;
                            }
                        }

                        if ($esConceptoMercadoPago) {
                            $mercadoPago['gastos'] += $monto;
                        } else {
                            // Por defecto, gastos por transferencia van a Inbursa
                            $inbursa['gastos'] += $monto;
                        }
                    } elseif ($formaPago === 'Efectivo') {
                        $cajaFuerte['gastos'] += $monto;
                    }
                }
            }

            // Calcular saldos
            $saldoMercadoPago = $mercadoPago['ingresos'] - $mercadoPago['gastos'];
            $saldoInbursa = $inbursa['ingresos'] - $inbursa['gastos'];
            $saldoCajaFuerte = $cajaFuerte['ingresos'] - $cajaFuerte['gastos'];
            $saldoTotal = $saldoMercadoPago + $saldoInbursa + $saldoCajaFuerte;

            $cuentasBancarias = [
                [
                    'nombre' => 'Mercado Pago',
                    'banco' => 'Mercado Pago',
                    'tipo' => 'Cuenta Digital',
                    'ingresos' => $mercadoPago['ingresos'],
                    'gastos' => $mercadoPago['gastos'],
                    'saldo' => $saldoMercadoPago
                ],
                [
                    'nombre' => 'Cuenta Inbursa',
                    'banco' => 'Inbursa',
                    'tipo' => 'Cuenta Bancaria',
                    'ingresos' => $inbursa['ingresos'],
                    'gastos' => $inbursa['gastos'],
                    'saldo' => $saldoInbursa
                ],
                [
                    'nombre' => 'Caja Fuerte Efectivo',
                    'banco' => 'Efectivo',
                    'tipo' => 'Caja',
                    'ingresos' => $cajaFuerte['ingresos'],
                    'gastos' => $cajaFuerte['gastos'],
                    'saldo' => $saldoCajaFuerte
                ]
            ];

            // ============================================================
            // 3. GASTOS DE LA ESCUELA (Gastos que NO son de los socios)
            // ============================================================
            $gastosEscuelaWhereClause = $whereClause;
            if (!empty($whereClause)) {
                $gastosEscuelaWhereClause .= " AND tipo = 'G' AND socio NOT IN ($sociosPlaceholders)";
            } else {
                $gastosEscuelaWhereClause = "WHERE tipo = 'G' AND socio NOT IN ($sociosPlaceholders)";
            }

            $gastosEscuelaParams = array_merge($params, $sociosInversores);

            $gastosEscuelaQuery = "
                SELECT SUM(total) as monto
                FROM transacciones
                $gastosEscuelaWhereClause
            ";

            $gastosEscuelaResult = executeQuery($gastosEscuelaQuery, $gastosEscuelaParams);
            $montoGastosEscuela = floatval($gastosEscuelaResult[0]['monto'] ?? 0);

            // Calcular porcentaje de gastos escuela sobre el total de gastos
            $totalGastosQuery = "
                SELECT SUM(total) as total
                FROM transacciones
                " . (!empty($whereClause) ? $whereClause . " AND tipo = 'G'" : "WHERE tipo = 'G'");

            $totalGastosResult = executeQuery($totalGastosQuery, $params);
            $totalGastos = floatval($totalGastosResult[0]['total'] ?? 0);

            $gastosEscuela = [
                'monto' => $montoGastosEscuela,
                'porcentaje' => $totalGastos > 0 ? ($montoGastosEscuela / $totalGastos) * 100 : 0
            ];

            // ============================================================
            // 4. PARTICIPACIÓN EN LA SOCIEDAD (basada en inversión)
            // ============================================================
            $participacion = [];
            foreach ($socios as $socio) {
                $participacion[] = [
                    'socio' => $socio['socio'],
                    'porcentaje' => $socio['porcentaje']
                ];
            }

            // ============================================================
            // RESPUESTA FINAL
            // ============================================================
            echo json_encode([
                'success' => true,
                'data' => [
                    'inversion_total' => $totalInversion,
                    'numero_socios' => count($socios),
                    'saldo_total_cuentas' => $saldoTotal,
                    'socios' => $socios,
                    'cuentas_bancarias' => $cuentasBancarias,
                    'gastos_escuela' => $gastosEscuela,
                    'participacion' => $participacion
                ]
            ]);

        } catch (Exception $e) {
            error_log("Error en balance general v2: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error generando balance general',
                'message' => $e->getMessage()
            ]);
        }
    }
}
