// Function to get the data
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

// Main function for revenue prediction
async function predictRevenue() {
    // get the value of the date
    const predictionDate = document.getElementById('revenuePredictionDate').value;
    if (!predictionDate) {
        alert('Please select a date for prediction');
        return;
    }

    try {
        const historicalData = await fetchSessionData();
        const prediction = await calculateRevenuePredictionML(historicalData, new Date(predictionDate));
        console.log(prediction);
        displayRevenuePrediction(prediction);
    } catch (error) {
        console.error('Error in revenue prediction:', error);
        document.getElementById('revenuePredictionResult').innerHTML = 
            'Error calculating prediction. Please try again.';
    }
}

// Machine Learning based revenue prediction
async function calculateRevenuePredictionML(historicalData, targetDate) {
    // Step 1: Prepare data - Group revenue by date
    const dailyRevenue = {};
    historicalData.forEach(session => {
        const date = new Date(session.startTime).toISOString().split('T')[0];
        if (!dailyRevenue[date]) {
            dailyRevenue[date] = 0;
        }
        dailyRevenue[date] += parseFloat(session.totalBillAmount);
    });

    // Step 2: Create features for ML model
    // Extract all dates from dailyRevenue object and sort them chronologically
    const dates = Object.keys(dailyRevenue).sort();
    // Get the corresponding revenue values in the same order as the sorted dates
    // This creates two parallel arrays - dates and their matching revenues
    const revenues = Object.values(dailyRevenue);
    
    const features = [];
    const labels = [];
    
    // This code creates training data for the ML model using a sliding window approach
    // We use past revenue data to predict future revenue
    // lookback determines how many previous days of data we use to predict the next day
    // A larger lookback (e.g. 30 days) can capture longer-term patterns and seasonality
    // However, too large a lookback may introduce noise and require more training data
    // Recommended to experiment with 7-30 days depending on your data
    const lookback = 30;
    
    // Loop through the dates to create training examples
    for (let i = lookback; i < dates.length; i++) {
        // For each day, take the previous 'lookback' days of revenue as features
        const pastRevenues = revenues.slice(i - lookback, i);
        
        // Add additional time-based features to help the model learn seasonal patterns:
        features.push([
            ...pastRevenues,           // Previous days' revenue 
            new Date(dates[i]).getDay(),    // Day of week (0=Sun to 6=Sat) - captures weekly patterns
            new Date(dates[i]).getDate(),   // Day of month (1-31) - captures monthly patterns
            new Date(dates[i]).getMonth() + 1 // Month (1-12) - captures yearly seasonal patterns
        ]);
        
        // The label is the actual revenue for the day we're trying to predict
        labels.push(revenues[i]);
    }

    // Step 3: Create TensorFlow tensors
    const tensorFeatures = tf.tensor2d(features);
    const tensorLabels = tf.tensor1d(labels);

    // Step 4: Create neural network model
    const model = tf.sequential();
    model.add(tf.layers.dense({
        inputShape: [lookback + 3], // past revenues + day/month features
        units: 32,
        activation: 'relu'
    }));
    // Dropout layer to prevent overfitting
    model.add(tf.layers.dropout(0.2));
    // Hidden layer
    model.add(tf.layers.dense({
        units: 16,
        activation: 'relu'
    }));
    // Output layer
    model.add(tf.layers.dense({
        units: 1
    }));

    // Step 5: Compile the model
    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError'
    });

    // Step 6: Train the model
    await model.fit(tensorFeatures, tensorLabels, {
        epochs: 100,
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: async (epoch, logs) => {
                if (epoch % 10 === 0) {
                    console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
                }
            }
        }
    });

    // Step 7: Prepare prediction input
    const targetFeatures = [
        ...revenues.slice(-lookback), // Last 7 days of revenue
        targetDate.getDay(),
        targetDate.getDate(),
        targetDate.getMonth() + 1
    ];

    // Step 8: Make prediction
    const prediction = model.predict(tf.tensor2d([targetFeatures]));
    const predictedValue = await prediction.data();

    // Step 9: Calculate additional metrics for confidence
    const recentAvg = calculateRecentAverage(revenues, 7);
    const trend = calculateTrend(revenues, 7);
    const seasonality = detectSeasonality(dailyRevenue);

    // Step 10: Cleanup TensorFlow tensors
    model.dispose();
    tensorFeatures.dispose();
    tensorLabels.dispose();
    prediction.dispose();

    // Return prediction results
    return {
        predictedRevenue: predictedValue[0],
        confidence: calculateConfidenceScore(0.8, trend),
        trend,
        seasonality,
        recentAvg
    };
}

