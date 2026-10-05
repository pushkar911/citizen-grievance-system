<?php

header("Content-Type: application/json");

// Allow React frontend
header("Access-Control-Allow-Origin: https://citizen-grievance-system-zeta.vercel.app");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Handle CORS preflight
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../config/database.php";

use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

try {

    // =====================================================
    // ONLY POST
    // =====================================================

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {

        http_response_code(405);

        echo json_encode([
            "success" => false,
            "message" => "Only POST requests are allowed"
        ]);

        exit;
    }


    // =====================================================
    // READ JSON
    // =====================================================

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );


    // =====================================================
    // GET USER ID
    // =====================================================

    $userId = trim(
        $data["userId"] ?? ""
    );


    // =====================================================
    // GET GRIEVANCE DATA
    // =====================================================

    $title = trim(
        $data["title"] ?? ""
    );

    $description = trim(
        $data["description"] ?? ""
    );

    $location = trim(
        $data["location"] ?? ""
    );


    // =====================================================
    // GET MAP COORDINATES
    // =====================================================

    $latitude = $data["latitude"] ?? null;

    $longitude = $data["longitude"] ?? null;


    // =====================================================
    // VALIDATION
    // =====================================================

    if (
        $title === "" ||
        $description === "" ||
        $location === ""
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "All fields are required"
        ]);

        exit;
    }


    // =====================================================
    // DESCRIPTION VALIDATION
    // =====================================================

    if (strlen($description) <= 10) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Description must be more than 10 characters."
        ]);

        exit;
    }


    // =====================================================
    // LOCATION VALIDATION
    // =====================================================

    if (
        $latitude === null ||
        $longitude === null
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Please select a valid location from the map."
        ]);

        exit;
    }


    // =====================================================
    // USER ID VALIDATION
    // =====================================================

    if ($userId === "") {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Please login before submitting a grievance"
        ]);

        exit;
    }


    // =====================================================
    // VALIDATE MONGODB USER ID
    // =====================================================

    try {

        $userObjectId = new ObjectId($userId);

    } catch (Exception $e) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid user ID"
        ]);

        exit;
    }


    // =====================================================
    // CONNECT TO MONGODB ATLAS
    // =====================================================

    $db = getDatabase();


    // =====================================================
    // SELECT COLLECTION
    // =====================================================

    $grievances = $db->grievances;


    // =====================================================
    // CLASSIFICATION
    // =====================================================

    $text = strtolower(
        $title . " " . $description
    );

    $category = "General";

    $department = "General Department";

    $priority = "Medium";


    // =====================================================
    // FIRE / EMERGENCY / PUBLIC SAFETY
    // =====================================================

    if (
        strpos($text, "fire") !== false ||
        strpos($text, "accident") !== false ||
        strpos($text, "danger") !== false ||
        strpos($text, "dangerous") !== false ||
        strpos($text, "unsafe") !== false ||
        strpos($text, "emergency") !== false ||
        strpos($text, "gas leak") !== false ||
        strpos($text, "gas leakage") !== false
    ) {

        $category = "Public Safety";

        $department = "Public Safety Department";

        $priority = "High";
    }


    // =====================================================
    // ELECTRICITY
    // =====================================================

    elseif (
        strpos($text, "electricity") !== false ||
        strpos($text, "electric") !== false ||
        strpos($text, "power") !== false ||
        strpos($text, "power cut") !== false ||
        strpos($text, "power failure") !== false ||
        strpos($text, "street light") !== false ||
        strpos($text, "exposed wire") !== false
    ) {

        $category = "Electricity";

        $department = "Electricity Department";

        $priority = "High";
    }


    // =====================================================
    // WATER
    // =====================================================

    elseif (
        strpos($text, "water") !== false ||
        strpos($text, "pipeline") !== false ||
        strpos($text, "leakage") !== false ||
        strpos($text, "water leakage") !== false ||
        strpos($text, "flood") !== false ||
        strpos($text, "flooding") !== false
    ) {

        $category = "Water Supply";

        $department = "Water Department";

        $priority = "High";
    }


    // =====================================================
    // ROADS
    // =====================================================

    elseif (
        strpos($text, "pothole") !== false ||
        strpos($text, "road") !== false ||
        strpos($text, "street") !== false ||
        strpos($text, "broken road") !== false
    ) {

        $category = "Roads";

        $department = "Road Department";

        $priority = "High";
    }


    // =====================================================
    // DRAINAGE / SEWAGE
    // =====================================================

    elseif (
        strpos($text, "drain") !== false ||
        strpos($text, "drainage") !== false ||
        strpos($text, "sewage") !== false ||
        strpos($text, "sewer") !== false ||
        strpos($text, "sewage overflow") !== false
    ) {

        $category = "Drainage";

        $department = "Municipal Corporation";

        $priority = "Medium";
    }


    // =====================================================
    // WASTE MANAGEMENT
    // =====================================================

    elseif (
        strpos($text, "garbage") !== false ||
        strpos($text, "waste") !== false ||
        strpos($text, "trash") !== false ||
        strpos($text, "dustbin") !== false ||
        strpos($text, "cleaning") !== false
    ) {

        $category = "Waste Management";

        $department = "Municipal Corporation";

        $priority = "Medium";
    }


    // =====================================================
    // GENERAL
    // =====================================================

    else {

        $category = "General";

        $department = "General Department";

        $priority = "Medium";
    }


    // =====================================================
    // GENERATE GRIEVANCE ID
    // =====================================================

    $grievanceId =
        "GRV" .
        date("YmdHis") .
        rand(100, 999);


    // =====================================================
    // CREATE GRIEVANCE DOCUMENT
    // =====================================================

    $grievance = [

        // USER RELATION
        "userId" => $userObjectId,

        // GRIEVANCE ID
        "grievanceId" => $grievanceId,

        // BASIC DETAILS
        "title" => $title,

        "description" => $description,

        "location" => $location,

        // MAP LOCATION
        "latitude" => (float) $latitude,

        "longitude" => (float) $longitude,

        // CLASSIFICATION
        "category" => $category,

        "priority" => $priority,

        "department" => $department,

        // STATUS
        "status" => "Submitted",

        "resolution" => null,

        // DATE
        "createdAt" => new UTCDateTime()
    ];


    // =====================================================
    // SAVE TO MONGODB ATLAS
    // =====================================================

    $result = $grievances->insertOne(
        $grievance
    );


    // =====================================================
    // RESPONSE
    // =====================================================

    echo json_encode([

        "success" => true,

        "message" =>
            "Grievance submitted successfully",

        "grievanceId" =>
            $grievanceId,

        "category" =>
            $category,

        "department" =>
            $department,

        "priority" =>
            $priority,

        "status" =>
            "Submitted"

    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Server error",

        "error" =>
            $e->getMessage()

    ]);
}