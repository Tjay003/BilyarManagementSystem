let chartInstanceForTotalRevenue ;
let chartInstanceForRevenuePerTable ;
let chartInstanceForRevenueByTimerType ;
let chartInstanceForUnpaidAnalysis;
let chartInstanceForUtilizationRate;

console.log("finance js has been loaded");

async function fetchSessionData() {
    try {
        const response = await fetch('2fetchSessions.php');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return []; // Return an empty array on error to avoid breaking the chart function
    }
}

// SECTION FOR TOTAL REVENUE
async function initializeChartForTotalRevenue() {
    const data = await fetchSessionData();
    const aggregationType = document.getElementById('aggregationSelect').value; // Get selected value
    
    if (data.length === 0) {
        console.log('No data available to create chart.');
        return;
    }
    //initialization for storing
    let aggregationFunction;
    switch (aggregationType) {
        case 'weekly':
            aggregationFunction = getWeekNumber;
            break;
        case 'monthly':
            aggregationFunction = getMonthNumber;
            break;
        case 'daily':
        default:
            aggregationFunction = getDateNumber;
            break;
    }
    // Aggregate the data by day
    const aggregatedData = aggregateDataForTotalRevenue(data, aggregationFunction);
    // Destroy the existing chart if it exists
    if (chartInstanceForTotalRevenue) {
        chartInstanceForTotalRevenue.destroy();
    }

    createRevenueChart(aggregatedData);
}

// Function to aggregate data (pass the aggregation function as an argument)
function aggregateDataForTotalRevenue(logs, aggregationFunction) {
    const aggregatedData = {};

    logs.forEach(log => {
        const date = new Date(log.startTime);
        const dateString = aggregationFunction(date); // Get aggregated value (day, week, or month)

        if (!aggregatedData[dateString]) {
            aggregatedData[dateString] = 0;
        }

        aggregatedData[dateString] += parseFloat(log.totalBillAmount); // Aggregate total revenue
    });

    return aggregatedData;
}

function getDateNumber(date) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
}
function getWeekNumber(date) {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const diff = date - startDate;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const weekNumber = Math.ceil(diff / oneWeek);
    return `${date.getFullYear()}-W${weekNumber}`;
}
function getMonthNumber(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero
    return `${date.getFullYear()}-${month}`; // YYYY-MM
}
function getHourNumber(date) {
    const hours24 = date.getHours();
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12; // Convert 24-hour time to 12-hour format
    const formattedDate = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
    
    return `${formattedDate} ${hours12}${period}`; // "YYYY-MM-DD 12PM" or "YYYY-MM-DD 3AM"
}


// Function to create the revenue chart
function createRevenueChart(aggregatedData) {
    const labels = Object.keys(aggregatedData);
    const data = Object.values(aggregatedData);

    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    chartInstanceForTotalRevenue = new Chart(ctx, {
        type: 'bar', // You can change it to 'bar' for a bar chart
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Revenue',
                data: data,
                borderColor: 'black',
                backgroundColor: '#9A7E6F',
                fill: true,
                tension: 0.1 // Smooths the line
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },

                },
                y: {
                    title: {
                        display: true,
                        text: 'Revenue (PHP)'
                    },
                    beginAtZero: true
                }
            }
        }
    });

    const total = data.reduce((a, b) => a + b, 0);
    const average = total / data.length;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const maxDate = labels[data.indexOf(max)];
    const minDate = labels[data.indexOf(min)];
    const period = document.getElementById('aggregationSelect').value;

    // Create detailed interpretation using HTML
    const interpretation = `
        <strong>Based on the ${period} revenue analysis:</strong><br>
        <ul>
            <li>Total Revenue: ₱${total.toFixed(2)}</li>
            <li>Average ${period} Revenue: ₱${average.toFixed(2)}</li>
            <li>Peak Revenue: ₱${max.toFixed(2)} (${maxDate})</li>
            <li>Lowest Revenue: ₱${min.toFixed(2)} (${minDate})</li>
        </ul>
        <strong>Performance Analysis:</strong><br>
        <p>${data[data.length-1] > average 
            ? `The current period shows strong performance with revenue above the average by ₱${(data[data.length-1] - average).toFixed(2)}.`
            : `The current period is performing below average by ₱${(average - data[data.length-1]).toFixed(2)}, suggesting potential areas for improvement.`
        }</p>
    `;

    // Update the interpretation element using innerHTML instead of textContent
    const interpretationElement = document.getElementById('revenueInterpretation');
    if (interpretationElement) {
        interpretationElement.innerHTML = interpretation;
    }
}
initializeChartForTotalRevenue();

