<?php
$expected = getenv('ADMIN_TOKEN');
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!$expected || !preg_match('/Bearer\s+(.*)/', $auth, $m) || hash_equals($expected, $m[1]) === false) {
    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'رمز الإدارة غير صحيح']);
    exit;
}
$input = file_get_contents('php://input');
if ($input === false) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'لا يوجد محتوى']);
    exit;
}
file_put_contents(__DIR__ . '/config.json', $input);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['ok' => true]);
