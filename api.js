// api.js

import { apiBaseUrl } from './config.js';

// Function to fetch the summary from the API and update the word element
export function fetchSummary(url, wordElement, loadingSpinner) {
    const apiUrl = `${apiBaseUrl}/scrape/summarize-lite?url=${encodeURIComponent(url)}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const wordSummary = document.createElement('p');
            wordSummary.innerText = data.summary || 'No summary available';

            const actualText = document.createElement('p');
            actualText.style.display = 'none'; // Hide the summary by default
            actualText.innerText = data.actual_text || 'No text available';

            // Remove loading spinner and add summary text
            wordElement.removeChild(loadingSpinner);
            wordElement.appendChild(wordSummary);
            wordElement.appendChild(actualText);
        })
        .catch(error => {
            console.error('Error fetching summary:', error);
            const errorElement = document.createElement('p');
            errorElement.innerText = 'Error fetching summary.';
            wordElement.removeChild(loadingSpinner);
            wordElement.appendChild(errorElement);
        });
}

// Function to submit selected items
export function submitSelectedItems(selectedWords) {
    const submitButton = document.getElementById('submit-sources');

    // Disable the button and show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<div class="loading-spinner" style="margin-top:0;margin-right:8px"></div> Loading...';

    const payload = {
        sources: selectedWords
    };

    fetch(`${apiBaseUrl}/post-sources`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error('Failed to submit sources');
            }
        })
        .then(data => {
            console.log('Success:', data);
            alert('Sources submitted successfully');

            // Redirect the user to the new URL with the current location as a parameter
            const currentLocation = window.location.href; // Get the current location
            window.location.href = `${redirectUrl}${encodeURIComponent(currentLocation)}`;
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Failed to submit sources');
        })
        .finally(() => {
            // Re-enable the button and restore original text
            submitButton.disabled = false;
            submitButton.innerHTML = 'Submit Sources';
        });
}
