var timer = setInterval(loadFinished, 100);

function loadFinished () {
	if (window.Fuel) {
		clearInterval(timer);

		var activities = document.getElementsByClassName('activity wait');
		for (var i = 0; i < activities.length; i++) {
			activities[i].querySelector('.duration-label').innerHTML += ' <i>(' + activities[i].getAttribute('data-activity-key') + ')</i>';
		}
	}
}
