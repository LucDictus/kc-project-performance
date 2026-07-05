<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') jsonError('Method not allowed', 405);

$body     = json_decode(file_get_contents('php://input'), true);
$id       = $body['id']       ?? null;

if (!$id) jsonError('id is verplicht', 422);

$pdo = getDB();

// Bouw dynamisch de update query op met alleen de velden die meegegeven zijn
$fields = [];
$params = [];

if (isset($body['name'])) {
    $fields[] = 'name = ?';
    $params[] = trim($body['name']);
}
if (isset($body['username'])) {
    // Check of username al in gebruik is door iemand anders
    $check = $pdo->prepare('SELECT id FROM employees WHERE username = ? AND id != ?');
    $check->execute([trim($body['username']), $id]);
    if ($check->fetch()) jsonError('Gebruikersnaam is al in gebruik', 409);
    $fields[] = 'username = ?';
    $params[] = trim($body['username']);
}
if (isset($body['role'])) {
    if (!in_array($body['role'], ['mechanic', 'admin'])) jsonError('Ongeldige rol', 422);
    $fields[] = 'role = ?';
    $params[] = $body['role'];
}
if (isset($body['password']) && trim($body['password']) !== '') {
    $fields[] = 'password_hash = ?';
    $params[] = trim($body['password']);
}
if (isset($body['is_active'])) {
    $fields[] = 'is_active = ?';
    $params[] = $body['is_active'] ? 1 : 0;
}

if (empty($fields)) jsonError('Geen velden om bij te werken', 422);

$params[] = $id;
$pdo->prepare('UPDATE employees SET ' . implode(', ', $fields) . ' WHERE id = ?')
    ->execute($params);

$row = $pdo->prepare('SELECT id, name, role, username, is_active, created_at FROM employees WHERE id = ?');
$row->execute([$id]);
jsonResponse($row->fetch());