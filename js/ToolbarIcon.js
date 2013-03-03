var ToolbarIcon = new Class({
	initialize: function() {
		this.messages = 0;
		this.topics = 0;
		this.set();
	},

	setMessagesCounter: function(count) {
		this.messages = count;
        this.set();
	},

	setTopicCounter: function(count) {
		this.topics = count;
        this.set();
	},

	getMessagesCounter: function() {
		return this.messages;
	},

	getTopicCounter: function() {
		return this.topics;
	},

	setTitle: function() {
		if (this.messages == 0 && this.topics == 0)
			this.titleText = "Prohardver! Eszközök";
		else if (this.messages > 0 && this.topics == 0)
			this.titleText = String(this.messages) + " új üzenet";
		else if (this.topics > 0 && this.messages == 0)
			this.titleText = String(this.topics) + " témában új hozzászólás";
		else if (this.topics > 0 && this.messages > 0)
			this.titleText = String(this.topics) + " témában új hozzászólás\n" + String(this.messages) + " új üzenet";

		chrome.browserAction.setTitle({
			title: this.titleText
		});
	},

	setBadge: function() {
		if (this.messages == 0 && this.topics == 0)
			this.badgeText = '';
		else if (this.messages > 0 && this.topics == 0)
			this.badgeText = "0|" + String(this.messages);
		else if (this.topics > 0 && this.messages == 0)
			this.badgeText = String(this.topics) + "|0";
		else if (this.topics > 0 && this.messages > 0)
			this.badgeText = String(this.topics) + "|" + String(this.messages);

		chrome.browserAction.setBadgeText({
			text: this.badgeText
		});
	},

	set: function() {
		this.setTitle();
		this.setBadge();
	}
});