<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Access Denied - Better Billiards</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .access-denied-container {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .access-denied-content {
            max-width: 500px;
            padding: 2rem;
        }
        .error-code {
            font-size: 6rem;
            font-weight: bold;
            color: #dc3545;
        }
        .back-button {
            margin-top: 2rem;
        }
    </style>
</head>
<body>
    <div class="access-denied-container">
        <div class="access-denied-content">
            <div class="error-code">403</div>
            <h1 class="mb-4">Access Denied</h1>
            <p class="lead mb-4">Sorry, you don't have permission to access this page. This area is restricted to authorized personnel only.</p>
            <div class="back-button">
                <a href="/Bilyar4/BilyarSystem/2dashboard/dashboard.php" class="btn btn-primary">Back to Dashboard</a>
            </div>
        </div>
    </div>
</body>
</html>