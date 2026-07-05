<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method not allowed', 405);

$q   = trim($_GET['q'] ?? '');
if (!$q) jsonError('Zoekterm is verplicht', 422);

$pdo  = getDB();
$like = '%' . $q . '%';
$stmt = $pdo->prepare('
    SELECT id, project_number, car_license_plate, car_make_model, customer_name, status
    FROM projects
    WHERE (car_license_plate LIKE ? OR project_number LIKE ?)
    AND status != "closed"
    ORDER BY created_at DESC
    LIMIT 10
');
$stmt->execute([$like, $like]);

jsonResponse($stmt->fetchAll());