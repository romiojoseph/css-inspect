// Function to send the toggle message to the active tab
function toggleInspector(tab) {
    if (!tab.id) return;

    // We check if we can access the tab to avoid errors on chrome:// pages
    if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
        return;
    }

    chrome.tabs.sendMessage(tab.id, { action: "toggle_inspector" })
        .catch(err => {
            // If the content script isn't ready or injected yet, we can script inject it manually
            // This is a fallback for robust behavior
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }).then(() => {
                // Try sending message again after injection
                setTimeout(() => {
                    chrome.tabs.sendMessage(tab.id, { action: "toggle_inspector" });
                }, 100);
            }).catch(e => console.log("Cannot inject on this page", e));
        });
}

// 1. Listen for the Toolbar Icon Click
chrome.action.onClicked.addListener((tab) => {
    toggleInspector(tab);
});

// 2. Listen for the Keyboard Shortcut (Alt+Shift+C)
chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-inspector") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                toggleInspector(tabs[0]);
            }
        });
    }
});