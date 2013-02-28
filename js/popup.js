function getMessages() {
	var table = new Element('table');
	var thead = new Element('thead');
	thead.inject(table);
	var headTr = new Element('tr');
	headTr.inject(thead);
	new Element('th', {
		"class": "face"
	}).inject(headTr);
	
	var privTh = new Element('th', {
		"class": "title",
		html: "Privát beszélgetéseim"
	});
	var openUnreadImg = new Element('img', {
		src: chrome.extension.getURL("images/wand.png"),
		style: "margin-left: 15px; display: none; cursor: pointer;",
		title: "Összes olvasatlan megnyitása"
	});
	openUnreadImg.inject(privTh);
	var unreadLinks = [];
	openUnreadImg.addEvent('click', function() {
		unreadLinks.each(function(el) {
			chrome.tabs.create({ url: el, selected: false });
		});
	}.bind(this));
	privTh.inject(headTr);
	
	new Element('th', {
		"class": "num_new"
	}).appendText("új").inject(headTr);
	new Element('th', {
		"class": "num_msg",
		"style": "width: 70px;"
	}).appendText("összes").inject(headTr);
	new Element('th', {
		"class": "time"
	}).appendText("utolsó üzenet").inject(headTr);
	var tbody = new Element('tbody');
	tbody.inject(table);
	RequestSender.sendRequest({
		requestSource: "popup",
		action: "messages"
	}, function(response) {
		for (i = 0, k = 0; i < response.message.length; i++, k = 1 - k) {
			if ( response.message[i].num_new == '-' ) {
				num_new = '-';
				rowClass = (k == 0 ? "odd" : "evn");
			} else {
				num_new = new Number(response.message[i].num_new.split(' ')[0]);
				rowClass = (k == 0 ? "odd" : "evn") + (num_new > 0 ? ' feat' : '');
			}
			tr = new Element('tr', {
				"class": rowClass
			});
			tr.inject(tbody);
			td = new Element('td', {
				"class": "face"
			});
			td.inject(tr);
			new Element('img', {
				src: response.message[i].face
			}).inject(td);
			td = new Element('td', {
				"class": "title"
			});
			td.inject(tr);
			new Element('a', {
				href: response.message[i].name_url,
				target: "_blank",
				title: "Ugrás a beszélgetéshez"
			}).appendText(response.message[i].name).inject(td);
			
			new Element('td', {
				"class": "num_new"
			}).appendText(String(num_new)).inject(tr);
			if ( typeOf(num_new) != 'string' && num_new.toInt() )
				unreadLinks.push(response.message[i].name_url);
			
			new Element('td', {
				"class": "num_msg"
			}).appendText(response.message[i].num_msg).inject(tr);
			new Element('td', {
				"class": "time"
			}).appendText(response.message[i].time).inject(tr);
		}
		if ( unreadLinks.length )
			openUnreadImg.style.display = '';
	}.bind(this));
	return table;
}

function starEvent(event, id) {
	if (event == 'mouseover') {
		$(id).style.cursor = "pointer";
	} else if (event == 'mouseout') {
		el = $(id);
		if ( el != null ) {
			$(id).style.cursor = "auto";
			$(id).src = chrome.extension.getURL("images/delete.png");
		}
	} else if (event == 'click') {
		topic = id.split('|')[1];
		RequestSender.sendRequest({
			requestSource: "popup",
			action: "deleteObservedTopic",
			topic: topic
		}, function() {
			$(id).parentNode.parentNode.dispose();
			rows = $$('div#content tbody tr');
			rows.each(function(row, k) {
				numNew = parseInt(row.getElement('td.num_new').innerHTML);
				rowClass = (k % 2 == 0 ? "odd" : "evn") + (numNew > 0 ? ' feat' : '');
				row.setProperty('class', rowClass);
			});
		});
	}
}

function readEvent(event, id) {
	if (event == 'mouseover') {
		$(id).style.cursor = "pointer";
	} else if (event == 'mouseout') {
		el = $(id);
		if ( el != null ) {
			$(id).style.cursor = "auto";
		}
	} else if (event == 'click') {
		topic = id.split('|')[1];
		RequestSender.sendRequest({
			requestSource: "popup",
			action: "readObservedTopic",
			topic: topic
		}, function() {
			tr = $(id).parentNode.parentNode;
			tr.removeClass('feat');
			tr.getElement('.num_new').innerHTML = '0';
		});
	}
}

function parseDateString(d) {
	var t = d.split(' ');
	t[0] = t[0].split('-');
	t[1] = t[1].split(':');
	t[0][0] = parseInt(t[0][0]);
	t[0][1] = parseInt(t[0][1].replace(/0?/, '')) - 1;
	t[0][2] = parseInt(t[0][2]);
	t[1][0] = parseInt(t[1][0]);
	t[1][1] = parseInt(t[1][1]);
	t[1][2] = parseInt(t[1][2]);
	return new Date(t[0][0], t[0][1], t[0][2], t[1][0], t[1][1], t[1][2]);
}

function sortByDate(a, b) {
	if (a.lastPost > b.lastPost)
		return -1;
	if (a.lastPost < b.lastPost)
		return 1;
	return 0;
}

