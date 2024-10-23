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
                                <strong>Remaining Time:</strong> <span>${
                                  remainingTime || "N/A"
                                }</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <div><strong>Start Time:</strong> ${
                                  startTime || "N/A"
                                }</div>
                                <div><strong>Expected End:</strong> ${
                                  expectedEndTime || "N/A"
                                }</div>
                                <div><strong>Total Time Used:</strong> ${
                                  totalTimeUsed || "N/A"
                                }</div>
                            </div>
                        </div>
                        <div class="card-footer text-end">
                            <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#timerModal">
                                Expand
                            </button>
                        </div>
                    </div>
                `;

        // Append the card to the container
        tableCards.appendChild(card);
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
  let totalSeconds = 0; // Store total seconds for regular time
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
    //REGULAR TIME
    if (document.getElementById("regularTime").checked) {
      const hours = parseInt(document.getElementById("hoursInput").value) || 0;
      const minutes =
        parseInt(document.getElementById("minutesInput").value) || 0;

      //calculate all totalSeconds
      totalSeconds = hours * 3600 + minutes * 60;
      updateRemainingTime(totalSeconds);
      isPaused = false;

      timer = setInterval(() => {
        //if may laman
        //then decrement it until maubos
        //then call the updateRemainingTimeFunction
        if (totalSeconds > 0 && !isPaused) {
          totalSeconds--;
          updateRemainingTime(totalSeconds);
        } else {
          clearInterval(timer);
          alert("Time is finished!");
        }
      }, 1000);
    } else {
      //OPEN TIME FUNCTION IF ITS NOT REGULAR TIME
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

  // Stop Timer
  stopTimerButton.addEventListener("click", function () {
    clearInterval(timer);
    totalSeconds = 0;
    updateRemainingTime(totalSeconds);
    isPaused = false;
    updateButtonStates();
  });

  // Function to update the remaining time display
  // will be called for regular Time
  function updateRemainingTime(seconds) {
    const remainingTimeDisplay = document.getElementById(
      "remainingTimeRegular"
    );
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    remainingTimeDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(
      remainingSeconds
    )}`;
  }

  function updateRemainingTime(time, type) {
    if (type === "regular") {
      let timeDisplay = document.getElementById("remainingTimeRegular");
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      timeDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(
        remainingSeconds
      )}`;
    } else if (type === "open") {
      let timeDisplay = document.getElementById("remainingTimeOpen");
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      timeDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(
        remainingSeconds
      )}`;
    }
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

  // Update button states
  function updateButtonStates() {
    startTimerButton.disabled =
      !document.getElementById("regularTime").checked &&
      !document.getElementById("openTime").checked;
    pauseTimerButton.disabled = isPaused || totalSeconds === 0;
    resumeTimerButton.style.display = isPaused ? "inline" : "none";
    stopTimerButton.disabled = totalSeconds === 0;
  }

  // Function to start open time
  function startOpenTime() {
    totalSeconds = 0;
    interval = setInterval(() => {
      totalSeconds++;
      updateRemainingTime(totalSeconds, 'open');
    }, 1000);
  }
});
