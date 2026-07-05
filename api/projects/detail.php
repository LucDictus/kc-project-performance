<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method not allowed', 405);

$id = $_GET['id'] ?? null;
if (!$id) jsonError('id is verplicht', 422);

$pdo = getDB();

// Project info
$projectStmt = $pdo->prepare('
    SELECT id, project_number, car_license_plate, car_make_model,
           customer_name, status, created_at
    FROM projects
    WHERE id = ?
');
$projectStmt->execute([$id]);
$project = $projectStmt->fetch();
if (!$project) jsonError('Project niet gevonden', 404);

// Sessies met medewerker info en beschrijving
$sessionsStmt = $pdo->prepare('
    SELECT
        ps.id                AS session_id,
        ps.started_at,
        ps.ended_at,
        ps.duration_minutes,
        ps.description,
        e.id                 AS employee_id,
        e.name               AS employee_name,
        DATE(ps.started_at)  AS date
    FROM project_sessions ps
    JOIN shifts s  ON s.id  = ps.shift_id
    JOIN employees e ON e.id = s.employee_id
    WHERE ps.project_id = ?
    ORDER BY ps.started_at DESC
');
$sessionsStmt->execute([$id]);
$sessions = $sessionsStmt->fetchAll();

// Uren per medewerker
$perEmployeeStmt = $pdo->prepare('
    SELECT
        e.id                                          AS employee_id,
        e.name                                        AS employee_name,
        COUNT(ps.id)                                  AS session_count,
        SUM(COALESCE(ps.duration_minutes,
            TIMESTAMPDIFF(MINUTE, ps.started_at, NOW()))) AS total_minutes
    FROM project_sessions ps
    JOIN shifts s    ON s.id  = ps.shift_id
    JOIN employees e ON e.id  = s.employee_id
    WHERE ps.project_id = ?
    GROUP BY e.id, e.name
    ORDER BY total_minutes DESC
');
$perEmployeeStmt->execute([$id]);
$perEmployee = $perEmployeeStmt->fetchAll();

// Totaal minuten
$totalMinutes = array_sum(array_column($perEmployee, 'total_minutes'));

jsonResponse([
    'project'       => $project,
    'sessions'      => $sessions,
    'per_employee'  => $perEmployee,
    'total_minutes' => (int) $totalMinutes,
]);