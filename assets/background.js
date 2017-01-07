// Browser Action Listener to open new tab on clock
chrome.browserAction.onClicked.addListener(function(activeTab)
{
    chrome.tabs.create({ url: "chrome://newtab" });
});