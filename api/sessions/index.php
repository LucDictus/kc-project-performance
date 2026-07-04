<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo    = getDB();

// POST — sessie starten
if ($method === 'POST') {
    $body       = json_decode(file_get_contents('php://input'), true);
    $shift_id   = $body['shift_id']   ?? null;
    $project_id = $body['project_id'] ?? null;

    if (!$shift_id || !$project_id) jsonError('shift_id en project_id zijn verplicht', 422);

    $stmt = $pdo->prepare('
        INSERT INTO project_sessions (shift_id, project_id, started_at)
        VALUES (?, ?, NOW())
    ');
    $stmt->execute([$shift_id, $project_id]);

    $id  = $pdo->lastInsertId();
    $row = $pdo->prepare('SELECT * FROM project_sessions WHERE id = ?');
    $row->execute([$id]);

    jsonResponse($row->fetch(), 201);
}

// PATCH — sessie stoppen met beschrijving
if ($method === 'PATCH') {
    $uri  = $_SERVER['REQUEST_URI'];
    preg_match('/\/sessions\/(\d+)\/stop/', $uri, $matches);
    $id   = $matches[1] ?? null;
    $body = json_decode(file_get_contents('php://input'), true);

    if (!$id) jsonError('Session ID ontbreekt', 422);

    $pdo->prepare('
        UPDATE project_sessions
        SET ended_at         = NOW(),
            duration_minutes = TIMESTAMPDIFF(MINUTE, started_at, NOW()),
            description      = ?
        WHERE id = ? AND ended_at IS NULL
    ')->execute([$body['description'] ?? null, $id]);

    $row = $pdo->prepare('SELECT * FROM project_sessions WHERE id = ?');
    $row->execute([$id]);

    jsonResponse($row->fetch());
}

jsonError('Method not allowed', 405);