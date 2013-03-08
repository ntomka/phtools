function gup(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if (results == null)
		return "";
	else
		return results[1];
}

window.setTimeout(window.close, gup('notificationTimeout'));

window.onload = function() {
	var title = decodeURIComponent(gup("title"));
	var body = decodeURIComponent(gup("body"));
	document.getElementById('content').innerHTML =
		'<div style="padding-bottom: 5px; font-weight: bold;">' + title + '</div>'
		+ '<div>' + body + '</div>';
}
