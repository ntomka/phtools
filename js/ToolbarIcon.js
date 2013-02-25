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