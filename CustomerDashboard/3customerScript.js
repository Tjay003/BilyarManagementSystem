document.addEventListener('DOMContentLoaded', () => {
  fetchReservations();
  fetchTables();
  // Add periodic refresh
  setInterval(() => {
    fetchReservations();
    fetchTables();
    console.log("automatic gets refreshed");
  }, 15000); // Fetch every 15 seconds
});
// Fetch data from the server using AJAX
async function fetchReservations() {
  try {
      const response = await fetch('4fetchReservation.php');
      const data = await response.json();
      renderTableReservation(data) ;
  } catch (error) {
      console.error('Error fetching data:', error);
      return; // Return an empty array on error to avoid breaking the chart function
  }
}

//vars
const tableBody = document.getElementById('tableBodyReservation');

let currentPage = 1; //pagination var
const itemsPerPage = 5; // Change this to the number of items you want per page

function renderTableReservation(data) {
  tableBody.innerHTML = '';
  const pagination = document.getElementById('pagination');

  // Check if there is a message indicating no reservations
  if (data.length === 1 && data[0].message) {
      const noDataRow = `<tr><td colspan="4" class="text-center">${data[0].message}</td></tr>`;
      tableBody.innerHTML += noDataRow;
      pagination.style.display = 'none';
  } else {
      // Calculate the total number of pages
      pagination.style.display = 'flex';
      const totalPages = Math.ceil(data.length / itemsPerPage);

      // Get the items for the current page
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentItems = data.slice(startIndex, endIndex);

      currentItems.forEach((item, index) => {
          const isFirst = index === 0 && currentPage === 1;
          const row = `<tr class="${isFirst ? 'custom-highlight' : ''}">
              <td>${item.order_number} ${isFirst ? '<span class="custom-badge">Next</span>' : ''}</td>
          </tr>`;
          tableBody.innerHTML += row;
      });

      // Create pagination buttons
      pagination.innerHTML = '<li class="page-item"><a class="page-link" href="#" id="prev">Previous</a></li>'; // Reset pagination

      for (let i = 1; i <= totalPages; i++) {
          const pageItem = `<li class="page-item ${currentPage === i ? 'active' : ''}">
              <a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
          pagination.innerHTML += pageItem;
      }

      pagination.innerHTML += '<li class="page-item"><a class="page-link" href="#" id="next">Next</a></li>';
  }
}


async function fetchTables(sortType = 'default') {
try {
  const response = await fetch("5fetchTables.php");
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
    card.classList.add("mb-0"); // Remove margin-bottom since we're using gap

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
                              <strong>Timer Type: </strong> <span>${timerType}</span>
                          </div>
                          <div class="mb-2">
                              <strong id="timeLabel-${tableId}">Remaining Time: </strong><span id="remainingTime-${tableId}"></span>
                          </div>
                          <div>
                              <div class="mb-2">
                              <strong>Start Time: </strong><span> ${formattedStartTime || "N/A"}</span>
                              </div>
                               <div class="mb-2">
                                <strong>Expected End: </strong><span id="expectedEnd-${tableId}"> ${expectedEnd || "N/A"}</span> 
                              </div>
                              <div>
                                <strong>Total Time Used:</strong>  
                                <span class="total-time-used">00:00:00</span>   
                              </div>
                          </div>
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

// Initialization of the timer function
function initializeTimer(startTime, totalSeconds, timerType, pauseTime, cumulativePause, status, tableId, tableNumb, expectedEnd) {
// Clear any existing timer for the specific table
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
// console.log("elapsedTime: ", elapsedTime);
// console.log("Total Seconds", totalSeconds);
let remainingSeconds;
if ( status == "available") {
  remainingSeconds = parseInt(totalSeconds);
  updateRemainingTimeCard(remainingSeconds, tableId, "regular");
} else {
  remainingSeconds = timerType === "regular" ? parseInt(totalSeconds) - elapsedTime : elapsedTime;   
  // console.log("RemainingSeconds after calculation", remainingSeconds);
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
        const tableNumber = tableNumberMap.get(tableId);
        alert(`Table ${tableNumber} has finished.`);
          // finishTimer(tableId);
        } else {

          // Update the remaining seconds and display
          remainingSecondsMap.set(tableId, currentRemainingSeconds - 1);
          updateRemainingTimeCard(currentRemainingSeconds - 1, tableId, "regular");
        }
      } else if (timerType === "open") {
        // Calculate elapsed time first
        const currentElapsedTime = getElapsedTime(new Date(startTime).getTime(), cumulativePauseDurations.get(tableId) || 0);
        
        // Use the same elapsed time for both displays
        remainingSecondsMap.set(tableId, currentElapsedTime);
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


function getElapsedTime(startTimeMillis, cumulativePauseDuration) {
  let currentTime = new Date().getTime();
  return Math.floor(
    (currentTime - startTimeMillis - cumulativePauseDuration) / 1000
  );
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


// Add event listener for sort selection
document.getElementById('sortSelect').addEventListener('change', function(e) {
const sortType = e.target.value;
fetchTables(sortType);
});

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