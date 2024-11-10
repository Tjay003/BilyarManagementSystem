let chartInstanceForTotalRevenue ;
let chartInstanceForRevenuePerTable ;
let chartInstanceForRevenueByTimerType ;
let chartInstanceForUnpaidAnalysis;
let chartInstanceForUtilizationRate;


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
            aggregatedData[dateKey] = { totalPaid: 0, totalUnpaid: 0 };
        }

        // Accumulate total paid and unpaid amounts
        aggregatedData[dateKey].totalPaid += parseFloat(log.totalBillAmount) - parseFloat(log.totalBillUnpaid);
        aggregatedData[dateKey].totalUnpaid += parseFloat(log.totalBillUnpaid);
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

// Function to create the Unpaid Bills Analysis Stacked Bar Chart
function createUnpaidBillsAnalysisChart(aggregatedData) {
    const ctx = document.getElementById("UnpaidBillsAnalysisChart").getContext("2d");

    // Prepare data for the stacked bar chart
    const labels = Object.keys(aggregatedData);
    const paidData = labels.map(dateKey => aggregatedData[dateKey].totalPaid);
    const unpaidData = labels.map(dateKey => aggregatedData[dateKey].totalUnpaid);

    // Create the stacked bar chart
    chartInstanceForUnpaidAnalysis = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels, // Dates or periods
            datasets: [
                {
                    label: 'Total Paid',
                    data: paidData,
                    backgroundColor: '#9A7E6F',
                    borderColor: '#FFFFFF',
                    stack: 'Stack 0',
                },
                {
                    label: 'Total Unpaid',
                    data: unpaidData,
                    backgroundColor: 'rgb(84, 71, 63)',
                    borderColor: '#FFFFFF',
                    stack: 'Stack 0',
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

    createUtilizationRateChart(aggregatedData);
}

// Function to aggregate data (pass the aggregationconst dateKey = aggregationFunction(date); function as an argument)
function utilizationRate(logs, aggregationFunction) {
    const aggregatedData = {};

    logs.forEach(log => {
        const date = new Date(log.startTime);
        const dateKey = aggregationFunction(date); // Get aggregated value (day, week, or month)

        if (!aggregatedData[dateKey]) {
            aggregatedData[dateKey] = { totalPaid: 0, totalUnpaid: 0 };
        }

        // Accumulate total paid and unpaid amounts
        aggregatedData[dateKey].totalPaid += parseFloat(log.totalBillAmount) - parseFloat(log.totalBillUnpaid);
        aggregatedData[dateKey].totalUnpaid += parseFloat(log.totalBillUnpaid);
    });

    return aggregatedData;
}