// Main function for survivability analysis
async function analyzeSurvivability() {
    const analysisDate = document.getElementById('survivabilityDate').value;
    if (!analysisDate) {
        alert('Please select a date for analysis');
        return;
    }

    try {
        const historicalData = await fetchSessionData();
        const analysis = await calculateSurvivabilityScoreML(historicalData, new Date(analysisDate));
        console.log(analysis);
        displaySurvivabilityAnalysis(analysis);
    } catch (error) {
        console.error('Error in survivability analysis:', error);
        document.getElementById('survivabilityResult').innerHTML = 
            'Error performing analysis. Please try again.';
    }
}

// Machine Learning based survivability analysis
async function calculateSurvivabilityScoreML(historicalData, targetDate) {
    // Step 1: Prepare features for survivability analysis
    const features = [];
    const labels = [];

    // Step 2: Calculate daily metrics
    const dailyMetrics = calculateDailyMetrics(historicalData);
    console.log("daily metrics bitch", dailyMetrics);
    // Step 3: Create training data using 30-day windows
    const lookback = 30;
    for (let i = lookback; i < dailyMetrics.length; i++) {
        const pastMetrics = dailyMetrics.slice(i - lookback, i);
        features.push(flattenMetrics(pastMetrics));
        labels.push(calculateGrowthLabel(dailyMetrics.slice(i, i + 30)));
    }

    // Step 4: Create and train classification model
    const model = tf.sequential();
    // Input layer
    model.add(tf.layers.dense({
        inputShape: [lookback * 4],
        units: 128, // Increased number of units
        activation: 'relu'
    }));
    model.add(tf.layers.dropout(0.3));
    // Hidden layer
    model.add(tf.layers.dense({
        units: 64,
        activation: 'relu'
    }));
    // Output layer (binary classification)
    model.add(tf.layers.dense({
        units: 1,
        activation: 'sigmoid'
    }));

    // Step 5: Compile model
    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });

    // Step 6: Train model
    const tensorFeatures = tf.tensor2d(features);
    const tensorLabels = tf.tensor1d(labels);

    await model.fit(tensorFeatures, tensorLabels, {
        epochs: 100,
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: async (epoch, logs) => {
                if (epoch % 10 === 0) {
                    console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
                }
            }
        }
    });


    // Step 7: Make prediction
    const recentMetrics = dailyMetrics.slice(-lookback);
    const predictionInput = tf.tensor2d([flattenMetrics(recentMetrics)]);
    const prediction = model.predict(predictionInput);
    const survivabilityScore = await prediction.data();

    // Step 8: Calculate business metrics
    const revenueMetrics = calculateRevenueMetrics(historicalData);
    const utilizationMetrics = calculateUtilizationMetrics(historicalData);
    const paymentMetrics = calculatePaymentMetrics(historicalData);

    // Step 9: Calculate weighted average score
    const weightedScore = (
        (revenueMetrics.score * 0.6) +  // 50% weight on revenue
        (utilizationMetrics.score * 0.1) + // 20% weight on utilization
        (paymentMetrics.score * 0.3)  // 30% weight on payment performance
    );

    // Step 10: Apply time decay factor for future predictions
    const yearsInFuture = (targetDate - new Date()) / (365 * 24 * 60 * 60 * 1000);
    const timeFactor = Math.max(0.7, 1 - (yearsInFuture * 0.1)); // Reduce confidence by 10% per year
    
    // Step 11: Cleanup
    model.dispose();
    tensorFeatures.dispose();
    tensorLabels.dispose();
    predictionInput.dispose();
    prediction.dispose();

    return {
        score: weightedScore * timeFactor,
        revenueMetrics,
        utilizationMetrics,
        paymentMetrics,
        recommendation: generateRecommendation(weightedScore * timeFactor)
    };
}

