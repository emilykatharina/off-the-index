// Store all loaded catalogue data globally
let allData = [];

// Load the JSON file from the assets/data folder
fetch('assets/data/csvjson.json')
    .then(response => {

        // Log the HTTP response so we can check if the file was found
        console.log('JSON response:', response);

        // If the file was not loaded successfully, throw an error
        if (!response.ok) {
            throw new Error('JSON file could not be loaded');
        }

        // Convert the JSON response into JavaScript data
        return response.json();
    })
    .then(data => {

        // Log the loaded data to check if it is an array
        console.log('Loaded JSON data:', data);

        // Save the loaded data in a global variable
        allData = data.records;

        // Render the catalogue cards
        renderKatalog(allData);
    })
    .catch(error => {

        // Log the error in the browser console
        console.error('Error loading JSON:', error);

        // Show an error message on the page
        document.getElementById('katalog').innerHTML =
            '<div class="loading">Error loading data</div>';
    });


// Render catalogue items into the HTML page
function renderKatalog(items) {

    // Get the catalogue container from the HTML document
    const katalog = document.getElementById('katalog');

    // If the element does not exist, stop the function
    if (!katalog) {
        console.error('Element with id="katalog" was not found');
        return;
    }

    // Check if the data is really an array
    if (!Array.isArray(items)) {
        console.error('Expected an array, but got:', items);
        return;
    }

    // This variable will collect all generated HTML
    let html = '';

    // Loop through every item in the JSON array
    for (let i = 0; i < items.length; i++) {

        const item = items[i];

        // Add one card to the HTML string
        html += `
            <div class="card">
                <div class="card-content">

                    <div class="card-name">
                        ${item.Name}
                    </div>

                    <div class="card-content-grid">
                        <div class="card-age-at-interview">Age at interview: ${item['Age at interview'] || '–'}</div>
                        <div class="card-age-at-diagnose">Age at diagnosis: ${item['Age at diagnosis'] || '–'}</div>
                    </div>

                    <div class="card-brief-outline">
                        ${item['Brief outline'] || ''}
                    </div>

                    <details class="card-details">
                        <summary class="card-details-summary">${item.Name}'s interview</summary>
                        <div class="card-details-content">
                            ${item['Interview text'] || ''}
                        </div>
                    </details>

                </div>
            </div>
        `;
    }

    // Insert the generated HTML into the catalogue container
    katalog.innerHTML = html;
}
