document.addEventListener("DOMContentLoaded", function () {
    fetchTables();
  });

  // Render table information based on fetched data
  let tableInfoBody = document.querySelector("#tableInfoBody");
  
  // Fetch tables from the database
  function fetchTables() {
    console.log("fetch tables triggered");
    fetch("1fetchEmployee.php") // Endpoint to fetch current table data
      .then((response) => response.json())
      .then((data) => {
        renderTableInfo(data);
      })
      .catch((error) => console.error("Error:", error));
  }

  
  function renderTableInfo(tables) {
    tableInfoBody.innerHTML = ""; // Clear existing rows
  
    tables.forEach((table) => {
      const row = `<tr id="tableRow-${table.id}">
                      <td>${table.first_name}</td>
                      <td>${table.last_name}</td>
                      <td>${table.role}</td>
                      <td>
                          <button type="button" class="btn btn-warning btn-info btn-sm" data-bs-toggle="modal" data-bs-target="#userModal"
                              data-table-id="${table.id}"
                              data-table-first-name="${table.first_name}"
                              data-table-last-name="${table.last_name}"
                              data-table-username="${table.username}"
                              data-table-contact-number="${table.contact_number}"
                              data-table-email="${table.email}"
                              data-table-role="${table.role}"
                              data-table-image="${table.image_path || ''}">
                              <i class="fas fa-eye"></i> Edit
                          </button>
                      </td>
                  </tr>`;
      tableInfoBody.innerHTML += row;
    });
  
    // Add event listeners to the newly added buttons
    document.querySelectorAll(".btn-info").forEach((button) => {
      button.addEventListener("click", function () {
        const tableId = this.getAttribute("data-table-id");
        const firstName = this.getAttribute("data-table-first-name");
        const lastName = this.getAttribute("data-table-last-name");
        const username = this.getAttribute("data-table-username");
        const contactNumber = this.getAttribute("data-table-contact-number");
        const email = this.getAttribute("data-table-email");
        const role = this.getAttribute("data-table-role");
        const imageSrc = this.getAttribute("data-table-image");
  
        // Populate modal fields
        document.getElementById("firstName").value = firstName;
        document.getElementById("lastName").value = lastName;
        document.getElementById("username").value = username;
        document.getElementById("contactNumber").value = contactNumber;
        document.getElementById("email").value = email;
        document.getElementById("userImagePreview").src = imageSrc ? `${imageSrc}` : '../uploads/Pusa.jpg';
        document.getElementById("userId").value = tableId; // Hidden field for ID

        // Set role in the dropdown
      const roleSelect = document.getElementById("role");
      roleSelect.value = role;  // Pre-select the role based on the fetched data
      });
    });
}

document.getElementById("updateButton").addEventListener("click", function () {
  // Get the values from the modal form
  const userId = document.getElementById("userId").value;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const username = document.getElementById("username").value;
  const contactNumber = document.getElementById("contactNumber").value;
  const email = document.getElementById("email").value;
  const role = document.getElementById("role").value;

  // Create an object to hold the data
  const updatedData = {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      username: username,
      contact_number: contactNumber,
      email: email,
      role: role
  };
  console.log("data that is going to be passed: ", updatedData)

  fetch("2updateEmployee.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData)
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        // Close the modal and fetch updated table data
        $("#userModal").modal("hide");
        fetchTables();
        alert("User updated successfully.");
    } else if (data.message) {
        // Display specific message for username or email conflicts
        alert(data.message);
    } else {
        console.error("Update failed:", data.error);
        alert("Update failed: " + data.error);
    }
})
.catch(error => {
    console.error("Fetch error:", error);
    alert("An error occurred: " + error.message);
});
});

document.getElementById("deleteButton").addEventListener("click", function(){
  const userId = document.getElementById("userId").value;
  if(confirm("Are you sure you want to delete this user")){
    fetch("4deleteEmployee.php", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ user_id: userId })
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert("Employee deleted successfully.");
          $("#userModal").modal("hide");
          fetchTables(); // Refresh the table or list of employees after deletion
      } else {
          alert("Failed to delete employee: " + data.error);
      }
  })
  .catch(error => console.error("Error:", error));
  }
});

document.getElementById("resetPassword").addEventListener("click", function(){
  const userId = document.getElementById("userId").value;
  const newPassword = prompt("Enter a new password: ");
  if (newPassword){
    fetch("5resetPassword.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId, password: newPassword}),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Password reset successfully.");
            fetchTables(); // Refresh the table or list of employees after deletion
        } else {
            alert("Failed to reset the password: " + data.error);
        }
    })
    .catch(error => console.error("Error:", error));
  }
});


document.getElementById("changeImageButton").addEventListener("click", function () {
    document.getElementById("imageUpload").click();
  });

document.getElementById("imageUpload").addEventListener("change", function () {
  const userId = document.getElementById("userId").value;
    const file = this.files[0];
    if (file) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("user_id", userId);  // Send the user ID for identification
        console.log(file);
        console.log(userId);
        // Send data to the server via AJAX for image upload
        fetch("3uploadImage.php", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Image updated successfully.");
                fetchTables(); // Reload the table if needed
            } else {
                alert("Image update failed: " + data.error);
            }
        })
        .catch(error => console.error("Error:", error));
    }
});
