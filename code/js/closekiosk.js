chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    checkCloseTab(tabId, changeInfo, tab);
});

chrome.tabs.onCreated.addListener(function(tabId, changeInfo, tab) {         
   checkCloseTab(tabId, changeInfo, tab);
});

function checkCloseTab(tabId, changeInfo, tab) 
{
	if (typeof changeInfo !== 'undefined')
	{
		if (typeof changeInfo.url !== 'undefined' && changeInfo.url !== '')
		{
			if (changeInfo.url.toLowerCase().indexOf('closekiosk') != -1)
			{
				// Url changed.
				chrome.tabs.remove(tabId);
			}
		}
	}
}
