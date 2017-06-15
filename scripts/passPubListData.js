var timer = setInterval(loadFinished, 100);

function loadFinished () {
	if (window.grid1) {
		clearInterval(timer);

		var publicationLists = [];
		for (var i = 0; window.grid1.get_table().getRow(i); i++) {
			var pubid = window.grid1.get_table().getRow(i).getMember('PublicationListID').get_value();
			var category = window.grid1.get_table().getRow(i).getMember('CategoryID').get_value();
			var name = window.grid1.get_table().getRow(i).getMember('Name').get_value();

			publicationLists.push({
				listId: pubid,
				categoryId: category,
				name: name
			});

			if (pubid) {
				window.document.querySelector('#grid1_cell_' + i + '_3').childNodes[0].childNodes[0].innerHTML = window.document.querySelector('#grid1_cell_' + i + '_3').childNodes[0].childNodes[0].innerHTML + ' <i>(ID: ' + pubid + ')</i>';
			}
		}

		// TODO: Need some way to send publicationLists-array back to the chrome extension. Until then, log it to the console.
		// chrome.extension.sendMessage({publicationLists: publicationLists}, (message) => {});
		console.log('Publication Lists:', JSON.stringify(publicationLists));
	}
}
