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
		if (type == "networkError")
			console.log(new Date(), "Hálózati hiba: " + title + " ; " + body);
	}
};
