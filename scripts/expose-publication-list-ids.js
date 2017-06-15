for (let i = 0; i < window.frames.length; i++) {
	if (window.frames[i].location.href.indexOf('Content/Subscribers/PublicationLists/PublicationListListing.aspx') > -1) {
		let s = window.frames[i].document.createElement('script');
		s.src = chrome.extension.getURL('scripts/passPubListData.js');
		(window.frames[i].document.head || window.frames[i].document.documentElement).appendChild(s);
		s.onload = () => {
			s.remove();
		};
	}
}
