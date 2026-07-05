<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri    = $_SERVER['REQUEST_URI'];
$pdo    = getDB();

// PATCH /api/shifts/stop — dienst stoppen
if ($method === 'PATCH' && str_contains($uri, '/stop')) {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = $body['shift_id'] ?? null;
    if (!$id) jsonError('shift_id is verplicht', 422);

    // Stop ook eventuele open sessie
    $pdo->prepare('
        UPDATE project_sessions
        SET ended_at = NOW(),
            duration_minutes = TIMESTAMPDIFF(MINUTE, started_at, NOW())
        WHERE shift_id = ? AND ended_at IS NULL
    ')->execute([$id]);

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

// POST /api/shifts — dienst starten
if ($method === 'POST') {
    $body        = json_decode(file_get_contents('php://input'), true);
    $employee_id = $body['employee_id'] ?? null;
    if (!$employee_id) jsonError('employee_id is verplicht', 422);

    $check = $pdo->prepare('SELECT id FROM shifts WHERE employee_id = ? AND ended_at IS NULL LIMIT 1');
    $check->execute([$employee_id]);
    if ($check->fetch()) jsonError('Er is al een actieve dienst', 409);

    $stmt = $pdo->prepare('INSERT INTO shifts (employee_id, started_at) VALUES (?, NOW())');
    $stmt->execute([$employee_id]);

    $id  = $pdo->lastInsertId();
    $row = $pdo->prepare('SELECT * FROM shifts WHERE id = ?');
    $row->execute([$id]);
    jsonResponse($row->fetch(), 201);
}

jsonError('Method not allowed', 405);