document.addEventListener("DOMContentLoaded", function () {
  fetchTables();
  fetchPrices();
});


let timerId = null;
let timer = null; // Store the timer interval

const startTimerButton = document.getElementById("startTimer");
const pauseTimerButton = document.getElementById("pauseTimer");
const resumeTimerButton = document.getElementById("resumeTimer");
const stopTimerButton = document.getElementById("stopTimer");
const saveTimerButton = document.getElementById("saveTimer");
const addTimeButton = document.getElementById("addTimeButton");

// Function to toggle timer type
const timerTypeRadios = document.querySelectorAll('input[name="timerType"]');
const regularTimeFields = document.getElementById("regularTimeFields"); // Replace with actual ID
const openTimeFields = document.getElementById("openTimeFields"); // Replace with actual ID


async function fetchTables(sortType = 'default') {
  try {
    const response = await fetch("2fetchTables.php");
    const tables = await response.json();
    
    // Sort the tables based on selected sort type
    const sortedTables = sortTables(tables, sortType);
    
    const tableCards = document.getElementById("tableCards");
    tableCards.innerHTML = ""; // Clear any previous content

    sortedTables.forEach((table) => {
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

      const expectedEnd = table.timer_type === "regular" 
            ? calculateExpectedEnd(startTime, totalSeconds, tableId)
            : "N/A";
   
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
                                  <div id="expectedEnd-${tableId}"> ${expectedEnd || "N/A"}</div> 
                                </div>

                                <div>
                                  <strong>Total Time Used:</strong> 
                                  <div class="total-time-used">00:00:00</div>
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
      tableId,
      table.tableNumber,
      expectedEnd,
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

// Function to calculate expected end time for regular timers
function calculateExpectedEnd(startTime, totalSeconds, tableId) {
    // Check if startTime is valid
    if (!startTime || startTime === "Na" || startTime === "N/A") {
        return "N/A";
    }
    
    try {
        const startDate = new Date(startTime);
        // Check if startDate is valid
        if (isNaN(startDate.getTime())) {
            return "N/A";
        }
        
        // Get cumulative pause duration for this timer
        const cumulativePause = cumulativePauseDurations.get(tableId) || 0;
        
        // Add both the total seconds and cumulative pause to get the actual end time
        const endDate = new Date(startDate.getTime() + (totalSeconds * 1000) + cumulativePause);
        return formatToAMPM(endDate);
    } catch (error) {
        console.error("Error calculating expected end:", error);
        return "N/A";
    }
}

//function to save shit
async function saveTimerSession(sessionData) {
 
  try {
    const response = await fetch("3saveTimer.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionData),
    });
    const data = await response.json();
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
const tableNumberMap = new Map();  // Stores table numbers by timerId
const startTimeMap = new Map();     // Stores start times by timerId
const timerTypeMap = new Map();     // Stores start times by timerId


// I think I should have pausedTimeMillis map

let pauseTimeMillis = 0;
let cumulativePauseDuration = 0;
let totalSeconds = 0; // Store total seconds for both timer types
let isPaused = false; // Track if the timer is paused

// Initialization of the timer function
function initializeTimer(startTime, totalSeconds, timerType, pauseTime, cumulativePause, status, tableId, tableNumb, expectedEnd) {
  // Clear any existing timer for the specific table
  console.log("expected End after initialization: ", expectedEnd);
  if (timerIntervals.has(tableId)) {
    clearInterval(timerIntervals.get(tableId));
  }
  // Initialize specific table flags
  pausedTimers.set(tableId, status === "paused"); // Track if this timer is paused
  finishedTimers.set(tableId, false); // Reset finished state when initializing
  statusMap.set(tableId, status);
  tableNumberMap.set(tableId, tableNumb);
  startTimeMap.set(tableId, startTime);
  timerTypeMap.set(tableId, timerType);
 
   //just making it into integer para sure haha
  let cumulativePauseDuration = parseInt(cumulativePause, 10) || 0;
  cumulativePauseDurations.set(tableId, cumulativePauseDuration);
  // Store the pause start time if the timer is currently paused
  pauseTimeMillisMap.set(tableId, pauseTime ? new Date(pauseTime).getTime() : 0);

  // Calculate additional pause time for this page load
  if (status === "paused" && pauseTime) {
    const currentPauseDuration = new Date().getTime() - pauseTimeMillisMap.get(tableId);
    cumulativePauseDuration += currentPauseDuration;
  }

  let elapsedTime = getElapsedTime(new Date(startTime).getTime(), cumulativePauseDuration);
  console.log("elapsedTime: ", elapsedTime);
  console.log("Total Seconds", totalSeconds);
  let remainingSeconds;
  if ( status == "available") {
    remainingSeconds = parseInt(totalSeconds);
    updateRemainingTime(remainingSeconds, tableId, "regular");
    updateRemainingTimeCard(remainingSeconds, tableId, "regular");
  } else {
    remainingSeconds = timerType === "regular" ? parseInt(totalSeconds) - elapsedTime : elapsedTime;   console.log("RemainingSeconds after calculation", remainingSeconds);
  }

  // Initialize remainingSeconds based on timer type and elapsed time
  remainingSecondsMap.set(tableId, remainingSeconds);
  // Initialize the totalSecondsMap
  totalSecondsMap.set(tableId, parseInt(totalSeconds)); // Store the initial totalSeconds
  updateExpectedEndTime(tableId); 
  if (status !== "available"){
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
 
            // Update the remaining seconds and display
            remainingSecondsMap.set(tableId, currentRemainingSeconds - 1);
            updateRemainingTime(currentRemainingSeconds - 1, tableId, "regular");
            updateRemainingTimeCard(currentRemainingSeconds - 1, tableId, "regular");
          }
        } else if (timerType === "open") {
          // Calculate elapsed time first
          const currentElapsedTime = getElapsedTime(new Date(startTime).getTime(), cumulativePauseDurations.get(tableId) || 0);
          
          // Use the same elapsed time for both displays
          remainingSecondsMap.set(tableId, currentElapsedTime);
          updateRemainingTime(currentElapsedTime, tableId, "open");
          updateRemainingTimeCard(currentElapsedTime, tableId, "open");
          updateTotalTimeUsed(tableId, currentElapsedTime);

          // Check for billing interval
          if (currentElapsedTime % 300 === 0) {
            const price = calculateOpenTimePrice(currentElapsedTime);
            addBillingLogOpenTime(tableId, price);
          }
          return; // Skip the additional total time update below for open time
        }

        // Update total time used only for regular timer
        const currentElapsedTime = getElapsedTime(new Date(startTime).getTime(), cumulativePauseDurations.get(tableId) || 0);
        updateTotalTimeUsed(tableId, currentElapsedTime);
      } else {
        // When paused, maintain the current total time display
        let currentRemainingSeconds = remainingSecondsMap.get(tableId);
        updateRemainingTime(currentRemainingSeconds, tableId, timerType);
        updateRemainingTimeCard(currentRemainingSeconds, tableId, timerType);
        
        // Add this: Calculate and display the frozen total time when paused
        if (isPaused) {
          const pauseStartTime = pauseTimeMillisMap.get(tableId);
          const currentPauseDuration = pauseStartTime ? (new Date().getTime() - pauseStartTime) : 0;
          const totalPauseDuration = (cumulativePauseDurations.get(tableId) || 0) + currentPauseDuration;
          const frozenElapsedTime = getElapsedTime(new Date(startTime).getTime(), totalPauseDuration);
          updateTotalTimeUsed(tableId, frozenElapsedTime);
        }
      }
    }, 1000);
    // Store the interval in the map for future reference
    timerIntervals.set(tableId, interval);
    }

}