function getTopics() {
	var table = new Element('table');
	var thead = new Element('thead');
	thead.inject(table);
	var headTr = new Element('tr');
	headTr.inject(thead);
	new Element('th', {
		"width": "20px"
	}).inject(headTr);
	var topicTh = new Element('th', {"class": "title", html: "Téma"});
	var openUnreadImg = new Element('img', {
		src: chrome.extension.getURL("images/wand.png"),
		style: "margin-left: 15px; display: none; cursor: pointer;",
		title: "Összes olvasatlan megnyitása"
	});
	openUnreadImg.inject(topicTh);
	var unreadLinks = [];
	openUnreadImg.addEvent('click', function() {
		unreadLinks.each(function(el) {
			chrome.tabs.create({ url: el, selected: false });
		});
	}.bind(this));
	topicTh.inject(headTr);
	new Element('th', {
		"class": "num_new"
	}).appendText("új").inject(headTr);
	new Element('th', {
		"class": "num_msg"
	}).appendText("összes").inject(headTr);
	new Element('th', {
		"class": "time"
	}).appendText("utolsó hozzászólás").inject(headTr);
	var tbody = new Element('tbody');
	tbody.inject(table);

	RequestSender.sendRequest({
		requestSource: "popup",
		action: "topics"
	}, function(response) {
		response.topics.sort(sortByDate);
		for (i = 0, k = 0; i < response.topics.length; i++, k = 1 - k) {
			numNew = 0;
			numSum = response.topics[i].posts;
			for (j = 0; j < response.notifications.length; j++)
				if (response.topics[i].id == response.notifications[j].id) {
					numNew = response.notifications[j].newPosts;
					numSum = response.notifications[j].posts;
					break;
				}
			rowClass = (k == 0 ? "odd" : "evn") + (numNew > 0 ? ' feat' : '');
			tr = new Element('tr', {
				"class": rowClass
			});
			tr.inject(tbody);

			td = new Element('td');
			starId = "star|" + response.topics[i].id;
			var img1 = new Element('img', {
				"alt": " - ",
				"title": "Töröl",
				"src": chrome.extension.getURL("images/delete.png"),
				"style": "width: 14px;",
				"id": starId
			});
			img1.addEvents({
				'click': function(e) {
					starEvent('click', e.target.id);
				},
				'mouseover': function(e) {
					starEvent('mouseover', e.target.id);
				},
				'mouseout': function(e) {
					starEvent('mouseout', e.target.id);
				}
			});
			img1.inject(td);
			if ( numNew ) {
				readId = "read|" + response.topics[i].id;
				var img2 = new Element('img', {
					"alt": " o ",
					"title": "Olvasott",
					"src": chrome.extension.getURL("images/accept.png"),
					"style": "width: 14px;",
					"id": readId
				});
				img2.addEvents({
					'click': function(e) {
						readEvent('click', e.target.id);
					},
					'mouseover': function(e) {
						readEvent('mouseover', e.target.id);
					},
					'mouseout': function(e) {
						readEvent('mouseout', e.target.id);
					}
				});
				img2.inject(td);
			}
			td.inject(tr);

			td = new Element('td', {
				"class": "title"
			});
			td.inject(tr);
			if (response.topics[i].id.search('apro/') != -1) {
				jump = '';
				topicType = '';
			} else if (response.topics[i].id.search('/') != -1) {
				jump = '#rel_msgs';
				topicType = 'bejegyzes/';
			} else {
				jump = '#msg' + numSum;
				topicType = 'tema/';
			}
			var href = "http://" + response.topics[i].domain + "/" + topicType + response.topics[i].id + "/friss.html" + jump;
			if ( numNew )
				unreadLinks.push(href);
			new Element('a', {
				href: href,
				target: "_blank",
				title: "Ugrás a témához"
			}).appendText(response.topics[i].title).inject(td);
			new Element('td', {
				"class": "num_new"
			}).appendText(String(numNew)).inject(tr);
			new Element('td', {
				"class": "num_msg"
			}).appendText(numSum).inject(tr);
			new Element('td', {
				"class": "time"
			}).appendText(response.topics[i].lastPost).inject(tr);
		}
		if ( unreadLinks.length )
			openUnreadImg.style.display = '';
	}.bind(this));

	return table;
}

var Active = new Class({
	buttons: ['topics-button', 'messages-button'],

	toggleTo: function(id) {
		for (i = 0; i < this.buttons.length; i++) {
			if (this.buttons[i] != id)
				$(this.buttons[i]).setAttribute('class', 'popup-button');
		}
		$(id).setAttribute('class', 'popup-button popup-button-active');
	}
});

document.addEvent('domready', function() {
	var contentDiv = $('content');

	RequestSender.sendRequest({
		requestSource: "popup",
		action: "numNew"
	}, function(response) {
		contentDiv.empty();
		if (response.messages > 0 || response.observedTopics == null || response.observedTopics.length == 0) {
			active.toggleTo('messages-button');
			getMessages().inject(contentDiv);
		} else {
			active.toggleTo('topics-button');
			getTopics().inject(contentDiv);
		}
	});

	var active = new Active();

	$('topics-button').addEvent('click', function() {
		active.toggleTo('topics-button');
		contentDiv.empty();
		getTopics().inject(contentDiv);
	});

	$('messages-button').addEvent('click', function() {
		active.toggleTo('messages-button');
		contentDiv.empty();
		getMessages().inject(contentDiv);
	});

	$('settings-button').addEvent('click', function() {
		chrome.tabs.create({url: 'options.html'});
	});
});