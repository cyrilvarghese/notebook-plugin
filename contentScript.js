
console.log("Content script loaded!");
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request)
    currentLocation = window.location.href;
    if (request.action === "redirect") {
        const { redirectUrl } = request;
        window.location.href = `${redirectUrl}${encodeURIComponent(currentLocation)}`;
    }
});