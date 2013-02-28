var ToolbarIcon = new Class({
	initialize: function() {
		this.messages = 0;
		this.topics = 0;

		if ( window.opera ) {
			this.button = opera.contexts.toolbar.createItem({
				title: 'Prohardver! Eszközök',
				icon: 'images/icon19.png',
				popup: {
					href: "popup.html",
					width: 400
				},
				badge: {
					textContent: '',
					backgroundColor: '#006',
					color: '#ff6',
					display: 'block'
				}
			});
			opera.contexts.toolbar.addItem( this.button );
		}

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

		if ( window.chrome )
			chrome.browserAction.setTitle({
				title: this.titleText
			});
		else if ( window.opera )
			this.button.title = this.badgeText;
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

		if ( window.chrome )
			chrome.browserAction.setBadgeText({
				text: this.badgeText
			});
		else if ( window.opera )
			this.button.badge.textContent = this.badgeText;
	},

	set: function() {
		this.setTitle();
		this.setBadge();
	}
});