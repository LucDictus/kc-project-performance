<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed', 405);
}

$pdo  = getDB();
$stmt = $pdo->query('
    SELECT
        e.id          AS employee_id,
        e.name        AS employee_name,
        s.id          AS shift_id,
        s.started_at  AS shift_started_at,
        ps.id         AS session_id,
        ps.project_id,
        p.project_number,
        p.car_license_plate,
        p.car_make_model,
        ps.started_at AS session_started_at
    FROM employees e
    JOIN shifts s ON s.employee_id = e.id AND s.ended_at IS NULL
    LEFT JOIN project_sessions ps ON ps.shift_id = s.id AND ps.ended_at IS NULL
    LEFT JOIN projects p ON p.id = ps.project_id
    ORDER BY s.started_at DESC
');

jsonResponse($stmt->fetchAll());