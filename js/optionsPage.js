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

RequestSender.sendRequest({
	requestSource: "options",
	action: "get"
}, function(Options) {
	Options.set = function(k, v) {
		RequestSender.sendRequest({
			requestSource: "options",
			action: "set",
			key: k,
			value: v
		});
	};

	window.addEvent('domready', function() {
		// Menü váltó
		$$('div#content > div#left-menu > ul > li').addEvent('click', function(e) {
			e.target.getParent().getElements('li').removeClass('active');
			e.target.setProperty('class', 'active');
			$$('.page').addClass('hidden');
			$(e.target.id.split('-')[0] + '-page').removeClass('hidden');
		});

		/**
		 * Értestések
		 */
		$('notificationTimeout').value = Options.notificationTimeout / 1000;
		$('notificationTimeoutValue').innerHTML = Options.notificationTimeout / 1000;
		$('notificationTimeout').addEvent('change', function(e) {
			$('notificationTimeoutValue').innerHTML = e.target.value;
			Options.set('notificationTimeout', e.target.value * 1000);
		});

		if (Options.notificationsEnabled == 1)
			$('notificationsEnabled').setAttribute("checked", "checked");
		$('notificationsEnabled').addEvent('click', function(e) {
			Options.set('notificationsEnabled', e.target.checked);
		});

		if (Options.messagesNotificationEnabled == 1)
			$('messagesNotificationEnabled').setAttribute("checked", "checked");
		$('messagesNotificationEnabled').addEvent('click', function(e) {
			Options.set('messagesNotificationEnabled', e.target.checked);
		});

		if (Options.errorsNotificationEnabled == 1)
			$('errorsNotificationEnabled').setAttribute("checked", "checked");
		$('errorsNotificationEnabled').addEvent('click', function(e) {
			Options.set('errorsNotificationEnabled', e.target.checked);
		});

		if (Options.topicsNotificatonEnabled == 1)
			$('topicsNotificatonEnabled').setAttribute("checked", "checked");
		$('topicsNotificatonEnabled').addEvent('click', function(e) {
			Options.set('topicsNotificatonEnabled', e.target.checked);
		});

		if (Options.loginNeed)
			$('loginNeed').setAttribute("checked", "checked");
		$('loginNeed').addEvent('click', function(e) {
			Options.set('loginNeed', e.target.checked);
		});
		/**
		 * Értesítések vége
		 */

		/**
		 * Billentyűparancsok
		 */
		if (Options.hotkeysEnabled)
			$('hotkeys-enabled').setAttribute("checked", "checked");
		$('hotkeys-enabled').addEvent('click', function() {
			Options.set('hotkeysEnabled', $('hotkeys-enabled').checked);
		});

		RequestSender.sendRequest({
			requestSource: "hotkeys",
			action: "get"
		}, function(response) {
			if ( response && response.data )
				Object.each(response.data, function(value, id) {
					var inputs = $$('input[name="'+id+'"]');
					if ( inputs.length )
						inputs[0].value = value;
				});
		});
		
		$$('input.hotkeys-input').addEvents({
			'keydown': function(e) {
				e.stop();

				var code = e.code ? e.code : e.which;
				if (code == null)
					return true;
				var key = (e.control ? "ctrl+" : "") + (e.alt ? "alt+" : "") + (e.shift ? "shift+" : "");

				var named_keys = {
					  //8 : "backspace",
					  //9 : "tab",
					 13 : "enter",
					 32 : "space",
					 //27 : "esc",
					 33 : "pageup",
					 34 : "pagedown",
					 35 : "end",
					 36 : "home",
					 37 : "left",
					 38 : "up",
					 39 : "right",
					 40 : "down",
					 45 : "insert",
					 //46 : "delete",
					112 : "f1",
					113 : "f2",
					114 : "f3",
					115 : "f4",
					116 : "f5",
					117 : "f6",
					118 : "f7",
					119 : "f8",
					120 : "f9",
					121 : "f10",
					122 : "f11",
					123 : "f12"
				};

				if ((code >= 65 && code <= 90) || (code >= 48 && code <= 57))
					key += String.fromCharCode(code).toLowerCase();
				else if ( named_keys[code] )
					key += named_keys[code];

				e.target.value = key;

				RequestSender.sendRequest({
					requestSource: "hotkeys",
					action: "set",
					hotkey: e.target.name,
					value: key
				});
			}
		});
		/**
		 * Billentyűparancsok vége
		 */
	});
});

/**
 * Témaszerkesztő
 */
RequestSender.sendRequest({
	requestSource: "options",
	action: "getTopics"
}, function(topics) {
	var otDiv = $('observedTopics-page');
	var phDomains = [
		'prohardver.hu', 'itcafe.hu', 'mobilarena.hu', 'gamepod.hu', 'logout.hu'
	];
	if ( otDiv && topics && topics.length ) {
		topics.each(function(topic) {
			var section = new Element('section');
			delImg = new Element('img', {src: 'images/delete.png', style: 'cursor: pointer;', title: "Töröl"});
			delImg.addEvent('click', function(e) {
				RequestSender.sendRequest({
					requestSource: "options",
					action: "delTopic",
					topic: topic.id
				});
				section.destroy();
			}.bind(this));
			h3 = new Element('h3');
			delImg.inject(h3);
			h3.inject(section);
			section.inject(otDiv);
			mainDiv = new Element('div');
			mainDiv.inject(section);
			(new Element('div', {html: topic.title, style: 'font-weight: bold;'})).inject(mainDiv); 
			(new Element('div', {html: 'Utolsó hozzászólás: ' + topic.lastPost})).inject(mainDiv); 
			(new Element('div', {html: 'Hozzászólások: ' + topic.posts})).inject(mainDiv); 
			(new Element('div', {html: 'Téma azonosító: ' + topic.id})).inject(mainDiv);
			
			domainDiv = new Element('div', {html: 'Domain: '});
			(domainDiv).inject(mainDiv);
			if ( topic.domain == 'hardverapro.hu' || topic.id.search('/') != -1 ) {
				domainDiv.innerHTML += topic.domain;
				text = '';
				if (topic.domain == 'hardverapro.hu')
					text = 'Az aprókat csak a hardverapro.hu domain alatt lehet megjeleníteni!';
				else
					text = 'A logout bejegyzéseket csak a logout.hu domain alatt lehet megjeleníteni!';
				(new Element('div', {html: text, 'class': 'informational-text'})).inject(mainDiv);
				return;
			}
			domainSelect = new Element('select');
			domainSelect.addEvent('change', function(e) {
				topic.domain = phDomains[e.target.selectedIndex];
				RequestSender.sendRequest({
					requestSource: "options",
					action: "setTopic",
					topic: topic.id,
					data: topic
				});
			}.bind(this));
			domainSelect.inject(domainDiv);
			phDomains.each(function(domain) {
				(new Element('option', {html: domain, selected: topic.domain == domain})).inject(domainSelect);
			});
		});
	}
});