// SECTION FOR INITIALIZE CHART FOR REVENUE PER TABLE
async function initializeChartForRevenuePertable(){
    const data = await fetchSessionData();
    const aggregationType = document.getElementById('TableRevSelect').value; // Get selected value

    if (data.length === 0) {
        console.log('No data available to create chart.');
        return;
    }
    // I dont have the function currently for aggregateDataForRevenuePerTable currently
    const aggregatedData = aggregateDataForRevenuePerTable(data, aggregationType);
    // Destroy the existing chart if it exists
    if (chartInstanceForRevenuePerTable) {
        chartInstanceForRevenuePerTable.destroy();
    }
    
    // i dont have this currently
    createRevenuePerTableChart(aggregatedData);
}

// Helper function to aggregate and sort revenue by table number
function aggregateDataForRevenuePerTable(data, aggregationType) {
    const revenueByTable = {};

    // Loop through each entry in the data
    data.forEach((session) => {
        const tableNumber = session.tableNumber;
        const totalBillAmount = parseFloat(session.totalBillAmount); // Ensure it's a number
        
        // Sum revenue per table
        if (revenueByTable[tableNumber]) {
            revenueByTable[tableNumber] += totalBillAmount;
        } else {
            revenueByTable[tableNumber] = totalBillAmount;
        }
    });

    // Convert revenueByTable object to an array for sorting
    let sortedData = Object.entries(revenueByTable);

    // Sort the array by revenue based on aggregation type
    sortedData.sort((a, b) => {
        if (aggregationType === 'highest') {
            return b[1] - a[1]; // Sort descending
        } else if (aggregationType === 'lowest') {
            return a[1] - b[1]; // Sort ascending
        }
    });

    return sortedData;
}

