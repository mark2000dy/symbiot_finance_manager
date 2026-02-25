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

    // Buffer interno para evitar doble lectura de php://input en helpers
    private static $inputOverride = null;

    // Buffer para forzar filtro tipo ('G'/'I') sin mutar $_GET
    private static $tipoOverride = null;

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
            $tipo = self::$tipoOverride ?? $_GET['tipo'] ?? null;
            self::$tipoOverride = null;
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

    // Obtener transacción por ID
    public static function getTransaccionById($id) {
        AuthController::requireAuth();

        try {
            $query = "
                SELECT
                    t.*,
                    e.nombre as nombre_empresa
                FROM transacciones t
                LEFT JOIN empresas e ON t.empresa_id = e.id
                WHERE t.id = ?
            ";

            $transaccion = executeQuery($query, [$id]);

            if (empty($transaccion)) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Transacción no encontrada'
                ]);
                return;
            }

            echo json_encode([
                'success' => true,
                'data' => $transaccion[0]
            ]);

        } catch (Exception $e) {
            error_log("Error al obtener transacción: " . $e->getMessage());
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
            $input = self::$inputOverride ?? json_decode(file_get_contents('php://input'), true);
            self::$inputOverride = null;

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

            // Notificación: nueva transacción (usar nombre del usuario logueado, no el socio)
            $nombreUsuarioNot = $user['nombre'] ?? 'Sistema';
            NotificacionesController::crearNotificacion('transaccion', "$tipo - $nombreUsuarioNot ha registrado una nueva transacción", $empresa_id);

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

            // FIX: Incluir campo socio en el UPDATE
            $socio = $input['socio'] ?? null;

            $query = $bypassCreatedByCheck
                ? "UPDATE transacciones SET
                    fecha = ?, concepto = ?, socio = ?, empresa_id = ?, forma_pago = ?,
                    cantidad = ?, precio_unitario = ?, tipo = ?
                WHERE id = ?"
                : "UPDATE transacciones SET
                    fecha = ?, concepto = ?, socio = ?, empresa_id = ?, forma_pago = ?,
                    cantidad = ?, precio_unitario = ?, tipo = ?
                WHERE id = ? AND created_by = ?";

            $queryParams = $bypassCreatedByCheck
                ? [$fecha, $concepto, $socio, $empresa_id, $forma_pago, $cantidad, $precio_unitario, $tipo, $id]
                : [$fecha, $concepto, $socio, $empresa_id, $forma_pago, $cantidad, $precio_unitario, $tipo, $id, $user['id']];

            $oldConcepto   = $existeTransaccion[0]['concepto'];
            $oldTipo       = $existeTransaccion[0]['tipo'];
            $oldEmpresaId  = $existeTransaccion[0]['empresa_id'];

            executeUpdate($query, $queryParams);

            // Recalcular fecha_ultimo_pago desde las transacciones restantes
            // (cubre cambios de fecha en cualquier dirección, no solo hacia adelante)
            if ($oldTipo === 'I' && $oldConcepto && $oldEmpresaId == 1) {
                self::recalcularFechaUltimoPago($oldConcepto, $oldEmpresaId);
            }
            // Si el concepto cambió a otro alumno, recalcular también el nuevo
            if ($tipo === 'I' && $concepto && $empresa_id == 1 && $concepto !== $oldConcepto) {
                self::recalcularFechaUltimoPago($concepto, $empresa_id);
            }

            error_log("✅ Transacción $id actualizada por {$user['nombre']}");

            $nombreUsuarioNot = $user['nombre'] ?? 'Sistema';
            NotificacionesController::crearNotificacion('transaccion', "$nombreUsuarioNot modificó una transacción: $concepto", (int)$empresa_id);

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
                ? 'SELECT concepto, tipo, empresa_id FROM transacciones WHERE id = ?'
                : 'SELECT concepto, tipo, empresa_id FROM transacciones WHERE id = ? AND created_by = ?';
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

            $txConcepto   = $existeTransaccion[0]['concepto'];
            $txTipo       = $existeTransaccion[0]['tipo'];
            $txEmpresaId  = $existeTransaccion[0]['empresa_id'];

            $deleteQuery = $bypassCreatedByCheck
                ? 'DELETE FROM transacciones WHERE id = ?'
                : 'DELETE FROM transacciones WHERE id = ? AND created_by = ?';
            $deleteParams = $bypassCreatedByCheck ? [$id] : [$id, $user['id']];

            executeUpdate($deleteQuery, $deleteParams);

            error_log("✅ Transacción eliminada: {$txConcepto} ({$txTipo})");

            $nombreUsuarioNot = $user['nombre'] ?? 'Sistema';
            NotificacionesController::crearNotificacion('transaccion', "$nombreUsuarioNot eliminó una transacción: $txConcepto", (int)$txEmpresaId);

            // Recalcular fecha_ultimo_pago desde las transacciones restantes
            if ($txTipo === 'I' && $txConcepto && $txEmpresaId == 1) {
                self::recalcularFechaUltimoPago($txConcepto, $txEmpresaId);
            }

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
                        WHEN tipo = 'G' AND forma_pago LIKE 'Inversion a%' THEN 'inversion'
                        WHEN tipo = 'G' THEN 'gastos'
                    END as categoria,
                    SUM(total) as total_monto,
                    COUNT(*) as cantidad
                FROM transacciones $whereClause
                GROUP BY
                    CASE
                        WHEN tipo = 'I' THEN 'ingresos'
                        WHEN tipo = 'G' AND forma_pago LIKE 'Inversion a%' THEN 'inversion'
                        WHEN tipo = 'G' THEN 'gastos'
                    END
            ";

            $resultados = executeQuery($resumenQuery, $params);

            $resumen = [
                'ingresos' => 0,
                'gastos' => 0,
                'inversion' => 0,
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
                } else if ($row['categoria'] === 'inversion') {
                    $resumen['inversion'] = floatval($row['total_monto'] ?? 0);
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
            $unificar = $_GET['unificar'] ?? '1'; // Por defecto unifica

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

            // Si unificar=1, agrupa alumnos por nombre y consolida sus clases
            if ($unificar === '1' && empty($clase)) {
                $alumnos = executeQuery("
                    SELECT
                        MIN(a.id) as id,
                        a.nombre,
                        MAX(a.edad) as edad,
                        MAX(a.telefono) as telefono,
                        MAX(a.email) as email,
                        GROUP_CONCAT(DISTINCT a.clase ORDER BY a.clase SEPARATOR ', ') as clase,
                        GROUP_CONCAT(DISTINCT a.tipo_clase ORDER BY a.clase SEPARATOR ', ') as tipo_clase,
                        GROUP_CONCAT(DISTINCT CONCAT(a.clase, ': ', COALESCE(a.horario, 'Sin horario')) ORDER BY a.clase SEPARATOR ' | ') as horario,
                        MIN(a.fecha_inscripcion) as fecha_inscripcion,
                        NULLIF(
                            GREATEST(
                                MAX(COALESCE(a.fecha_ultimo_pago, '1900-01-01')),
                                COALESCE((
                                    SELECT MAX(t.fecha)
                                    FROM transacciones t
                                    WHERE t.tipo = 'I'
                                      AND t.empresa_id = a.empresa_id
                                      AND t.concepto LIKE CONCAT('%', a.nombre, '%')
                                ), '1900-01-01')
                            ),
                            '1900-01-01'
                        ) as fecha_ultimo_pago,
                        MAX(a.promocion) as promocion,
                        SUM(COALESCE(a.precio_mensual, 0)) as precio_mensual,
                        MAX(a.forma_pago) as forma_pago,
                        MAX(a.domiciliado) as domiciliado,
                        CASE
                            WHEN SUM(CASE WHEN a.estatus = 'Activo' THEN 1 ELSE 0 END) > 0 THEN 'Activo'
                            ELSE 'Baja'
                        END as estatus,
                        GROUP_CONCAT(DISTINCT COALESCE(m.nombre, 'Sin asignar') ORDER BY a.clase SEPARATOR ', ') as maestro,
                        GROUP_CONCAT(DISTINCT a.id ORDER BY a.clase SEPARATOR ',') as all_ids,
                        COUNT(DISTINCT a.id) as num_clases,
                        MIN(a.salon_id) as salon_id
                    FROM alumnos a
                    LEFT JOIN maestros m ON a.maestro_id = m.id
                    $whereClause
                    GROUP BY a.nombre, a.empresa_id
                    ORDER BY a.nombre
                    LIMIT ? OFFSET ?
                ", array_merge($params, [(int)$limit, (int)$offset]));

                $countResult = executeQuery("
                    SELECT COUNT(DISTINCT a.nombre) as total
                    FROM alumnos a
                    LEFT JOIN maestros m ON a.maestro_id = m.id
                    $whereClause
                ", $params);
            } else {
                // Query original sin unificar
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
                        NULLIF(
                            GREATEST(
                                COALESCE(a.fecha_ultimo_pago, '1900-01-01'),
                                COALESCE((
                                    SELECT MAX(t.fecha)
                                    FROM transacciones t
                                    WHERE t.tipo = 'I'
                                      AND t.empresa_id = a.empresa_id
                                      AND t.concepto LIKE CONCAT('%', a.nombre, '%')
                                ), '1900-01-01')
                            ),
                            '1900-01-01'
                        ) as fecha_ultimo_pago,
                        a.promocion,
                        COALESCE(a.precio_mensual, 0) as precio_mensual,
                        a.forma_pago,
                        a.domiciliado,
                        a.estatus,
                        a.maestro_id,
                        a.salon_id,
                        COALESCE(m.nombre, 'Sin asignar') as maestro,
                        1 as num_clases
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
            }

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

            // ============================================================
            // INTEGRACIÓN GOOGLE CALENDAR: Agendar clase recurrente
            // ============================================================
            if ($horario && $estatus === 'Activo') {
                try {
                    // 1. Obtener nombre del maestro
                    $teacherName = '';
                    if ($maestro_id) {
                        $maestro = executeQuery("SELECT nombre FROM maestros WHERE id = ?", [$maestro_id]);
                        if (!empty($maestro)) {
                            $teacherName = $maestro[0]['nombre'];
                        }
                    }

                    // 2. Acortar nombre del alumno (Heurística: Primer Nombre + Primer Apellido)
                    // Ej: "Marco Antonio Delgado Yáñez" -> "Marco Delgado"
                    $nameParts = explode(' ', trim($nombre));
                    $shortName = $nameParts[0];
                    if (count($nameParts) >= 3) {
                        $shortName .= ' ' . $nameParts[count($nameParts) - 2];
                    } elseif (count($nameParts) == 2) {
                        $shortName .= ' ' . $nameParts[1];
                    }

                    // 3. Parsear Horario (Ej: "19:00 a 20:00 Vie")
                    $horarioNorm = mb_strtolower($horario);
                    if (preg_match('/(\d{1,2}:\d{2})\s*a\s*(\d{1,2}:\d{2})\s+(.+)/', $horarioNorm, $matches)) {
                        $startTime = $matches[1];
                        $endTime = $matches[2];
                        $daysStr = $matches[3];

                        $daysMap = [
                            'lunes' => 'Monday', 'lun' => 'Monday',
                            'martes' => 'Tuesday', 'mar' => 'Tuesday',
                            'miércoles' => 'Wednesday', 'miercoles' => 'Wednesday', 'mie' => 'Wednesday',
                            'jueves' => 'Thursday', 'jue' => 'Thursday',
                            'viernes' => 'Friday', 'vie' => 'Friday',
                            'sábado' => 'Saturday', 'sabado' => 'Saturday', 'sab' => 'Saturday',
                            'domingo' => 'Sunday', 'dom' => 'Sunday'
                        ];
                        
                        $rruleMap = ['Monday'=>'MO', 'Tuesday'=>'TU', 'Wednesday'=>'WE', 'Thursday'=>'TH', 'Friday'=>'FR', 'Saturday'=>'SA', 'Sunday'=>'SU'];

                        require_once __DIR__ . '/../config/GoogleCalendarService.php';
                        $calendarService = new GoogleCalendarService();

                        foreach ($daysMap as $es => $en) {
                            if (mb_strpos($daysStr, $es) !== false) {
                                // Calcular próxima ocurrencia
                                $startDT = new DateTime("next $en $startTime", new DateTimeZone('America/Mexico_City'));
                                $endDT = new DateTime("next $en $endTime", new DateTimeZone('America/Mexico_City'));
                                
                                // Regla de recurrencia semanal
                                $recurrence = ["RRULE:FREQ=WEEKLY;BYDAY=" . $rruleMap[$en]];

                                $link = $calendarService->scheduleClassEvent(
                                    $shortName, 
                                    $clase, 
                                    $teacherName, 
                                    $startDT->format('c'), 
                                    $endDT->format('c'),
                                    $recurrence
                                );
                                if ($link) error_log("📅 Evento recurrente creado en Calendar: $link");
                            }
                        }
                    }
                } catch (Exception $e) {
                    error_log("⚠️ Error agendando en Google Calendar: " . $e->getMessage());
                }
            }

            // Notificación admin: alta de alumno
            $nombreUsuarioNot = $user['nombre'] ?? 'Sistema';
            NotificacionesController::crearNotificacion('alta_alumno', "$nombreUsuarioNot acaba de registrar un nuevo alumno", $empresa_id);
            // Notificación maestro: nuevo alumno en su clase (si tiene maestro asignado)
            if ($maestro_id > 0) {
                NotificacionesController::crearNotificacion('alta_alumno', "Nuevo alumno registrado en tu clase: $nombre", $empresa_id, $maestro_id);
            }

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

        // Maestros puros no pueden eliminar alumnos; admins y coordinadores (incluido Hugo) sí
        $pureMaestroEmails = ['jolvera@rockstarskull.com','dandrade@rockstarskull.com','ihernandez@rockstarskull.com','nperez@rockstarskull.com','lblanquet@rockstarskull.com','mreyes@rockstarskull.com','hlopez@rockstarskull.com'];
        if (in_array($user['email'], $pureMaestroEmails)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'No tienes permisos para eliminar alumnos']);
            return;
        }

        try {
            error_log("🗑️ Eliminando alumno ID: $id por usuario: " . $user['email']);

            // Verificar que el alumno existe
            $alumno = executeQuery("SELECT id, nombre, clase, maestro_id, empresa_id FROM alumnos WHERE id = ?", [$id]);

            if (empty($alumno)) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Alumno no encontrado']);
                return;
            }

            $nombreOriginal = $alumno[0]['nombre'];
            $claseOriginal = $alumno[0]['clase'];

            // ============================================================
            // INTEGRACIÓN GOOGLE CALENDAR: Eliminar evento al borrar alumno
            // ============================================================
            try {
                require_once __DIR__ . '/../config/GoogleCalendarService.php';
                $calendarService = new GoogleCalendarService();
                error_log("🗑️ [Calendar] Eliminando evento de '$nombreOriginal' ($claseOriginal) por ELIMINACIÓN...");
                $ok = $calendarService->removeStudentFromSchedule($nombreOriginal, $claseOriginal);
                if ($ok === false) {
                    error_log("⚠️ [Calendar] removeStudentFromSchedule devolvió false — ¿token vencido o sin conexión?");
                }
            } catch (Exception $e) {
                error_log("⚠️ Error eliminando evento de Calendar (delete): " . $e->getMessage() . " en " . $e->getFile() . ":" . $e->getLine());
            }

            // Soft delete: renombrar con prefijo [ELIMINADO]
            executeQuery("
                UPDATE alumnos SET
                    nombre = CONCAT('[ELIMINADO] ', nombre),
                    estatus = 'Baja'
                WHERE id = ?
            ", [$id]);

            error_log("✅ Alumno eliminado (soft): $nombreOriginal (ID: $id)");

            // Notificación admin: baja de alumno
            $nombreUsuarioNot = $user['nombre'] ?? 'Sistema';
            $empresaIdDelNot  = (int)($alumno[0]['empresa_id'] ?? 1);
            NotificacionesController::crearNotificacion('baja_alumno', "El alumno $nombreOriginal fue dado de baja, registró $nombreUsuarioNot", $empresaIdDelNot);
            // Notificación maestro: alumno removido de su clase (si tenía maestro)
            $maestroIdDel = (int)($alumno[0]['maestro_id'] ?? 0);
            if ($maestroIdDel > 0) {
                NotificacionesController::crearNotificacion('baja_alumno', "El alumno $nombreOriginal fue dado de baja de tu clase", $empresaIdDelNot, $maestroIdDel);
            }

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

        // Security: maestros no pueden editar alumnos; cualquier otro usuario autenticado sí
        // Maestros puros no pueden actualizar alumnos; admins y coordinadores (incluido Hugo) sí
        $pureMaestroEmails = ['jolvera@rockstarskull.com','dandrade@rockstarskull.com','ihernandez@rockstarskull.com','nperez@rockstarskull.com','lblanquet@rockstarskull.com','mreyes@rockstarskull.com','hlopez@rockstarskull.com'];
        if (in_array($user['email'], $pureMaestroEmails)) {
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
                SELECT id, nombre, estatus, clase, maestro_id, horario FROM alumnos WHERE id = ?
            ", [$id]);

            if (empty($alumnoExistente)) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Alumno no encontrado'
                ]);
                return;
            }

            // ============================================================
            // INTEGRACIÓN GOOGLE CALENDAR: Eliminar evento si pasa a BAJA
            // ============================================================
            if (isset($input['estatus']) && $input['estatus'] === 'Baja' && $alumnoExistente[0]['estatus'] === 'Activo') {
                try {
                    require_once __DIR__ . '/../config/GoogleCalendarService.php';
                    $calendarService = new GoogleCalendarService();
                    $nombreBaja = $alumnoExistente[0]['nombre'];
                    $claseBaja  = $alumnoExistente[0]['clase'];
                    error_log("🗑️ [Calendar] Eliminando evento de '$nombreBaja' ($claseBaja) por BAJA...");
                    $ok = $calendarService->removeStudentFromSchedule($nombreBaja, $claseBaja);
                    if ($ok === false) {
                        error_log("⚠️ [Calendar] removeStudentFromSchedule devolvió false — ¿token vencido o sin conexión?");
                    }
                } catch (Exception $e) {
                    error_log("⚠️ Error eliminando evento de Calendar (Baja): " . $e->getMessage() . " en " . $e->getFile() . ":" . $e->getLine());
                }
            }

            // ============================================================
            // INTEGRACIÓN GOOGLE CALENDAR: Reactivación (Baja -> Activo)
            // También cubre el caso donde el alumno ya es Activo pero
            // se le asigna horario por primera vez o se cambia.
            // ============================================================
            $estudianteEsActivo = ($input['estatus'] ?? $alumnoExistente[0]['estatus']) === 'Activo';
            $horarioEntrada     = isset($input['horario']) && $input['horario'] !== '' ? $input['horario'] : null;
            $horarioDB          = $alumnoExistente[0]['horario'] ?? null;
            $esReactivacion     = isset($input['estatus']) && $input['estatus'] === 'Activo' && $alumnoExistente[0]['estatus'] === 'Baja';
            $horarioCambia      = $horarioEntrada !== null && $horarioEntrada !== $horarioDB;

            if ($estudianteEsActivo && ($esReactivacion || $horarioCambia)) {
                $horarioNuevo = $horarioEntrada ?: $horarioDB;

                error_log("📅 [Calendar check] esReactivacion=$esReactivacion horarioCambia=$horarioCambia horarioNuevo=" . json_encode($horarioNuevo));

                if ($horarioNuevo) {
                    try {
                        require_once __DIR__ . '/../config/GoogleCalendarService.php';
                        error_log("📅 [Calendar] Iniciando GoogleCalendarService para reactivación...");
                        $calendarService = new GoogleCalendarService();
                        error_log("📅 [Calendar] GoogleCalendarService instanciado OK");

                        // Datos para el evento (usar input si existe, sino fallback a DB)
                        $nombreFinal = $input['nombre'] ?? $alumnoExistente[0]['nombre'];
                        $claseFinal = $input['clase'] ?? $alumnoExistente[0]['clase'];
                        $maestroIdFinal = $input['maestro_id'] ?? $alumnoExistente[0]['maestro_id'];

                        // 1. Obtener nombre del maestro
                        $teacherName = '';
                        if ($maestroIdFinal) {
                            $maestro = executeQuery("SELECT nombre FROM maestros WHERE id = ?", [$maestroIdFinal]);
                            if (!empty($maestro)) {
                                $teacherName = $maestro[0]['nombre'];
                            }
                        }

                        // 2. Acortar nombre del alumno
                        $nameParts = explode(' ', trim($nombreFinal));
                        $shortName = $nameParts[0];
                        if (count($nameParts) >= 3) {
                            $shortName .= ' ' . $nameParts[count($nameParts) - 2];
                        } elseif (count($nameParts) == 2) {
                            $shortName .= ' ' . $nameParts[1];
                        }

                        // 3. Parsear Horario y Agendar
                        $horarioNorm = mb_strtolower($horarioNuevo);
                        error_log("📅 [Calendar] Parseando horario: '$horarioNorm' para alumno '$shortName' clase '$claseFinal' maestro '$teacherName'");
                        if (preg_match('/(\d{1,2}:\d{2})\s*a\s*(\d{1,2}:\d{2})\s+(.+)/', $horarioNorm, $matches)) {
                            $startTime = $matches[1];
                            $endTime = $matches[2];
                            $daysStr = $matches[3];
                            error_log("📅 [Calendar] Regex match: start=$startTime end=$endTime days='$daysStr'");

                            $daysMap = [
                                'lunes' => 'Monday', 'lun' => 'Monday',
                                'martes' => 'Tuesday', 'mar' => 'Tuesday',
                                'miércoles' => 'Wednesday', 'miercoles' => 'Wednesday', 'mie' => 'Wednesday',
                                'jueves' => 'Thursday', 'jue' => 'Thursday',
                                'viernes' => 'Friday', 'vie' => 'Friday',
                                'sábado' => 'Saturday', 'sabado' => 'Saturday', 'sab' => 'Saturday',
                                'domingo' => 'Sunday', 'dom' => 'Sunday'
                            ];

                            $rruleMap = ['Monday'=>'MO', 'Tuesday'=>'TU', 'Wednesday'=>'WE', 'Thursday'=>'TH', 'Friday'=>'FR', 'Saturday'=>'SA', 'Sunday'=>'SU'];

                            foreach ($daysMap as $es => $en) {
                                if (mb_strpos($daysStr, $es) !== false) {
                                    $startDT = new DateTime("next $en $startTime", new DateTimeZone('America/Mexico_City'));
                                    $endDT = new DateTime("next $en $endTime", new DateTimeZone('America/Mexico_City'));
                                    $recurrence = ["RRULE:FREQ=WEEKLY;BYDAY=" . $rruleMap[$en]];

                                    error_log("📅 [Calendar] Llamando scheduleClassEvent para $en " . $startDT->format('c'));
                                    $link = $calendarService->scheduleClassEvent($shortName, $claseFinal, $teacherName, $startDT->format('c'), $endDT->format('c'), $recurrence);
                                    if ($link) {
                                        error_log("📅 Evento reactivado en Calendar: $link");
                                    } else {
                                        error_log("⚠️ [Calendar] scheduleClassEvent devolvió null/false");
                                    }
                                }
                            }
                        } else {
                            error_log("⚠️ [Calendar] Regex no coincidió con horario: '$horarioNorm'");
                        }
                    } catch (Exception $e) {
                        error_log("⚠️ Error reactivando evento en Calendar: " . $e->getMessage() . " en " . $e->getFile() . ":" . $e->getLine());
                    }
                }
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
            if (isset($input['salon_id'])) {
                $fields[] = 'salon_id = ?';
                $params[] = $input['salon_id'] ? (int)$input['salon_id'] : null;
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
                    a.salon_id,
                    COALESCE(m.nombre, 'Sin asignar') as maestro
                FROM alumnos a
                LEFT JOIN maestros m ON a.maestro_id = m.id
                WHERE a.id = ?
            ", [$id]);

            error_log("✅ Alumno actualizado: " . ($input['nombre'] ?? $alumnoExistente[0]['nombre']));

            // Notificaciones: baja, reactivación o modificación
            $nombreUsuarioNot = $user['nombre'] ?? 'Sistema';
            $nombreAlumnoNot  = $alumnoExistente[0]['nombre'];
            $empresaIdNot     = (int)($input['empresa_id'] ?? 1);
            $viejoEstatus     = $alumnoExistente[0]['estatus'] ?? '';
            $viejoMaestroId   = (int)($alumnoExistente[0]['maestro_id'] ?? 0);
            $nuevoMaestroId   = isset($input['maestro_id']) ? (int)($input['maestro_id'] ?: 0) : $viejoMaestroId;
            $viejoHorario     = $alumnoExistente[0]['horario'] ?? '';
            $nuevoHorario     = isset($input['horario']) ? (string)$input['horario'] : $viejoHorario;

            if (isset($input['estatus']) && $input['estatus'] === 'Baja') {
                // Baja: notificar admin y maestro actual
                NotificacionesController::crearNotificacion('baja_alumno', "El alumno $nombreAlumnoNot fue dado de baja, registró $nombreUsuarioNot", $empresaIdNot);
                if ($viejoMaestroId > 0) {
                    NotificacionesController::crearNotificacion('baja_alumno', "El alumno $nombreAlumnoNot fue dado de baja de tu clase", $empresaIdNot, $viejoMaestroId);
                }
            } elseif (isset($input['estatus']) && $input['estatus'] === 'Activo' && $viejoEstatus === 'Baja') {
                // Reactivación: notificar admin y maestro asignado
                NotificacionesController::crearNotificacion('alta_alumno', "$nombreUsuarioNot ha reactivado al alumno $nombreAlumnoNot", $empresaIdNot);
                if ($viejoMaestroId > 0) {
                    NotificacionesController::crearNotificacion('alta_alumno', "El alumno $nombreAlumnoNot ha sido reactivado en tu clase", $empresaIdNot, $viejoMaestroId);
                }
            } else {
                // Modificación genérica: notificar admin
                NotificacionesController::crearNotificacion('modificacion_alumno', "$nombreUsuarioNot ha actualizado al alumno $nombreAlumnoNot", $empresaIdNot);
                // Cambio de maestro: baja al viejo, alta al nuevo
                if ($viejoMaestroId !== $nuevoMaestroId) {
                    if ($viejoMaestroId > 0) {
                        NotificacionesController::crearNotificacion('baja_alumno', "El alumno $nombreAlumnoNot fue removido de tu clase", $empresaIdNot, $viejoMaestroId);
                    }
                    if ($nuevoMaestroId > 0) {
                        NotificacionesController::crearNotificacion('alta_alumno', "El alumno $nombreAlumnoNot fue asignado a tu clase", $empresaIdNot, $nuevoMaestroId);
                    }
                } elseif ($viejoMaestroId > 0 && $viejoHorario !== $nuevoHorario && $nuevoHorario !== '') {
                    // Mismo maestro, cambio de horario
                    NotificacionesController::crearNotificacion('modificacion_alumno', "Se actualizó el horario de $nombreAlumnoNot", $empresaIdNot, $viejoMaestroId);
                }
            }

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

            $alumnoEncontrado = null;

            // Estrategia 1: Extraer nombre con regex original
            $match = [];
            if (preg_match('/(?:Mensualidad\s+clase\s+de\s+\w+\s+)?[GI]\s+(.+?)(?:\s*,|$)/i', $concepto, $match)) {
                $nombreExtraido = trim($match[1]);
                error_log("👤 Nombre extraído por regex: $nombreExtraido");

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
                    $alumnoEncontrado = $alumnos[0];
                }
            }

            // Estrategia 2 (fallback): Buscar cualquier alumno activo cuyo nombre aparezca en el concepto
            if (!$alumnoEncontrado) {
                error_log("🔍 Regex no coincidió, buscando nombre de alumno en concepto...");
                $todosAlumnos = executeQuery("
                    SELECT id, nombre
                    FROM alumnos
                    WHERE empresa_id = 1
                        AND nombre NOT LIKE '[ELIMINADO]%'
                        AND estatus != 'Baja'
                    ORDER BY CHAR_LENGTH(nombre) DESC
                ");

                foreach ($todosAlumnos as $alumno) {
                    if (mb_stripos($concepto, $alumno['nombre']) !== false) {
                        $alumnoEncontrado = $alumno;
                        error_log("👤 Alumno encontrado por búsqueda directa: " . $alumno['nombre']);
                        break;
                    }
                }
            }

            if ($alumnoEncontrado) {
                $alumnoId = $alumnoEncontrado['id'];
                $alumnoNombre = $alumnoEncontrado['nombre'];

                // Solo actualizar si la nueva fecha es más reciente que la existente
                executeUpdate("
                    UPDATE alumnos
                    SET fecha_ultimo_pago = CASE
                        WHEN fecha_ultimo_pago IS NULL THEN ?
                        WHEN ? > fecha_ultimo_pago THEN ?
                        ELSE fecha_ultimo_pago
                    END
                    WHERE id = ?
                ", [$fecha, $fecha, $fecha, $alumnoId]);

                error_log("✅ fecha_ultimo_pago actualizada para: $alumnoNombre -> $fecha");
            } else {
                error_log("⚠️ No se encontró alumno en concepto: \"$concepto\"");
            }
        } catch (Exception $e) {
            error_log("❌ Error actualizando fecha_ultimo_pago: " . $e->getMessage());
        }
    }

    /**
     * Recalcula fecha_ultimo_pago buscando el MAX(fecha) entre las transacciones
     * de ingreso restantes para el alumno identificado en $concepto.
     * Se usa tras DELETE o UPDATE para reflejar correctamente el estado de pago.
     */
    private static function recalcularFechaUltimoPago($concepto, $empresa_id) {
        try {
            error_log("🔄 Recalculando fecha_ultimo_pago para: $concepto");

            $alumnoEncontrado = null;

            // Estrategia 1: Extraer nombre con regex
            $match = [];
            if (preg_match('/(?:Mensualidad\s+clase\s+de\s+\w+\s+)?[GI]\s+(.+?)(?:\s*,|$)/i', $concepto, $match)) {
                $nombreExtraido = trim($match[1]);

                $alumnos = executeQuery("
                    SELECT id, nombre
                    FROM alumnos
                    WHERE empresa_id = ?
                        AND (
                            nombre = ?
                            OR REPLACE(nombre, '  ', ' ') = ?
                        )
                    LIMIT 1
                ", [$empresa_id, $nombreExtraido, $nombreExtraido]);

                if (empty($alumnos)) {
                    $alumnos = executeQuery("
                        SELECT id, nombre
                        FROM alumnos
                        WHERE empresa_id = ?
                            AND nombre LIKE ?
                        ORDER BY
                            CASE
                                WHEN nombre = ? THEN 1
                                WHEN nombre LIKE CONCAT(?, '%') THEN 2
                                ELSE 3
                            END
                        LIMIT 1
                    ", [$empresa_id, "%$nombreExtraido%", $nombreExtraido, $nombreExtraido]);
                }

                if (!empty($alumnos)) {
                    $alumnoEncontrado = $alumnos[0];
                }
            }

            // Estrategia 2 (fallback): buscar nombre de alumno activo en el concepto
            if (!$alumnoEncontrado) {
                $todosAlumnos = executeQuery("
                    SELECT id, nombre
                    FROM alumnos
                    WHERE empresa_id = ?
                        AND nombre NOT LIKE '[ELIMINADO]%'
                    ORDER BY CHAR_LENGTH(nombre) DESC
                ", [$empresa_id]);

                foreach ($todosAlumnos as $alumno) {
                    if (mb_stripos($concepto, $alumno['nombre']) !== false) {
                        $alumnoEncontrado = $alumno;
                        break;
                    }
                }
            }

            if (!$alumnoEncontrado) {
                error_log("⚠️ recalcularFechaUltimoPago: alumno no encontrado en concepto \"$concepto\"");
                return;
            }

            $alumnoNombre = $alumnoEncontrado['nombre'];

            // Buscar la transacción de ingreso más reciente restante para este alumno
            $result = executeQuery("
                SELECT MAX(fecha) AS ultima_fecha
                FROM transacciones
                WHERE tipo = 'I'
                    AND empresa_id = ?
                    AND concepto LIKE ?
            ", [$empresa_id, "%$alumnoNombre%"]);

            $nuevaFecha = (!empty($result) && $result[0]['ultima_fecha']) ? $result[0]['ultima_fecha'] : null;

            // Actualizar TODAS las filas del alumno (1 fila por inscripción)
            executeUpdate("
                UPDATE alumnos
                SET fecha_ultimo_pago = ?
                WHERE empresa_id = ?
                    AND nombre = ?
            ", [$nuevaFecha, $empresa_id, $alumnoNombre]);

            error_log("✅ fecha_ultimo_pago recalculada para $alumnoNombre -> " . ($nuevaFecha ?? 'NULL'));

        } catch (Exception $e) {
            error_log("❌ Error en recalcularFechaUltimoPago: " . $e->getMessage());
        }
    }

    // Métodos helpers para gastos e ingresos
    public static function getGastos() {
        self::$tipoOverride = 'G';
        self::getTransacciones();
    }

    public static function getIngresos() {
        self::$tipoOverride = 'I';
        self::getTransacciones();
    }

    public static function createGasto() {
        $input = json_decode(file_get_contents('php://input'), true);
        $input['tipo'] = 'G';
        self::$inputOverride = $input;
        self::createTransaccion();
    }

    public static function createIngreso() {
        $input = json_decode(file_get_contents('php://input'), true);
        $input['tipo'] = 'I';
        self::$inputOverride = $input;
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
            // Join directo con alumnos usando nombre+clase para evitar que alumnos
            // multi-instrumento (ej. Joshua: Guitarra/Batería/Canto/Bajo) acumulen
            // todas sus transacciones en un solo maestro. Cada tx matchea exactamente
            // la inscripción correcta por concepto que incluye instrumento y nombre.
            $ingresosQuery = "
                SELECT
                    COALESCE(m.nombre, 'Sin asignar') as maestro,
                    a.estatus,
                    SUM(t.total) as total_ingresos
                FROM transacciones t
                INNER JOIN alumnos a
                    ON  t.concepto LIKE CONCAT('%', a.nombre, '%')
                    AND t.concepto LIKE CONCAT('%', a.clase, '%')
                LEFT JOIN maestros m ON a.maestro_id = m.id
                WHERE t.tipo = 'I'
                    AND t.empresa_id = ?
                    AND a.empresa_id = ?
                    AND a.nombre NOT LIKE '[ELIMINADO]%'
                GROUP BY m.nombre, a.estatus
            ";
            $ingresos = executeQuery($ingresosQuery, [$empresa_id, $empresa_id]);

            // 3c. INGRESOS DEL MES ACTUAL por maestro (mismo patrón, filtrado por mes corriente)
            $ingresosMesQuery = "
                SELECT
                    COALESCE(m.nombre, 'Sin asignar') as maestro,
                    SUM(t.total) as total_ingresos
                FROM transacciones t
                INNER JOIN alumnos a
                    ON  t.concepto LIKE CONCAT('%', a.nombre, '%')
                    AND t.concepto LIKE CONCAT('%', a.clase, '%')
                LEFT JOIN maestros m ON a.maestro_id = m.id
                WHERE t.tipo = 'I'
                    AND t.empresa_id = ?
                    AND a.empresa_id = ?
                    AND a.nombre NOT LIKE '[ELIMINADO]%'
                    AND YEAR(t.fecha) = YEAR(CURDATE())
                    AND MONTH(t.fecha) = MONTH(CURDATE())
                GROUP BY m.nombre
            ";
            $ingresosMes = executeQuery($ingresosMesQuery, [$empresa_id, $empresa_id]);

            // Crear mapa de ingresos históricos por maestro
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

            // Crear mapa de ingresos del mes actual por maestro
            $ingresosMesMap = [];
            foreach ($ingresosMes as $ing) {
                $ingresosMesMap[$ing['maestro']] = (float)$ing['total_ingresos'];
            }

            // Agregar ingresos reales a la distribución de maestros
            foreach ($distribucion_maestros as &$maestro) {
                $nombre = $maestro['maestro'];
                $maestro['ingresos_activos'] = $ingresosMap[$nombre]['activos'] ?? 0;
                $maestro['ingresos_bajas']   = $ingresosMap[$nombre]['bajas']   ?? 0;
                $maestro['ingresos_mes']     = $ingresosMesMap[$nombre]         ?? 0;
            }
            unset($maestro);

            // 4. MÉTRICAS ESPECÍFICAS DE ROCKSTARSKULL
            // Subquery para obtener fecha_ultimo_pago real (fallback a transacciones si es NULL)
            $metricasQuery = "
                SELECT
                    SUM(CASE WHEN tipo_clase = 'Grupal' AND estatus = 'Activo' THEN 1 ELSE 0 END) as clases_grupales,
                    SUM(CASE WHEN tipo_clase = 'Individual' AND estatus = 'Activo' THEN 1 ELSE 0 END) as clases_individuales,
                    -- Al corriente: pagó este mes o pagó mes anterior y aún no vence periodo actual
                    SUM(CASE
                        WHEN estatus = 'Activo' AND (
                            DATE_FORMAT(fecha_pago_real, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
                            OR (
                                DATE_FORMAT(fecha_pago_real, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')
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
                            DATE_FORMAT(fecha_pago_real, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
                            OR (
                                DATE_FORMAT(fecha_pago_real, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')
                                AND CURDATE() <= DATE_ADD(
                                    LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)),
                                    INTERVAL 5 DAY
                                )
                            )
                        ) THEN 1 ELSE 0 END
                    ) as alumnos_pendientes
                FROM (
                    SELECT a.*,
                        NULLIF(
                            GREATEST(
                                COALESCE(a.fecha_ultimo_pago, '1900-01-01'),
                                COALESCE((
                                    SELECT MAX(t.fecha)
                                    FROM transacciones t
                                    WHERE t.tipo = 'I'
                                      AND t.empresa_id = a.empresa_id
                                      AND t.concepto LIKE CONCAT('%', a.nombre, '%')
                                ), '1900-01-01')
                            ),
                            '1900-01-01'
                        ) as fecha_pago_real
                    FROM alumnos a
                    WHERE a.empresa_id = ?
                        AND a.nombre NOT LIKE '[ELIMINADO]%'
                ) sub
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
     * v3.5.0: Unifica alumnos con múltiples clases
     */
    public static function getDashboardAlertasPagos() {
        AuthController::requireAuth();

        try {
            error_log("🔔 Obteniendo alertas de pagos...");

            $empresa_id = $_GET['empresa_id'] ?? 1;

            // v3.5.0: Unificar alumnos con múltiples clases
            // Agrupa por nombre y concatena clases
            $alumnosQuery = "
                SELECT
                    MIN(a.id) as id,
                    a.nombre,
                    GROUP_CONCAT(DISTINCT a.clase ORDER BY a.clase SEPARATOR ', ') as clase,
                    CASE
                        WHEN SUM(CASE WHEN a.estatus = 'Activo' THEN 1 ELSE 0 END) > 0 THEN 'Activo'
                        ELSE 'Baja'
                    END as estatus,
                    MIN(a.fecha_inscripcion) as fecha_inscripcion,
                    NULLIF(
                        GREATEST(
                            MAX(COALESCE(a.fecha_ultimo_pago, '1900-01-01')),
                            COALESCE((
                                SELECT MAX(t.fecha)
                                FROM transacciones t
                                WHERE t.tipo = 'I'
                                  AND t.empresa_id = a.empresa_id
                                  AND t.concepto LIKE CONCAT('%', a.nombre, '%')
                            ), '1900-01-01')
                        ),
                        '1900-01-01'
                    ) as fecha_ultimo_pago,
                    SUM(COALESCE(a.precio_mensual, 0)) as precio_mensual
                FROM alumnos a
                WHERE a.empresa_id = ?
                    AND a.nombre NOT LIKE '[ELIMINADO]%'
                GROUP BY a.nombre, a.empresa_id
                ORDER BY a.nombre
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
     *
     * v3.5.1: Búsqueda simplificada - patrón construido en PHP
     */
    public static function getHistorialPagosAlumno($nombreAlumno) {
        AuthController::requireAuth();

        $meses = isset($_GET['meses']) ? (int)$_GET['meses'] : null;

        try {
            // Decodificar nombre si viene URL-encoded
            $nombreAlumno = urldecode($nombreAlumno);

            // Normalizar nombre: quitar espacios extras
            $nombreAlumno = trim(preg_replace('/\s+/', ' ', $nombreAlumno));

            error_log("🔍 Buscando historial de pagos para: '$nombreAlumno'");

            // v3.5.1: Construir patrón LIKE en PHP (más confiable que CONCAT en SQL)
            $searchPattern = '%' . mb_strtolower($nombreAlumno) . '%';

            error_log("📝 Patrón de búsqueda: '$searchPattern'");

            $query = "
                SELECT
                    id,
                    concepto,
                    (cantidad * precio_unitario) as total,
                    fecha,
                    tipo,
                    empresa_id,
                    forma_pago,
                    socio
                FROM transacciones
                WHERE tipo = 'I'
                AND LOWER(concepto) LIKE ?
                AND empresa_id = 1
            ";

            $params = [$searchPattern];

            // Si se especifica meses, filtrar
            if ($meses) {
                $query .= " AND fecha >= DATE_SUB(NOW(), INTERVAL ? MONTH)";
                $params[] = $meses;
            }

            $query .= " ORDER BY fecha DESC";

            $pagos = executeQuery($query, $params);

            error_log("✅ Pagos encontrados: " . count($pagos));

            // Log detallado de los primeros conceptos
            if (count($pagos) > 0) {
                error_log("📋 Primeros 5 conceptos encontrados:");
                foreach (array_slice($pagos, 0, 5) as $p) {
                    error_log("   -> " . $p['concepto']);
                }
            } else {
                // Debug: buscar transacciones que contengan partes del nombre
                error_log("⚠️ No se encontraron pagos. Verificando si existen transacciones...");
                $partes = explode(' ', $nombreAlumno);
                $primerNombre = $partes[0] ?? '';
                $apellido = end($partes);

                $debugQuery = "
                    SELECT DISTINCT concepto
                    FROM transacciones
                    WHERE tipo = 'I' AND empresa_id = 1
                    AND (LOWER(concepto) LIKE ? OR LOWER(concepto) LIKE ?)
                    LIMIT 10
                ";
                $debugParams = ['%' . mb_strtolower($primerNombre) . '%', '%' . mb_strtolower($apellido) . '%'];
                $debugResults = executeQuery($debugQuery, $debugParams);

                error_log("🔎 Transacciones con '$primerNombre' o '$apellido': " . count($debugResults));
                foreach ($debugResults as $r) {
                    error_log("   -> " . $r['concepto']);
                }
            }

            echo json_encode([
                'success' => true,
                'data' => $pagos,
                'alumno' => $nombreAlumno,
                'total_pagos' => count($pagos),
                'debug' => ['search_pattern' => $searchPattern]
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
            $empresa = (int)($_GET['empresa'] ?? 0);
            $ano    = (int)($_GET['ano'] ?? 0);
            $mes    = (int)($_GET['mes'] ?? 0);
            $tipo   = $_GET['tipo'] ?? '';

            $whereConditions = [];
            $params = [];

            if ($ano > 0) {
                $whereConditions[] = "YEAR(fecha) = ?";
                $params[] = $ano;
            }

            if ($empresa > 0) {
                $whereConditions[] = "empresa_id = ?";
                $params[] = $empresa;
            }

            if ($mes > 0) {
                $whereConditions[] = "MONTH(fecha) = ?";
                $params[] = $mes;
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
                    empresa_id,
                    forma_pago
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

            // Query para obtener todas las transacciones con sus detalles (incluyendo empresa_id y socio)
            $cuentasQuery = "
                SELECT
                    tipo,
                    forma_pago,
                    LOWER(concepto) as concepto_lower,
                    total,
                    empresa_id,
                    socio
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
                $socio = $tx['socio'] ?? '';

                if ($tipo === 'I') {
                    // INGRESOS
                    if ($formaPago === 'TPV' || $formaPago === 'TPV Domiciliado' || $formaPago === 'Mercado Pago') {
                        $mercadoPago['ingresos'] += $monto;
                    } elseif ($formaPago === 'Transferencia' || $formaPago === 'CTIM') {
                        $inbursa['ingresos'] += $monto;
                    } elseif ($formaPago === 'Efectivo') {
                        $cajaFuerte['ingresos'] += $monto;
                    }
                } else {
                    // GASTOS

                    // Gastos etiquetados como "Inversion a RS/ST - ..." son inversión personal
                    // de los socios. No afectan los saldos de las cuentas bancarias.
                    if (strpos($formaPago, 'Inversion a') === 0) {
                        continue;
                    }

                    // Regla especial: Gastos de Symbiot Technologies (empresa_id=2) van a Inbursa
                    // (fueron devueltos a Marco Delgado desde Inbursa)
                    if ($empresaId === 2) {
                        $inbursa['gastos'] += $monto;
                        continue;
                    }

                    // Reglas para RockstarSkull (empresa_id=1)
                    if ($formaPago === 'TPV' || $formaPago === 'TPV Domiciliado' || $formaPago === 'Mercado Pago') {
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

    /**
     * Reporte de Altas y Bajas de Alumnos
     * GET /reportes/altas-bajas?empresa=X&ano=Y
     *
     * Enfoque HÍBRIDO: transacciones para presencia histórica + estatus para proyección
     *
     * Un alumno está "activo" en un mes si:
     *   1. Tiene transacción ese mes (presencia comprobada), O
     *   2. El mes es >= su última transacción, estatus='Activo' y precio > 0
     *      (sigue inscrito, simplemente no ha pagado ese mes aún)
     *
     * Esto detecta GAPS como el caso de Fanny Ieraldini:
     *   - Activa meses 1-5 (transacciones), ausente meses 6-8 (sin tx), regresa mes 9
     *   - En meses 6-8 NO se cuenta como activa (gap real)
     *   - Desde su última tx hasta hoy: activa (estatus=Activo, precio > 0)
     *
     * Alta = activo en mes M, NO activo en mes M-1
     * Baja = NO activo en mes M, activo en mes M-1
     *
     * Excluye alumnos con nombre LIKE '[ELIMINADO]%'
     */
    public static function getReporteAltasBajas() {
        AuthController::requireAuth();

        try {
            $empresa = $_GET['empresa'] ?? '';
            $ano = $_GET['ano'] ?? '';

            if (empty($empresa)) {
                echo json_encode(['success' => false, 'error' => 'Se requiere filtro de empresa']);
                return;
            }

            // 1. Obtener alumnos de la empresa agrupados por nombre único (excluir eliminados)
            // GROUP BY nombre para que alumnos multi-inscripción cuenten como 1 persona,
            // igual que el gestor con unificar=1. Evita el bug del break en el matching
            // de transacciones donde filas secundarias del mismo nombre quedaban sin lastTx.
            $alumnosQuery = "
                SELECT
                    MIN(id)                                                                   AS id,
                    nombre,
                    MAX(CASE WHEN estatus = 'Activo' THEN 'Activo' ELSE 'Baja' END)         AS estatus,
                    MIN(fecha_inscripcion)                                                    AS fecha_inscripcion,
                    SUM(COALESCE(precio_mensual, 0))                                         AS precio_mensual,
                    GROUP_CONCAT(DISTINCT tipo_clase ORDER BY tipo_clase SEPARATOR ', ')     AS tipo_clase
                FROM alumnos
                WHERE empresa_id = ?
                  AND nombre NOT LIKE '[ELIMINADO]%'
                GROUP BY nombre
                ORDER BY nombre
            ";
            $alumnos = executeQuery($alumnosQuery, [(int)$empresa]);
            
            // DEBUG: Log total de alumnos obtenidos
            error_log("👥 Reporte Altas/Bajas - Empresa: {$empresa} - Total alumnos cargados: " . count($alumnos));

            if (empty($alumnos)) {
                echo json_encode([
                    'success' => true,
                    'data' => ['meses' => [], 'resumen' => ['total_altas' => 0, 'total_bajas' => 0, 'neto' => 0, 'total_alumnos' => 0]]
                ]);
                return;
            }

            // 2. Obtener TODAS las transacciones de ingresos (sin filtro de año, necesitamos historial completo)
            $txQuery = "
                SELECT t.concepto, DATE_FORMAT(t.fecha, '%Y-%m') as mes
                FROM transacciones t
                WHERE t.empresa_id = ? AND t.tipo = 'I'
                ORDER BY t.fecha
            ";
            $transacciones = executeQuery($txQuery, [(int)$empresa]);

            // 3. Mapear meses con transacción por alumno + último mes de transacción
            $alumnoMeses = [];   // id => ['2023-08' => true, '2023-09' => true, ...]
            $alumnoLastTx = [];  // id => '2025-11'

            foreach ($alumnos as $alumno) {
                $alumnoMeses[$alumno['id']] = [];
            }

            foreach ($transacciones as $tx) {
                $conceptoLower = mb_strtolower(trim($tx['concepto']));
                foreach ($alumnos as $alumno) {
                    $nombreLower = mb_strtolower(trim($alumno['nombre']));
                    if (strpos($conceptoLower, $nombreLower) !== false) {
                        $alumnoMeses[$alumno['id']][$tx['mes']] = true;
                        if (!isset($alumnoLastTx[$alumno['id']]) || $tx['mes'] > $alumnoLastTx[$alumno['id']]) {
                            $alumnoLastTx[$alumno['id']] = $tx['mes'];
                        }
                        break;
                    }
                }
            }

            // 4. Generar rango continuo de meses a analizar
            $mesActual = date('Y-m');
            $allMeses = [];

            // Incluir meses de inscripción
            foreach ($alumnos as $alumno) {
                if (!empty($alumno['fecha_inscripcion'])) {
                    $allMeses[date('Y-m', strtotime($alumno['fecha_inscripcion']))] = true;
                }
            }
            // Incluir meses de transacciones
            foreach ($transacciones as $tx) {
                $allMeses[$tx['mes']] = true;
            }
            // Incluir mes actual
            $allMeses[$mesActual] = true;

            if (empty($allMeses)) {
                echo json_encode([
                    'success' => true,
                    'data' => ['meses' => [], 'resumen' => ['total_altas' => 0, 'total_bajas' => 0, 'neto' => 0, 'total_alumnos' => count($alumnos)]]
                ]);
                return;
            }

            ksort($allMeses);
            $monthKeys = array_keys($allMeses);
            $primerMes = reset($monthKeys);
            $ultimoMes = end($monthKeys);

            $mesesContinuos = [];
            $cur = $primerMes;
            while ($cur <= $ultimoMes) {
                $mesesContinuos[] = $cur;
                $cur = date('Y-m', strtotime($cur . '-01 +1 month'));
            }

            // Filtrar por año si se especificó
            if (!empty($ano)) {
                $mesesContinuos = array_values(array_filter($mesesContinuos, function($m) use ($ano) {
                    return strpos($m, $ano) === 0;
                }));
            }

            // 5. Para cada alumno y cada mes, determinar si está activo
            // Pre-calcular mapa de actividad: alumno_id => mes => bool
            // Esto es más eficiente que recalcular en cada iteración
            $alumnoActivoEnMes = [];

            foreach ($alumnos as $alumno) {
                $id = $alumno['id'];
                if (empty($alumno['fecha_inscripcion'])) continue;

                $inscMes = date('Y-m', strtotime($alumno['fecha_inscripcion']));
                $esBaja = $alumno['estatus'] === 'Baja';
                $lastTx = isset($alumnoLastTx[$id]) ? $alumnoLastTx[$id] : null;

                foreach ($mesesContinuos as $mes) {
                    // Antes de inscripción: no activo
                    if ($mes < $inscMes) {
                        $alumnoActivoEnMes[$id][$mes] = false;
                        continue;
                    }

                    // Tiene transacción este mes: activo
                    if (isset($alumnoMeses[$id][$mes])) {
                        $alumnoActivoEnMes[$id][$mes] = true;
                        continue;
                    }

                    // Sin transacción este mes:
                    // Si NO es Baja y el mes es >= última transacción → sigue activo
                    // (no ha pagado aún pero sigue inscrito)
                    if (!$esBaja && $lastTx !== null && $mes >= $lastTx) {
                        $alumnoActivoEnMes[$id][$mes] = true;
                        continue;
                    }

                    // Fallback mes actual: alumno Activo en BD sin transacciones detectadas
                    // (concepto en transacción puede tener discrepancia de acentos u ortografía)
                    // Solo aplica al mes en curso para no distorsionar el historial
                    if (!$esBaja && $lastTx === null && $mes === $mesActual) {
                        $alumnoActivoEnMes[$id][$mes] = true;
                        continue;
                    }

                    // Cualquier otro caso: no activo
                    // - Gap histórico entre transacciones (baja temporal)
                    // - Estatus Baja después de última transacción (baja definitiva)
                    $alumnoActivoEnMes[$id][$mes] = false;
                }
            }

            // 6. Calcular altas, bajas y activos por mes
            $resultado = [];
            $totalAltas = 0;
            $totalBajas = 0;

            foreach ($mesesContinuos as $idx => $mes) {
                $altas = 0;
                $bajas = 0;
                $activos = 0;

                $mesAnterior = date('Y-m', strtotime($mes . '-01 -1 month'));

                foreach ($alumnoActivoEnMes as $id => $mesesMap) {
                    $activoEsteMes = isset($mesesMap[$mes]) && $mesesMap[$mes];
                    $activoMesAnterior = isset($mesesMap[$mesAnterior]) && $mesesMap[$mesAnterior];

                    if ($activoEsteMes) {
                        $activos++;
                    }

                    // Alta: activo este mes, no activo el anterior
                    if ($activoEsteMes && !$activoMesAnterior) {
                        $altas++;
                    }

                    // Baja: no activo este mes, activo el anterior
                    if (!$activoEsteMes && $activoMesAnterior) {
                        $bajas++;
                    }
                }

                $resultado[] = [
                    'mes' => $mes,
                    'altas' => $altas,
                    'bajas' => $bajas,
                    'neto' => $altas - $bajas,
                    'alumnos_activos' => $activos
                ];

                $totalAltas += $altas;
                $totalBajas += $bajas;
            }

            echo json_encode([
                'success' => true,
                'data' => [
                    'meses' => $resultado,
                    'resumen' => [
                        'total_altas' => $totalAltas,
                        'total_bajas' => $totalBajas,
                        'neto' => $totalAltas - $totalBajas,
                        // Contar solo alumnos únicos con estatus Activo (coherente con gestor unificar=1)
                    'total_alumnos' => count(array_filter($alumnos, function($a) { return $a['estatus'] === 'Activo'; }))
                    ]
                ]
            ]);
            
            // DEBUG: Log resultado final
            error_log("✅ Reporte generado - Total alumnos retornados: " . count($alumnos));

        } catch (Exception $e) {
            error_log("Error en reporte altas/bajas: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error generando reporte de altas y bajas',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener horario calculado desde Google Calendar
     * GET /alumnos/{id}/horario-calendar
     */
    public static function getHorarioFromCalendar($id) {
        AuthController::requireAuth();
        
        try {
            // Obtener datos del alumno
            $alumno = executeQuery("SELECT nombre, clase FROM alumnos WHERE id = ?", [$id]);
            
            if (empty($alumno)) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Alumno no encontrado']);
                return;
            }
            
            $nombre = $alumno[0]['nombre'];
            $clase = $alumno[0]['clase'];
            
            // Verificar autoloader de Composer
            $autoloadPath = __DIR__ . '/../../vendor/autoload.php';
            if (!file_exists($autoloadPath)) {
                throw new Exception("No se encuentra vendor/autoload.php. Ejecuta 'composer install'.");
            }

            $servicePath = __DIR__ . '/../config/GoogleCalendarService.php';
            if (!file_exists($servicePath)) {
                throw new Exception("El archivo de servicio de calendario no existe en: $servicePath");
            }
            require_once $servicePath;
            $calendarService = new GoogleCalendarService();
            
            $horario = $calendarService->getStudentSchedule($nombre, $clase);
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'horario' => $horario,
                    'alumno' => $nombre,
                    'clase' => $clase
                ]
            ]);

        } catch (Throwable $e) {
            error_log("Error obteniendo horario de calendar: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    // ================================================================
    // SYMBIOT TECHNOLOGIES — SENSORES & CLIENTES
    // ================================================================

    public static function getDashboardSensores() {
        AuthController::requireAuth();
        try {
            $pdo = getConnection();
            $empresa_id = intval($_GET['empresa_id'] ?? 2);

            // — Estadísticas generales de sensores —
            $stmtStats = $pdo->prepare(
                "SELECT
                    COUNT(*) AS total_sensores,
                    SUM(CASE WHEN estado = 'Activo'      THEN 1 ELSE 0 END) AS activos,
                    SUM(CASE WHEN estado = 'Inactivo'    THEN 1 ELSE 0 END) AS inactivos,
                    SUM(CASE WHEN estado = 'Fabricacion' THEN 1 ELSE 0 END) AS fabricacion
                 FROM sensores WHERE empresa_id = ?"
            );
            $stmtStats->execute([$empresa_id]);
            $stats = $stmtStats->fetch(PDO::FETCH_ASSOC);

            // — Distribución geográfica —
            $stmtGeo = $pdo->prepare(
                "SELECT
                    ubicacion_pais AS pais,
                    SUM(CASE WHEN estado = 'Activo'   THEN 1 ELSE 0 END) AS activos,
                    SUM(CASE WHEN estado = 'Inactivo' THEN 1 ELSE 0 END) AS inactivos,
                    COUNT(*) AS total
                 FROM sensores
                 WHERE empresa_id = ? AND ubicacion_pais IS NOT NULL
                 GROUP BY ubicacion_pais ORDER BY total DESC"
            );
            $stmtGeo->execute([$empresa_id]);
            $distribucion_geo = $stmtGeo->fetchAll(PDO::FETCH_ASSOC);

            // — Clientes —
            $stmtClientes = $pdo->prepare(
                "SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN estatus = 'Activo' THEN 1 ELSE 0 END) AS activos,
                    SUM(CASE WHEN estatus = 'Baja'   THEN 1 ELSE 0 END) AS bajas
                 FROM clientes_symbiot WHERE empresa_id = ?"
            );
            $stmtClientes->execute([$empresa_id]);
            $clientes = $stmtClientes->fetch(PDO::FETCH_ASSOC);

            // — Movimientos del mes: sensores instalados/desconectados este mes —
            $mesActual = date('Y-m');
            $stmtMov = $pdo->prepare(
                "SELECT
                    SUM(CASE WHEN estado = 'Activo'   AND DATE_FORMAT(fecha_instalacion,'%Y-%m') = ? THEN 1 ELSE 0 END) AS encendidos,
                    SUM(CASE WHEN estado = 'Inactivo' AND DATE_FORMAT(updated_at,'%Y-%m') = ?         THEN 1 ELSE 0 END) AS desconectados,
                    SUM(CASE WHEN estado = 'Fabricacion'                                              THEN 1 ELSE 0 END) AS nuevos_pedidos
                 FROM sensores WHERE empresa_id = ?"
            );
            $stmtMov->execute([$mesActual, $mesActual, $empresa_id]);
            $movimientos = $stmtMov->fetch(PDO::FETCH_ASSOC);

            // — Distribución por tipo de sensor —
            $stmtTipos = $pdo->prepare(
                "SELECT
                    COALESCE(NULLIF(tipo_sensor,''), 'Sin tipo') AS tipo,
                    COUNT(*) AS total,
                    SUM(CASE WHEN estado = 'Activo' THEN 1 ELSE 0 END) AS activos
                 FROM sensores WHERE empresa_id = ?
                 GROUP BY tipo_sensor ORDER BY total DESC"
            );
            $stmtTipos->execute([$empresa_id]);
            $tipos_sensor = $stmtTipos->fetchAll(PDO::FETCH_ASSOC);

            // — Clientes con ingreso por suscripción —
            $stmtClientesLista = $pdo->prepare(
                "SELECT id, nombre, empresa, pais, tipo_suscripcion,
                        precio_suscripcion, fecha_vencimiento, estatus
                 FROM clientes_symbiot
                 WHERE empresa_id = ?
                 ORDER BY estatus ASC, nombre ASC"
            );
            $stmtClientesLista->execute([$empresa_id]);
            $clientes_lista = $stmtClientesLista->fetchAll(PDO::FETCH_ASSOC);

            // — Alertas de suscripción: clientes con vencimiento en los próximos 10 días —
            $fechaLimite = date('Y-m-d', strtotime('+10 days'));
            $hoy = date('Y-m-d');
            $stmtAlertas = $pdo->prepare(
                "SELECT id, nombre, empresa, pais, tipo_suscripcion, precio_suscripcion,
                        fecha_vencimiento, estatus,
                        DATEDIFF(fecha_vencimiento, CURDATE()) AS dias_restantes
                 FROM clientes_symbiot
                 WHERE empresa_id = ? AND estatus = 'Activo'
                   AND fecha_vencimiento BETWEEN ? AND ?
                 ORDER BY fecha_vencimiento ASC"
            );
            $stmtAlertas->execute([$empresa_id, $hoy, $fechaLimite]);
            $alertas = $stmtAlertas->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => [
                    'stats'            => $stats,
                    'distribucion_geo' => $distribucion_geo,
                    'clientes'         => $clientes,
                    'clientes_lista'   => $clientes_lista,
                    'tipos_sensor'     => $tipos_sensor,
                    'movimientos_mes'  => $movimientos,
                    'alertas_suscripcion' => $alertas,
                ]
            ]);
        } catch (Exception $e) {
            error_log("Error getDashboardSensores: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public static function getSensores() {
        AuthController::requireAuth();
        try {
            $pdo = getConnection();
            $empresa_id = intval($_GET['empresa_id'] ?? 2);
            $estado     = $_GET['estado']     ?? null;
            $pais       = $_GET['pais']       ?? null;
            $cliente_id = isset($_GET['cliente_id']) ? intval($_GET['cliente_id']) : null;

            $where = ['s.empresa_id = ?'];
            $params = [$empresa_id];

            if ($estado) { $where[] = 's.estado = ?'; $params[] = $estado; }
            if ($pais)   { $where[] = 's.ubicacion_pais = ?'; $params[] = $pais; }
            if ($cliente_id) { $where[] = 's.cliente_id = ?'; $params[] = $cliente_id; }

            $sql = "SELECT s.*, c.nombre AS cliente_nombre, c.empresa AS cliente_empresa
                    FROM sensores s
                    LEFT JOIN clientes_symbiot c ON s.cliente_id = c.id
                    WHERE " . implode(' AND ', $where) . "
                    ORDER BY s.estado ASC, s.nombre ASC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $sensores = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $sensores, 'total' => count($sensores)]);
        } catch (Exception $e) {
            error_log("Error getSensores: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public static function createSensor() {
        AuthController::requireAuth();
        try {
            $pdo  = getConnection();
            $data = json_decode(file_get_contents('php://input'), true) ?? [];

            if (empty($data['nombre'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Campo requerido: nombre']);
                return;
            }

            $stmt = $pdo->prepare(
                "INSERT INTO sensores (
                    nombre, device_id, device_code, token,
                    tipo_sensor, conexion, modelo,
                    ubicacion_pais, ubicacion_ciudad, cliente_id,
                    estado, fecha_instalacion, fecha_ultimo_contacto, empresa_id, notas,
                    version, licencia, modo_operacion, api_url, frecuencia, intervalo_min
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([
                $data['nombre'],
                $data['device_id']              ?? null,
                $data['device_code']            ?? null,
                $data['token']                  ?? null,
                $data['tipo_sensor']            ?? null,
                $data['conexion']               ?? 'WiFi',
                $data['modelo']                 ?? null,
                $data['ubicacion_pais']         ?? null,
                $data['ubicacion_ciudad']       ?? null,
                !empty($data['cliente_id'])     ? intval($data['cliente_id']) : null,
                $data['estado']                 ?? 'Fabricacion',
                $data['fecha_instalacion']      ?? null,
                $data['fecha_ultimo_contacto']  ?? null,
                intval($data['empresa_id']      ?? 2),
                $data['notas']                  ?? null,
                $data['version']                ?? null,
                isset($data['licencia'])        ? intval($data['licencia'])      : null,
                $data['modo_operacion']         ?? null,
                $data['api_url']                ?? null,
                isset($data['frecuencia'])      ? intval($data['frecuencia'])    : null,
                isset($data['intervalo_min'])   ? intval($data['intervalo_min']) : null,
            ]);

            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Sensor creado']);
        } catch (Exception $e) {
            error_log("Error createSensor: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public static function updateSensor($id) {
        AuthController::requireAuth();
        try {
            $pdo  = getConnection();
            $data = json_decode(file_get_contents('php://input'), true) ?? [];

            $stmt = $pdo->prepare(
                "UPDATE sensores SET
                    nombre = ?, device_id = ?, device_code = ?, token = ?,
                    tipo_sensor = ?, conexion = ?, modelo = ?,
                    ubicacion_pais = ?, ubicacion_ciudad = ?, cliente_id = ?,
                    estado = ?, fecha_instalacion = ?, fecha_ultimo_contacto = ?, notas = ?,
                    version = ?, licencia = ?, modo_operacion = ?, api_url = ?,
                    frecuencia = ?, intervalo_min = ?
                 WHERE id = ? AND empresa_id = ?"
            );
            $stmt->execute([
                $data['nombre']                 ?? '',
                $data['device_id']              ?? null,
                $data['device_code']            ?? null,
                $data['token']                  ?? null,
                $data['tipo_sensor']            ?? null,
                $data['conexion']               ?? 'WiFi',
                $data['modelo']                 ?? null,
                $data['ubicacion_pais']         ?? null,
                $data['ubicacion_ciudad']       ?? null,
                !empty($data['cliente_id'])     ? intval($data['cliente_id']) : null,
                $data['estado']                 ?? 'Fabricacion',
                $data['fecha_instalacion']      ?? null,
                $data['fecha_ultimo_contacto']  ?? null,
                $data['notas']                  ?? null,
                $data['version']                ?? null,
                isset($data['licencia'])        ? intval($data['licencia'])      : null,
                $data['modo_operacion']         ?? null,
                $data['api_url']                ?? null,
                isset($data['frecuencia'])      ? intval($data['frecuencia'])    : null,
                isset($data['intervalo_min'])   ? intval($data['intervalo_min']) : null,
                intval($id),
                intval($data['empresa_id']      ?? 2),
            ]);

            echo json_encode(['success' => true, 'message' => 'Sensor actualizado']);
        } catch (Exception $e) {
            error_log("Error updateSensor: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public static function deleteSensor($id) {
        AuthController::requireAuth();
        try {
            $db   = Database::getConnection();
            $stmt = $pdo->prepare("DELETE FROM sensores WHERE id = ?");
            $stmt->execute([intval($id)]);
            echo json_encode(['success' => true, 'message' => 'Sensor eliminado']);
        } catch (Exception $e) {
            error_log("Error deleteSensor: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public static function getClientesSymbiot() {
        AuthController::requireAuth();
        try {
            $pdo = getConnection();
            $empresa_id = intval($_GET['empresa_id'] ?? 2);
            $estatus    = $_GET['estatus'] ?? null;

            $where  = ['empresa_id = ?'];
            $params = [$empresa_id];
            if ($estatus) { $where[] = 'estatus = ?'; $params[] = $estatus; }

            $sql  = "SELECT * FROM clientes_symbiot WHERE " . implode(' AND ', $where)
                  . " ORDER BY estatus ASC, nombre ASC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $clientes, 'total' => count($clientes)]);
        } catch (Exception $e) {
            error_log("Error getClientesSymbiot: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public static function createClienteSymbiot() {
        AuthController::requireAuth();
        try {
            $db   = Database::getConnection();
            $data = json_decode(file_get_contents('php://input'), true) ?? [];

            if (empty($data['nombre'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Campo requerido: nombre']);
                return;
            }

            $stmt = $pdo->prepare(
                "INSERT INTO clientes_symbiot
                    (nombre, empresa, pais, email, telefono, tipo_suscripcion, precio_suscripcion,
                     fecha_inicio, fecha_vencimiento, estatus, empresa_id, notas)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([
                $data['nombre'],
                $data['empresa']             ?? null,
                $data['pais']                ?? null,
                $data['email']               ?? null,
                $data['telefono']            ?? null,
                $data['tipo_suscripcion']    ?? 'Mensual',
                floatval($data['precio_suscripcion'] ?? 0),
                $data['fecha_inicio']        ?? null,
                $data['fecha_vencimiento']   ?? null,
                $data['estatus']             ?? 'Activo',
                intval($data['empresa_id']   ?? 2),
                $data['notas']               ?? null,
            ]);

            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Cliente creado']);
        } catch (Exception $e) {
            error_log("Error createClienteSymbiot: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public static function updateClienteSymbiot($id) {
        AuthController::requireAuth();
        try {
            $db   = Database::getConnection();
            $data = json_decode(file_get_contents('php://input'), true) ?? [];

            $stmt = $pdo->prepare(
                "UPDATE clientes_symbiot SET
                    nombre = ?, empresa = ?, pais = ?, email = ?, telefono = ?,
                    tipo_suscripcion = ?, precio_suscripcion = ?,
                    fecha_inicio = ?, fecha_vencimiento = ?, estatus = ?, notas = ?
                 WHERE id = ? AND empresa_id = ?"
            );
            $stmt->execute([
                $data['nombre']              ?? '',
                $data['empresa']             ?? null,
                $data['pais']                ?? null,
                $data['email']               ?? null,
                $data['telefono']            ?? null,
                $data['tipo_suscripcion']    ?? 'Mensual',
                floatval($data['precio_suscripcion'] ?? 0),
                $data['fecha_inicio']        ?? null,
                $data['fecha_vencimiento']   ?? null,
                $data['estatus']             ?? 'Activo',
                $data['notas']               ?? null,
                intval($id),
                intval($data['empresa_id']   ?? 2),
            ]);

            echo json_encode(['success' => true, 'message' => 'Cliente actualizado']);
        } catch (Exception $e) {
            error_log("Error updateClienteSymbiot: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public static function deleteClienteSymbiot($id) {
        AuthController::requireAuth();
        try {
            $db   = Database::getConnection();
            // Desasociar sensores antes de eliminar
            $pdo->prepare("UPDATE sensores SET cliente_id = NULL WHERE cliente_id = ?")->execute([intval($id)]);
            $pdo->prepare("DELETE FROM clientes_symbiot WHERE id = ?")->execute([intval($id)]);
            echo json_encode(['success' => true, 'message' => 'Cliente eliminado']);
        } catch (Exception $e) {
            error_log("Error deleteClienteSymbiot: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
