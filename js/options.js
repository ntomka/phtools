var Options = {
	notificationsEnabled: 1,
	messagesNotificationEnabled: 1,
	errorsNotificationEnabled: 1,
	topicsNotificatonEnabled: 1,
	notificationTimeout: 10000,
	lastVersion: 0,
	hotkeysEnabled: 1,
	loginNeed: true,

	initialize: function() {
		notificationsEnabled = localStorage["notificationsEnabled"];
		messagesNotificationEnabled = localStorage["messagesNotificationEnabled"];
		errorsNotificationEnabled = localStorage["errorsNotificationEnabled"];
		notificationTimeout = localStorage["notificationTimeout"];
		lastVersion = localStorage["lastVersion"];
		topicsNotificatonEnabled = localStorage["topicsNotificatonEnabled"];
		hotkeysEnabled = localStorage["hotkeysEnabled"];
		loginNeed = localStorage["loginNeed"];

		if (notificationsEnabled)
			Options.notificationsEnabled = notificationsEnabled;
		if (messagesNotificationEnabled)
			Options.messagesNotificationEnabled = messagesNotificationEnabled;
		if (errorsNotificationEnabled)
			Options.errorsNotificationEnabled = errorsNotificationEnabled;
		if (notificationTimeout)
			Options.notificationTimeout = parseInt(notificationTimeout);
		if (lastVersion)
			Options.lastVersion = lastVersion;
		if (topicsNotificatonEnabled)
			Options.topicsNotificatonEnabled = topicsNotificatonEnabled;
		if (hotkeysEnabled)
			Options.hotkeysEnabled = parseInt(hotkeysEnabled);
		if (loginNeed != undefined)
			Options.loginNeed = loginNeed == '0' ? false : true;
	},

	set: function(property, value) {
		switch (property) {
			case 'notificationsEnabled' :
				Options.notificationsEnabled = value ? 1 : 0;
				localStorage["notificationsEnabled"] = value ? 1 : 0;
				break;
			case 'messagesNotificationEnabled' :
				Options.messagesNotificationEnabled = value ? 1 : 0;
				localStorage["messagesNotificationEnabled"] = value ? 1 : 0;
				break;
			case 'errorsNotificationEnabled' :
				Options.errorsNotificationEnabled = value ? 1 : 0;
				localStorage["errorsNotificationEnabled"] = value ? 1 : 0;
				break;
			case 'notificationTimeout' :
				Options.notificationTimeout = value;
				localStorage["notificationTimeout"] = value;
				break;
			case 'lastVersion' :
				Options.lastVersion = value;
				localStorage["lastVersion"] = value;
				break;
			case 'topicsNotificatonEnabled' :
				Options.topicsNotificatonEnabled = value ? 1 : 0;
				localStorage["topicsNotificatonEnabled"] = value ? 1 : 0;
				break;
			case 'hotkeysEnabled' :
				Options.hotkeysEnabled = value ? 1 : 0;
				localStorage['hotkeysEnabled'] = Options.hotkeysEnabled;
				break;
			case 'loginNeed' :
				Options.loginNeed = value ? true : false;
				localStorage['loginNeed'] = Options.loginNeed ? 1 : 0;
				break;
		}
	}
}