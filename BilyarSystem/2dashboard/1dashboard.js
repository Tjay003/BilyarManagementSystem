document.addEventListener("DOMContentLoaded", function () {
    fetchTableStats();
    fetchReservations();
    // fetchTables();
  });
  
// Function to fetch table stats from the backend
async function fetchTableStats() {
    try {
      const response = await fetch('2fetchTableStats.php'); // URL of your PHP script
      const data = await response.json(); // Parse the JSON response
    console.log(data)
      // Update the HTML with the fetched data
      document.getElementById('totalOccupied').textContent = data.totalOccupied || "Waiting...";
      document.getElementById('totalAvailable').textContent = data.totalAvailable || "Waiting..." ;
      document.getElementById('totalTables').textContent = data.totalTables || "Waiting...";
  
    } catch (error) {
      console.error('Error fetching table stats:', error);
      console.log("ayaw gomana")
    }
  }


function fetchReservations() {
    fetch("3fetchReservation.php")
      .then((response) => response.json())
      .then((data) => {
        renderTableReservation(data);
      });
}
//vars
const tableBody = document.querySelector("#tableBodyReservation");
let currentPage = 1; //pagination var
const itemsPerPage = 5; // Change this to the number of items you want per page

function renderTableReservation(data) {
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
    }
}

// async function fetchTables() {
//     try {
//       const response = await fetch("4fetchTables.php");
//       const tables = await response.json();
//       const tableCards = document.getElementById("tableCards");
//       tableCards.innerHTML = ""; // Clear any previous content
  
//       tables.forEach((table) => {
//         const tableId = table.id;
//         const tableNumber = table.tableNumber;
//         const timerType = table.timer_type; // Timer type (regular or open time)
//         const startTime = table.start_time; // Start time
//         const endTime = table.end_time; // Expected end time
//         const totalSeconds = table.total_seconds; // Total time used for open time
//         const status = table.status; // Status (available, active, paused, finished)
//         const pauseTime = table.pause_time;
//         const notes = table.notes;
//         const cumulativePause = table.cumulativePause;
  
//         const formattedStartTime = formatToAMPM(startTime);
  
//         // Bootstrap card for each table
//         const card = document.createElement("div");
//         card.classList.add("col-md-4", "mb-4"); // Bootstrap grid styling
  
//         // Assign a data attribute to the card for the table ID (unique)
//         card.setAttribute("data-table-id", tableId);
  
//         // Set up Bootstrap card content
//         card.innerHTML = `
//                       <div class="card" id="card-${tableNumber}">
//                           <div class="card-header bg-primary text-white">
//                               <h5 class="card-title mb-0">Table ${tableNumber}</h5>
//                               <span class="badge bg-secondary">${status}</span>
//                           </div>
//                           <div class="card-body">
//                               <div class="mb-2">
//                                   <strong>Timer Type:</strong> <span>${timerType}</span>
//                               </div>
//                               <div class="mb-2">
//                                   <strong id="timeLabel-${tableId}">Remaining Time:</strong><span id="remainingTime-${tableId}"></span>
//                               </div>
//                               <div class="d-flex justify-content-between">
//                                   <div>
//                                   <strong>Start Time:</strong> 
//                                   <div> ${formattedStartTime || "N/A"}</div>
//                                   </div>
//                                   <div>
//                                     <strong>Expected End:</strong>
//                                     <div>N/A</div> 
//                                   </div>
  
//                                   <div>
//                                     <strong>Total Time Used:</strong> 
//                                     <div>N/A</div>
//                                   </div>
//                               </div>
//                           </div>
//                       </div>
//                   `;
  
//          // Append the card to the container
//       tableCards.appendChild(card);
  
//       initializeTimer(
//         table.start_time,
//         table.total_seconds,
//         table.timer_type,
//         table.pause_time,
//         table.cumulativePause,
//         table.status,
//         tableId,
//         table.tableNumber,
//       );
    
//       });
//     } catch (error) {
//       console.error("Error fetching table data:", error);
//     }
//   }
  
// // timerDetails
// const timerIntervals = new Map(); // storing each table's timer
// const remainingSecondsMap = new Map();
// const finishedTimers = new Map(); // Track finished state per table
// const pausedTimers = new Map(); // Track paused state per table
// const cumulativePauseDurations  = new Map();
// const totalSecondsMap = new Map();
// const statusMap = new Map();
// const pauseTimeMillisMap = new Map(); // Store pauseTimeMillis per timer
// const tableNumberMap = new Map();  // Stores table numbers by timerId
// const startTimeMap = new Map();     // Stores start times by timerId
// const timerTypeMap = new Map();     // Stores start times by timerId

// // Initialization of the timer function
// function initializeTimer(startTime, totalSeconds, timerType, pauseTime, cumulativePause, status, tableId, tableNumb) {
//     // Clear any existing timer for the specific table
//     if (timerIntervals.has(tableId)) {
//       clearInterval(timerIntervals.get(tableId));
//     }
//     // Initialize specific table flags
//     pausedTimers.set(tableId, status === "paused"); // Track if this timer is paused
//     finishedTimers.set(tableId, false); // Reset finished state when initializing
//     statusMap.set(tableId, status);
//     tableNumberMap.set(tableId, tableNumb);
//     startTimeMap.set(tableId, startTime);
//     timerTypeMap.set(tableId, timerType);
//     tableNumberMap.set(tableId, tableNumb);
//     //just making it into integer para sure haha
//     let cumulativePauseDuration = parseInt(cumulativePause, 10) || 0;
//     cumulativePauseDurations.set(tableId, cumulativePauseDuration);
//     // console.log("cpd: ",cumulativePauseDuration);
  
