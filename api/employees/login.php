<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

$body = json_decode(file_get_contents('php://input'), true);
$username = trim($body['username'] ?? '');
$password = trim($body['password'] ?? '');

if (!$username || !$password) {
    jsonError('Gebruikersnaam en wachtwoord zijn verplicht', 422);
}

$pdo  = getDB();
$stmt = $pdo->prepare('
    SELECT id, name, role, password_hash
    FROM employees
    WHERE username = ? AND is_active = 1
    LIMIT 1
');
$stmt->execute([$username]);
$employee = $stmt->fetch();

if (!$employee) {
    jsonError('Gebruikersnaam of wachtwoord onjuist', 401);
}

// TODO: vervang door password_verify() zodra wachtwoorden gehasht zijn
if ($employee['password_hash'] !== $password) {
    jsonError('Gebruikersnaam of wachtwoord onjuist', 401);
}

jsonResponse([
    'id'   => $employee['id'],
    'name' => $employee['name'],
    'role' => $employee['role'],
]);