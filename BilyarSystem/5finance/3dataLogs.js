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
        const newSessionID = formatSessionId(table.startTime)
        console.log("newSessionId", newSessionID);
        const row = `<tr id="tableRow-${table.sessionID}">
                        <td>${newSessionID}</td>
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

// Function to format the receipt ID from start time
function formatSessionId(startTime) {
    const date = new Date(startTime);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
  
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
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

        // Show only a subset of pagination links
        const maxVisiblePages = 5; // Number of visible page links
        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        for (let i = startPage; i <= endPage; i++) {
            pagination.innerHTML += `<li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }

        pagination.innerHTML += '<li class="page-item"><a class="page-link" href="#" id="next">Next</a></li>';

        // Add event listeners for page links
        pagination.querySelectorAll('.page-link[data-page]').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                currentPage = parseInt(this.getAttribute('data-page'));
                renderFilteredTableInfo(); // Use filtered data
            });
        });

        // Handle previous and next buttons
        document.getElementById('prev').addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderFilteredTableInfo(); // Use filtered data
            }
        });

        document.getElementById('next').addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                renderFilteredTableInfo(); // Use filtered data
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

// ... existing code ...
document.getElementById("exportToExcel").addEventListener("click", showExportPreview);
// Add this function after your existing functions
function showExportPreview() {
    const previewHeader = document.getElementById('previewHeader');
    const previewBody = document.getElementById('previewBody');
    
    // Set up headers
    const headers = [
        'Session ID',
        'Table Number', 
        'Start Time', 
        'Saved Time', 
        'Total Bill Amount',
        'Total Duration',
        'Timer Type',
        'Total Paid',
        'Total Unpaid'
    ];

    // Create header row
    previewHeader.innerHTML = `
        <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
        </tr>
    `;

    // Create preview rows (showing first 5 entries)
    previewBody.innerHTML = tables.slice(0, 5).map(table => `
        <tr>  
            <td>${formatSessionId(table.startTime)}</td>
            <td>${table.tableNumber}</td>
            <td>${formatDateTime(table.startTime)}</td>
            <td>${formatDateTime(table.savedTime)}</td>
            <td>${table.totalBillAmount}</td>
            <td>${table.totalDurationSeconds}</td>
            <td>${table.timerType}</td>
            <td>${table.totalBillPaid}</td>
            <td>${table.totalBillUnpaid}</td>
        </tr>
    `).join('') + `
        <tr>
            <td colspan="8" class="text-center">
                <em>Preview showing first 5 rows of ${tables.length} total rows...</em>
            </td>
        </tr>
    `;

    // Show the modal
    const previewModal = new bootstrap.Modal(document.getElementById('exportPreviewModal'));
    previewModal.show();
}

function exportToExcel() {
    // Create CSV content
    let csvContent = "Session ID, Table Number,Start Time,Saved Time,Total Bill Amount,Total Duration,Timer Type,Total Paid,Total Unpaid\n";
    
    tables.forEach(table => {
        const formattedStartTime = formatDateTime(table.startTime);
        const formattedSavedTime = formatDateTime(table.savedTime);
        const formattedSessionID = formatSessionId(table.startTime); // Corrected function name
        // Escape values that might contain commas by wrapping them in quotes
        const escapeCsvValue = (value) => {
            if (value === null || value === undefined) return '""';
            return `"${value.toString().replace(/"/g, '""')}"`;
        };
        
        const row = [
            escapeCsvValue(formattedSessionID),
            escapeCsvValue(table.tableNumber),
            escapeCsvValue(formattedStartTime),
            escapeCsvValue(formattedSavedTime),
            escapeCsvValue(table.totalBillAmount),
            escapeCsvValue(table.totalDurationSeconds),
            escapeCsvValue(table.timerType),
            escapeCsvValue(table.totalBillPaid),
            escapeCsvValue(table.totalBillUnpaid)
        ].join(',');
        
        csvContent += row + "\n";
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = window.URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "billiards_data_" + new Date().toISOString().split('T')[0] + ".csv");
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Close the modal after export
    const previewModal = bootstrap.Modal.getInstance(document.getElementById('exportPreviewModal'));
    previewModal.hide();
}

// Update event listeners
document.addEventListener("DOMContentLoaded", function() {
    // ... existing DOMContentLoaded code ...
    
    // Change the export button to show preview first
    document.getElementById("exportToExcel").addEventListener("click", showExportPreview);
    
    // Add listener for the confirm export button
    document.getElementById("confirmExport").addEventListener("click", exportToExcel);
});

// Add search input and date filter elements in your HTML
// Add this inside your <main> tag, above the table


// Add event listeners for search and date filter
document.getElementById("searchInput").addEventListener("input", function() {
    currentPage = 1; // Reset to first page on search
    renderFilteredTableInfo();
});

document.getElementById("dateFilter").addEventListener("change", function() {
    currentPage = 1; // Reset to first page on date filter
    renderFilteredTableInfo();
});

// Add event listener for month and year filters
document.getElementById("monthFilter").addEventListener("change", function() {
    currentPage = 1; // Reset to first page on month filter
    renderFilteredTableInfo();
});

document.getElementById("yearFilter").addEventListener("change", function() {
    currentPage = 1; // Reset to first page on year filter
    renderFilteredTableInfo();
});
// Update the renderFilteredTableInfo function
function renderFilteredTableInfo() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const selectedMonth = document.getElementById("monthFilter").value;
    const selectedYear = document.getElementById("yearFilter").value;
    const selectedDate = document.getElementById("dateFilter").value; // Get the selected date

    const filteredTables = tables.filter(table => {
        const matchesSearch = table.tableNumber.toString().includes(searchTerm) || 
                              formatSessionId(table.startTime).includes(searchTerm);
        const tableDate = new Date(table.startTime);
        const matchesMonth = selectedMonth ? tableDate.getMonth() === parseInt(selectedMonth) : true;
        const matchesYear = selectedYear ? tableDate.getFullYear() === parseInt(selectedYear) : true;
        const matchesDate = selectedDate ? tableDate.toISOString().split('T')[0] === selectedDate : true; // Compare dates

        return matchesSearch && matchesMonth && matchesYear && matchesDate;
    });

    totalPages = Math.ceil(filteredTables.length / itemsPerPage);
    renderTableInfo(filteredTables);
}
