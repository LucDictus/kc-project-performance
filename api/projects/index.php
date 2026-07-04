<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed', 405);
}

$pdo  = getDB();
$stmt = $pdo->query('
    SELECT id, project_number, car_license_plate, car_make_model,
           customer_name, status, created_at
    FROM projects
    ORDER BY created_at DESC
');

jsonResponse($stmt->fetchAll());