
console.log("Content script loaded!");
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request)
    currentLocation = window.location.href;
    if (request.action === "redirect") {
        const { redirectUrl } = request;
        window.location.href = `${redirectUrl}${encodeURIComponent(currentLocation)}`;
    }
});

// content-script.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getAltText' && request.imageSrc) {
      // Find the image on the page by its src URL
      const img = document.querySelector(`img[src="${request.imageSrc}"]`);
      
      if (img) {
        const altText = img.getAttribute('alt') || 'No alt attribute';
        // Send the alt text back to the service worker
        chrome.runtime.sendMessage({ title: request.imageSrc, text: altText, type: 'image' });
      }
    }
  });