// Helper functions for ML calculations
function calculateDailyMetrics(historicalData) {
    // Group data by date and calculate multiple metrics
    const dailyMetrics = {};
    
    historicalData.forEach(session => {
        const date = new Date(session.startTime).toISOString().split('T')[0];
        if (!dailyMetrics[date]) {
            dailyMetrics[date] = {
                revenue: 0,
                utilization: 0,
                unpaidRate: 0,
                sessionCount: 0
            };
        }
        
        dailyMetrics[date].revenue += parseFloat(session.totalBillAmount);
        // This line calculates the utilization rate for a given date by adding the total duration of all sessions in seconds, 
        // converted to a fraction of a day (assuming 24 hours * 3600 seconds per hour), to the total utilization for that date.
        // The expected output is a decimal value representing the fraction of the day utilized.
        dailyMetrics[date].utilization += parseFloat(session.totalDurationSeconds) / (12 * 3600);
        dailyMetrics[date].unpaidRate += parseFloat(session.totalBillUnpaid) / parseFloat(session.totalBillAmount);
        dailyMetrics[date].sessionCount++;
    });

    // Convert to array and normalize
    return Object.entries(dailyMetrics)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([_, metrics]) => ({
            revenue: metrics.revenue,
            utilization: metrics.utilization / metrics.sessionCount,
            unpaidRate: metrics.unpaidRate / metrics.sessionCount,
            sessionCount: metrics.sessionCount
        }));
}

function flattenMetrics(metrics) {
    return metrics.reduce((flat, day) => [
        ...flat,
        day.revenue,
        day.utilization,
        day.unpaidRate,
        day.sessionCount
    ], []);
}

function calculateGrowthLabel(metrics) {
    const firstHalf = metrics.slice(0, 15).reduce((sum, m) => sum + m.revenue, 0);
    const secondHalf = metrics.slice(15).reduce((sum, m) => sum + m.revenue, 0);
    return secondHalf > firstHalf ? 1 : 0;
}

function calculateRecentAverage(values, days) {
    const recent = values.slice(-days);
    return recent.reduce((a, b) => a + b, 0) / recent.length;
}

function calculateTrend(values, days) {
    const recent = values.slice(-days);
    const xValues = Array.from({length: days}, (_, i) => i);
    const regression = calculateLinearRegression(xValues, recent);
    return regression.slope;
}

function detectSeasonality(dailyRevenue) {
    // Simple day-of-week seasonality detection
    const dayRevenues = Array(7).fill(0);
    const dayCounts = Array(7).fill(0);

    Object.entries(dailyRevenue).forEach(([date, revenue]) => {
        const dayOfWeek = new Date(date).getDay();
        dayRevenues[dayOfWeek] += revenue;
        dayCounts[dayOfWeek]++;
    });

    return dayRevenues.map((rev, i) => 
        dayCounts[i] ? rev / dayCounts[i] : 0);
}

