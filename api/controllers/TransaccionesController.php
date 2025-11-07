<?php
// ====================================================
// CONTROLADOR DE TRANSACCIONES (PHP VERSION)
// Archivo: api/controllers/TransaccionesController.php
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

            $socio = $user['nombre'];
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
            $isAdmin = $user['rol'] === 'admin';
            $queryCheck = $isAdmin
                ? 'SELECT * FROM transacciones WHERE id = ?'
                : 'SELECT * FROM transacciones WHERE id = ? AND created_by = ?';
            $paramsCheck = $isAdmin ? [$id] : [$id, $user['id']];

            $existeTransaccion = executeQuery($queryCheck, $paramsCheck);

            if (empty($existeTransaccion)) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Transacción no encontrada'
                ]);
                return;
            }

            $query = $isAdmin
                ? "UPDATE transacciones SET
                    fecha = ?, concepto = ?, empresa_id = ?, forma_pago = ?,
                    cantidad = ?, precio_unitario = ?, tipo = ?
                WHERE id = ?"
                : "UPDATE transacciones SET
                    fecha = ?, concepto = ?, empresa_id = ?, forma_pago = ?,
                    cantidad = ?, precio_unitario = ?, tipo = ?
                WHERE id = ? AND created_by = ?";

            $queryParams = $isAdmin
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
            $isAdmin = $user['rol'] === 'admin';
            $queryCheck = $isAdmin
                ? 'SELECT concepto, tipo FROM transacciones WHERE id = ?'
                : 'SELECT concepto, tipo FROM transacciones WHERE id = ? AND created_by = ?';
            $paramsCheck = $isAdmin ? [$id] : [$id, $user['id']];

            $existeTransaccion = executeQuery($queryCheck, $paramsCheck);

            if (empty($existeTransaccion)) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Transacción no encontrada'
                ]);
                return;
            }

            $deleteQuery = $isAdmin
                ? 'DELETE FROM transacciones WHERE id = ?'
                : 'DELETE FROM transacciones WHERE id = ? AND created_by = ?';
            $deleteParams = $isAdmin ? [$id] : [$id, $user['id']];

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
}