function getElapsedTime(startTimeMillis, cumulativePauseDuration) {
  let currentTime = new Date().getTime();
  return Math.floor(
    (currentTime - startTimeMillis - cumulativePauseDuration) / 1000
  );
}


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

// Add a function to update expected end time in both card and modal
function updateExpectedEndTime(tableId) {
  const startTime = startTimeMap.get(tableId);
  const totalSecs = totalSecondsMap.get(tableId);
  const newExpectedEnd = calculateExpectedEnd(startTime, totalSecs, tableId);
  // Update in card
  const cardExpectedEnd = document.getElementById(`expectedEnd-${tableId}`);
  if (cardExpectedEnd) {
      cardExpectedEnd.textContent = newExpectedEnd;
  }
  
  // Update in modal
  const modalExpectedEnd = document.getElementById('endTime');
  if (modalExpectedEnd && timerId === tableId) {
      modalExpectedEnd.textContent = newExpectedEnd;
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
  const timerType = button.getAttribute("data-timer-type");
  const totalSeconds = button.getAttribute("data-total-seconds");
  const pauseTime = button.getAttribute("data-pause-time");
  const cumulativePause = button.getAttribute("data-cumulative-pause");
  // Calculate and display expected end time
  const expectedEnd = timerType === "regular" 
  ? calculateExpectedEnd(startTime, totalSeconds, timerId)
  : "N/A";

  const formattedStartTime = formatToAMPM(startTime);
  // Populate the modal header with the current values
  document.querySelector(".modal-title.tableNumber").textContent = `Table ${tableNumber}`;
  document.querySelector(".badge.status").textContent = status;
  document.querySelector("#startTime").textContent = formattedStartTime;
  document.querySelector("#noteInput").textContent = notes;
  document.querySelector("#endTime").textContent = expectedEnd;
  
  // Dynamically assign unique IDs based on the timer ID
  document.querySelector("[data-type='remainingTimeRegular']").id = `remainingTimeRegular-${timerId}`;
  document.querySelector("[data-type='runningTimeOpen']").id = `runningTimeOpen-${timerId}`;
  document.querySelector("[data-type='totalBillDisplay']").id = `totalUnpaidDisplay-${timerId}`;
  
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
    tableNumber,
    startTime
  );
  manageButtonStates(status);
  manageTimerTypeFields();
  fetchBillingLogs(timerId);

  // Add a unique ID for the total time used display in the modal
  document.querySelector("[data-type='totalTimeUsed']").id = `totalTimeUsed-${timerId}`;
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

  //clearing the billingLogs
  // Function to clear billing logs in the UI
  clearBillingLogsUI(timerId);
  clearBillingLogsDatabase(timerId);
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
  document.getElementById("noteInput").value = "";
  console.log("Timer reset and session saved.");
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

saveTimerButton.addEventListener("click", function (){
  console.log("saveTimerButton Clicked!")

  // Confirmation dialog
  const confirmSave = confirm("Do you want to save the session?");
  if (!confirmSave) {
    console.log("Session save canceled by user.");
    return; // Exit if user selects "No"
  }

  const tableNumber = tableNumberMap.get(timerId); // Retrieve table number from map
  const startTime = startTimeMap.get(timerId); 
  const timerType = timerTypeMap.get(timerId); 


  let cumulativePause = cumulativePauseDurations.get(timerId) || 0;    // Retrieve start time from ma
  //if the timer is paused
  if (pausedTimers.get(timerId)) {
    const currentTime = new Date().getTime();
    const pauseStart = pauseTimeMillisMap.get(timerId); // Get stored pause start time

    // Calculate this pause's duration
    const pauseDuration = currentTime - pauseStart;
    cumulativePause += pauseDuration; // add the recent pause duration
  }
  //for saveTimeStamp
  const localTimestamp = new Date(); // Current local time
  const localTimeStampMillis = localTimestamp.getTime();
  const options = { timeZone: "Asia/Singapore", hour12: false }; // Set options for Singapore timezone
  // Create a formatted string for the timestamp
  const saveTimeStamp = localTimestamp
    .toLocaleString("sv-SE", options) // 'sv-SE' gives YYYY-MM-DD format
    .replace(" ", " ") // Ensure a single space
    .slice(0, 19);

     // Calculate `totalDurationSeconds`
  const elapsedTimeMillis = localTimeStampMillis - new Date(startTime).getTime(); // total time in milliseconds
  const activeDurationMillis = elapsedTimeMillis - cumulativePause; // exclude paused time
  const totalDurationSeconds = Math.floor(activeDurationMillis / 1000);
   
  // Get billing details (assuming these are functions or methods to retrieve amounts)
  const totalBillAmount = calculateAllTotal();
  const totalBillPaid = calculatePaidBill();
  const totalBillUnpaid = calculateTotalBill();


  saveSessionLogs([{
   timerId: timerId,
   startTime: startTime,
   savedTime: saveTimeStamp,
   totalDurationSeconds: totalDurationSeconds,
   totalBillAmount: totalBillAmount,
   totalBillPaid: totalBillPaid,
   totalBillUnpaid: totalBillUnpaid,
   tableNumber: tableNumber,
   timerType: timerType
  }])
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

    // Generate the billing log entry
    addBillingLogEntry(additionalTimeInSeconds);
  }
});

