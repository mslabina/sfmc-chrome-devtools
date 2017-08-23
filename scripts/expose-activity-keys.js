if (!s)	var s = null;
s = window.document.createElement('script');
s.src = chrome.extension.getURL('scripts/addActivityKeys.js');
(window.document.head || window.document).appendChild(s);
s.onload = () => {
	s.remove();
};
