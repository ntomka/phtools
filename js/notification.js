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
 * Copyright (C) 2010 Nagy Tamás (ntomka). All rights reserved.
 **/

var Notifications = {
	notifications: new Array(),

	enabled: function(type) {
		if (Options.notificationsEnabled == 0)
			return false;
		switch (type) {
			case "message" :
				if (Options.messagesNotificationEnabled == 0)
					return false;
				break;
			case "networkError" :
				if (Options.errorsNotificationEnabled == 0)
					return false;
				break;
			case "topic" :
				if (Options.topicsNotificatonEnabled == 0)
					return false;
				break;
		}
		return true;
	},

	cancel: function() {
		Notifications.notifications[0].notification.cancel();
	},

	add: function(type, title, body) {
		if (!Notifications.enabled(type))
			return;
		if (body == null)
			body = '';
		var notification = webkitNotifications.createHTMLNotification('notification.html?title=' + encodeURIComponent(title) +
			'&body=' + encodeURIComponent(body) + '&notificationTimeout=' + Options.notificationTimeout);
		notification.onclose = function() {
			for (i = 0; i < Notifications.notifications.length; i++)
				if (Notifications.notifications[i].notification == notification) {
					Notifications.notifications[i] = null;
					break;
				}
			Notifications.notifications = Notifications.notifications.clean();
		};
		Notifications.notifications.push({
			type: type,
			notification: notification
		});
		notification.show();
		//window.setTimeout("Notifications.cancel()", Options.notificationTimeout);
		if (type == "networkError")
			console.log(new Date(), "Hálózati hiba: " + title + " ; " + body);
	}
}