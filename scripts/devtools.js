chrome.devtools.panels.create('Marketing Cloud', 'icons/icon128.png', 'panel.html', (panel) => {
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
					}
				}
			}
		});
	});
});