// Function to create a bar chart with aggregated revenue data
function createRevenuePerTableChart(aggregatedData) {
    const labels = aggregatedData.map(item => `Table ${item[0]}`); // `item[0]` is tableNumber
    const values = aggregatedData.map(item => item[1]); // `item[1]` is revenue
    const ctx = document.getElementById('tableRevenueChart').getContext('2d');

    // Create the bar chart
    chartInstanceForRevenuePerTable = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels, // Table numbers
            datasets: [{
                label: 'Revenue by Table',
                data: values, // Revenue amounts per table
                backgroundColor: '#9A7E6F',
                borderColor: '#FFFFFF',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Table Number'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Total Revenue (PHP)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
    // Calculate statistics for interpretation
    const total = aggregatedData.reduce((sum, [_, revenue]) => sum + revenue, 0);
    const average = total / aggregatedData.length;
    const highestTable = aggregatedData[0];
    const lowestTable = aggregatedData[aggregatedData.length - 1];

    const interpretation = `
        <strong>Table Revenue Analysis:</strong><br>
        <ul>
            <li>Total Revenue Across Tables: ₱${total.toFixed(2)}</li>
            <li>Average Revenue per Table: ₱${average.toFixed(2)}</li>
            <li>Highest Performing Table: Table ${highestTable[0]} (₱${highestTable[1].toFixed(2)})</li>
            <li>Lowest Performing Table: Table ${lowestTable[0]} (₱${lowestTable[1].toFixed(2)})</li>
        </ul>
        <strong>Performance Analysis:</strong><br>
        <p>Table ${highestTable[0]} is generating ${((highestTable[1]/total)*100).toFixed(1)}% of total revenue. 
        ${highestTable[1] > average * 1.5 ? 
            'This table is significantly outperforming others and may indicate optimal placement or condition.' : 
            'Revenue distribution across tables is relatively balanced.'}</p>
    `;

    const interpretationElement = document.getElementById('tableRevenueInterpretation');
    if (interpretationElement) {
        interpretationElement.innerHTML = interpretation;
    }

}
initializeChartForRevenuePertable()

async function initializeChartForRevenueByTimerType() {
    const data = await fetchSessionData();
    const aggregationType = document.getElementById('TimerTypeRevChartType').value; // Get selected value

    if (data.length === 0) {
        console.log('No data available to create chart.');
        return;
    }
    // I dont have the function currently for aggregateDataForRevenuePerTable currently
    const aggregatedData = aggregateDataForRevenueByTimerType(data);
    // Destroy the existing chart if it exists
    if (chartInstanceForRevenueByTimerType) {
        chartInstanceForRevenueByTimerType.destroy();
    }
    // i dont have this currently
    createRevenueByTimerType(aggregatedData, aggregationType)
}

function aggregateDataForRevenueByTimerType(data){
    const revenueByTimerType  = {};

    data.forEach((session) => {
        const timerType = session.timerType;
        const totalBillAmount = parseFloat(session.totalBillAmount);

        // Sum revenue by timer type
        if (revenueByTimerType[timerType]) {
            revenueByTimerType[timerType] += totalBillAmount;
        } else {
            revenueByTimerType[timerType] = totalBillAmount;
        }
    });

    return revenueByTimerType;
}

// Function to create the chart for revenue by timer type
function createRevenueByTimerType(aggregatedData, aggregationType) {
    const ctx = document.getElementById("TimerTypeRevenueChart").getContext("2d");
    const chartType = aggregationType;

    // Prepare data for the chart
    const labels = Object.keys(aggregatedData);
    const dataValues = Object.values(aggregatedData);

    // Create the chart instance
    chartInstanceForRevenueByTimerType = new Chart(ctx, {
        type: chartType, // 'pie' or 'bar'
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue by Timer Type',
                data: dataValues,
                backgroundColor: chartType === 'pie' ? ['#9A7E6F', 'rgb(84, 71, 63)'] : '#9A7E6F',
                borderColor: '#FFFFFF',
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
            
        },
    });

    const total = Object.values(aggregatedData).reduce((a, b) => a + b, 0);
    const timerTypes = Object.entries(aggregatedData);

    const interpretation = `
        <strong>Timer Type Revenue Distribution:</strong><br>
        <ul>
            <li>Total Revenue: ₱${total.toFixed(2)}</li>
            ${timerTypes.map(([type, amount]) => 
                `<li>${type}: ₱${amount.toFixed(2)} (${((amount/total)*100).toFixed(1)}%)</li>`
            ).join('')}
        </ul>
        <strong>Analysis:</strong><br>
        <p>The ${timerTypes[0][0]} timer type is the most used, generating 
        ${((timerTypes[0][1]/total)*100).toFixed(1)}% of total revenue. 
        ${timerTypes[0][1] > total * 0.7 ? 
            'This suggests a strong customer preference for this timer type.' : 
            'Revenue is fairly distributed across timer types.'}</p>
    `;

    const interpretationElement = document.getElementById('timerTypeInterpretation');
    if (interpretationElement) {
        interpretationElement.innerHTML = interpretation;
    }
}
initializeChartForRevenueByTimerType();

// SECTION FOR TOTAL REVENUE
async function initializeChartForUnpaidBills() {
    const data = await fetchSessionData();
    const aggregationType = document.getElementById('UnpaidBillsAggregated').value; // Get selected value
    
    if (data.length === 0) {
        console.log('No data available to create chart.');
        return;
    }
    //initialization for storing
    let aggregationFunction;
    switch (aggregationType) {
        case 'weekly':
            aggregationFunction = getWeekNumber;
            break;
        case 'monthly':
            aggregationFunction = getMonthNumber;
            break;
        case 'daily':
        default:
            aggregationFunction = getDateNumber;
            break;
    }
    // Aggregate the data by day
    const aggregatedData = aggregateDataForUnpaidBills(data, aggregationFunction);
    // Destroy the existing chart if it exists
    if (chartInstanceForUnpaidAnalysis) {
        chartInstanceForUnpaidAnalysis.destroy();
    }

    createUnpaidBillsAnalysisChart(aggregatedData);
}

// Function to aggregate data (pass the aggregationconst dateKey = aggregationFunction(date); function as an argument)
function aggregateDataForUnpaidBills(logs, aggregationFunction) {
    const aggregatedData = {};

    logs.forEach(log => {
        const date = new Date(log.startTime);
        const dateKey = aggregationFunction(date); // Get aggregated value (day, week, or month)

        if (!aggregatedData[dateKey]) {
            aggregatedData[dateKey] = { totalPaid: 0, totalUnpaid: 0, totalBill: 0 };
        }

        const totalPaid = parseFloat(log.totalBillAmount) - parseFloat(log.totalBillUnpaid);
        const totalUnpaid = parseFloat(log.totalBillUnpaid);

        // Accumulate total paid, unpaid, and overall bill amount
        aggregatedData[dateKey].totalPaid += totalPaid;
        aggregatedData[dateKey].totalUnpaid += totalUnpaid;
        aggregatedData[dateKey].totalBill += parseFloat(log.totalBillAmount); // Add total amount for each entry
    });

    return aggregatedData;
}


// Function to create the Unpaid Bills Analysis Stacked Bar Chart
function createUnpaidBillsAnalysisChart(aggregatedData) {
    const ctx = document.getElementById("UnpaidBillsAnalysisChart").getContext("2d");

    // Prepare data for the stacked bar chart
    const labels = Object.keys(aggregatedData);
    const paidData = labels.map(dateKey => aggregatedData[dateKey].totalPaid);
    const unpaidData = labels.map(dateKey => aggregatedData[dateKey].totalUnpaid);
    const totalBillData = labels.map(dateKey => aggregatedData[dateKey].totalBill);

    // Create the stacked bar chart
    chartInstanceForUnpaidAnalysis = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels, // Dates or periods
            datasets: [
                {
                    label: 'Total Bill',
                    data: totalBillData,
                    backgroundColor: '#C0A080', // Different color for total bill
                    borderColor: '#FFFFFF',
                    stack: 'Stack 0',
                },
                {
                    label: 'Total Paid',
                    data: paidData,
                    backgroundColor: '#9A7E6F',
                    borderColor: '#FFFFFF',
                    stack: 'Stack 1',
                },
                {
                    label: 'Total Unpaid',
                    data: unpaidData,
                    backgroundColor: 'rgb(84, 71, 63)',
                    borderColor: '#FFFFFF',
                    stack: 'Stack 1',
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
            scales: {
                x: { 
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Period'
                    }
                },
                y: { 
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Amount (php)'
                    }
                }
            }
        }
    });

    // Get the latest period's data
    const currentPeriod = labels[labels.length - 1];
    const currentPeriodData = {
        totalPaid: paidData[paidData.length - 1],
        totalUnpaid: unpaidData[unpaidData.length - 1],
        totalBill: totalBillData[totalBillData.length - 1]
    };

    const periodUnpaidPercentage = (currentPeriodData.totalUnpaid / currentPeriodData.totalBill) * 100;
    const period = document.getElementById('UnpaidBillsAggregated').value;

    const interpretation = `
        <strong>Current ${period.charAt(0).toUpperCase() + period.slice(1)} Analysis (${currentPeriod}):</strong><br>
        <ul>
            <li>${period.charAt(0).toUpperCase() + period.slice(1)} Total Bill: ₱${currentPeriodData.totalBill.toFixed(2)}</li>
            <li>${period.charAt(0).toUpperCase() + period.slice(1)} Total Paid: ₱${currentPeriodData.totalPaid.toFixed(2)}</li>
            <li>${period.charAt(0).toUpperCase() + period.slice(1)} Total Unpaid: ₱${currentPeriodData.totalUnpaid.toFixed(2)}</li>
            <li>${period.charAt(0).toUpperCase() + period.slice(1)} Unpaid Percentage: ${periodUnpaidPercentage.toFixed(1)}%</li>
        </ul>
        <strong>${period.charAt(0).toUpperCase() + period.slice(1)} Risk Assessment:</strong><br>
        <p>${periodUnpaidPercentage > 10 ? 
            `The current ${period} unpaid rate of ${periodUnpaidPercentage.toFixed(1)}% is above recommended levels and requires attention.` : 
            `The ${period} unpaid rate is within acceptable range at ${periodUnpaidPercentage.toFixed(1)}%.`}</p>
        <strong>Recommendations:</strong><br>
        <p>${periodUnpaidPercentage > 10 ? 
            `• Immediate review of ${period} payment collection needed<br>
             • Consider stricter payment policies for this ${period}<br>
             • Follow up on current ${period}'s outstanding payments` : 
            `• Continue effective ${period} payment collection<br>
             • Maintain current payment policies<br>
             • Monitor ${period} payment patterns`
        }</p>
    `;

    const interpretationElement = document.getElementById('unpaidBillsInterpretation');
    if (interpretationElement) {
        interpretationElement.innerHTML = interpretation;
    }
}
initializeChartForUnpaidBills();

// SECTION FOR TOTAL REVENUE
async function initializeChartForUtilizationRates() {
    const data = await fetchSessionData();
    const aggregationType = document.getElementById('typeForUtilizationRate').value; // Get selected value
    
    if (data.length === 0) {
        console.log('No data available to create chart.');
        return;
    }
    // Determine the aggregation function
    let aggregationFunction;
    switch (aggregationType) {
        case 'hourly':
            aggregationFunction = getHourNumber;
            break;
        case 'daily':
        default:
            aggregationFunction = getDateNumber;
            break;
    }
    // Aggregate the data by day
    const aggregatedData = aggregateDataForUtilizationRates(data, aggregationFunction);
    // Destroy the existing chart if it exists
    if (chartInstanceForUtilizationRate) {
        chartInstanceForUtilizationRate.destroy();
    }

    createUtilizationRateChart(aggregatedData, aggregationType);
}

// Function to aggregate data (pass the aggregationconst dateKey = aggregationFunction(date); function as an argument)
function aggregateDataForUtilizationRates(logs, aggregationFunction) {
    const aggregatedData = {};

    logs.forEach(log => {
        const date = new Date(log.startTime);
        const dateKey = aggregationFunction(date); // Get aggregated value (day, week, or month)

        if (!aggregatedData[dateKey]) {
            aggregatedData[dateKey] = 0;
        }

        // Accumulate total duration in seconds
        aggregatedData[dateKey] += parseFloat(log.totalDurationSeconds);
    });

    return aggregatedData;
}

// Function to create an area or line chart for utilization rate
function createUtilizationRateChart(aggregatedData, aggregationType) {
    const ctx = document.getElementById("UtilizationRateChart").getContext("2d");

    // Prepare data for the chart
    const labels = Object.keys(aggregatedData); // Time intervals (hourly or daily)
    const durationData = Object.values(aggregatedData).map(duration => duration / 3600); // Convert seconds to hours

    // Create the chart instance
    chartInstanceForUtilizationRate = new Chart(ctx, {
        type: 'line', // Can be 'line' or 'area'
        data: {
            labels: labels,
            datasets: [{
                label: `Utilization Rate (${aggregationType})`,
                data: durationData,
                fill: true, // Set to true for area chart effect
                borderColor: 'rgb(84, 71, 63)',
                backgroundColor: '#9A7E6F',
                tension: 0.4, // For smooth lines
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: aggregationType === 'hourly' ? 'Hour' : 'Day'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Hours Utilized'
                    },
                    beginAtZero: true
                }
            }
        }
    });

    const values = Object.values(aggregatedData);
    const avgHours = (values.reduce((a, b) => a + b, 0) / values.length / 3600).toFixed(2);
    const maxHours = (Math.max(...values) / 3600).toFixed(2);
    const minHours = (Math.min(...values) / 3600).toFixed(2);

    const interpretation = `
        <strong>${aggregationType.charAt(0).toUpperCase() + aggregationType.slice(1)} Utilization Analysis:</strong><br>
        <ul>
            <li>Average Utilization: ${avgHours} hours</li>
            <li>Peak Utilization: ${maxHours} hours</li>
            <li>Lowest Utilization: ${minHours} hours</li>
        </ul>
        <strong>Efficiency Analysis:</strong><br>
        <p>${avgHours > 12 ? 
            `Tables are being well-utilized with an average of ${avgHours} hours per ${aggregationType} period.` : 
            `There may be opportunity to increase utilization from the current ${avgHours} hours per ${aggregationType} period.`}</p>
    `;

    const interpretationElement = document.getElementById('utilizationRateInterpretation');
    if (interpretationElement) {
        interpretationElement.innerHTML = interpretation;
    }
}

initializeChartForUtilizationRates()

async function exportAnalyticsReport() {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // 1. Total Revenue Sheet
    const revenueData = await prepareRevenueSheet();
    const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
    XLSX.utils.book_append_sheet(workbook, revenueSheet, "Total Revenue");

    // 2. Table Revenue Sheet
    const tableRevenueData = await prepareTableRevenueSheet();
    const tableRevenueSheet = XLSX.utils.aoa_to_sheet(tableRevenueData);
    XLSX.utils.book_append_sheet(workbook, tableRevenueSheet, "Table Revenue");

    // 3. Timer Type Revenue Sheet
    const timerTypeData = await prepareTimerTypeSheet();
    const timerTypeSheet = XLSX.utils.aoa_to_sheet(timerTypeData);
    XLSX.utils.book_append_sheet(workbook, timerTypeSheet, "Timer Type Analysis");

    // 4. Unpaid Bills Sheet
    const unpaidBillsData = await prepareUnpaidBillsSheet();
    const unpaidBillsSheet = XLSX.utils.aoa_to_sheet(unpaidBillsData);
    XLSX.utils.book_append_sheet(workbook, unpaidBillsSheet, "Unpaid Bills");

    // 5. Utilization Rates Sheet
    const utilizationData = await prepareUtilizationSheet();
    const utilizationSheet = XLSX.utils.aoa_to_sheet(utilizationData);
    XLSX.utils.book_append_sheet(workbook, utilizationSheet, "Utilization Rates");

    // Generate Excel file
    const fileName = `billiards_analytics_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

