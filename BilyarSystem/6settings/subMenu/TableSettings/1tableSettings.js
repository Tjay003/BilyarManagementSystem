let tableCountInput = document.querySelector("#tableCount");
let tableInfoBody = document.querySelector("#tableInfoBody");
let totalTables = 0;
let numberOfTables = document.querySelector("#numberOfTables");

// Fetch tables from the database when the page is loaded
window.onload = function () {
  fetchTables();
};

document.getElementById("setTablesBtn").addEventListener("click", function () {
  const tableCount = parseInt(tableCountInput.value);

  if (!isNaN(tableCount) && tableCount > 0) {
    // Send AJAX request to save the table number
    fetch("2saveTables.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `tableCount=${tableCount}`,
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          fetchTables();
          alert("Table number saved successfully!");
          // Optionally re-fetch table info or update UI
        } else {
          fetchTables();
          alert("Failed to save table number.");
        }
      });
  } else {
    alert("Please enter a valid table number.");
  }
});

// Increment button logic
document.getElementById("incrementBtn").addEventListener("click", function () {
  // Send AJAX request to increment tables in the database
  updateTableCount("increment");
});

// Decrement button logic
document.getElementById("decrementBtn").addEventListener("click", function () {
  // Send AJAX request to decrement tables in the database
  updateTableCount("decrement");
});

// Function to update tables count in the backend
function updateTableCount(action) {
  fetch("3updateTableCount.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `action=${action}`,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        alert("Table count updated successfully!");
        // Re-fetch and render the table info
        fetchTables();
      } else {
        alert("Failed to update table count.");
      }
    })
    .catch((error) => console.error("Error:", error));
}

//fetchTables function
function fetchTables() {
  fetch("4fetchTables.php") // Endpoint to fetch current table data
    .then((response) => response.json())
    .then((data) => {
      // Render your table rows here
      renderTableInfo(data); // Ensure this function is defined to render your UI
    })
    .catch((error) => console.error("Error:", error));
}

// Render table information based on fetched data
function renderTableInfo(tables) {
  tableInfoBody.innerHTML = ""; // Clear existing rows
  const totalTables = tables.length; // Get the total number of tables from the fetched data

  tables.forEach((table) => {
    const row = `<tr id="tableRow-${table.id}">
                <td>Table ${table.tableNumber}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-warning edit-btn" data-table="${table.id}" data-table-number="${table.tableNumber}" data-toggle="modal" data-target="#editModal" >Edit</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-table="${table.id}" data-toggle="modal" data-target="#deleteModal">Delete</button>
                </td>
            </tr>`;
    tableInfoBody.innerHTML += row;
  });

  // Update total table count
  numberOfTables.textContent = `Total Number of Tables: ${totalTables}`;

  // Handle edit button click
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const tableId = this.getAttribute("data-table");
      const tableNumber = this.getAttribute("data-table-number");

      // Populate the modal fields
      document.getElementById("editTableId").value = tableId; // Populate the hidden input
      document.getElementById("editTableNumber").value = tableNumber; // Populate the table number input
    });
  });

  // Add event listeners for delete buttons
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", function () {
      console.log("Delete button clicked!");
      const tableId = this.getAttribute("data-table");
      deleteTable(tableId); // Call the delete function
    });
  });
}

function deleteTable(tableId) {
  let currentTableId = tableId; // Store the current table ID to be deleted

  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", function () {
      fetch("5deleteTable.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id=${currentTableId}`,
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            fetchTables(); // Refresh the table info after deletion
            currentTableId = null; // Reset deleteId
          $("#deleteModal").modal("hide");
          } else {
            alert("Failed to delete table: " + result.error);
          }
        })
        .catch((error) => console.error("Error:", error));
    });
}

// Handle save changes in edit modal
document.getElementById("saveEditBtn").addEventListener("click", function() {
    const tableId = document.getElementById("editTableId").value;
    const tableNumber = document.getElementById("editTableNumber").value;

    fetch('6editTable.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Send data as JSON
        },
        body: JSON.stringify({ id: tableId, tableNumber: tableNumber }) // Send the ID and new table number
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert("Table updated successfully!");
            fetchTables(); // Refresh the table info after update
            $('#editModal').modal('hide'); // Hide the modal after successful update
        } else {
            alert("Failed to update table: " + result.error);
        }
    })
    .catch(error => console.error("Error:", error));
});



// Function to add tables
document.getElementById("add").addEventListener("click", function () {
    const tableCount = parseInt(document.getElementById("specifiedTable").value);
    if (isNaN(tableCount) || tableCount <= 0) {
        alert("Please enter a valid number of tables to add.");
        return;
    }

    fetch("7addTables.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `tableCount=${tableCount}`
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert("Tables added successfully!");
            fetchTables(); // Refresh the table info
        } else {
            alert("Failed to add tables: " + result.error);
        }
    })
    .catch(error => console.error("Error:", error));
});

// Function to delete tables
document.getElementById("delete").addEventListener("click", function () {
    const tableCount = parseInt(document.getElementById("specifiedTable").value);
    if (isNaN(tableCount) || tableCount <= 0) {
        alert("Please enter a valid number of tables to delete.");
        return;
    }

    fetch("8deleteTables.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `tableCount=${tableCount}`
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert("Tables deleted successfully!");
            fetchTables(); // Refresh the table info
        } else {
            alert("Failed to delete tables: " + result.error);
        }
    })
    .catch(error => console.error("Error:", error));
});
