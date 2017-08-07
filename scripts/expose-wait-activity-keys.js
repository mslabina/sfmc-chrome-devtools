if (!s)	var s = null;
s = window.document.createElement('script');
s.src = chrome.extension.getURL('scripts/addWaitKeys.js');
(window.document.head || window.document).appendChild(s);
s.onload = () => {
	s.remove();
};