// Helper functions to prepare data for each sheet
async function prepareRevenueSheet() {
    const data = await fetchSessionData();
    const aggregationType = document.getElementById('aggregationSelect').value;
    
    // Header rows
    const sheet = [
        [`Better Billiards - Revenue Analysis (${aggregationType})`],
        [`Report Generated: ${new Date().toLocaleString()}`],
        [],
        ['Date', 'Revenue (PHP)']
    ];

    // Get aggregated data
    let aggregationFunction;
    switch (aggregationType) {
        case 'weekly':
            aggregationFunction = getWeekNumber;
            break;
        case 'monthly':
            aggregationFunction = getMonthNumber;
            break;
        default:
            aggregationFunction = getDateNumber;
    }

    const aggregatedData = aggregateDataForTotalRevenue(data, aggregationFunction);
    
    // Add data rows
    Object.entries(aggregatedData).forEach(([date, revenue]) => {
        sheet.push([date, revenue]);
    });

    // Add summary statistics
    const values = Object.values(aggregatedData);
    sheet.push(
        [],
        ['Summary Statistics'],
        ['Total Revenue', values.reduce((a, b) => a + b, 0)],
        ['Average Revenue', values.reduce((a, b) => a + b, 0) / values.length],
        ['Highest Revenue', Math.max(...values)],
        ['Lowest Revenue', Math.min(...values)]
    );

    return sheet;
}

