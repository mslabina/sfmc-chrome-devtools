chrome.devtools.panels.create('Marketing Cloud', 'icons/icon128.png', 'panel.html', (panel) => {
	panel.activities = {};
	panel.onShown.addListener((win) => {
		chrome.devtools.network.onRequestFinished.addListener((request) => {
			// We are only interested in marketing cloud responses, so only handle them
			if (/exacttarget|marketingcloud|sfmc|exct|salesforce/g.test(request.request.url) === true) {
				if (request.response.status >= 400 && request.request.url.indexOf('favicon') < 0) {
					// An error status has been returned and the request was sent to marketing cloud
					request.getContent((content) => {
						try {
							content = JSON.parse(content);
							if (content.message)	content.message = content.message.replace('\n', '<br />');
						} catch (e) {
							try {
								let tmp = document.createElement('div');
								tmp.innerHTML = content;
								content = tmp.innerText || 'No message returned';
							} catch (e) {
								content = 'No message returned';
							}
						}
						let errorList = win.document.getElementById('errorlist');
						const message = (content && content.message) ? content.message : (content || 'No message returned');
						const url = request.request.url.replace(/^https?:\/\/.*?(?=\/)/g, '');
						errorList.innerHTML = '<tr><td>' + new Date().toLocaleString() + '</td><td>' + request.response.status + '</td><td>' + request.response.statusText + '</td><td>' + url + '</td><td>' + message + '</td></tr>' + errorList.innerHTML;
					});
				} else {
					// Gain information, from successful responses that are interesting for us
					if (/\/platform-internal\/v1\/aggregator/g.test(request.request.url) === true) {
						// This route contains information on the current instance
						request.getContent((content) => {
							try {
								content = JSON.parse(content);
								content.responses.filter((res) => {
									return (['v1/accounts/@current', 'v1/users/@default', 'v1/applications/@me'].indexOf(res.url) > -1);
								}).forEach((data) => {
									switch (data.url) {
									case 'v1/accounts/@current':
										win.document.getElementById('orgName').innerHTML = data.response.name || '';
										win.document.getElementById('accountType').innerHTML = data.response.accountType || '';
										break;
									case 'v1/users/@default':
										win.document.getElementById('memberId').innerHTML = data.response.memberId || '';
										win.document.getElementById('enterpriseId').innerHTML = data.response.enterpriseId || '';
										win.document.getElementById('userName').innerHTML = data.response.userName || '';
										win.document.getElementById('userEmail').innerHTML = data.response.email || '';
										break;
									case 'v1/applications/@me':
										let applicationsHtml = '';
										data.response.items.forEach((app) => {
											applicationsHtml += '<tr><td>' + (app.name || '') + '</td><td class="center">' + (app.isProvisioned ? '&check;' : '&cross;') + '</td><td class="center">' + (app.hasAccess ? '&check;' : '&cross;') + '</td></tr>';
										});
										win.document.getElementById('applications').innerHTML = applicationsHtml;
										break;
									default:
									}
								});
							} catch (e) {
							}
						});
					} else if (/\/internal\/v1\/customobjects/g.test(request.request.url) === true) {
						// This route contains information on data extenesions
						request.getContent((content) => {
							try {
								content = JSON.parse(content);
								let dataExtensionHtml = '';
								content.items.forEach((dataExtension) => {
									dataExtensionHtml += '<tr>';
									dataExtensionHtml += '<td>' + (dataExtension.name || '') + '</td>';
									dataExtensionHtml += '<td>' + (dataExtension.id || '') + '</td>';
									dataExtensionHtml += '<td>' + (dataExtension.customerKey || '') + '</td>';
									if (dataExtension.isSendable) {
										dataExtensionHtml += '<td>' + (dataExtension.sendableCustomObjectField || '') + ' &harr; ' + (dataExtension.sendableSubscriberField || '') + '</td>';
									} else {
										dataExtensionHtml += '<td></td>';
									}
									dataExtensionHtml += '<td class="center">' + (dataExtension.isSendable ? '&check;' : '&cross;') + '</td>';
									dataExtensionHtml += '<td class="center">' + (dataExtension.isTestable ? '&check;' : '&cross;') + '</td>';
									dataExtensionHtml += '<td class="center">' + (dataExtension.fieldCount || '') + '</td>';
									dataExtensionHtml += '<td class="center">' + (dataExtension.totalRowCount || '') + '</td>';
									dataExtensionHtml += '</tr>';
								});
								win.document.getElementById('dataExtensions').innerHTML = dataExtensionHtml;
							} catch (e) {}
						});
					} else if (/\/fuelapi\/interaction\/v1\/interactions/g.test(request.request.url) === true) {
						// This route contains information on a journey
						request.getContent((content) => {
							try {
								content = JSON.parse(content);

								if (content.activities) {
									let activitiesHtml = '';
									let activitiesJson = {activities: []};
									content.activities.forEach((activity) => {
										// Write to panel.activities so it is usable in conjunction
										// with goal attainment data retrievied from another route
										panel.activities[activity.id] = activity;

										activitiesHtml += '<tr>';
										activitiesHtml += '<td class="center">' + (activity.id || '-') + '</td>';
										activitiesHtml += '<td class="center">' + (activity.key || '-') + '</td>';
										activitiesHtml += '<td class="center">' + (activity.type || '-') + '</td>';
										activitiesHtml += '<td class="center">' + (activity.name || '-') + '</td>';
										activitiesHtml += '</tr>';
										activitiesJson.activities.push({
											id: activity.id,
											key: activity.key,
											type: activity.type,
											name: activity.name
										});
									});

									win.document.getElementById('activityList').innerHTML = activitiesHtml;
									win.document.getElementById('activitiesJson').value = JSON.stringify(activitiesJson);
								}

								win.document.getElementById('journeyName').innerHTML = (content && content.items && content.items.length > 0) ? content.items[0].name : '';
								win.document.getElementById('journeyId').innerHTML = (content && content.items && content.items.length > 0) ? content.items[0].id : '';
								win.document.getElementById('journeyKey').innerHTML = (content && content.items && content.items.length > 0) ? content.items[0].key : '';
								win.document.getElementById('journeyVersions').innerHTML = content.count || '';

								let journeyHtml = '';
								content.items.forEach((journey) => {
									journeyHtml += '<tr>';
									journeyHtml += '<td class="center">' + (journey.version || '') + '</td>';
									journeyHtml += '<td class="center">' + (journey.status || '') + '</td>';
									journeyHtml += '<td class="center">' + (journey.executionMode || '') + '</td>';
									journeyHtml += '<td class="center">' + (new Date(journey.createdDate).toLocaleString() || '') + '</td>';
									journeyHtml += '<td class="center">' + (journey.entryMode || '') + '</td>';
									journeyHtml += '<td class="center">' + (journey.stats.cumulativePopulation || '') + '</td>';
									if (journey.goals && journey.goals.length > 0) {
										if (journey.goals[0].metaData.conversionUnit === 'percentage') {
											journeyHtml += '<td>I want ' + journey.goals[0].metaData.conversionValue + '% of the population to ' + journey.goals[0].description + '</td>';
										} else {
											journeyHtml += '<td>I want ' + journey.goals[0].metaData.conversionValue + ' total people ' + journey.goals[0].description + '</td>';
										}
										journeyHtml += '<td class="center">' + (journey.goals[0].metaData.isExitCriteria ? '&check;' : '&cross;') + '</td>';
									} else {
										journeyHtml += '<td>-</td><td>-</td>';
									}
									journeyHtml += '<td class="center">' + (journey.stats.goalPerformance ? journey.stats.goalPerformance + '%' : '-') + '</td>';
									journeyHtml += '<td class="center">' + (journey.stats.metGoal || '-') + '</td>';
									journeyHtml += '</tr>';
								});
								win.document.getElementById('journeys').innerHTML = journeyHtml;
							} catch (e) {}
						});
					} else if (/\/fuelapi\/interaction\/v1\/goalstatistics/g.test(request.request.url) === true) {
						// This route contains information on the goal attainment per activity of the active journey version
						request.getContent((content) => {
							try {
								content = JSON.parse(content);

								let goalAttainmentPerActivityHtml = '';
								let resultsByActivity = {};
								content.days.forEach((day) => {
									day.activities.forEach((activity) => {
										if (!resultsByActivity[activity.activityId]) resultsByActivity[activity.activityId] = 0;
										resultsByActivity[activity.activityId] += activity.metGoalForDay;
									});
								});

								let goalAttainmentJson = {
									totalMetGoal: Object.keys(resultsByActivity).reduce((acc, value) => acc + resultsByActivity[value], 0),
									activities: []
								};

								Object.keys(resultsByActivity).forEach((id) => {
									let tmp = {
										id: id,
										metGoal: resultsByActivity[id]
									};

									goalAttainmentPerActivityHtml += '<tr>';
									goalAttainmentPerActivityHtml += '<td class="center">' + (id || '-') + '</td>';
									if (panel && panel.activities && panel.activities[id]) {
										tmp.key = panel.activities[id].key;
										goalAttainmentPerActivityHtml += '<td class="center">' + (panel.activities[id].key || '-') + '</td>';
									} else {
										goalAttainmentPerActivityHtml += '<td class="center">-</td>';
									}
									goalAttainmentPerActivityHtml += '<td class="center">' + (resultsByActivity[id] || '0') + '</td>';
									goalAttainmentPerActivityHtml += '</tr>';
									goalAttainmentJson.activities.push(tmp);
								});
								win.document.getElementById('goalAttainmentPerActivity').innerHTML = goalAttainmentPerActivityHtml;
								win.document.getElementById('goalAttainmentJson').value = JSON.stringify(goalAttainmentJson);
							} catch (e) {}
						});
					}
				}
			}
		});
	});
});
