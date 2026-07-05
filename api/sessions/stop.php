<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') jsonError('Method not allowed', 405);

$body = json_decode(file_get_contents('php://input'), true);
$id   = $body['session_id'] ?? null;

if (!$id) jsonError('session_id is verplicht', 422);

$pdo = getDB();

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