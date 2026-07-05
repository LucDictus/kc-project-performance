<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') jsonError('Method not allowed', 405);

$body = json_decode(file_get_contents('php://input'), true);
$id   = $body['shift_id'] ?? null;

if (!$id) jsonError('shift_id is verplicht', 422);

$pdo = getDB();

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