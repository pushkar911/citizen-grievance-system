<?php

header("Content-Type: application/json");

$allowedOrigin = "https://citizen-grievance-system-zeta.vercel.app";

if (isset($_SERVER["HTTP_ORIGIN"]) && $_SERVER["HTTP_ORIGIN"] === $allowedOrigin) {
    header("Access-Control-Allow-Origin: " . $allowedOrigin);
}

header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    echo json_encode([
        "success" => true
    ]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);

    exit;
}

require_once __DIR__ . "/../config/database.php";

try {

    $rawInput = file_get_contents("php://input");

    $data = json_decode($rawInput, true);

    if (!is_array($data)) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid request data"
        ]);

        exit;
    }

    $name = trim($data["name"] ?? "");
    $email = strtolower(trim($data["email"] ?? ""));
    $password = $data["password"] ?? "";

    if ($name === "" || $email === "" || $password === "") {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "All fields are required"
        ]);

        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Please enter a valid email address"
        ]);

        exit;
    }

    if (strlen($password) < 6) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Password must contain at least 6 characters"
        ]);

        exit;
    }

    $db = getDatabase();

    $users = $db->users;

    $existingUser = $users->findOne([
        "email" => $email
    ]);

    if ($existingUser !== null) {

        http_response_code(409);

        echo json_encode([
            "success" => false,
            "message" => "Email already registered"
        ]);

        exit;
    }

    $hashedPassword = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    $result = $users->insertOne([
        "name" => $name,
        "email" => $email,
        "password" => $hashedPassword,
        "role" => "citizen",
        "createdAt" => new \MongoDB\BSON\UTCDateTime()
    ]);

    if (!$result->isAcknowledged()) {

        throw new Exception("MongoDB could not create the account.");
    }

    echo json_encode([
        "success" => true,
        "message" => "Registration successful",
        "userId" => (string) $result->getInsertedId()
    ]);

} catch (\Throwable $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Registration server error",
        "error" => $e->getMessage()
    ]);
}