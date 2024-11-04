// Handling form submission
const registrationForm = document.querySelector('#registrationForm');

if (registrationForm) {



    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission
        
        //confirm password feature
        const password = document.querySelector('#password').value;
        const confirmPassword = document.querySelector('#confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return; // Stop further execution
        }

        // Gather form data
        const formData = new FormData(registrationForm);
        
        // Send AJAX request
        fetch('2registerUser.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            // Check for a success message
            if (data === 'User registered successfully.') { // Adjust this condition based on your server response
                alert('Registration successful!');
    
                // Reset the form fields
                registrationForm.reset();
            } else {
                // Handle errors or other responses
                console.log(data); // Display the error message from the server
            }
        })
        .catch(error => console.error('Error:', error));
    });
    
}