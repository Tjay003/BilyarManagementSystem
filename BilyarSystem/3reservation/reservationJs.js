const tableBody = document.querySelector("#tableBodyReservation");
let deleteId = null;
let editId = null;

//pagination variables
let currentPage = 1;
const itemsPerPage = 5; // Change this to the number of items you want per page

// Fetch data from the server using AJAX
function fetchReservations() {
  fetch("fetchReservation.php")
    .then((response) => response.json())
    .then((data) => {
      renderTable(data);
    });
}

fetchReservations();

//renderingTheTable agad-agad
function renderTable(data) {
    tableBody.innerHTML = '';

    // Check if there is a message indicating no reservations
    if (data.length === 1 && data[0].message) {
        const noDataRow = `<tr><td colspan="4" class="text-center">${data[0].message}</td></tr>`;
        tableBody.innerHTML += noDataRow;
    } else {
        // Calculate the total number of pages
        const totalPages = Math.ceil(data.length / itemsPerPage);

        // Get the items for the current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = data.slice(startIndex, endIndex);

        currentItems.forEach(item => {
            const row = `<tr>
                <td>${item.order_number}</td>
                <td>${item.name}</td>
                <td>${item.created_at}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-btn" data-id="${item.id}" data-name="${item.name}" data-order-number="${item.order_number}" data-toggle="modal" data-target="#editModal">Edit</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}" data-toggle="modal" data-target="#deleteModal">Delete</button>
                </td>
            </tr>`;
            tableBody.innerHTML += row;
        });

        // Create pagination buttons
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '<li class="page-item"><a class="page-link" href="#" id="prev">Previous</a></li>'; // Reset pagination

        for (let i = 1; i <= totalPages; i++) {
            const pageItem = `<li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
            pagination.innerHTML += pageItem;
        }

        pagination.innerHTML += '<li class="page-item"><a class="page-link" href="#" id="next">Next</a></li>';

        // Add event listeners for page numbers
        document.querySelectorAll('.page-link[data-page]').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                currentPage = parseInt(this.getAttribute('data-page'));
                renderTable(data); // Rerender table with new current page
            });
        });

        // Handle previous and next buttons
        document.getElementById('prev').addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderTable(data);
            }
        });

        document.getElementById('next').addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                renderTable(data);
            }
        });

        // Handle edit button click
        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", function () {
                editId = this.getAttribute("data-id");
                const name = this.getAttribute("data-name");
                const orderNumber = this.getAttribute("data-order-number");

                // Populate the edit modal with the current values
                document.getElementById('editName').value = name;
                document.getElementById('editOrderNumber').value = orderNumber;
            });
        });

        // Handle delete button click
        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", function () {
                deleteId = this.getAttribute("data-id");
            });
        }); 
    }
}

// Handle confirm delete button click
document.getElementById("confirmDelete").addEventListener("click", () => {
  if (deleteId !== null) {
    fetch("delete.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: deleteId }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          fetchReservations(); // Refresh the table after deletion
        } else {
          alert("Failed to delete");
        }
      });
    deleteId = null; // Reset deleteId
    $("#deleteModal").modal("hide");
  }
});

// Listen for form submission to create a new reservation
document.getElementById('createForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const order_number = document.getElementById('order_number').value;

    // Use AJAX to send form data to PHP
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'saveReservation.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onload = function() {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (!response.error) {
                fetchReservations(); // Refresh the table after adding a new reservation
                document.getElementById('createForm').reset(); // Reset form fields
            } else {
                alert(response.error);
            }
        }
    };

    xhr.send(`name=${name}&order_number=${order_number}`);
});

fetchReservations();

// Handle form submission for edit
document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('editName').value;
    const orderNumber = document.getElementById('editOrderNumber').value;

    fetch('edit.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: editId, name: name, order_number: orderNumber }),
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            $('#editModal').modal('hide');
            fetchReservations();  // Refresh the table after edit
        } else {
            alert('Failed to update');
        }
    });
});

