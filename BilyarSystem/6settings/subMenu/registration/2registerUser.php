<?php
include '../../../0database/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $firstName = $_POST['firstName'];
    $lastName = $_POST['lastName'];
    $contactNumber = $_POST['contactNumber'];
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = $_POST['password']; // This should be hashed
    $confirmPassword = $_POST['confirmPassword'];
    $role = $_POST['role'];

    // Check if passwords match
    if ($password !== $confirmPassword) {
        echo "Passwords do not match.";
        exit; // Stop further execution
    }

    // Check if the username already exists
    $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->bind_result($userCount);
    $stmt->fetch();
    $stmt->close();

    // If the username already exists, return an error message
    if ($userCount > 0) {
        echo "Username has already been taken.";
        exit; // Stop further execution
    }

    // Check if the email already exists
    $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->bind_result($emailCount);
    $stmt->fetch();
    $stmt->close();

    // If the email already exists, return an error message
    if ($emailCount > 0) {
        echo "Email has already been taken.";
        exit; // Stop further execution
    }

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Handle file upload
    $imagePath = null; // Default to null if no image is uploaded
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $imageTmpPath = $_FILES['image']['tmp_name'];
        $imageName = $_FILES['image']['name'];
        $imageSize = $_FILES['image']['size'];
        $imageExtension = pathinfo($imageName, PATHINFO_EXTENSION);
        
        // Validate file size and type if necessary
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        if ($imageSize <= 2000000 && in_array(strtolower($imageExtension), $allowedExtensions)) {
            // Set a target directory for uploads
            $uploadDir = '../uploads';
            $imagePath = $uploadDir . uniqid() . '.' . $imageExtension; // Unique image path

            // Move the uploaded file to the desired location
            move_uploaded_file($imageTmpPath, $imagePath);
        } else {
            echo "Image upload failed. Ensure the file is an image and less than 2MB.";
            exit; // Stop further execution
        }
    }

    // Insert the user into the database
    $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, contact_number, username, email, password, role, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssisssss", $firstName, $lastName, $contactNumber, $username, $email, $hashedPassword, $role, $imagePath);
    
    if ($stmt->execute()) {
        echo "User registered successfully.";
    } else {
        echo "Error registering user: " . $stmt->error; // Show error details for debugging
    }
    $stmt->close();
}
?>
