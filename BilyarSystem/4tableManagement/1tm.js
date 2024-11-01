document.addEventListener("DOMContentLoaded", function () {
  fetchTables();
});


let timerId = null;
let timer = null; // Store the timer interval

const startTimerButton = document.getElementById("startTimer");
const pauseTimerButton = document.getElementById("pauseTimer");
const resumeTimerButton = document.getElementById("resumeTimer");
const stopTimerButton = document.getElementById("stopTimer");
const addTimeButton = document.getElementById("addTimeButton");

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
      const startTime = table.start_time; // Start time
      const endTime = table.end_time; // Expected end time
      const totalSeconds = table.total_seconds; // Total time used for open time
      const status = table.status; // Status (available, active, paused, finished)
      const pauseTime = table.pause_time;
      const notes = table.notes;
      const cumulativePause = table.cumulativePause;

      const formattedStartTime = formatToAMPM(startTime);

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
                                <strong id="timeLabel-${tableId}">Remaining Time:</strong><span id="remainingTime-${tableId}"></span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <div>
                                <strong>Start Time:</strong> 
                                <div> ${formattedStartTime || "N/A"}</div>
                                </div>
                                <div>
                                  <strong>Expected End:</strong>
                                  <div>N/A</div> 
                                </div>

                                <div>
                                  <strong>Total Time Used:</strong> 
                                  <div>N/A</div>
                                </div>
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
                            data-notes="${notes}"
                            data-pause-time="${pauseTime}"
                            data-cumulative-pause="${cumulativePause}">      
                                Expand
                            </button>
                        </div>
                    </div>
                `;

       // Append the card to the container
    tableCards.appendChild(card);

    initializeTimer(
      table.start_time,
      table.total_seconds,
      table.timer_type,
      table.pause_time,
      table.cumulativePause,
      table.status,
      tableId
    );
  
    });
    document.querySelectorAll(".expand-btn").forEach((button) => {
      button.addEventListener("click", function () {
        totalSeconds = 0;
        updateModal(this);
      });
    });
  } catch (error) {
    console.error("Error fetching table data:", error);
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
    // alert("timer has been saved");

    await fetchTables();
    updateModalContentIfOpen();
  } catch (error) {
    console.log("Error", error);
  }
}


// timerDetails
const timerIntervals = new Map(); // storing each table's timer
const remainingSecondsMap = new Map();
const finishedTimers = new Map(); // Track finished state per table
const pausedTimers = new Map(); // Track paused state per table
const cumulativePauseDurations  = new Map();
const totalSecondsMap = new Map();
const statusMap = new Map();
const pauseTimeMillisMap = new Map(); // Store pauseTimeMillis per timer

// I think I should have pausedTimeMillis map


let pauseTimeMillis = 0;
let cumulativePauseDuration = 0;
let totalSeconds = 0; // Store total seconds for both timer types
let isPaused = false; // Track if the timer is paused

// Initialization of the timer function
function initializeTimer(startTime, totalSeconds, timerType, pauseTime, cumulativePause, status, tableId, tableNumb) {
  // Clear any existing timer for the specific table
  if (timerIntervals.has(tableId)) {
    clearInterval(timerIntervals.get(tableId));
  }
    // Initialize specific table flags
  pausedTimers.set(tableId, status === "paused"); // Track if this timer is paused
  finishedTimers.set(tableId, false); // Reset finished state when initializing
  statusMap.set(tableId, status);

  //just making it into integer para sure haha
  let cumulativePauseDuration = parseInt(cumulativePause, 10) || 0;
  cumulativePauseDurations.set(tableId, cumulativePauseDuration);
  console.log("cpd: ",cumulativePauseDuration);

  // Store the pause start time if the timer is currently paused
  pauseTimeMillisMap.set(tableId, pauseTime ? new Date(pauseTime).getTime() : 0);

  // Calculate additional pause time for this page load
  if (status === "paused" && pauseTime) {
    const currentPauseDuration = new Date().getTime() - pauseTimeMillisMap.get(tableId);
    cumulativePauseDuration += currentPauseDuration;
  }


  let elapsedTime = getElapsedTime(new Date(startTime).getTime(), cumulativePauseDuration);
  console.log("Total Seconds", totalSeconds);
  // Initialize remainingSeconds based on timer type and elapsed time
  let remainingSeconds = timerType === "regular" ? parseInt(totalSeconds) - elapsedTime : elapsedTime;
  console.log("RemainingSeconds after calculation", remainingSeconds)
  remainingSecondsMap.set(tableId, remainingSeconds);


  // Initialize the totalSecondsMap
  totalSecondsMap.set(tableId, parseInt(totalSeconds)); // Store the initial totalSeconds

  // Set interval for each tableId
  const interval = setInterval(() => {
    const isPaused = pausedTimers.get(tableId);
    const isFinished = finishedTimers.get(tableId);
    const currentStatus  = statusMap.get(tableId);
  
    // Only update if the timer is not paused or finished
    if (!isPaused && !isFinished && currentStatus !== "available") {
      let currentRemainingSeconds = remainingSecondsMap.get(tableId);
      
      if (timerType === "regular") {
        if (currentRemainingSeconds <= 0) {
          finishTimer(tableId);
        } else {
          console.log("REMAINING SECONDS RUNNING", currentRemainingSeconds);
          // Update the remaining seconds and display
          remainingSecondsMap.set(tableId, currentRemainingSeconds - 1);
          updateRemainingTime(currentRemainingSeconds - 1, tableId, "regular");
          updateRemainingTimeCard(currentRemainingSeconds - 1, tableId, "regular");
        }
      } else if (timerType === "open") {
        remainingSecondsMap.set(tableId, currentRemainingSeconds + 1);
        updateRemainingTime(currentRemainingSeconds + 1, tableId, "open");
        updateRemainingTimeCard(currentRemainingSeconds + 1, tableId, "open");
      }
    } else {
      // Optionally update the display to show the paused time
      let currentRemainingSeconds = remainingSecondsMap.get(tableId);
      updateRemainingTime(currentRemainingSeconds, tableId, "regular");
      updateRemainingTimeCard(currentRemainingSeconds, tableId, "regular");
    }
  }, 1000);
  

  // Store the interval in the map for future reference
  timerIntervals.set(tableId, interval);
}


function getElapsedTime(startTimeMillis, cumulativePauseDuration) {
  let currentTime = new Date().getTime();
  return Math.floor(
    (currentTime - startTimeMillis - cumulativePauseDuration) / 1000
  );
}

// Pause Timer
pauseTimerButton.addEventListener("click", function () {
  console.log("Pause Clicked!");
  const localTimestamp = new Date(); // Current local time
  const options = { timeZone: "Asia/Singapore", hour12: false }; // Set options for Singapore timezone

  // Create a formatted string for the timestamp
  const pauseTime = localTimestamp
    .toLocaleString("sv-SE", options) // 'sv-SE' gives YYYY-MM-DD format
    .replace(" ", " ") // Ensure a single space
    .slice(0, 19);

  // Set the pause time in milliseconds for this specific timer
  pauseTimeMillisMap.set(timerId, localTimestamp.getTime());
  
  // track that this timer is now paused
  pausedTimers.set(timerId, true);

  saveTimerSession({
    id: timerId, // Use the global sessionId
    pause_time: pauseTime,
    status: "paused",
  });
});


// Event listener for resume button
resumeTimerButton.addEventListener("click", function () {
  console.log("resume clicked!");

  // Check if this timer is currently paused
  if (pausedTimers.get(timerId)) {
    const currentTime = new Date().getTime();
    const pauseStart = pauseTimeMillisMap.get(timerId); // Get stored pause start time


    // Calculate this pause's duration
    const pauseDuration = currentTime - pauseStart;

    let cumulativePause = cumulativePauseDurations.get(timerId) || 0;
    cumulativePause += pauseDuration; // add the recent pause duration
    cumulativePauseDurations.set(timerId, cumulativePause);

    // clear the pause state for this timer
    pausedTimers.set(timerId, false);
    pauseTimeMillisMap.set(timerId, 0);
    
    console.log("Updated cumulative pause duration:", cumulativePause);

    // Save updated session details, resetting the pause_time and updating the status to active
    saveTimerSession({
      id: timerId, // Use the timer's ID for session tracking
      status: "active",
      pause_time: "reset", // Indicate to reset pause_time in the database
      cumulativePause: parseInt(cumulativePause, 10), // Convert to seconds
    });
  }
});

function finishTimer(tableId) {
  console.log("Timer finished for table:", tableId);

  //check if the timer has already been marked as finished
  if (finishedTimers.get(tableId)) return;
  console.log("Timer finished for table:", tableId);

  // Mark as finished and pause this timer
  finishedTimers.set(tableId, true);
  pausedTimers.set(tableId, true);

  // Save the finish (pause) time as a timestamp
  const localTimestamp = new Date();
  const options = { timeZone: "Asia/Singapore", hour12: false };
  const finishTime = localTimestamp
    .toLocaleString("sv-SE", options)
    .slice(0, 19);

  // Update session status to "paused" and save finish time
  saveTimerSession({
    id: tableId,
    pause_time: finishTime,
    status: "paused",
  });

  updateRemainingTime(0, tableId, "regular");
  updateRemainingTimeCard(0, tableId, "regular");

  alert("timer has been finished")
}


//for card
function updateRemainingTimeCard(seconds, tableId, type) {

  const validSeconds = isNaN(seconds) || seconds === null ? 0 : seconds;
  const formattedTime = formatTime(validSeconds);
  
  const remainingTimeSpan = document.getElementById(`remainingTime-${tableId}`);
  const timeLabel = document.getElementById(`timeLabel-${tableId}`);

  if (remainingTimeSpan) {
    if (type === "regular") {
      if (timeLabel) {
        timeLabel.textContent = "Remaining Time: ";
      }
      remainingTimeSpan.textContent = formattedTime;
    } else if (type === "open") {
      if (timeLabel) {
        timeLabel.textContent = "Running Time: ";
      }
      remainingTimeSpan.textContent = formattedTime;
    }
  }
}

//for modal
function updateRemainingTime(seconds, tableId, type) {
  // Default to 0 if seconds is NaN or null
  const validSeconds = isNaN(seconds) || seconds === null ? 0 : seconds;
  const formattedTime = formatTime(validSeconds);
  
  // Update modal display
  if (type === "regular") {
    const modalTimeDisplay = document.getElementById(`remainingTimeRegular-${tableId}`);
    if (modalTimeDisplay) {
      modalTimeDisplay.textContent = formattedTime;
    }
  } else if (type === "open") {
    const modalTimeDisplay = document.getElementById(`runningTimeOpen-${tableId}`);
    if (modalTimeDisplay) {
      modalTimeDisplay.textContent = formattedTime;
    }
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
  const pauseTime = button.getAttribute("data-pause-time");
  const cumulativePause = button.getAttribute("data-cumulative-pause");

  const formattedStartTime = formatToAMPM(startTime);
  // Populate the modal header with the current values
  document.querySelector(".modal-title.tableNumber").textContent = `Table ${tableNumber}`;
  document.querySelector(".badge.status").textContent = status;
  document.querySelector("#startTime").textContent = formattedStartTime;
  document.querySelector("#noteInput").textContent = notes;
  document.querySelector("#endTime").textContent = endTime;
  
  // Dynamically assign unique IDs based on the timer ID
  document.querySelector("[data-type='remainingTimeRegular']").id = `remainingTimeRegular-${timerId}`;
  document.querySelector("[data-type='runningTimeOpen']").id = `runningTimeOpen-${timerId}`;
  
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

  initializeTimer(
    startTime,
    totalSeconds,
    timerType,
    pauseTime,
    cumulativePause,
    status,
    timerId,
    tableNumber
  );
  manageButtonStates(status);
  manageTimerTypeFields();
}

// Start Timer
startTimerButton.addEventListener("click", function () {
  console.log("startTimerButton Click");
  if (timer !== null) {
    clearInterval(timer); // Stop any previous running timer
  }
  // if start means its paused thats why isPaused is false
  isPaused = false;

  const localTimestamp = new Date(); // Current local time
  const options = { timeZone: "Asia/Singapore", hour12: false }; // Set options for Singapore timezone

  // Create a formatted string for the timestamp
  const formattedTimestamp = localTimestamp
    .toLocaleString("sv-SE", options) // 'sv-SE' gives YYYY-MM-DD format
    .replace(" ", " ") // Ensure a single space
    .slice(0, 19);
  // retrieve the current totalSeconds from the map
  let currentTotalSeconds = totalSecondsMap.get(timerId) || 0; // if no value then 0

  // Generate a unique session ID and save session data
  const sessionData = {
    id: timerId, // Use the generated session ID
    timer_type: document.getElementById("regularTime").checked
      ? "regular"
      : "open",
    start_time: formattedTimestamp, // Convert to ISO string for MySQL
    total_seconds: currentTotalSeconds,
    status: "active",
    notes: document.getElementById("noteInput").value || "", // Assuming you have an input for notes
  };

  saveTimerSession(sessionData);
});


addTimeButton.addEventListener("click", function () {
  console.log("Add Time button clicked");

  if (document.getElementById("regularTime").checked) {
    const hoursInput = document.getElementById("hoursInput").value;
    const minutesInput = document.getElementById("minutesInput").value;

    // Check if both inputs are empty or zero
    if (
      (!hoursInput && !minutesInput) ||
      (parseInt(hoursInput) === 0 && parseInt(minutesInput) === 0)
    ) {
      alert("Please input a valid number for either hours or minutes.");
      console.log("addTime");
      return; // Stop the function if no valid input is provided
    }

    // Ensure additional time values are integers
    const additionalHours = parseInt(hoursInput) || 0;
    const additionalMinutes = parseInt(minutesInput) || 0;
    const additionalTimeInSeconds =
      additionalHours * 3600 + additionalMinutes * 60;

    
    // retrieve the current totalSeconds from the map
    let currentTotalSeconds = totalSecondsMap.get(timerId) || 0; // if no value then 0

    // add the additional time to totalSeconds
    currentTotalSeconds += additionalTimeInSeconds;

    //set the new currentTotalSeconds to the totalSecondsMap
    totalSecondsMap.set(timerId, currentTotalSeconds);

    // Retrieve the current remaining seconds from remainingSecondsMap
    let currentRemainingSeconds = remainingSecondsMap.get(timerId) || 0;
    currentRemainingSeconds += additionalTimeInSeconds;

    // Set the updated remaining seconds back to the map
    remainingSecondsMap.set(timerId, currentRemainingSeconds);

    // Update the remaining time display
    updateRemainingTime(currentRemainingSeconds, timerId, "regular");
    updateRemainingTimeCard(currentRemainingSeconds, timerId, "regular");

    // Save the updated totalSeconds and update display
    saveTimerSession({
      id: timerId,
      timer_type: "regular",
      total_seconds: currentTotalSeconds.toString(), // Convert to string for consistent storage
    });

    // Clear input fields after adding time
    document.getElementById("hoursInput").value = "";
    document.getElementById("minutesInput").value = "";
  }
});


// Event listener for Stop Timer
stopTimerButton.addEventListener("click", function () {
  console.log("Stop Timer Clicked!");

  // Clear the interval for this specific timer
  if (timerIntervals.has(timerId)) {
    clearInterval(timerIntervals.get(timerId));
    timerIntervals.delete(timerId); // Remove timer from the map
  }

  // Reset all state values for this timer
  pausedTimers.set(timerId, false); // Reset paused state
  remainingSecondsMap.set(timerId, 0); // Set remaining seconds to 0
  totalSecondsMap.set(timerId, 0); // Reset total seconds
  cumulativePauseDurations.set(timerId, 0); // Reset cumulative pause duration
  pauseTimeMillisMap.set(timerId, 0); // Reset pause time

  // Mark the timer as finished
  finishedTimers.set(timerId, true); // Mark as finished
  statusMap.set(timerId, "available"); // Set status to available
  
  // Update the UI to show the timer reset state
  updateRemainingTime(0, timerId, "regular"); // Set display to 0 for the specific timer
  updateRemainingTimeCard(0, timerId, "regular"); // Also update the card display if needed
  updateRemainingTime(0, timerId, "open"); // Set display to 0 for the specific timer
  updateRemainingTimeCard(0, timerId, "open"); // Also update the card display if needed

  // Save session details with reset values to the database
  saveTimerSession({
    id: timerId,
    start_time: "Na", // Clear start time
    end_time: "Na", // Clear end time
    total_seconds: "0", // Set total seconds to 0
    status: "available", // Update status to available
    pause_time: "reset", // Reset pause time
    cumulativePause: 0, // Reset cumulative pause duration
    notes: "", // Clear notes or set as needed
  });
  
  console.log("Timer reset and session saved.");
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
  const selectedTimerType = document.querySelector(
    'input[name="timerType"]:checked'
  ).value;
  if (selectedTimerType === "regular") {
    regularTimeFields.style.display = "block"; // Show regular time fields
    openTimeFields.style.display = "none"; // Hide open time fields
  } else {
    regularTimeFields.style.display = "none"; // Hide regular time fields
    openTimeFields.style.display = "block"; // Show open time fields
  }
}

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
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert hours from 24-hour to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Pad minutes and seconds with leading zeros if needed
  const formattedTime = `${pad(hours)}:${pad(minutes)} ${ampm}`;
  return formattedTime;
}



function manageButtonStates(status) {
  const startButton = document.getElementById("startTimer");
  const pauseButton = document.getElementById("pauseTimer");
  const resumeButton = document.getElementById("resumeTimer");
  const stopButton = document.getElementById("stopTimer");

  const regularTimeRadio = document.getElementById("regularTime");
  const openTimeRadio = document.getElementById("openTime");
  // conditional statement depending on the status value

  if (status === "active") {
    startButton.disabled = true; // Timer is already running
    pauseButton.disabled = false; // Enable pause
    resumeButton.disabled = true; // Cannot resume if already active
    stopButton.disabled = false; // Enable stop
    regularTimeRadio.disabled = true;
    openTimeRadio.disabled = true;

  } else if (status === "paused") {
    startButton.disabled = true; // Enable start
    pauseButton.disabled = true; // Disable pause
    resumeButton.disabled = false; // Enable resume
    stopButton.disabled = false; // Enable stop
    regularTimeRadio.disabled = true;
    openTimeRadio.disabled = true;
    
  } else if (status === "available") {
    startButton.disabled = false;
    pauseButton.disabled = true; // Disable pause
    resumeButton.disabled = true; // Enable resume
    stopButton.disabled = false; // Enable stop
    regularTimeRadio.disabled = false;
    openTimeRadio.disabled = false;
  } else if (status === "finished") {
    // in this case this is finished
    startButton.disabled = true; // Timer is already running
    pauseButton.disabled = false; // Enable pause
    resumeButton.disabled = true; // Cannot resume if already active
    stopButton.disabled = false; // Enable stop
    regularTimeRadio.disabled = true;
    openTimeRadio.disabled = true;
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

// Initial display setting based on checked radio button when modal is opened
document.addEventListener("DOMContentLoaded", function () {
  const checkedRadio = document.querySelector(
    'input[name="timerType"]:checked'
  );
  if (checkedRadio) {
    manageTimerTypeFields(); // Ensure visibility is set correctly on page load
  }
});