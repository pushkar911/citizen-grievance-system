<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://citizen-grievance-system-zeta.vercel.app");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../config/database.php";

try {

    // =====================================================
    // GET REQUEST DATA
    // =====================================================

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $name = trim(
        $data["name"] ?? ""
    );

    $email = trim(
        $data["email"] ?? ""
    );

    $password = $data["password"] ?? "";


    // =====================================================
    // VALIDATE INPUT
    // =====================================================

    if (
        $name === "" ||
        $email === "" ||
        $password === ""
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "All fields are required"
        ]);

        exit;
    }


    // =====================================================
    // VALIDATE EMAIL
    // =====================================================

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Please enter a valid email address"
        ]);

        exit;
    }


    // =====================================================
    // CONNECT TO MONGODB ATLAS
    // =====================================================

    $db = getDatabase();

    $users = $db->users;


    // =====================================================
    // CHECK IF EMAIL ALREADY EXISTS
    // =====================================================

    $existingUser = $users->findOne([
        "email" => $email
    ]);

    if ($existingUser) {

        http_response_code(409);

        echo json_encode([
            "success" => false,
            "message" => "Email already registered"
        ]);

        exit;
    }


    // =====================================================
    // HASH PASSWORD
    // =====================================================

    $hashedPassword = password_hash(
        $password,
        PASSWORD_DEFAULT
    );


    // =====================================================
    // CREATE USER
    // =====================================================

    $result = $users->insertOne([

        "name" => $name,

        "email" => $email,

        "password" => $hashedPassword,

        "role" => "citizen",

        "createdAt" =>
            new \MongoDB\BSON\UTCDateTime()

    ]);


    // =====================================================
    // SUCCESS RESPONSE
    // =====================================================

    echo json_encode([

        "success" => true,

        "message" => "Registration successful",

        "userId" =>
            (string) $result->getInsertedId()

    ]);

} catch (Exception $e) {

    // =====================================================
    // SERVER ERROR
    // =====================================================

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" => "Server error",

        "error" => $e->getMessage()

    ]);
}