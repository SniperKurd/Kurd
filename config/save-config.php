<?php
/**
 * Handles saving configuration securely.
 * Validates Authorization header, limits payload size,
 * ensures JSON input is valid, and writes to a safe path.
 */

// Authorization check
$adminToken = getenv('ADMIN_TOKEN');
$headers = function_exists('getallheaders') ? getallheaders() : [];
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
if (empty($adminToken) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $m) || !hash_equals($adminToken, $m[1])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'رمز الدخول مفقود أو غير صحيح']);
    exit;
}

// Read input with size limit (1MB)
$maxSize = 1024 * 1024; // 1MB
$input = file_get_contents('php://input', false, null, 0, $maxSize + 1);
if ($input === false || strlen($input) > $maxSize) {
    http_response_code(413);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'البيانات تتجاوز الحد المسموح']);
    exit;
}

// Decode JSON
$data = json_decode($input, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'بيانات JSON غير صالحة']);
    exit;
}

// Determine safe path
$baseDir = realpath(__DIR__);
$configFile = $baseDir . DIRECTORY_SEPARATOR . 'config.json';
if (strpos($configFile, $baseDir) !== 0) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'مسار غير آمن']);
    exit;
}

// Save configuration
if (file_put_contents($configFile, json_encode($data, JSON_PRETTY_PRINT | LOCK_EX)) === false) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'فشل حفظ الملف']);
    exit;
}

header('Content-Type: application/json');
echo json_encode(['status' => 'success']);