// Pad single digits with leading zeros
function pad(num) {
  return String(num).padStart(2, "0");
}

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
    // If dateTimeString is already a Date object
    if (dateTimeString instanceof Date) {
        const hours = dateTimeString.getHours();
        const minutes = dateTimeString.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12; // Convert 0 to 12
        return `${pad(formattedHours)}:${pad(minutes)} ${ampm}`;
    }

    // If dateTimeString is a string
    if (typeof dateTimeString !== 'string' || !dateTimeString || dateTimeString === "Na" || dateTimeString === "N/A") {
        return "N/A";
    }

    try {
        const date = new Date(dateTimeString.replace(" ", "T")); // Convert to ISO format
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return "N/A";
        }

        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12; // Convert 0 to 12
        
        return `${pad(formattedHours)}:${pad(minutes)} ${ampm}`;
    } catch (error) {
        console.error("Error formatting time:", error);
        return "N/A";
    }
}

function manageButtonStates(status) {
  const startButton = document.getElementById("startTimer");
  const pauseButton = document.getElementById("pauseTimer");
  const resumeButton = document.getElementById("resumeTimer");
  const stopButton = document.getElementById("stopTimer");
  const saveTimer = document.getElementById("saveTimer");

  const regularTimeRadio = document.getElementById("regularTime");
  const openTimeRadio = document.getElementById("openTime");
  // conditional statement depending on the status value

  if (status === "active") {
    startButton.disabled = true; // Timer is already running
    pauseButton.disabled = false; // Enable pause
    resumeButton.disabled = true; // Cannot resume if already active
    stopButton.disabled = false; // Enable stop
    saveTimer.disabled = false; // Enable stop
    regularTimeRadio.disabled = true;
    openTimeRadio.disabled = true;

  } else if (status === "paused") {
    startButton.disabled = true; // Enable start
    pauseButton.disabled = true; // Disable pause
    resumeButton.disabled = false; // Enable resume
    stopButton.disabled = false; // Enable stop
    saveTimer.disabled = false; // Enable stop
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
    saveTimer.disabled = false; // Enable stop
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


//BILLING LOGS SECTION

function addBillingLogOpenTime(tableId, price) {
    const localTimestamp = new Date(); // Current local time
    const options = { timeZone: "Asia/Singapore", hour12: false }; // Set options for Singapore timezone
  
    // Create a formatted string for the timestamp
    const timesStampForDb = localTimestamp
      .toLocaleString("sv-SE", options) // 'sv-SE' gives YYYY-MM-DD format
      .replace(" ", " ") // Ensure a single space
      .slice(0, 19);

    saveBillingLogsOpenTime([{
      timer_id: tableId,
      timestamp: timesStampForDb,
      price: price,
      paid: false
    }]);
   
}

//function to save shit
async function saveBillingLogsOpenTime(logs) {
  console.log("Session Data that is going to be sent for Open Time: ", logs);
  try {
    const response = await fetch("9savingOBLogs.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logs),
    });
    const data = await response.json();
    console.log("Success", data);
    await fetchTables();
    await fetchBillingLogs(logs[0].timer_id); // Add this line to refresh logs immediately
  } catch (error) {
    console.log("Error", error);
  }
}

//function to save shit
async function saveBillingLogs(logs) {
  console.log("Session Data that is going to be sent: ", logs);
  try {
    const response = await fetch("4savingBlogs.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logs),
    });
    const data = await response.json();
    console.log("Success", data);
    await fetchTables();
  } catch (error) {
    console.log("Error", error);
  }
}

