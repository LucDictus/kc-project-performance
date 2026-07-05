<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') jsonError('Method not allowed', 405);

$body   = json_decode(file_get_contents('php://input'), true);
$id     = $body['id']     ?? null;
$status = $body['status'] ?? null;

if (!$id || !$status) jsonError('id en status zijn verplicht', 422);
if (!in_array($status, ['open', 'on_hold', 'closed'])) jsonError('Ongeldige status', 422);

$pdo = getDB();
$pdo->prepare('UPDATE projects SET status = ? WHERE id = ?')->execute([$status, $id]);

$row = $pdo->prepare('SELECT * FROM projects WHERE id = ?');
$row->execute([$id]);
jsonResponse($row->fetch());