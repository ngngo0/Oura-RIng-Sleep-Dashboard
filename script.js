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
          document.getElementById('message').textContent = JSON.stringify(data, null, 2);
        })
        .catch(error => {
          console.error('Error fetching sleep data:', error);
        });
    });