//function to save shit
async function saveSessionLogs(logs) {
  console.log("saveSessionLogs that is going to be sent: ", logs);
  try {
    const response = await fetch("10saveSessionLogs.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logs),
    });
    const data = await response.json();
    alert("Timer Session saved succesfully")
    await fetchTables();
  } catch (error) {
    console.log("Error", error);
  }
}


// BILLINGLOGS
function addBillingLogEntry(additionalTimeInSeconds){
  const price = calculatePrice(additionalTimeInSeconds); // Calculate the price for the added time

  const localTimestamp = new Date(); // Current local time
  const options = { timeZone: "Asia/Singapore", hour12: false }; // Set options for Singapore timezone

  // Create a formatted string for the timestamp
  const timesStampForDb = localTimestamp
    .toLocaleString("sv-SE", options) // 'sv-SE' gives YYYY-MM-DD format
    .replace(" ", " ") // Ensure a single space
    .slice(0, 19);
    
    saveBillingLogs([{
      timer_id: timerId,
      timestamp: timesStampForDb,
      price: price,
      paid: false,
    }]);
}



async function fetchBillingLogs(timerId) {
  try {
      const response = await fetch(`5fetchBlogs.php?timer_id=${timerId}`);
      const data = await response.json();

      console.log("Response data:", data); // Log the full response data

      if (data.status === "success") {
          populateBillingLogs(data.data);
          updateTotalBill();
      } else {
          console.error("Error fetching logs:", data.message || "Unknown error");
      }
  } catch (error) {
      console.error("Error:", error);
  }
}

