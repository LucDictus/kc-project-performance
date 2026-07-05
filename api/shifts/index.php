<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);

$body        = json_decode(file_get_contents('php://input'), true);
$employee_id = $body['employee_id'] ?? null;

if (!$employee_id) jsonError('employee_id is verplicht', 422);

$pdo = getDB();

$check = $pdo->prepare('SELECT id FROM shifts WHERE employee_id = ? AND ended_at IS NULL LIMIT 1');
$check->execute([$employee_id]);
if ($check->fetch()) jsonError('Er is al een actieve dienst', 409);

$stmt = $pdo->prepare('INSERT INTO shifts (employee_id, started_at) VALUES (?, NOW())');
$stmt->execute([$employee_id]);

$id  = $pdo->lastInsertId();
$row = $pdo->prepare('SELECT * FROM shifts WHERE id = ?');
$row->execute([$id]);
jsonResponse($row->fetch(), 201);