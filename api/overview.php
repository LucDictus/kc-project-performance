<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed', 405);
}

$pdo = getDB();

// Actieve medewerkers + hun project
$activeStmt = $pdo->query('
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
$activeNow = $activeStmt->fetchAll();

// Open projecten
$openStmt = $pdo->query('SELECT COUNT(*) AS count FROM projects WHERE status = "open"');
$openProjects = (int) $openStmt->fetch()['count'];

// Totaal gewerkte minuten vandaag (afgeronde + nog actieve diensten)
$todayStmt = $pdo->query('
    SELECT COALESCE(SUM(
        CASE
            WHEN ended_at IS NOT NULL THEN total_minutes
            ELSE TIMESTAMPDIFF(MINUTE, started_at, NOW())
        END
    ), 0) AS total
    FROM shifts
    WHERE DATE(started_at) = CURDATE()
');
$totalMinutesToday = (int) $todayStmt->fetch()['total'];

jsonResponse([
    'active_employees'    => count($activeNow),
    'open_projects'       => $openProjects,
    'total_minutes_today' => $totalMinutesToday,
    'active_now'          => $activeNow,
]);