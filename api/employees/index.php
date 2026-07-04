<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed', 405);
}

$pdo  = getDB();
$stmt = $pdo->query('
    SELECT id, name, role, username, is_active, created_at
    FROM employees
    ORDER BY name ASC
');

jsonResponse($stmt->fetchAll());