//store the logs inside the array


function populateBillingLogs(logs) {
  billingLogs = []; //clearing existing logs
  const logsContainer = document.getElementById('billingLogsBody');
  logsContainer.innerHTML = ''; // Clear previous logs
  billingLogs = logs; // Update the in-memory array
  console.log("billing logs", billingLogs);
  if (logs.length === 0) {
      const noLogsMessage = document.createElement('tr');
      noLogsMessage.innerHTML = `<td colspan="4" class="text-center">No billing logs recorded.</td>`;
      logsContainer.appendChild(noLogsMessage);
      return; // Exit the function
  }

  

  // Populate logs
  logs.forEach((log, index) => {
      const formattedTimestamp = formatToAMPM(log.timestamp);
      const logRow = document.createElement('tr');
      logRow.innerHTML = `
          <td>${formattedTimestamp}</td>
          <td>P ${log.price}</td>
          <td>
              <input type="checkbox" class="paid-checkbox" data-index="${index}" ${log.paid === 1 ? 'checked' : ''}>
          </td>
          <td>
              <button class="btn btn-sm btn-warning edit-btn" data-id="${log.id}" data-price="${log.price}">Edit</button>
              <button class="btn btn-sm btn-danger delete-btn" data-id="${log.id}">Delete</button>
          </td>
      `;
      logsContainer.appendChild(logRow);
  });

  document.querySelectorAll('.paid-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function(event) {
        const index = event.target.dataset.index; // Get the index from data attribute
        billingLogs[index].paid = event.target.checked ? 1 : 0; // Update paid status in array
        updateTotalBill(); // Recalculate the total bill based on updated `billingLogs`

        // Save the modified log to the database
        const logToSave = billingLogs[index];
        saveBillingLogs([logToSave]);   // Only send the updated log
    });
  });

  document.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', (event) => {
          const logId = event.target.dataset.id;
          const logPrice = event.target.dataset.price;
          // Populate the edit modal with the log details
          document.getElementById('editPriceInput').value = logPrice; // Assuming you have an input for price in your modal
          document.getElementById('editLogId').value = logId; // Assuming you have a hidden input to store the log ID
          // Show the edit modal
          const editModal = new bootstrap.Modal(document.getElementById('editModal'));
          editModal.show();
      });
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const logId = event.target.dataset.id;
        document.getElementById('confirmDeleteLogId').value = logId; // Assuming you have a hidden input for confirming deletion
        // Show the delete modal
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        deleteModal.show();
    });
  });

  updateTotalBill();
}



// Function to clear billing logs in the UI
function clearBillingLogsUI(timerId) {
  const billingLogsElement = document.getElementById(`billingLogs-${timerId}`);
  const unpaidBillElement = document.getElementById(`totalUnpaidDisplay-${timerId}`);
  if (billingLogsElement && unpaidBillElement) {
    billingLogsElement.innerHTML = ""; // Clear the billing logs display
    unpaidBillElement.textContent = "0"; // Set total unpaid bill display to 0
  }
}

