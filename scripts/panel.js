document.querySelector('#exposePubListIds').addEventListener('click', () => {
	sendObjectToInspectedPage({
		action: 'script',
		content: 'scripts/expose-publication-list-ids.js',
		allFrames: true
	});
}, false);

document.querySelector('#exposeActivityKeys').addEventListener('click', () => {
	sendObjectToInspectedPage({
		action: 'script',
		content: 'scripts/expose-activity-keys.js',
		allFrames: true
	});
}, false);

window.onload = () => {
	let tabNavigation = document.getElementsByClassName('tabnav');
	for (let i = 0; i < tabNavigation.length; i++) {
		document.getElementById(tabNavigation[i].id).addEventListener('click', (e) => {
			showTab(e, e.currentTarget.id.replace('Nav', ''));
		}, false);
	}
};

function showTab (e, tabId) {
	let i;
	let tabContent = document.getElementsByClassName('tabcontent');

	for (i = 0; i < tabContent.length; i++) {
		tabContent[i].style.display = 'none';
	}

	let activeTabs = document.getElementsByClassName('active');
	for (i = 0; i < activeTabs.length; i++) {
		activeTabs[i].classList.remove('active');
	}

	document.getElementById(tabId).style.display = 'block';
	e.currentTarget.classList.add('active');
}
