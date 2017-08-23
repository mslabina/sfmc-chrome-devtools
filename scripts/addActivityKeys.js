var timer = setInterval(loadFinished, 100);

function loadFinished () {
	if (window.Fuel) {
		clearInterval(timer);

		var activities = document.getElementsByClassName('activity');
		for (var i = 0; i < activities.length; i++) {
			try {
				activities[i].querySelector('.duration-label').innerHTML += ' <i style="font-size:xx-small;">(' + activities[i].getAttribute('data-activity-key') + ')</i>';
			} catch (e) {}
		}
	}
}