function calculateLinearRegression(x, y) {
    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumXX += x[i] * x[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const r2 = Math.pow(slope * Math.sqrt(sumXX - (sumX * sumX) / n) / 
        Math.sqrt(sumY * sumY - (sumY * sumY) / n), 2);

    return { slope, intercept, r2 };
}

function calculateConfidenceScore(r2, trend) {
    // Combine R² and trend direction for confidence score
    const trendFactor = trend > 0 ? 1.1 : 0.9;
    return Math.min(Math.max(r2 * trendFactor, 0), 1);
}

// Add these functions for survivability analysis
function calculateRevenueMetrics(historicalData) {
    const revenues = historicalData.map(session => parseFloat(session.totalBillAmount));
    const total = revenues.reduce((a, b) => a + b, 0);
    const avg = total / revenues.length;
    const recentRevenues = revenues.slice(-30); // Look at last 30 days
    const recentAvg = recentRevenues.reduce((a, b) => a + b, 0) / recentRevenues.length;
    
    return {
        score: Math.min(recentAvg / avg, 1), // Compare recent performance to overall
        total,
        average: avg
    };
}

function calculateUtilizationMetrics(historicalData) {
    const utilizations = historicalData.map(session => 
        parseFloat(session.totalDurationSeconds) / (24 * 3600 * 8)); // Divide by (24 hours * 8 tables)
    const avg = utilizations.reduce((a, b) => a + b, 0) / utilizations.length;
    
    return {
        score: Math.min(avg * 2, 1), // Scale utilization to 0-1, targeting 50% as optimal
        average: avg
    };
}

function calculatePaymentMetrics(historicalData) {
    const payments = historicalData.map(session => ({
        total: parseFloat(session.totalBillAmount),
        unpaid: parseFloat(session.totalBillUnpaid)
    }));
    
    const totalBilled = payments.reduce((sum, p) => sum + p.total, 0);
    const totalUnpaid = payments.reduce((sum, p) => sum + p.unpaid, 0);
    const paymentRate = 1 - (totalUnpaid / totalBilled);
    
    return {
        score: paymentRate,
        paymentRate
    };
}

function generateRecommendation(score) {
    if (score >= 0.8) {
        return "Business is performing strongly. Consider expansion opportunities and maintain current practices.";
    } else if (score >= 0.6) {
        return "Business is stable. Focus on optimizing operations and increasing customer retention.";
    } else if (score >= 0.4) {
        return "Some attention needed. Review pricing strategy and operational efficiency. Consider implementing new marketing strategies.";
    } else {
        return "Action required: Focus on increasing utilization rates, improving payment collection, and implementing cost control measures. Consider promotional activities to boost revenue.";
    }
}

// Add display functions
function displayRevenuePrediction(prediction) {
    const resultDiv = document.getElementById('revenuePredictionResult');
    const confidenceLevel = prediction.confidence >= 0.7 ? 'High' :
                          prediction.confidence >= 0.4 ? 'Medium' : 'Low';
    
    resultDiv.innerHTML = `
        <h5>Predicted Revenue: ₱${prediction.predictedRevenue.toFixed(2)}</h5>
        <p>Confidence Level: ${confidenceLevel} (${(prediction.confidence * 100).toFixed(1)}%)</p>
        <p>Recent Trend: ${prediction.trend > 0 ? 'Upward' : 'Downward'}</p>
        <p>Based on recent average of ₱${prediction.recentAvg.toFixed(2)}</p>
        <small>Note: This prediction is based on historical data patterns and should be used as a guide only.</small>
    `;
}

function displaySurvivabilityAnalysis(analysis) {
    const resultDiv = document.getElementById('survivabilityResult');
    const healthStatus = analysis.score >= 0.7 ? 'Strong' :
                        analysis.score >= 0.4 ? 'Stable' : 'At Risk';
    
    resultDiv.innerHTML = `
        <h5>Business Health Status: ${healthStatus}</h5>
        <p>Overall Score: ${(analysis.score * 100).toFixed(1)}%</p>
        <h6>Key Metrics:</h6>
        <ul>
            <li>Revenue Health: ${(analysis.revenueMetrics.score * 100).toFixed(1)}%</li>
            <li>Utilization Efficiency: ${(analysis.utilizationMetrics.score * 100).toFixed(1)}%</li>
            <li>Payment Performance: ${(analysis.paymentMetrics.score * 100).toFixed(1)}%</li>
        </ul>
        <h6>Recommendation:</h6>
        <p>${analysis.recommendation}</p>
        <small class="text-muted">Note: Long-term predictions (>1 year) have reduced confidence due to increased uncertainty.</small>
    `;
}