// Function to clear billing logs in the database
async function clearBillingLogsDatabase(timerId) {
  console.log("timerId thats being cleared: ", timerId);
  try {
    const response = await fetch("8clearBlogs.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ timer_id: timerId }),
    });
    const data = await response.json();
    if (data.status === "success") {
      console.log("Billing logs cleared successfully in the database.");
    } else {
      throw new Error(data.message || "Unknown error");
    }
  } catch (error) {
    console.error("Error clearing billing logs:", error);
    throw error; // Re-throw error to be caught in the calling function
  }
}

// Billing rate tiers
const priceTiers = [
  { maxMinutes: 30, price: 50 },  // 1 to 30 minutes costs 50 PHP
  { maxMinutes: 60, price: 100 }, // 31 to 60 minutes costs 100 PHP
  // Add more tiers as needed
];

let pricePerHalfHour;
let pricePerHour;

// Add this function to fetch prices from the database
async function fetchPrices() {
    try {
        const response = await fetch('11getPrices.php');
        const data = await response.json();
        
        if (data.success) {
            pricePerHalfHour = data.prices.half_hour_price;
            pricePerHour = data.prices.hour_price;
            
            // Update price tiers
            priceTiers[0] = { maxMinutes: 30, price: pricePerHalfHour };
            priceTiers[1] = { maxMinutes: 60, price: pricePerHour };
            
            console.log('Prices fetched:', { halfHour: pricePerHalfHour, hour: pricePerHour });
        } else {
            console.error('Failed to fetch prices');
        }
    } catch (error) {
        console.error('Error fetching prices:', error);
    }
}



// Update the calculateOpenTimePrice function
function calculateOpenTimePrice(elapsedSeconds) {
    let price = 0;

    if (elapsedSeconds <= 1800) {  // Up to 30 minutes
        price = pricePerHalfHour;
    } else if (elapsedSeconds <= 3600) {  // Between 31 minutes and 60 minutes
        price = pricePerHour;
    } else {  // For more than 1 hour
        const hours = Math.floor(elapsedSeconds / 3600);
        price += hours * pricePerHour;
        const remainingSeconds = elapsedSeconds - (hours * 3600);
        if (remainingSeconds > 0) {
            if (remainingSeconds <= 1800) { // 30 minutes or less
                price += pricePerHalfHour;
            } else {
                price += pricePerHour;
            }
        }
    }

    return price;
}

// Update the calculatePrice function
function calculatePrice(additionalTimeInSeconds) {
    const minutes = additionalTimeInSeconds / 60;

    // Find the price tier that fits the time range
    for (const tier of priceTiers) {
        if (minutes <= tier.maxMinutes) {
            return tier.price;
        }
    }
    
    // For times beyond the defined tiers, calculate based on hours
    const hours = Math.ceil(minutes / 60);
    return hours * pricePerHour;
}

// Handle Confirm Delete Button Click
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  const logId = document.getElementById('confirmDeleteLogId').value;

  // Send a request to delete the log
  const response = await fetch('6DeleteBlogs.php', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: logId })
  });
  
  const result = await response.json();
  if (result.status === 'success') {
      // Refresh the logs if the delete is successful
      fetchBillingLogs(timerId); // Make sure to define `currentTimerId`
      $('#deleteModal').modal('hide'); // Hide the modal
  } else {
      console.error('Error deleting log:', result.message);
  }
});

// Handle Save Changes Button Click
document.getElementById('saveChangesBtn').addEventListener('click', async () => {
  const logId = document.getElementById('editLogId').value;
  const newPrice = document.getElementById('editPriceInput').value;

  // Send a request to update the log
  const response = await fetch('7editBlogs.php', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: logId, price: newPrice })
  });
  
  const result = await response.json();
  if (result.status === 'success') {
      // Refresh the logs if the update is successful
      fetchBillingLogs(timerId); // Make sure to define `currentTimerId`
      $('#editModal').modal('hide'); // Hide the modal
  } else {
      console.error('Error updating log:', result.message);
  }
});

// Function to update and display the total unpaid bill
function updateTotalBill() {
  const totalBill = calculateTotalBill();
  const paidBill = calculatePaidBill()
  const allTotal = calculateAllTotal()

  // Log the calculated total unpaid bill
  console.log("Total unpaid bill:", totalBill);
  // Log the calculated total unpaid bill
  console.log("Total paidBill:", paidBill);
  // Log the calculated total unpaid bill
  console.log("Total allTotal:", allTotal);

  // Select elements with a class for displaying the total unpaid bill
  const totalBillElements = document.querySelectorAll(`#totalUnpaidDisplay-${timerId}`);

  // Update each element with the total unpaid amount
  totalBillElements.forEach(element => {
      element.innerText = `PHP ${totalBill.toFixed(2)}`; // Ensure a fixed decimal format
  });
}


