
const startTimerButton = document.getElementById("startTimer");
const pauseTimerButton = document.getElementById("pauseTimer");
const resumeTimerButton = document.getElementById("resumeTimer");
const stopTimerButton = document.getElementById("stopTimer");
const addTimeButton = document.getElementById("addTimeButton");

let timerId = null;
let timer = null; // Store the timer interval
let totalSeconds = 0; // Store total seconds for both timer types
let isPaused = false; // Track if the timer is paused

document.addEventListener("DOMContentLoaded", function () {
  fetchTables();
});

async function fetchTables() {
  try {
    const response = await fetch("2fetchTables.php");
    const tables = await response.json();
    const tableCards = document.getElementById("tableCards");
    tableCards.innerHTML = ""; // Clear any previous content

    tables.forEach((table) => {
      const tableId = table.id;
      const tableNumber = table.tableNumber;
      const timerType = table.timer_type; // Timer type (regular or open time)
      const remainingTime = table.remainingTime; // Remaining time for regular time
      const startTime = table.start_time; // Start time
      const endTime = table.end_time; // Expected end time
      const totalSeconds = table.total_seconds; // Total time used for open time
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
                                <strong id="timeLabel" >Remaining Time:</strong><span id="timeStatus">                      
                                </span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <div><strong>Start Time:</strong> ${
                                  startTime || "N/A"
                                }</div>
                                <div><strong>Expected End:</strong> ${
                                  endTime || "N/A"
                                }</div>
                                <div><strong>Total Time Used:</strong> ${
                                  totalSeconds || "N/A"
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
                            data-total-seconds="${totalSeconds}"
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
    document.querySelectorAll(".expand-btn").forEach((button) => {
      button.addEventListener("click", function () {
        updateModal(this);
      });
    });
  } catch (error) {
    console.error("Error fetching table data:", error);
  }
}
// still reviewing this shit
function initializeTimer(startTime, endTime, totalSeconds, timerType, status) {
  clearInterval(timer); // Clear any existing intervals

  // if its regular
  if (timerType === "regular") {
    totalSeconds = parseInt(totalSeconds); // set the total seconds and make it in int

    let currentTime = new Date().getTime();
    let startTimeMillis = new Date(startTime).getTime();
    let elapsedSeconds = Math.floor((currentTime - startTimeMillis) / 1000);
    let remainingSeconds = totalSeconds - elapsedSeconds;

    console.log("currentDate", currentTime);
    console.log("startTime", startTimeMillis);
    console.log("elapsedSeconds", elapsedSeconds);
    console.log("remainingSeconds", remainingSeconds);

    if (remainingSeconds <= 0) {
      remainingSeconds = 0;
      updateRemainingTime(remainingSeconds, "regular");
      return;
    }
    // startCount for regular Time
    timer = setInterval(() => {
      if (remainingSeconds <= 0) {
        clearInterval(timer);
        timer = null;
      } else {
        updateRemainingTime(remainingSeconds--, "regular");
      }
    }, 1000);

    //open time
  } else if (timerType === "open") {
    let currentTime = new Date().getTime();
    let startTimeMillis = new Date(startTime).getTime();
    let elapsedSeconds = Math.floor((currentTime - startTimeMillis) / 1000);

    console.log("Current ELAPSED SECONDS I SUPPOSED", elapsedSeconds);
    timer = setInterval(() => {
      elapsedSeconds++;
      updateRemainingTime(elapsedSeconds, "open");
    }, 1000);
  }
}

// // Function to start open time
// function startOpenTime() {
//   totalSeconds = 0;
//   isPaused = false; // Ensure the timer starts running

//   timer = setInterval(() => {
//     if (!isPaused) {
//       totalSeconds++;
//       updateRemainingTime(totalSeconds, "open");
//     }
//   }, 1000);
// }

// Function to update the remaining time display
function updateRemainingTime(seconds, type) {
  // Default value in case of NaN or invalid seconds
  const validSeconds = isNaN(seconds) || seconds === null ? 0 : seconds;
  // Format the time using the valid seconds
  const formattedTime = formatTime(validSeconds);
  
  if (type === "regular") {
    const timeDisplay = document.getElementById("remainingTimeRegular");
    timeDisplay.textContent = formattedTime; // Update the display
  } else if (type === "open") {
    const timeDisplay = document.getElementById("runningTimeOpen");
    timeDisplay.textContent = formattedTime; // Update the display
  }
}

// Format seconds into HH:MM:SS
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
}

// Function to update the modal content
function updateModal(button) {
  timerId = button.getAttribute("data-id");
  const tableNumber = button.getAttribute("data-table-number");
  const status = button.getAttribute("data-status");
  const notes = button.getAttribute("data-notes");

  // for timer
  const startTime = button.getAttribute("data-start-time");
  const endTime = button.getAttribute("data-end-time");
  const timerType = button.getAttribute("data-timer-type");
  const totalSeconds = button.getAttribute("data-total-seconds");
  const formattedStartTime = formatToAMPM(startTime); 
  // Populate the modal header with the current values
  document.querySelector(
    ".modal-title.tableNumber"
  ).textContent = `Table ${tableNumber}`;
  document.querySelector(".badge.status").textContent = status;
  document.querySelector("#startTime").textContent = formattedStartTime;
  document.querySelector("#noteInput").textContent = notes;
  document.querySelector("#endTime").textContent = endTime;
  
  // Set the radio button based on timerType
  const regularTimeRadio = document.getElementById("regularTime");
  const openTimeRadio = document.getElementById("openTime");

  if (timerType === "regular") {
    regularTimeRadio.checked = true; // Check the regular time radio button
  } else if (timerType === "open") {
    openTimeRadio.checked = true; // Check the open time radio button
  }

   // Set the radio button based on timer type
   const timerTypeRadios = document.querySelectorAll('input[name="timerType"]');
   timerTypeRadios.forEach((radio) => {
     if (radio.value === timerType) {
       radio.checked = true;
     }
   });

  initializeTimer(startTime, endTime, totalSeconds, timerType, status);

  manageButtonStates(status);
  manageTimerTypeFields();
}

function manageButtonStates(status) {
  const startButton = document.getElementById("startTimer");
  const pauseButton = document.getElementById("pauseTimer");
  const resumeButton = document.getElementById("resumeTimer");
  const stopButton = document.getElementById("stopTimer");

  // conditional statement depending on the status value

  if (status === "active") {
    startButton.disabled = true; // Timer is already running
    pauseButton.disabled = false; // Enable pause
    resumeButton.disabled = true; // Cannot resume if already active
    stopButton.disabled = false; // Enable stop
  } else if (status === "paused") {
    startButton.disabled = true; // Enable start
    pauseButton.disabled = true; // Disable pause
    resumeButton.disabled = false; // Enable resume
    stopButton.disabled = false; // Enable stop
  } else if (status === "available") {
    startButton.disabled = false;
    pauseButton.disabled = true; // Disable pause
    resumeButton.disabled = true; // Enable resume
    stopButton.disabled = false; // Enable stop
  } else if (status === "finished") {
    // in this case this is finished
    startButton.disabled = true; // Timer is already running
    pauseButton.disabled = false; // Enable pause
    resumeButton.disabled = true; // Cannot resume if already active
    stopButton.disabled = false; // Enable stop
  }
}

// Function to dynamically update the modal when status changes
function updateModalContentIfOpen() {
  const modalElement = document.querySelector("#timerModal");

  if (modalElement && modalElement.classList.contains("show")) {
    // If the modal is open, update it
    const currentButton = document.querySelector(
      `.expand-btn[data-id="${timerId}"]`
    );
    if (currentButton) {
      updateModal(currentButton);
    }
  }
}

//function to save shit
async function saveTimerSession(sessionData) {
  console.log("Session Data that is going to be sent: ", sessionData);
  try {
    const response = await fetch("3saveTimer.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionData),
    });
    const data = await response.json();
    console.log("Success", data);
    alert("timer has been saved");

    await fetchTables();
    updateModalContentIfOpen();
  } catch (error) {
    console.log("Error", error);
  }
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

  const localTimestamp = new Date(); // Current local time
  const options = { timeZone: "Asia/Singapore", hour12: false }; // Set options for Singapore timezone

  // Create a formatted string for the timestamp
  const formattedTimestamp = localTimestamp
    .toLocaleString("sv-SE", options) // 'sv-SE' gives YYYY-MM-DD format
    .replace(" ", " ") // Ensure a single space
    .slice(0, 19);

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
});

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
}

