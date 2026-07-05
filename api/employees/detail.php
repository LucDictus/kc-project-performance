<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method not allowed', 405);

$id         = $_GET['id']         ?? null;
$month_from = $_GET['month_from'] ?? date('Y-m-01');
$month_to   = $_GET['month_to']   ?? date('Y-m-t');

if (!$id) jsonError('id is verplicht', 422);

$pdo = getDB();

// Medewerker info
$empStmt = $pdo->prepare('
    SELECT id, name, role, username, is_active, created_at
    FROM employees
    WHERE id = ?
');
$empStmt->execute([$id]);
$employee = $empStmt->fetch();
if (!$employee) jsonError('Medewerker niet gevonden', 404);

// Uren per dag
$shiftsStmt = $pdo->prepare('
    SELECT
        DATE(started_at)                              AS date,
        MIN(started_at)                               AS first_clock_in,
        MAX(COALESCE(ended_at, NOW()))                AS last_clock_out,
        SUM(COALESCE(total_minutes,
            TIMESTAMPDIFF(MINUTE, started_at, NOW()))) AS total_minutes,
        COUNT(*)                                      AS shift_count
    FROM shifts
    WHERE employee_id = ?
      AND DATE(started_at) BETWEEN ? AND ?
    GROUP BY DATE(started_at)
    ORDER BY DATE(started_at) DESC
');
$shiftsStmt->execute([$id, $month_from, $month_to]);
$days = $shiftsStmt->fetchAll();

// Projecten in periode
$projectsStmt = $pdo->prepare('
    SELECT
        p.id,
        p.project_number,
        p.car_license_plate,
        p.car_make_model,
        p.customer_name,
        p.status,
        SUM(COALESCE(ps.duration_minutes,
            TIMESTAMPDIFF(MINUTE, ps.started_at, NOW()))) AS total_minutes,
        COUNT(DISTINCT s.id)                              AS session_count,
        MIN(ps.started_at)                                AS first_session
    FROM project_sessions ps
    JOIN shifts s      ON s.id  = ps.shift_id
    JOIN projects p    ON p.id  = ps.project_id
    WHERE s.employee_id = ?
      AND DATE(ps.started_at) BETWEEN ? AND ?
    GROUP BY p.id, p.project_number, p.car_license_plate,
             p.car_make_model, p.customer_name, p.status
    ORDER BY first_session DESC
');
$projectsStmt->execute([$id, $month_from, $month_to]);
$projects = $projectsStmt->fetchAll();

// Totaal minuten in periode
$totalMinutes = array_sum(array_column($days, 'total_minutes'));

jsonResponse([
    'employee'      => $employee,
    'days'          => $days,
    'projects'      => $projects,
    'total_minutes' => (int) $totalMinutes,
    'period'        => ['from' => $month_from, 'to' => $month_to],
]);