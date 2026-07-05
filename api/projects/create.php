<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);

$body          = json_decode(file_get_contents('php://input'), true);
$license_plate = strtoupper(trim($body['car_license_plate'] ?? ''));
$make_model    = trim($body['car_make_model']    ?? '');
$customer_name = trim($body['customer_name']     ?? '');

if (!$license_plate || !$make_model || !$customer_name) {
    jsonError('Kenteken, merk/model en klantnaam zijn verplicht', 422);
}

$pdo = getDB();

// Genereer projectnummer: KC-2026-001
$year    = date('Y');
$numStmt = $pdo->prepare('SELECT COUNT(*) FROM projects WHERE YEAR(created_at) = ?');
$numStmt->execute([$year]);
$count   = (int) $numStmt->fetchColumn() + 1;
$project_number = sprintf('KC-%s-%03d', $year, $count);

$stmt = $pdo->prepare('
    INSERT INTO projects (project_number, car_license_plate, car_make_model, customer_name, status)
    VALUES (?, ?, ?, ?, "open")
');
$stmt->execute([$project_number, $license_plate, $make_model, $customer_name]);

$id  = $pdo->lastInsertId();
$row = $pdo->prepare('SELECT * FROM projects WHERE id = ?');
$row->execute([$id]);

jsonResponse($row->fetch(), 201);