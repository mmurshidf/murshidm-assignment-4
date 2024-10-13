document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    
    let query = document.getElementById('query').value;
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'query': query
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        displayResults(data);
        displayChart(data);
    });
});

function displayResults(data) {
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Results</h2>';
    for (let i = 0; i < data.documents.length; i++) {
        let docDiv = document.createElement('div');
        docDiv.innerHTML = `<strong>Document ${data.indices[i]}</strong><p>${data.documents[i]}</p><br><strong>Similarity: ${data.similarities[i]}</strong>`;
        resultsDiv.appendChild(docDiv);
    }
}

function displayChart(data) {
    // Input: data (object) - contains the following keys:
    //        - documents (list) - list of documents
    //        - indices (list) - list of indices   
    //        - similarities (list) - list of similarities
    // Implement function to display chart here
    // There is a canvas element in the HTML file with the id 'similarity-chart'
    //Chart

    let ctx = document.getElementById('similarity-chart').getContext('2d');
    if (window.simChart) {
        window.simChart.destroy();
    }
    
    window.simChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.indices.map(index => `Document ${index}`),
        
            datasets: [{
                label: 'Cosine Similarity',
                data: data.similarities,
        
                backgroundColor: data.similarities.map(similarity => {
                    return similarity > 0.8 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(54, 162, 235, 0.5)';
                }),
                
                borderColor: data.similarities.map(similarity => {
                    return similarity > 0.8 ? 'rgba(75, 192, 192, 1)' : 'rgba(54, 162, 235, 1)';
                }),
        
                borderWidth: 2,
            }]
        },

        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true
        }
    });
}