async function prepareTableRevenueSheet() {
    const data = await fetchSessionData();
    
    // Header rows
    const sheet = [
        ['Better Billiards - Table Revenue Analysis'],
        [`Report Generated: ${new Date().toLocaleString()}`],
        [],
        ['Table Number', 'Total Revenue', 'Number of Sessions', 'Average Revenue per Session']
    ];

    // Aggregate data by table
    const tableStats = {};
    data.forEach(session => {
        if (!tableStats[session.tableNumber]) {
            tableStats[session.tableNumber] = {
                totalRevenue: 0,
                sessions: 0,
            };
        }
        tableStats[session.tableNumber].totalRevenue += parseFloat(session.totalBillAmount);
        tableStats[session.tableNumber].sessions++;
    });

    // Add data rows
    Object.entries(tableStats).forEach(([tableNum, stats]) => {
        sheet.push([
            tableNum,
            stats.totalRevenue,
            stats.sessions,
            stats.totalRevenue / stats.sessions
        ]);
    });

    return sheet;
}

async function prepareTimerTypeSheet() {
    const data = await fetchSessionData();
    
    // Header rows
    const sheet = [
        ['Better Billiards - Timer Type Analysis'],
        [`Report Generated: ${new Date().toLocaleString()}`],
        [],
        ['Timer Type', 'Total Revenue', 'Number of Sessions', 'Average Revenue per Session']
    ];

    // Aggregate data by timer type
    const timerTypeStats = {};
    data.forEach(session => {
        if (!timerTypeStats[session.timerType]) {
            timerTypeStats[session.timerType] = {
                totalRevenue: 0,
                sessions: 0,
            };
        }
        timerTypeStats[session.timerType].totalRevenue += parseFloat(session.totalBillAmount);
        timerTypeStats[session.timerType].sessions++;
    });

    // Add data rows
    Object.entries(timerTypeStats).forEach(([type, stats]) => {
        sheet.push([
            type,
            stats.totalRevenue,
            stats.sessions,
            stats.totalRevenue / stats.sessions
        ]);
    });

    return sheet;
}

