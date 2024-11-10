document.addEventListener("DOMContentLoaded", function () {
    fetchTables();
    sortTable('startTime')
});

let currentPage = 1;
const itemsPerPage = 10;
let tables = [];
let totalPages = 0; // Declare totalPages here to be accessible in both functions

let sortOrders = {
    startTime: 'desc',
    savedTime: 'desc',
    totalBillAmount: 'asc'
};

const tableInfoBody = document.querySelector("#tableInfoBody");

// Fetch tables from the database
function fetchTables() {
    console.log("fetch tables triggered");
    fetch("2fetchSessions.php")
        .then(response => response.json())
        .then(data => {
            tables = data;
            totalPages = Math.ceil(data.length / itemsPerPage);
            renderTableInfo(tables);
        })
        .catch(error => console.error("Error:", error));
}

// Render the table with paginated and sorted data
function renderTableInfo(tables) {
    tableInfoBody.innerHTML = ""; 

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedTables = tables.slice(start, end);

    paginatedTables.forEach((table, index) => {
        const formattedStartTime = formatDateTime(table.startTime);
        const formattedSavedTime = formatDateTime(table.savedTime);
        const row = `<tr id="tableRow-${table.sessionID}">
                        <td>${table.tableNumber}</td>
                        <td>${formattedStartTime}</td>
                        <td>${formattedSavedTime}</td>
                        <td>${table.totalBillAmount}</td>
                        <td>
                            <button type="button" class="btn view-btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#userModal"
                              data-table-id="${table.sessionID}"
                              data-table-tableNumber="${table.tableNumber}"
                              data-table-totalDurationSeconds="${table.totalDurationSeconds}"
                              data-table-totalBillAmount="${table.totalBillAmount}"
                              data-table-totalBillPaid="${table.totalBillPaid}"
                              data-table-totalBillUnpaid="${table.totalBillUnpaid}"
                              data-table-timerType="${table.timerType}">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    </tr>`;
        tableInfoBody.innerHTML += row;
    });
    renderPagination();
    
    
    // Add event listeners to the newly added buttons
    document.querySelectorAll(".view-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const tableId = this.getAttribute("data-table-id");
          const tableNumber = this.getAttribute("data-table-tableNumber");
          const totalDurationSeconds = this.getAttribute("data-table-totalDurationSeconds");
          const totalBillAmount = this.getAttribute("data-table-totalBillAmount");
          const totalBillPaid = this.getAttribute("data-table-totalBillPaid");
          const totalBillUnpaid = this.getAttribute("data-table-totalBillUnpaid");
          const timerType = this.getAttribute("data-table-timerType");

    
          // Populate modal fields
          document.getElementById("tableNumber").value = tableNumber;
          document.getElementById("totalDurationSeconds").value = totalDurationSeconds;
          document.getElementById("totalBillAmount").value = totalBillAmount;
          document.getElementById("totalBillPaid").value = totalBillPaid;
          document.getElementById("totalBillUnpaid").value = totalBillUnpaid;
          document.getElementById("tableId").value = tableId; // Hidden field for ID
          document.getElementById("timerType").value = timerType; // Hidden field for ID
        });
      });
}

document.getElementById("updateButton").addEventListener("click", function () {
    // Get the values from the modal form
    const tableId = document.getElementById("tableId").value;
    const totalBillPaid =  document.getElementById("totalBillPaid").value
    const totalBillUnpaid = document.getElementById("totalBillUnpaid").value;

  
    // Create an object to hold the data
    const updatedData = {
        sessionID: tableId,
        totalBillPaid: totalBillPaid,
        totalBillUnpaid: totalBillUnpaid
        
    };
    console.log("data that is going to be passed: ", updatedData)
    updatedData
    fetch("4updateLogs.php", {
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
    const tableId = document.getElementById("tableId").value;
    if(confirm("Are you sure you want to delete this log")){
      fetch("5deleteLog.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ sessionID: tableId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Log deleted successfully.");
            $("#userModal").modal("hide");
            fetchTables(); // Refresh the table or list of employees after deletion
        } else {
            alert("Failed to delete log: " + data.error);
        }
    })
    .catch(error => console.error("Error:", error));
    }
  });

// Render pagination buttons with event listeners
function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = ''; // Clear previous pagination

    if (totalPages > 1) { // Only display pagination if more than one page
        pagination.innerHTML += '<li class="page-item"><a class="page-link" href="#" id="prev">Previous</a></li>';

        for (let i = 1; i <= totalPages; i++) {
            pagination.innerHTML += `<li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }

        pagination.innerHTML += '<li class="page-item"><a class="page-link" href="#" id="next">Next</a></li>';

        // Add event listeners for page links
        pagination.querySelectorAll('.page-link[data-page]').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                currentPage = parseInt(this.getAttribute('data-page'));
                renderTableInfo(tables);
            });
        });

        // Handle previous and next buttons
        document.getElementById('prev').addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderTableInfo(tables);
            }
        });

        document.getElementById('next').addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                renderTableInfo(tables);
            }
        });
    }
}

// Format date to "Month Day, Year hh:mmAM/PM"
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleString('en-US', options);
}

// Toggle and apply sorting to table columns
function sortTable(column) {
    sortOrders[column] = sortOrders[column] === 'asc' ? 'desc' : 'asc';

    tables.sort((a, b) => {
        const valueA = a[column];
        const valueB = b[column];

        if (column === 'totalBillAmount') {
            return sortOrders[column] === 'asc' ? valueA - valueB : valueB - valueA;
        }
        
        return sortOrders[column] === 'asc'
            ? new Date(valueA) - new Date(valueB)
            : new Date(valueB) - new Date(valueA);
    });

    renderTableInfo(tables);
}

sortTable('savedTime');