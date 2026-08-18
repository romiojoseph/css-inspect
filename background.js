// Manage inspector state per tab
const activeTabs = new Set();

function updateBadge(tabId, isActive) {
    if (!tabId) return;
    if (isActive) {
        activeTabs.add(tabId);
        chrome.action.setBadgeText({ tabId, text: "ON" });
        chrome.action.setBadgeBackgroundColor({ tabId, color: "#2563eb" });
    } else {
        activeTabs.delete(tabId);
        chrome.action.setBadgeText({ tabId, text: "" });
    }
}

// Function to send toggle message to the active tab
function toggleInspector(tab) {
    if (!tab || !tab.id) return;
    if (tab.url && (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("chrome-extension://"))) {
        return;
    }

    chrome.tabs.sendMessage(tab.id, { action: "toggle_inspector" })
        .then(response => {
            if (response && typeof response.isActive === "boolean") {
                updateBadge(tab.id, response.isActive);
            }
        })
        .catch(() => {
            // Content script fallback injection
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }).then(() => {
                setTimeout(() => {
                    chrome.tabs.sendMessage(tab.id, { action: "toggle_inspector" })
                        .then(res => {
                            if (res && typeof res.isActive === "boolean") {
                                updateBadge(tab.id, res.isActive);
                            }
                        })
                        .catch(err => console.error("Could not toggle inspector:", err));
                }, 100);
            }).catch(e => console.warn("Cannot inject script on this page:", e));
        });
}

// Listen for status updates from content script
chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.action === "inspector_status" && sender.tab && typeof msg.isActive === "boolean") {
        updateBadge(sender.tab.id, msg.isActive);
    }
});

// Clean up when tab is closed or updated
chrome.tabs.onRemoved.addListener((tabId) => {
    activeTabs.delete(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "loading") {
        updateBadge(tabId, false);
    }
});

// 1. Toolbar icon click
chrome.action.onClicked.addListener((tab) => {
    toggleInspector(tab);
});

// 2. Keyboard shortcut (Alt+Shift+C)
chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-inspector") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                toggleInspector(tabs[0]);
            }
        });
    }
});