async function prepareUnpaidBillsSheet() {
    const data = await fetchSessionData();
    const aggregationType = document.getElementById('UnpaidBillsAggregated').value;
    
    // Header rows
    const sheet = [
        [`Better Billiards - Unpaid Bills Analysis (${aggregationType})`],
        [`Report Generated: ${new Date().toLocaleString()}`],
        [],
        ['Period', 'Total Bill', 'Paid Amount', 'Unpaid Amount', 'Payment Rate (%)', 'Risk Level']
    ];

    // Get aggregation function based on type
    let aggregationFunction;
    switch (aggregationType) {
        case 'weekly':
            aggregationFunction = getWeekNumber;
            break;
        case 'monthly':
            aggregationFunction = getMonthNumber;
            break;
        default:
            aggregationFunction = getDateNumber;
    }

    // Get aggregated data using the same function as the chart
    const aggregatedData = aggregateDataForUnpaidBills(data, aggregationFunction);

    // Add data rows
    Object.entries(aggregatedData).forEach(([period, stats]) => {
        const paymentRate = ((stats.totalPaid / stats.totalBill) * 100).toFixed(2);
        const riskLevel = paymentRate < 90 ? 'High' : paymentRate < 95 ? 'Medium' : 'Low';

        sheet.push([
            period,
            stats.totalBill.toFixed(2),
            stats.totalPaid.toFixed(2),
            stats.totalUnpaid.toFixed(2),
            paymentRate,
            riskLevel
        ]);
    });

    // Add summary statistics
    const totalBill = Object.values(aggregatedData).reduce((sum, stats) => sum + stats.totalBill, 0);
    const totalUnpaid = Object.values(aggregatedData).reduce((sum, stats) => sum + stats.totalUnpaid, 0);
    const totalPaid = Object.values(aggregatedData).reduce((sum, stats) => sum + stats.totalPaid, 0);
    const overallPaymentRate = ((totalPaid / totalBill) * 100).toFixed(2);

    sheet.push(
        [],
        ['Summary Statistics'],
        ['Total Bill Amount', totalBill.toFixed(2)],
        ['Total Paid Amount', totalPaid.toFixed(2)],
        ['Total Unpaid Amount', totalUnpaid.toFixed(2)],
        ['Overall Payment Rate', `${overallPaymentRate}%`]
    );

    return sheet;
}

