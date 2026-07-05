<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method not allowed', 405);

$employee_id = $_GET['employee_id'] ?? null;
if (!$employee_id) jsonError('employee_id is verplicht', 422);

$pdo  = getDB();
$stmt = $pdo->prepare('
    SELECT
        s.id          AS shift_id,
        s.started_at  AS shift_started_at,
        ps.id         AS session_id,
        ps.project_id,
        ps.started_at AS session_started_at,
        p.project_number,
        p.car_license_plate,
        p.car_make_model,
        p.customer_name
    FROM shifts s
    LEFT JOIN project_sessions ps ON ps.shift_id = s.id AND ps.ended_at IS NULL
    LEFT JOIN projects p ON p.id = ps.project_id
    WHERE s.employee_id = ? AND s.ended_at IS NULL
    LIMIT 1
');
$stmt->execute([$employee_id]);
$row = $stmt->fetch();

jsonResponse($row ?: null);