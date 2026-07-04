<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo    = getDB();

// POST /api/shifts — dienst starten
if ($method === 'POST') {
    $body        = json_decode(file_get_contents('php://input'), true);
    $employee_id = $body['employee_id'] ?? null;

    if (!$employee_id) jsonError('employee_id is verplicht', 422);

    // Check of er al een open dienst is
    $check = $pdo->prepare('SELECT id FROM shifts WHERE employee_id = ? AND ended_at IS NULL LIMIT 1');
    $check->execute([$employee_id]);
    if ($check->fetch()) jsonError('Er is al een actieve dienst', 409);

    $stmt = $pdo->prepare('INSERT INTO shifts (employee_id, started_at) VALUES (?, NOW())');
    $stmt->execute([$employee_id]);

    $shiftId = $pdo->lastInsertId();
    $row     = $pdo->prepare('SELECT * FROM shifts WHERE id = ?');
    $row->execute([$shiftId]);

    jsonResponse($row->fetch(), 201);
}

// PATCH /api/shifts/{id}/stop — dienst stoppen
if ($method === 'PATCH') {
    $uri   = $_SERVER['REQUEST_URI'];
    preg_match('/\/shifts\/(\d+)\/stop/', $uri, $matches);
    $id    = $matches[1] ?? null;

    if (!$id) jsonError('Shift ID ontbreekt', 422);

    $pdo->prepare('
        UPDATE shifts
        SET ended_at = NOW(),
            total_minutes = TIMESTAMPDIFF(MINUTE, started_at, NOW())
        WHERE id = ? AND ended_at IS NULL
    ')->execute([$id]);

    $row = $pdo->prepare('SELECT * FROM shifts WHERE id = ?');
    $row->execute([$id]);

    jsonResponse($row->fetch());
}

jsonError('Method not allowed', 405);