async function prepareUtilizationSheet() {
    const data = await fetchSessionData();
    
    // Header rows
    const sheet = [
        ['Better Billiards - Utilization Rates Analysis'],
        [`Report Generated: ${new Date().toLocaleString()}`],
        [],
        ['Date', 'Hours Utilized', 'Number of Sessions', 'Average Session Duration (hours)']
    ];

    // Aggregate data by date
    const utilizationStats = {};
    data.forEach(session => {
        const date = new Date(session.startTime).toLocaleDateString();
        if (!utilizationStats[date]) {
            utilizationStats[date] = {
                totalHours: 0,
                sessions: 0,
            };
        }
        utilizationStats[date].totalHours += parseFloat(session.totalDurationSeconds) / 3600;
        utilizationStats[date].sessions++;
    });

    // Add data rows
    Object.entries(utilizationStats).forEach(([date, stats]) => {
        sheet.push([
            date,
            stats.totalHours.toFixed(2),
            stats.sessions,
            (stats.totalHours / stats.sessions).toFixed(2)
        ]);
    });

    return sheet;
}

// Individual export functions for each metric
async function exportRevenueData() {
    const workbook = XLSX.utils.book_new();
    const aggregationType = document.getElementById('aggregationSelect').value;
    
    // Create sheets for each aggregation type
    const types = ['daily', 'weekly', 'monthly'];
    for (const type of types) {
        // Temporarily set the aggregation type
        document.getElementById('aggregationSelect').value = type;
        await initializeChartForTotalRevenue(); // Refresh data
        
        const sheetData = await prepareRevenueSheet();
        const sheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, sheet, `Revenue ${type}`);
    }
    
    // Reset to original selection
    document.getElementById('aggregationSelect').value = aggregationType;
    await initializeChartForTotalRevenue();
    
    // Export the file
    XLSX.writeFile(workbook, `revenue_analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
}

async function exportTableRevenueData() {
    const workbook = XLSX.utils.book_new();
    const sortTypes = ['highest', 'lowest'];
    
    for (const type of sortTypes) {
        document.getElementById('TableRevSelect').value = type;
        await initializeChartForRevenuePertable();
        
        const sheetData = await prepareTableRevenueSheet();
        const sheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, sheet, `Table Revenue ${type}`);
    }
    
    XLSX.writeFile(workbook, `table_revenue_${new Date().toISOString().split('T')[0]}.xlsx`);
}

async function exportTimerTypeData() {
    const workbook = XLSX.utils.book_new();
    const chartTypes = ['bar', 'pie'];
    
    for (const type of chartTypes) {
        document.getElementById('TimerTypeRevChartType').value = type;
        await initializeChartForRevenueByTimerType();
        
        const sheetData = await prepareTimerTypeSheet();
        const sheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, sheet, `Timer Type ${type}`);
    }
    
    XLSX.writeFile(workbook, `timer_type_analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
}

async function exportUnpaidBillsData() {
    const workbook = XLSX.utils.book_new();
    const types = ['daily', 'weekly', 'monthly'];
    
    for (const type of types) {
        document.getElementById('UnpaidBillsAggregated').value = type;
        await initializeChartForUnpaidBills();
        
        const sheetData = await prepareUnpaidBillsSheet();
        const sheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, sheet, `Unpaid Bills ${type}`);
    }
    
    XLSX.writeFile(workbook, `unpaid_bills_analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
}

async function exportUtilizationData() {
    const workbook = XLSX.utils.book_new();
    const types = ['hourly', 'daily'];
    
    for (const type of types) {
        document.getElementById('typeForUtilizationRate').value = type;
        await initializeChartForUtilizationRates();
        
        const sheetData = await prepareUtilizationSheet();
        const sheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, sheet, `Utilization ${type}`);
    }
    
    XLSX.writeFile(workbook, `utilization_analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Add event listener for analytics export button
document.getElementById('exportAnalytics').addEventListener('click', exportAnalyticsReport);