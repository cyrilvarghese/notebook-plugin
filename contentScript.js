
console.log("Content script loaded!");
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request)
    currentLocation = window.location.href;
    if (request.action === "redirect") {
        const { redirectUrl } = request;
        window.location.href = `${redirectUrl}${encodeURIComponent(currentLocation)}`;
    }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.imageSrc && request.imageSrc.endsWith('.webp')) {
        alert('Please select another image. .webp files are not supported.');

    }
    else if (request.action === 'getAltText' && request.imageSrc) {
        // Get all image elements on the page
        const images = document.querySelectorAll('img');

        let foundImage = null;

        images.forEach((img) => {
            // Check if the image's src contains the clicked image's src as a substring (partial match)
            if (img.src.includes(request.imageSrc)) {
                foundImage = img;
            }
        });

        if (foundImage) {
            const altText = foundImage.getAttribute('alt') || 'No alt attribute';
            // Send the alt text back to the service worker
            chrome.runtime.sendMessage({ title: request.imageSrc, text: altText, type: 'image' });
        } else {
            chrome.runtime.sendMessage({ title: request.imageSrc, text: 'Image not found or no alt text', type: 'image' });
        }
    }
});