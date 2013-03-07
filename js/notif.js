function gup ( name ) {
	name = name.replace( /[\[]/, "\\\[" ).replace( /[\]]/, "\\\]" );
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if ( results == null )
		return "";
	else
		return results[1];
}

chrome.alarms.create( 'notificationTimeout', {
	// vissza kell osztani, mert a chrome api-ja perc alapú
	// így a kompatibilitás is megmarad a régi verziókkal
	delayInMinutes: gup( 'notificationTimeout' ) / 60000
} );
chrome.alarms.onAlarm.addListener( function ( alarm ) {
	if ( alarm.name == 'notificationTimeout' ) {
		window.close();
	}
} );

window.onload = function () {
	var title = decodeURIComponent( gup( "title" ) );
	var body = decodeURIComponent( gup( "body" ) );
	document.getElementById( 'content' ).innerHTML =
		'<div style="padding-bottom: 5px; font-weight: bold;">' + title + '</div>'
		+ '<div>' + body + '</div>';
};
