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
 * OPERA ONLY
 */

window.addEventListener('DOMContentLoaded', function() {

	// Specify the path to the stylesheet here:
	var cssFiles = [
		'css/logoutCenterAlign.css',
		'css/messagesFix.css'
	];

	var onCSS = function(event) {
		var message = event.data;

		// Check this is the correct message and path from the background script.
		cssFiles.each(function(path) {
			if (message.topic === 'LoadedInjectedCSS' && message.data.path === path) {
				// Remove the message listener so it doesn't get called again.
				//opera.extension.removeEventListener('message', onCSS, false);
	
				var css = message.data.css;
	
				// Create a <style> element and add it to the <head> element of the current page.
				// Insert the contents of the stylesheet into the <style> element.
				var style = document.createElement('style');
				style.setAttribute('type', 'text/css');
				style.appendChild(document.createTextNode(css));
				document.getElementsByTagName('head')[0].appendChild(style);
			}
		});
	}

	// On receipt of a message from the background script, execute onCSS().
	opera.extension.addEventListener('message', onCSS, false);

	// Send the stylesheet path to the background script to get the CSS.
	cssFiles.each(function(cssFile) {
		opera.extension.postMessage({
			requestSource: 'cssInjector',
			data: cssFile
		});
	});
}, false);