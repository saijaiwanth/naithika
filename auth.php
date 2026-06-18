<?php
session_start();
header('Content-Type: application/json');

// Load .env file manually if it exists
$envPath = __DIR__ . '/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $_ENV[trim($name)] = trim($value);
        }
    }
}

// Fallback to default local credentials if .env variables are missing
$host = isset($_ENV['DB_HOST']) ? $_ENV['DB_HOST'] : 'localhost';
$user = isset($_ENV['DB_USER']) ? $_ENV['DB_USER'] : 'u457412820_user1';
$pass = isset($_ENV['DB_PASS']) ? $_ENV['DB_PASS'] : 'Naithika@5566';
$dbname = isset($_ENV['DB_NAME']) ? $_ENV['DB_NAME'] : 'u457412820_Naithika_Web';

mysqli_report(MYSQLI_REPORT_OFF);
// Create connection directly to the database
$conn = @new mysqli($host, $user, $pass, $dbname);
if (mysqli_connect_errno()) {
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . mysqli_connect_error()]);
    exit;
}

// Create users table if not exists
$tableQuery = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    password VARCHAR(255) NOT NULL,
    login_count INT DEFAULT 0,
    whatsapp_joined TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($tableQuery);
@$conn->query("ALTER TABLE users ADD COLUMN login_count INT DEFAULT 0"); // Add column if table already exists
@$conn->query("ALTER TABLE users ADD COLUMN whatsapp_joined TINYINT(1) DEFAULT 0"); // Add column if table already exists

// Parse JSON Payload
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// If data is null, fallback to $_POST in case of form submission
if ($data === null) {
    $data = $_POST;
}

$action = isset($data['action']) ? $data['action'] : '';

if ($action == 'register') {
    $name = trim($data['name']);
    $contact = trim($data['contact_number']);
    $email = trim($data['email']);
    $address = trim($data['address']);
    $password = $data['password'];

    // Check for existing contact or email
    $stmt = $conn->prepare("SELECT email, contact_number FROM users WHERE email = ? OR contact_number = ?");
    $stmt->bind_param("ss", $email, $contact);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        if ($row['email'] === $email) {
            echo json_encode(["status" => "error", "message" => "User already exists with this Email ID."]);
        } else {
            echo json_encode(["status" => "error", "message" => "User already exists with this Contact Number."]);
        }
        exit;
    }
    
    // Hash password
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $whatsapp_joined = isset($data['whatsapp_joined']) ? intval($data['whatsapp_joined']) : 0;
    
    $stmt = $conn->prepare("INSERT INTO users (name, contact_number, email, address, password, whatsapp_joined) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssi", $name, $contact, $email, $address, $hashed, $whatsapp_joined);
    
    if ($stmt->execute()) {
        $user_id = $stmt->insert_id;
        $user_data = [
            "id" => $user_id,
            "name" => $name,
            "contact_number" => $contact,
            "email" => $email,
            "address" => $address,
            "whatsapp_joined" => $whatsapp_joined
        ];
        echo json_encode(["status" => "success", "message" => "Registration successful!", "user" => $user_data]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error during registration."]);
    }
    exit;
}


if ($action == 'check_exists') {
    $field = isset($data['field']) ? $data['field'] : '';
    $value = isset($data['value']) ? trim($data['value']) : '';
    if ($field === 'email' || $field === 'contact_number') {
        $stmt = $conn->prepare("SELECT id FROM users WHERE $field = ?");
        $stmt->bind_param("s", $value);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $msg = $field === 'email' ? 'User already exists with this Email ID.' : 'User already exists with this Contact Number.';
            echo json_encode(["status" => "exists", "message" => $msg]);
        } else {
            echo json_encode(["status" => "available"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid field."]);
    }
    exit;
}

if ($action == 'login') {
    $username = trim($data['username']); // Contact or email
    $password = $data['password'];

    $stmt = $conn->prepare("SELECT id, name, email, contact_number, address, password FROM users WHERE email = ? OR contact_number = ?");
    $stmt->bind_param("ss", $username, $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        if (password_verify($password, $row['password'])) {
            $updateStmt = $conn->prepare("UPDATE users SET login_count = login_count + 1 WHERE id = ?");
            $updateStmt->bind_param("i", $row['id']);
            $updateStmt->execute();
            $user_data = [
                "id" => $row['id'],
                "name" => $row['name'],
                "email" => $row['email'],
                "contact_number" => $row['contact_number'],
                "address" => $row['address']
            ];
            echo json_encode(["status" => "success", "message" => "Login successful", "user" => $user_data]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid password."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "User not found. Please register."]);
    }
    exit;
}

if ($action == 'update_profile') {
    $user_id = $data['id'];
    $name = trim($data['name']);
    $contact = trim($data['contact_number']);
    $email = trim($data['email']);
    $address = trim($data['address']);
    
    // Check duplicates for other users
    $stmt = $conn->prepare("SELECT id FROM users WHERE (email = ? OR contact_number = ?) AND id != ?");
    $stmt->bind_param("ssi", $email, $contact, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Email or Contact Number already in use by another account."]);
    } else {
        $stmt = $conn->prepare("UPDATE users SET name=?, contact_number=?, email=?, address=? WHERE id=?");
        $stmt->bind_param("ssssi", $name, $contact, $email, $address, $user_id);
        if ($stmt->execute()) {
            $user_data = [
                "id" => $user_id,
                "name" => $name,
                "contact_number" => $contact,
                "email" => $email,
                "address" => $address
            ];
            echo json_encode(["status" => "success", "message" => "Profile updated successfully!", "user" => $user_data]);
        } else {
            echo json_encode(["status" => "error", "message" => "Database error during profile update."]);
        }
    }
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid action."]);
?>
