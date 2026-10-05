<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../vendor/autoload.php";

use MongoDB\Client;

try {

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $email = trim(
        $data["email"] ?? ""
    );

    $password = $data["password"] ?? "";

    if (
        $email === "" ||
        $password === ""
    ) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Email and password are required"
        ]);

        exit;
    }

    $client = new Client(
        "mongodb://127.0.0.1:27017"
    );

    $db = $client->selectDatabase(
        "citizen_grievance"
    );

    $users = $db->users;

    $user = $users->findOne([
        "email" => $email
    ]);

    if (!$user) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password"
        ]);

        exit;
    }

    if (
        !password_verify(
            $password,
            $user["password"]
        )
    ) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password"
        ]);

        exit;
    }

    /*
     * Get user role
     *
     * Existing users without a role
     * are treated as citizens.
     */
    $role = $user["role"] ?? "citizen";

    /*
     * Department is only relevant
     * for department users.
     */
    $department = $user["department"] ?? null;

    echo json_encode([
        "success" => true,
        "message" => "Login successful",

        "user" => [
            "id" => (string) $user["_id"],

            "name" =>
                $user["name"] ?? "",

            "email" =>
                $user["email"] ?? "",

            "role" =>
                $role,

            "department" =>
                $department
        ]
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Server error",
        "error" => $e->getMessage()
    ]);
}