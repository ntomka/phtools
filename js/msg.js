/**
 * This file is part of 'Prohardver! Eszközök'.
 *
 * 'Prohardver! Eszközök' is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 'Prohardver! Eszközök' is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 'Prohardver! Eszközök'.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright (C) 2010 - 2011 Nagy Tamás (ntomka). All rights reserved.
 **/

var MSG = {
	notificationHandlerInterval: null,
	networkErrorNotified: false,
	tmpDiv: new Element("div"),
	messagesTable: null,
	//messages: null,
	countMessages: new Number(0),
	lastNotificationCount: new Number(0),
	names: [],
	toolbarIcon: null,
	loginNeed: true,

	initialize: function(toolbarIcon) {
		MSG.toolbarIcon = toolbarIcon;
		MSG.refreshBadger();
	},

	showNotification: function() {
		var title;
		var body = '';
		if (MSG.lastNotificationCount == 0) {
			title = MSG.countMessages.toString() + " új üzeneted érkezett " + MSG.names.length + " felhasználótól!";
			for (i = 0; i < MSG.names.length; i++) {
				body += '<a href="' + MSG.names[i].url + '" title="' + MSG.names[i].name + '" target="_blank">' + MSG.names[i].name + ' (' + MSG.names[i].numNew + ')</a>';
				if (i < MSG.names.length - 1)
					body += ', ';
			}
			Notifications.add("message", title, body);
		} else if (MSG.lastNotificationCount < MSG.countMessages) {
			title = MSG.countMessages.toString() + " olvasatlan üzeneted van " + MSG.names.length + " felhasználótól (" + (MSG.countMessages - MSG.lastNotificationCount).toString() + ' új)!';
			for (i = 0; i < MSG.names.length; i++) {
				body += '<a href="' + MSG.names[i].url + '" title="' + MSG.names[i].name + '" target="_blank">' + MSG.names[i].name + ' (' + MSG.names[i].numNew + ')</a>';
				if (i < MSG.names.length - 1)
					body += ', ';
			}
			Notifications.add("message", title, body);
		}
		MSG.lastNotificationCount = MSG.countMessages;
	},

	setBadger: function() {
		MSG.toolbarIcon.setMessagesCounter(MSG.countMessages);
		if (MSG.countMessages == 0)
			MSG.lastNotificationCount = 0;
		else
			MSG.showNotification();
	},

	reqErrorHandler: function() {
		if (!MSG.networkErrorNotified) {
			Notifications.add("networkError", "Az üzenetek lekérdezése meghiúsult!", "Nem sikerült csatlakozni a Prohardver! szerveréhez!");
			MSG.networkErrorNotified = true;
		}
	},

	getPopupData: function() {
//		console.log(Options.loginNeed, MSG.loginNeed);
		if ( Options.loginNeed && MSG.loginNeed )
			return { message: [] };
		try {
			var face = MSG.messagesTable.getElements("td.face > img");
			if (face.length == 0)
				sendResponse(null);
			var name = MSG.messagesTable.getElements("td.title > a");
			var num_new = MSG.messagesTable.getElements("td.num_new");
			var num_msg = MSG.messagesTable.getElements("td.num_msg");
			var time = MSG.messagesTable.getElements("td.time");

			var message = {
				message: []
			};
			for (i = 0; i < name.length; i++) {
				face[i].src = face[i].src.replace(chrome.extension.getURL(''), "http://prohardver.hu/");
				name[i].href = name[i].href.replace(chrome.extension.getURL(''), "http://prohardver.hu/");
				message.message.push({
					face: face[i].src,
					name: name[i].innerHTML,
					name_url: name[i].href,
					num_new: num_new[i].innerHTML == '-' ? '-' : num_new[i].innerHTML,
					num_msg: num_msg[i].innerHTML == '-' ? '-' : num_msg[i].innerHTML,
					time: time[i].innerHTML
				});
			}
		} catch (e) {
			return { message: [] };
		}
		return message;
	},

	reqForUnreadMessages: new Request({
		method: 'GET',
		url: 'http://prohardver.hu/privatok/listaz.php',
		onSuccess: function(response) {
			try {
				response = response.replace(/src=\"\//g, "src=\"http:\/\/prohardver.hu\/");
				MSG.tmpDiv.innerHTML = response.substring(response.indexOf('>', response.indexOf(response.match(/<body/i))) + 1,
					response.indexOf(response.match(/<\/body>/i)));
				//console.log(MSG.tmpDiv.getElements('div'));
				MSG.messagesTable = MSG.tmpDiv.getElements("div.forum.pbeszek > table")[0];
				//console.log(MSG.messagesTable);
				names = MSG.messagesTable.getElements("td.title > a");
				messages = MSG.messagesTable.getElements("td.num_new");
				MSG.countMessages = 0;
				MSG.names.empty();
				//console.log(messages);
				for (i = 0; i < messages.length; i++) {
					if ( messages[i].innerHTML == '-' )
						new_num = 0;
					else
						new_num = new Number(messages[i].innerHTML.split(' ')[0]);
						MSG.countMessages += new_num;
					if (new_num != 0)
						MSG.names.push({
                            name: names[i].innerHTML,
                            url: names[i].href.replace(chrome.extension.getURL(''), "http://prohardver.hu/"),
                            numNew: new_num
                        });
				}
				MSG.loginNeed = !Options.loginNeed || false;
			} catch(e) {
				if ( Options.loginNeed && MSG.tmpDiv.getElement('div.loginneed').length != 0 )
					MSG.loginNeed = true;
				else
					MSG.loginNeed = false;
				//console.log(e);
				MSG.countMessages = 0;
			}
			MSG.setBadger();
			MSG.networkErrorNotified = false;
		},
		onFailure: function(xhr) {
			MSG.reqErrorHandler();
		},
		onCancel: function() {
			MSG.reqErrorHandler();
		},
		onException: function(headerName, value) {
			MSG.reqErrorHandler();
		}
	}),

	refreshBadger: function() {
		try {
			MSG.reqForUnreadMessages.cancel();
			MSG.reqForUnreadMessages.send();
		}
		catch(e) {
			console.log(new Date(), e);
		}
		window.setTimeout("MSG.refreshBadger()", 60000);
	}
};