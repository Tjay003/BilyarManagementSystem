let timerId = null;

document.addEventListener("DOMContentLoaded", function () {
  fetchTables();
});

function fetchTables() {
  fetch("2fetchTables.php")
    .then((response) => response.json())
    .then((tables) => {
      const tableCards = document.getElementById("tableCards");
      tableCards.innerHTML = ""; // Clear any previous content

      tables.forEach((table) => {
        const tableId = table.id;
        const tableNumber = table.tableNumber;
        const timerType = table.timer_type; // Timer type (regular or open time)
        const remainingTime = table.remainingTime; // Remaining time for regular time
        const startTime = table.start_time; // Start time
        const endTime = table.end_time; // Expected end time
        const totalTimeUsed = table.totalTimeUsed; // Total time used for open time
        const status = table.status; // Status (available, active, paused, finished)
        const notes = table.notes;

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
                                  <strong>Remaining Time:</strong> <span>${
                                    remainingTime || "N/A"
                                  }</span>
                              </div>
                              <div class="d-flex justify-content-between">
                                  <div><strong>Start Time:</strong> ${
                                    startTime || "N/A"
                                  }</div>
                                  <div><strong>Expected End:</strong> ${
                                    endTime || "N/A"
                                  }</div>
                                  <div><strong>Total Time Used:</strong> ${
                                    totalTimeUsed || "N/A"
                                  }</div>
                              </div>
                          </div>
                          <div class="card-footer text-end">
                              <button class="btn btn-sm btn-outline-primary expand-btn"  data-bs-toggle="modal" data-bs-target="#timerModal" 
                              data-table-number="${tableNumber}" 
                              data-status="${status}"
                              data-id="${tableId}"
                              data-timer-type="${timerType}" 
                              data-start-time="${startTime}"
                              data-end-time="${endTime}"
                              data-total-time-used="${totalTimeUsed}"
                              data-notes="${notes}">
                                  Expand
                              </button>
                          </div>
                      </div>
                  `;

        // Append the card to the container
        tableCards.appendChild(card);
      });

      // Now add the event listeners for the expand buttons
      // Now add the event listeners for the expand buttons
      document.querySelectorAll(".expand-btn").forEach((button) => {
        button.addEventListener("click", function () {
          updateModal(this);
        });
      });
    })
    .catch((error) => {
      console.error("Error fetching table data:", error);
    });
}

// Function to update the modal content
function updateModal(button) {
  timerId = button.getAttribute("data-id");
  const tableNumber = button.getAttribute("data-table-number");
  const status = button.getAttribute("data-status");
  const startTime = button.getAttribute("data-start-time");
  const endTime = button.getAttribute("data-end-time");
  const timerType = button.getAttribute("data-timer-type");
  const notes = button.getAttribute("data-notes");

  // Populate the modal header with the current values
  document.querySelector(".modal-title.tableNumber").textContent = `Table ${tableNumber}`;
  document.querySelector(".badge.status").textContent = status;
  document.querySelector("#startTime").textContent = startTime;
  document.querySelector("#noteInput").textContent = notes;
  document.querySelector("#endTime").textContent = endTime;
}

// Function to dynamically update the modal when status changes
function updateModalContentIfOpen() {
  const modalElement = document.querySelector("#timerModal");

  if (modalElement && modalElement.classList.contains("show")) {
    // If the modal is open, update it
    const currentButton = document.querySelector(`.expand-btn[data-id="${timerId}"]`);
    if (currentButton) {
      updateModal(currentButton);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const regularTimeFields = document.getElementById("regularTimeFields");
  const openTimeFields = document.getElementById("openTimeFields");
  const startTimerButton = document.getElementById("startTimer");
  const pauseTimerButton = document.getElementById("pauseTimer");
  const resumeTimerButton = document.getElementById("resumeTimer");
  const stopTimerButton = document.getElementById("stopTimer");
  const addTimeButton = document.getElementById("addTimeButton");

  let timer = null; // Store the timer interval
  let totalSeconds = 0; // Store total seconds for both timer types
  let isPaused = false; // Track if the timer is paused
  // I declare the timerId sa taas but yeah lets check nalang if ever

  //function to save shit
  function saveTimerSession(sessionData) {
    console.log("Session Data that is going to be sent: ", sessionData);
    fetch("3saveTimer.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success", data);
        alert("Timer has been saved and started");
        fetchTables()
        updateModalContentIfOpen();
      })
      .catch((error) => {
        console.log("Error", error);
      });
  }


  // Start Timer
  startTimerButton.addEventListener("click", function () {
    if (timer !== null) {
      clearInterval(timer); // Stop any previous running timer
    }

    // Check if Regular Time is selected
    if (document.getElementById("regularTime").checked) {
      const hours = parseInt(document.getElementById("hoursInput").value) || 0;
      const minutes =
        parseInt(document.getElementById("minutesInput").value) || 0;

      totalSeconds = hours * 3600 + minutes * 60; // Calculate totalSeconds for regular time
      updateRemainingTime(totalSeconds, "regular");
      isPaused = false;

      timer = setInterval(() => {
        if (totalSeconds > 0 && !isPaused) {
          totalSeconds--;
          updateRemainingTime(totalSeconds, "regular");
        } else if (totalSeconds === 0) {
          clearInterval(timer);
          timer = null;
          alert("Time is finished!");
        }
      }, 1000);
    } else {
      // Start open time
      startOpenTime();
    }

    //for timeStamp
    const localTimestamp = new Date();
    const formattedTimestamp = localTimestamp
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Generate a unique session ID and save session data
    const sessionData = {
      id: timerId, // Use the generated session ID
      timer_type: document.getElementById("regularTime").checked
        ? "regular"
        : "open",
      start_time: formattedTimestamp, // Convert to ISO string for MySQL
      total_seconds: totalSeconds,
      status: "active", 
      notes: document.getElementById("noteInput").value || "", // Assuming you have an input for notes
    };
    
    saveTimerSession(sessionData);
    updateModalContentIfOpen();
    updateButtonStates(); // Update button states
  });

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

  // Add event listener for Add Time button
  addTimeButton.addEventListener("click", function () {
    console.log("add time gets clicked");
    if (document.getElementById("regularTime").checked) {
      const additionalHours =
        parseInt(document.getElementById("hoursInput").value) || 0;
      const additionalMinutes =
        parseInt(document.getElementById("minutesInput").value) || 0;

      const additionalTimeInSeconds =
        additionalHours * 3600 + additionalMinutes * 60;

      // Add the additional time to the total seconds
      totalSeconds += additionalTimeInSeconds;

      saveTimerSession({
        id: timerId, // Use the global sessionId
        total_seconds: totalSeconds,
      });
      fetchTables();
      // Update the remaining time display
      updateRemainingTime(totalSeconds, "regular");
    }
  });

  // Quick Action Button Function
  window.setQuickTime = function (time) {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    document.getElementById("hoursInput").value = hours;
    document.getElementById("minutesInput").value = minutes;
  };

  // Pause Timer
  pauseTimerButton.addEventListener("click", function () {
    isPaused = true;
    const pauseTime = new Date().toISOString();

    saveTimerSession({
      id: timerId, // Use the global sessionId
      pause_time: pauseTime,
      status: "paused",
    });
    updateButtonStates(); // Reflect pause state
  });

  // Resume Timer
  resumeTimerButton.addEventListener("click", function () {
    isPaused = false;
    const resumeTime = new Date().toISOString();

    saveTimerSession({
      id: timerId, // Use the global sessionId
      resume_time: resumeTime,
      status: "active",
    });
    updateButtonStates(); // Reflect resume state
  });

  // Stop Timer
  stopTimerButton.addEventListener("click", function () {
    if (timer !== null) {
      clearInterval(timer);
      timer = null; // Reset timer reference
    }

    isPaused = false; // Reset paused state
    totalSeconds = 0; // Reset total seconds

    // After resetting values, then update the UI
    updateRemainingTime(
      totalSeconds,
      document.getElementById("regularTime").checked ? "regular" : "open"
    );

    const endTime = new Date().toISOString();
    saveTimerSession({
      id: timerId, // Use the global sessionId
      end_time: endTime,
      total_seconds: totalSeconds,
      status: "available",
    });
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

  // Function to update button states
  function updateButtonStates() {
    const isTimerRunning = timer !== null && !isPaused;
    const isTimerPaused = timer !== null && isPaused;
    const isTimerStopped = timer === null;

    // Manage button states based on the timer's status
    startTimerButton.disabled = !isTimerStopped; // Disabled when the timer is running
    pauseTimerButton.disabled = isTimerPaused || isTimerStopped; // Enabled only if timer is running
    resumeTimerButton.disabled = !isTimerPaused || isTimerStopped; // Enabled only if timer is paused
  }

  // Function to start open time
  function startOpenTime() {
    totalSeconds = 0;
    isPaused = false; // Ensure the timer starts running

    timer = setInterval(() => {
      if (!isPaused) {
        totalSeconds++;
        updateRemainingTime(totalSeconds, "open");
      }
    }, 1000);

    updateButtonStates();
  }
});
