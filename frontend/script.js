    let barChartInstance = null;
    let lineChartInstance = null;

    // Set today's date as the max value for the "to-date"
    const today = new Date().toISOString().split('T')[0]; // Formats as yyyy-mm-dd
    document.getElementById('to-date').max = today;
    
    // Optionally, set the "from-date" to 7 days ago (or any other logic)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // Subtract 7 days
    document.getElementById('from-date').value = sevenDaysAgo.toISOString().split('T')[0];

    let form = document.getElementsByTagName('form')[0];

  
    form.addEventListener('submit', function(event) {
        
        let url = 'http://127.0.0.1:3000/api/getSleepData';
        event.preventDefault(); // Prevent the form from reloading the page
        
        // Get the values from the date inputs
        let fromDate = document.getElementById('from-date').value;
        let toDate = document.getElementById('to-date').value;
        
        let queryParams = [];

        // Check if fromDate is non-null and non-empty
        if (fromDate) {  // This checks if fromDate is not null or empty
          queryParams.push(`start_date=${encodeURIComponent(fromDate)}`);
        }
      
        // Check if toDate is non-null and non-empty
        if (toDate) {  // This checks if toDate is not null or empty
          queryParams.push(`end_date=${encodeURIComponent(toDate)}`);
        }
      
        // If there are any query parameters, add them to the URL
        if (queryParams.length > 0) {
          url += '?' + queryParams.join('&');
        }
      
        fetch(url)
        .then(response => {
          return response.json(); // Parse JSON
        })
        .then(data => {
          barGraph(data);
          lineGraph(data);
          document.getElementById('message').textContent = JSON.stringify(data, null, 2);
        })
        .catch(error => {
          console.error('Error fetching sleep data:', error);
        });
    });

/**
 * Bar graph and display the sleep data.
 */
function barGraph(sleepData){

  const labels = sleepData.map(entry => entry.day);
  const heartRates = sleepData.map(entry => entry.average_heart_rate);
  const hrvs = sleepData.map(entry => entry.average_hrv);
  const sleepDurations = sleepData.map(entry => entry.total_sleep_duration);  

  // Create datasets
  const datasets = [
    {
      label: 'Average Heart Rate',
      data: heartRates,
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    },
    {
      label: 'Average HRV',
      data: hrvs,
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    },
    {
      label: 'Total Sleep Duration',
      data: sleepDurations,
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }
  ];  

  // Chart config
  barChartInstance?.destroy();

  const ctx = document.getElementById('barChart').getContext('2d');
  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

  /**
 * Line graph and display the sleep data.
 */
function lineGraph(sleepData) {

  const labels = sleepData.map(entry => entry.day);
  const heartRates = sleepData.map(entry => entry.average_heart_rate);
  const hrvs = sleepData.map(entry => entry.average_hrv);
  const sleepDurations = sleepData.map(entry => entry.total_sleep_duration);

  // Create datasets
  const datasets = [
    {
      label: 'Average Heart Rate',
      data: heartRates,
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      tension: 0.4, // Smooth curves
      fill: false
    },
    {
      label: 'Average HRV',
      data: hrvs,
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      tension: 0.4,
      fill: false
    },
    {
      label: 'Total Sleep Duration',
      data: sleepDurations,
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4,
      fill: false
    }
  ];

  // Chart config

  lineChartInstance?.destroy();

  const ctx = document.getElementById('lineChart').getContext('2d');
  lineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}