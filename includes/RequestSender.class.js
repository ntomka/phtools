// ==UserScript==
// @include       http://*.prohardver.hu/*
// @include       http://prohardver.hu/*
// @include       http://*.mobilarena.hu/*
// @include       http://mobilarena.hu/*
// @include       http://*.logout.hu/*
// @include       http://logout.hu/*
// @include       http://*.itcafe.hu/*
// @include       http://itcafe.hu/*
// @include       http://*.gamepod.hu/*
// @include       http://gamepod.hu/*
// @include       http://*.hardverapro.hu/*
// @include       http://hardverapro.hu/*
// ==/UserScript==

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

var RequestSender = {
	rs: new Class({
		initialize: function(reqObj, userCallBack) {
			if ( window.chrome )
				this.requestSender = chrome.extension.sendRequest;
			else if ( window.opera )
				this.requestSender = function(obj) { opera.extension.postMessage(obj) }.bind(this);

			this.reqObj = reqObj;
			this.userCallBack = userCallBack;
		},

		callBack: function(response) {
			if ( window.opera )
				response = response.data;
			this.userCallBack(response);
		},

		sendRequest: function() {
			this.requestSender(this.reqObj, this.callBack.bind(this));
			if ( window.opera )
				opera.extension.onmessage = this.callBack.bind(this);
		}
	}),

	sendRequest: function(reqObj, userCallBack) {
		var rs = new this.rs(reqObj, userCallBack);
		rs.sendRequest();
	}
}