// Pause Timer
pauseTimerButton.addEventListener("click", function () {
  isPaused = true;
  const pauseTime = new Date().toISOString();

  saveTimerSession({
    id: timerId, // Use the global sessionId
    pause_time: pauseTime,
    status: "paused",
  });
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
});

// Stop Timer
stopTimerButton.addEventListener("click", function () {
  clearInterval(timer);
  if (timer !== null) {
    clearInterval(timer);
    timer = null; // Reset timer reference
  }

  isPaused = false; // Reset paused state
  totalSeconds = "0"; // Reset total seconds
  startTime = "Na";
  endTime = "Na";
  notes = "";

  // After resetting values, then update the UI
  updateRemainingTime(
    totalSeconds,
    document.getElementById("regularTime").checked ? "regular" : "open"
  );
  saveTimerSession({
    id: timerId, // Use the global sessionId
    start_time: startTime,
    end_time: endTime,
    total_seconds: totalSeconds,
    status: "available",
    notes: notes,
  });
});

// Pad single digits with leading zeros
function pad(num) {
  return String(num).padStart(2, "0");
}

// Function to toggle timer type
const timerTypeRadios = document.querySelectorAll('input[name="timerType"]');
const regularTimeFields = document.getElementById("regularTimeFields"); // Replace with actual ID
const openTimeFields = document.getElementById("openTimeFields"); // Replace with actual ID