//     // Store the pause start time if the timer is currently paused
//     pauseTimeMillisMap.set(tableId, pauseTime ? new Date(pauseTime).getTime() : 0);
  
//     // Calculate additional pause time for this page load
//     if (status === "paused" && pauseTime) {
//       const currentPauseDuration = new Date().getTime() - pauseTimeMillisMap.get(tableId);
//       cumulativePauseDuration += currentPauseDuration;
//     }
  
//     let elapsedTime = getElapsedTime(new Date(startTime).getTime(), cumulativePauseDuration);
//     console.log("Total Seconds", totalSeconds);
  
//     let remainingSeconds;
//     if ( status == "available") {
//       remainingSeconds = parseInt(totalSeconds);
//       updateRemainingTimeCard(remainingSeconds, tableId, "regular");
//     } else {
//       remainingSeconds = timerType === "regular" ? parseInt(totalSeconds) - elapsedTime : elapsedTime;   console.log("RemainingSeconds after calculation", remainingSeconds);
//     }
  
//     // Initialize remainingSeconds based on timer type and elapsed time
//     remainingSecondsMap.set(tableId, remainingSeconds);
//     // Initialize the totalSecondsMap
//     totalSecondsMap.set(tableId, parseInt(totalSeconds)); // Store the initial totalSeconds
  
//     if (status !== "available"){
//         // Set interval for each tableId
//         const interval = setInterval(() => {
//           const isPaused = pausedTimers.get(tableId);
//           const isFinished = finishedTimers.get(tableId);
//           const currentStatus  = statusMap.get(tableId);
      
//         // Only update if the timer is not paused or finished
//         if (!isPaused && !isFinished && currentStatus !== "available") {
//           let currentRemainingSeconds = remainingSecondsMap.get(tableId);
          
//           if (timerType === "regular") {
//             if (currentRemainingSeconds <= 0) {
//               alert("Timer is finished for table", )
//             } else {
   
//               // Update the remaining seconds and display
//               remainingSecondsMap.set(tableId, currentRemainingSeconds - 1);
//               updateRemainingTimeCard(currentRemainingSeconds - 1, tableId, "regular");
//             }
//           } else if (timerType === "open") {
//             remainingSecondsMap.set(tableId, currentRemainingSeconds + 1);
//             const timeUsed = remainingSecondsMap.get(tableId);
  
//             updateRemainingTimeCard(timeUsed + 1, tableId, "open");
//           }
//         } else {
//           // Optionally update the display to show the paused time
//           let currentRemainingSeconds = remainingSecondsMap.get(tableId);
//           updateRemainingTimeCard(currentRemainingSeconds, tableId, "regular");
//         }
//       }, 1000);
//       // Store the interval in the map for future reference
//       timerIntervals.set(tableId, interval);
//       }
  
//   }


//   // Function to format the start time string into AM/PM format
// function formatToAMPM(dateTimeString) {
//     // Check if the input is null, empty, or not a valid date
//     if (!dateTimeString || isNaN(new Date(dateTimeString))) {
//       return "N/A"; // or return an empty string "", or whatever default you prefer
//     }
  
//     // Create a Date object from the dateTimeString
//     const date = new Date(dateTimeString.replace(" ", "T")); // Convert to ISO format
  
//     // Get the hours, minutes, and seconds
//     let hours = date.getHours();
//     const minutes = date.getMinutes();
  
//     // Determine AM or PM suffix
//     const ampm = hours >= 12 ? "PM" : "AM";
  
//     // Convert hours from 24-hour to 12-hour format
//     hours = hours % 12;
//     hours = hours ? hours : 12; // the hour '0' should be '12'
  
//     // Pad minutes and seconds with leading zeros if needed
//     const formattedTime = `${pad(hours)}:${pad(minutes)} ${ampm}`;
//     return formattedTime;
//   }

  
// function getElapsedTime(startTimeMillis, cumulativePauseDuration) {
//     let currentTime = new Date().getTime();
//     return Math.floor(
//       (currentTime - startTimeMillis - cumulativePauseDuration) / 1000
//     );
// }

// //for card
// function updateRemainingTimeCard(seconds, tableId, type) {

//     const validSeconds = isNaN(seconds) || seconds === null ? 0 : seconds;
//     const formattedTime = formatTime(validSeconds);
    
//     const remainingTimeSpan = document.getElementById(`remainingTime-${tableId}`);
//     const timeLabel = document.getElementById(`timeLabel-${tableId}`);
  
//     if (remainingTimeSpan) {
//       if (type === "regular") {
//         if (timeLabel) {
//           timeLabel.textContent = "Remaining Time: ";
//         }
//         remainingTimeSpan.textContent = formattedTime;
//       } else if (type === "open") {
//         if (timeLabel) {
//           timeLabel.textContent = "Running Time: ";
//         }
//         remainingTimeSpan.textContent = formattedTime;
//       }
//     }
//   }

//   // Format seconds into HH:MM:SS
// function formatTime(seconds) {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const remainingSeconds = seconds % 60;
//     return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
//   }

//   // Pad single digits with leading zeros
// function pad(num) {
//     return String(num).padStart(2, "0");
//   }