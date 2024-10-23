document.addEventListener("DOMContentLoaded", function () {
    fetch("2fetchTables.php")
      .then((response) => response.json())
      .then((tables) => {
        const tableCards = document.getElementById("tableCards");
        tableCards.innerHTML = ""; // Clear any previous content
  
        tables.forEach((table) => {
          const tableId = table.id;
          const tableNumber = table.tableNumber;
          const timerType = table.timerType; // Timer type (regular or open time)
          const remainingTime = table.remainingTime; // Remaining time for regular time
          const startTime = table.startTime; // Start time
          const expectedEndTime = table.expectedEndTime; // Expected end time
          const totalTimeUsed = table.totalTimeUsed; // Total time used for open time
          const status = table.status; // Status (available, active, paused, finished)
  
          // Bootstrap card for each table
          const card = document.createElement("div");
          card.classList.add("col-md-4", "mb-4"); // Bootstrap grid styling
  
          // Assign a data attribute to the card for the table ID (unique)
          card.setAttribute("data-table-id", tableId);
  
          // Set up Bootstrap card content
          card.innerHTML = `
                      <div class="card" id="card-${tableNumber}">
                          <div class="card-header bg-primary text-white">
                              <h5 class="card-title mb-0">Table ${tableNumber}</h5>
                              <span class="badge bg-secondary">${status}</span>
                          </div>
                          <div class="card-body">
                              <div class="mb-2">
                                  <strong>Timer Type:</strong> <span>${timerType}</span>
                              </div>
                              <div class="mb-2">
                                  <strong>Remaining Time:</strong> <span>${remainingTime || "N/A"}</span>
                              </div>
                              <div class="d-flex justify-content-between">
                                  <div><strong>Start Time:</strong> ${startTime || "N/A"}</div>
                                  <div><strong>Expected End:</strong> ${expectedEndTime || "N/A"}</div>
                                  <div><strong>Total Time Used:</strong> ${totalTimeUsed || "N/A"}</div>
                              </div>
                          </div>
                          <div class="card-footer text-end">
                              <button class="btn btn-sm btn-outline-primary expand-btn" data-bs-toggle="modal" data-bs-target="#timerModal" data-table-number="${tableNumber}" data-status="${status}">
                                  Expand
                              </button>
                          </div>
                      </div>
                  `;
  
          // Append the card to the container
          tableCards.appendChild(card);
        });
  
        // Now add the event listeners for the expand buttons
        document.querySelectorAll(".expand-btn").forEach(button => {
          button.addEventListener("click", function () {
            console.log("expand gets clicked");
            const tableNumber = this.getAttribute("data-table-number");
            const status = this.getAttribute("data-status");
  
            // Populate the modal header with the current values
            document.querySelector('.modal-title.tableNumber').textContent = `Table ${tableNumber}`;
            document.querySelector('.badge.status').textContent = status;
          });
        });
      })
      .catch((error) => {
        console.error("Error fetching table data:", error);
      });
  });
  

document.addEventListener("DOMContentLoaded", function () {
  const timerModal = document.getElementById("timerModal");
  const regularTimeFields = document.getElementById("regularTimeFields");
  const openTimeFields = document.getElementById("openTimeFields");
  const startTimerButton = document.getElementById("startTimer");
  const pauseTimerButton = document.getElementById("pauseTimer");
  const resumeTimerButton = document.getElementById("resumeTimer");
  const stopTimerButton = document.getElementById("stopTimer");

  let timer; // Store the timer interval
  let totalSeconds = 0; // Store total seconds for both timer types
  let isPaused = false; // Track if timer is paused
  let interval; // Store interval ID for running timer

  // Function to toggle timer type
  const timerTypeRadios = document.querySelectorAll('input[name="timerType"]');
  timerTypeRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.value === "regular") {
        regularTimeFields.style.display = "block";
        openTimeFields.style.display = "none";
      } else {
        regularTimeFields.style.display = "none";
        openTimeFields.style.display = "block";
      }
    });
  });

  // Start Timer
  startTimerButton.addEventListener("click", function () {
    // Check if Regular Time is selected
    if (document.getElementById("regularTime").checked) {
      const hours = parseInt(document.getElementById("hoursInput").value) || 0;
      const minutes =
        parseInt(document.getElementById("minutesInput").value) || 0;

      // Calculate totalSeconds for regular time
      totalSeconds = hours * 3600 + minutes * 60;
      updateRemainingTime(totalSeconds, "regular");
      isPaused = false;

      timer = setInterval(() => {
        if (totalSeconds > 0 && !isPaused) {
          totalSeconds--;
          updateRemainingTime(totalSeconds, "regular");
        } else {
          clearInterval(timer);
          alert("Time is finished!");
        }
      }, 1000);
    } else {
      // Start open time
      startOpenTime();
    }

    // Update button states
    updateButtonStates();
  });

  // Pause Timer
  pauseTimerButton.addEventListener("click", function () {
    isPaused = true;
    updateButtonStates();
  });

  // Resume Timer
  resumeTimerButton.addEventListener("click", function () {
    isPaused = false;
    updateButtonStates();
  });

  stopTimerButton.addEventListener("click", function () {
    clearInterval(timer);
    isPaused = false; // Ensure the paused state is reset

    if (document.getElementById("regularTime").checked) {
        totalSeconds = 0;
        updateRemainingTime(totalSeconds, "regular"); // Reset display for regular time
    } else if (document.getElementById("openTime").checked) {
        totalSeconds = 0;
        updateRemainingTime(totalSeconds, "open"); // Reset display for open time
    }
    updateButtonStates(); // Update button states after stopping the timer
});


  // Function to update the remaining time display
  function updateRemainingTime(seconds, type) {
    if (type === "regular") {
      const timeDisplay = document.getElementById("remainingTimeRegular");
      timeDisplay.textContent = formatTime(seconds);
    } else if (type === "open") {
      const timeDisplay = document.getElementById("runningTimeOpen");
      timeDisplay.textContent = formatTime(seconds);
    }
  }

  // Format seconds into HH:MM:SS
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }

  // Pad single digits with leading zeros
  function pad(num) {
    return String(num).padStart(2, "0");
  }

  // Quick Action Time Settings
  window.setQuickTime = function (time) {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    document.getElementById("hoursInput").value = hours;
    document.getElementById("minutesInput").value = minutes;
  };

  function updateButtonStates() {
    const isRegularTimeChecked = document.getElementById("regularTime").checked;
    const isOpenTimeChecked = document.getElementById("openTime").checked;

    startTimerButton.disabled = !isRegularTimeChecked && !isOpenTimeChecked;
    pauseTimerButton.disabled = isPaused || totalSeconds === 0;
    resumeTimerButton.style.display = isPaused ? "inline" : "none";
    stopTimerButton.disabled = totalSeconds === 0; // Only disable if totalSeconds is 0
}


  // Function to start open time
  function startOpenTime() {
    totalSeconds = 0;
    interval = setInterval(() => {
      totalSeconds++;
      updateRemainingTime(totalSeconds, "open");
    }, 1000);
  }
});
