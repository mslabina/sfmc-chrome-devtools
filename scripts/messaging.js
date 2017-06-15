(function createChannel () {
	let port = chrome.extension.connect({
		name: 'sfmc-chrome-devtools'
	});

	port.onMessage.addListener((message) => {
	});
}());

function sendObjectToInspectedPage (message) {
	message.tabId = chrome.devtools.inspectedWindow.tabId;
	chrome.extension.sendMessage(message);
}
