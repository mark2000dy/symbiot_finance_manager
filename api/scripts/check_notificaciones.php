<?php
require_once dirname(__DIR__) . '/config/database.php';
header('Content-Type: application/json; charset=utf-8');
$rows = executeQuery('SELECT id, tipo, mensaje, leida, empresa_id, created_at FROM notificaciones ORDER BY id DESC LIMIT 10', []);
echo json_encode(['total' => count($rows), 'rows' => $rows], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