// Function to calculate total unpaid amount from billingLogs
function calculateTotalBill() {
  let total = 0;

  // Log the current state of billingLogs
  console.log("Current billingLogs array:", billingLogs);

  // Sum up prices of unpaid logs (paid === 0)
  billingLogs.forEach(log => {
      if (log.paid === 0) {  // Assuming 0 means unpaid
          console.log(`Adding unpaid log price: ${log.price}`);
          total += Number(log.price); // Ensure price is treated as a number
      }
  });

  console.log("Calculated total from unpaid logs:", total);
  return total;
}

// Function to calculate total unpaid bill based on unpaid billing logs
function calculatePaidBill() {
  let totalPaid = 0;

  // Sum up prices of unpaid logs (paid === 0)
  billingLogs.forEach(log => {
    if (log.paid === 1) {  // Assuming 0 means unpaid
        totalPaid += Number(log.price); // Ensure price is treated as a number
    }
  });

  return totalPaid;
}


// Function to calculate all total bill (both paid and unpaid)
function calculateAllTotal() {
  let allTotal = 0;

  // Calculate total for all billing logs
  billingLogs.forEach(log => {
      allTotal += Number(log.price); // Ensure the price is treated as a number
  });

  return allTotal;
}

// Update the updateTotalTimeUsed function to handle both card and modal updates
function updateTotalTimeUsed(tableId, seconds) {
  // Update card display
  const totalTimeElement = document.querySelector(`[data-table-id="${tableId}"] .total-time-used`);
  if (totalTimeElement) {
    totalTimeElement.textContent = formatTime(seconds);
  }

  // Update modal display if it's open and showing the same table
  const modalTotalTimeElement = document.getElementById(`totalTimeUsed-${tableId}`);
  if (modalTotalTimeElement && timerId === tableId) {
    modalTotalTimeElement.textContent = formatTime(seconds);
  }
}

// Add event listener for sort selection
document.getElementById('sortSelect').addEventListener('change', function(e) {
  const sortType = e.target.value;
  fetchTables(sortType);
});

// Modify sortTables function to handle different sort types
function sortTables(tables, sortType = 'default') {
  switch(sortType) {
    case 'tableNumber':
      return tables.sort((a, b) => a.tableNumber - b.tableNumber);
      
    case 'openTime':
      return tables.sort((a, b) => {
        if (a.timer_type === b.timer_type) return 0;
        return a.timer_type === 'open' ? -1 : 1;
      });
      
    case 'endingSoon':
      // Separate and sort regular tables by remaining time
      const regularTables = tables.filter(table => table.timer_type === 'regular')
        .sort((a, b) => calculateRemainingTime(a) - calculateRemainingTime(b));
      // Put open time tables at the end
      const openTables = tables.filter(table => table.timer_type === 'open');
      return [...regularTables, ...openTables];
      
    case 'status':
      return tables.sort((a, b) => {
        const statusOrder = { 'active': 1, 'paused': 2, 'available': 3, 'finished': 4 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
      
    default:
      // Default sorting (you can define what this should be)
      return tables;
  }
}

// Add this function before sortTables
function calculateRemainingTime(table) {
  // Return Infinity for available tables so they go to the end
  if (table.status === "available" || !table.start_time) {
    return Infinity;
  }

  try {
    const startTimeMillis = new Date(table.start_time).getTime();
    const totalSeconds = parseInt(table.total_seconds);
    const cumulativePause = parseInt(table.cumulativePause) || 0;
    
    // Calculate elapsed time using existing function
    const elapsedTime = getElapsedTime(startTimeMillis, cumulativePause);
    
    // Calculate remaining time
    const remainingTime = totalSeconds - elapsedTime;
    
    // Return remaining time, or Infinity if calculation fails
    return isNaN(remainingTime) ? Infinity : remainingTime;
  } catch (error) {
    console.error("Error calculating remaining time:", error);
    return Infinity;
  }
}