timerTypeRadios.forEach((radio) => {
  radio.addEventListener("change", function () {
    manageTimerTypeFields();
  });
});

// Function to manage the visibility of timer type fields
function manageTimerTypeFields() {
  const selectedTimerType = document.querySelector('input[name="timerType"]:checked').value;
  if (selectedTimerType === "regular") {
    regularTimeFields.style.display = "block"; // Show regular time fields
    openTimeFields.style.display = "none"; // Hide open time fields
  } else {
    regularTimeFields.style.display = "none"; // Hide regular time fields
    openTimeFields.style.display = "block"; // Show open time fields
  }
}

// Initial display setting based on checked radio button when modal is opened
document.addEventListener("DOMContentLoaded", function() {
  const checkedRadio = document.querySelector('input[name="timerType"]:checked');
  if (checkedRadio) {
    manageTimerTypeFields(); // Ensure visibility is set correctly on page load
  }
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
      timer_type: "regular",
      total_seconds: totalSeconds,
    });
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

// Function to format the start time string into AM/PM format
function formatToAMPM(dateTimeString) {
  // Check if the input is null, empty, or not a valid date
  if (!dateTimeString || isNaN(new Date(dateTimeString))) {
    return "N/A"; // or return an empty string "", or whatever default you prefer
  }

  // Create a Date object from the dateTimeString
  const date = new Date(dateTimeString.replace(" ", "T")); // Convert to ISO format

  // Get the hours, minutes, and seconds
  let hours = date.getHours();
  const minutes = date.getMinutes();

  // Determine AM or PM suffix
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Convert hours from 24-hour to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Pad minutes and seconds with leading zeros if needed
  const formattedTime = `${pad(hours)}:${pad(minutes)} ${ampm}`;
  return formattedTime;
}