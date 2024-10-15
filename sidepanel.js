// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// Array to store words
const storedWords = [];
let imageCount = 0;

const words = {
  extensions:

    'Extensions are software programs, built on web technologies (such as HTML, CSS, and JavaScript) that enable users to customize the Chrome browsing experience.',
  popup:
    "A UI surface which appears when an extension's action icon is clicked."
};


const redirectUrl = 'http://localhost:8001?prev=';

function separateUrl(url) {
  var separatorIndex = url.indexOf('#:~');
  if (separatorIndex !== -1) {
    return url.substring(0, separatorIndex);
  } else {
    return url; // If the separator is not found, return the original URL
  }
}
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {

    const { title, text, type } = request;
    const heading = separateUrl(title);

    if (!heading) {
      return;
    }

    updateDefinition(heading, text, type);
  }
);

function createElementWithClass(tag, className) {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

function updateDefinition(word, text, type) {
  if (!word || storedWords.includes(word)) return;

  storedWords.push(word);
  const definitionsContainer = document.getElementById('definitions-container');
  const wordElement = createElementWithClass('div', 'word-definition');

  // Add data-content-type attribute
  wordElement.setAttribute('data-content-type', type);

  const wordHeader = createElementWithClass('div', 'word-header');
  const checkbox = createElementWithClass('input', 'word-checkbox');
  checkbox.type = 'checkbox';
  checkbox.addEventListener('change', (event) => handleCheckboxChange(event, word, wordElement));

  const wordTitle = createElementWithClass('h3', 'word-title');
  wordTitle.innerText = word;
  wordTitle.style.width = '300px';
  wordTitle.style.wordWrap = 'break-word';

  wordHeader.append(checkbox, wordTitle);
  wordElement.appendChild(wordHeader);

  if (type === 'link') {
    const linkIcon = document.createElement('span');
    linkIcon.innerHTML = '&#128279;';
    linkIcon.className = 'link-icon';
    wordTitle.appendChild(linkIcon);

    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner';
    // Add the loading spinner as a separate div below the link
    wordElement.appendChild(loadingSpinner);
    fetchSummary(word, wordElement, loadingSpinner);

  } else if (type === 'text') {
    const wordSummary = document.createElement('p');
    wordSummary.innerText = text || 'No summary available';
    const actualText = document.createElement('p');
    actualText.style.display = 'none';
    actualText.innerText = text || 'No text available';

    wordElement.append(wordSummary, actualText);
  } else if (type === 'image') {
    const imageList = createElementWithClass('ul', 'image-list');
    const imageItem = createElementWithClass('li', 'image-item');
    const image = document.createElement('img');
    image.src = text;
    image.alt = `Image ${imageCount}`;
    image.style.maxWidth = '100%';
    fetchDescription(image, wordElement); 
    imageItem.appendChild(image);
    imageList.appendChild(imageItem);
    wordElement.appendChild(imageList);

    // Add textarea below the image
    const textarea = document.createElement('textarea');
    textarea.className = 'image-description';
    textarea.placeholder = 'Enter image description here...';
    textarea.rows = 3; // You can adjust this value as needed
    textarea.style.width = '100%';
    textarea.style.marginTop = '10px';
    wordElement.appendChild(textarea);

    // Create hidden text element for consistency with other types
    const actualText = document.createElement('p');
    actualText.style.display = 'none';
    actualText.innerText = `${text}`;
    wordElement.appendChild(actualText);

    // Increment the image count
    imageCount++;
  }

  definitionsContainer.appendChild(wordElement);
}
// Utility function to check if a word is a valid URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function fetchDescription(image, wordElement) {
  const baseUrl = 'http://127.0.0.1:8000/process-image/';
  const params = new URLSearchParams({
    image_url: image.src,
    topic: localStorage.getItem('currentTopic')
  });
  const apiUrl = `${baseUrl}?${params.toString()}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const wordSummary = document.createElement('p');
      wordSummary.innerText = data.description || 'No description available'; 
      wordElement.appendChild(wordSummary);
    })
    .catch(error => {
      console.error('Error fetching description:', error);
      const errorElement = document.createElement('p');
      errorElement.innerText = 'Error fetching description.';
      wordElement.appendChild(errorElement);
    });
}
// Function to fetch the summary from the API and update the word element
function fetchSummary(url, wordElement, loadingSpinner) {
  const apiUrl = `http://127.0.0.1:8000/scrape/summarize-lite?url=${encodeURIComponent(url)}`;

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

// Array to store selected words
const selectedWords = [];

// Function to handle checkbox changes and track selected items
function handleCheckboxChange(event, word, wordElement) {
  let wordTitle = wordElement.querySelector('h3').innerText;
  const wordSummary = wordElement.querySelector('p').innerText;
  wordTitle = wordTitle.replace('\u{1F517}', '').trim();
  const dataType = wordElement.dataset.contentType || 'unknown'; // Extract the data type from the wordElement using data props

  const actualTextElement = wordElement.querySelector('p:nth-of-type(2)'); // Select the second <p> element
  let actualText = actualTextElement ? actualTextElement.innerText : '';
  if (dataType === 'image') {
    const textareaElement = wordElement.querySelector('textarea');
    const imageDescription = textareaElement ? textareaElement.value : '';
    actualText = imageDescription; // Update actualText to be the image description
  }


  if (event.target.checked) {
    selectedWords.push({
      title: wordTitle,
      summary: wordSummary,
      text: actualText, // Add the actual hidden text to the selectedWords object
      type: dataType
    });
    wordElement.classList.add('selected');
  } else {
    const index = selectedWords.findIndex(item => item.title === wordTitle);
    if (index > -1) {
      selectedWords.splice(index, 1);
    }
    wordElement.classList.remove('selected');
  }
  console.log('Selected words:', selectedWords);
}

function submitSelectedItems(event) {
  const submitButton = document.getElementById('submit-sources');
  // Disable the button and show loading state
  submitButton.disabled = true;
  submitButton.innerHTML = '<div class="loading-spinner" style="margin-top:0;margin-right:8px"></div> Loading...';

  const payload = {
    sources: selectedWords
  };

  fetch('http://127.0.0.1:8000/post-sources', {
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

      const currentLocation = window.location.href;

      // Send a message directly to the content script to trigger redirection
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "redirect",
          redirectUrl: redirectUrl,
          currentLocation: currentLocation
        });
      });
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

// Add event listener to submit button
document.getElementById('submit-sources').addEventListener('click', submitSelectedItems);
