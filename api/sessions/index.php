<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);

$body       = json_decode(file_get_contents('php://input'), true);
$shift_id   = $body['shift_id']   ?? null;
$project_id = $body['project_id'] ?? null;

if (!$shift_id || !$project_id) jsonError('shift_id en project_id zijn verplicht', 422);

$pdo = getDB();

// Stop eventuele open sessie binnen deze dienst
$pdo->prepare('
    UPDATE project_sessions
    SET ended_at         = NOW(),
        duration_minutes = TIMESTAMPDIFF(MINUTE, started_at, NOW())
    WHERE shift_id = ? AND ended_at IS NULL
')->execute([$shift_id]);

$stmt = $pdo->prepare('
    INSERT INTO project_sessions (shift_id, project_id, started_at)
    VALUES (?, ?, NOW())
');
$stmt->execute([$shift_id, $project_id]);

$id  = $pdo->lastInsertId();
$row = $pdo->prepare('SELECT * FROM project_sessions WHERE id = ?');
$row->execute([$id]);
jsonResponse($row->fetch(), 201);