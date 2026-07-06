<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

$body     = json_decode(file_get_contents('php://input'), true);
$name     = trim($body['name']     ?? '');
$username = trim($body['username'] ?? '');
$password = trim($body['password'] ?? '');
$role     = trim($body['role']     ?? 'mechanic');

if (!$name || !$username || !$password) {
    jsonError('Naam, gebruikersnaam en wachtwoord zijn verplicht', 422);
}

if (!in_array($role, ['mechanic', 'admin'])) {
    jsonError('Ongeldige rol', 422);
}

$pdo = getDB();

$check = $pdo->prepare('SELECT id FROM employees WHERE username = ?');
$check->execute([$username]);
if ($check->fetch()) {
    jsonError('Gebruikersnaam is al in gebruik', 409);
}

$stmt = $pdo->prepare('
    INSERT INTO employees (name, role, username, password_hash, is_active)
    VALUES (?, ?, ?, ?, 1)
');
$stmt->execute([$name, $role, $username, password_hash($password, PASSWORD_DEFAULT)]);

$id  = $pdo->lastInsertId();
$row = $pdo->prepare('SELECT id, name, role, username, is_active, created_at FROM employees WHERE id = ?');
$row->execute([$id]);

jsonResponse($row->fetch(), 201);