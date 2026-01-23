<?php
/**
 * Script para crear backup de la base de datos
 */

require_once __DIR__ . '/api/config/database.php';

$backup_file = 'backup_antes_conciliacion_' . date('Ymd_His') . '.sql';

echo "Creando backup de base de datos...\n";
echo "Archivo: $backup_file\n\n";

try {
    // Obtener todas las tablas
    $tables = executeQuery("SHOW TABLES");

    $backup_content = "-- Backup de gastos_app_db\n";
    $backup_content .= "-- Fecha: " . date('Y-m-d H:i:s') . "\n";
    $backup_content .= "-- ANTES DE CONCILIACIÓN\n\n";
    $backup_content .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

    foreach ($tables as $table_row) {
        $table_name = array_values($table_row)[0];
        echo "Respaldando tabla: $table_name\n";

        // Estructura de la tabla
        $create_table = executeQuery("SHOW CREATE TABLE `$table_name`");
        $backup_content .= "\n-- Tabla: $table_name\n";
        $backup_content .= "DROP TABLE IF EXISTS `$table_name`;\n";
        $backup_content .= $create_table[0]['Create Table'] . ";\n\n";

        // Datos de la tabla
        $rows = executeQuery("SELECT * FROM `$table_name`");

        if (!empty($rows)) {
            foreach ($rows as $row) {
                $values = array_map(function($val) {
                    if ($val === null) return 'NULL';
                    return "'" . addslashes($val) . "'";
                }, array_values($row));

                $backup_content .= "INSERT INTO `$table_name` VALUES (" . implode(", ", $values) . ");\n";
            }
            $backup_content .= "\n";
        }
    }

    $backup_content .= "\nSET FOREIGN_KEY_CHECKS=1;\n";

    // Guardar archivo
    file_put_contents($backup_file, $backup_content);

    $file_size = filesize($backup_file);
    echo "\n✅ Backup creado exitosamente!\n";
    echo "Archivo: $backup_file\n";
    echo "Tamaño: " . number_format($file_size / 1024, 2) . " KB\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
