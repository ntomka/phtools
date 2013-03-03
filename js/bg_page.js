var extensionVersion = chrome.runtime.getManifest().version;

Options.initialize();
var tbi = new ToolbarIcon();
var observedTopicsDatabase = new ObservedTopicsDatabase();
// observedTopics adatbázis frissítés!
if ( Options.lastVersion == "3.1.23" || Options.lastVersion == "3.1.9002" ) {
	observedTopicsDatabase.convertDatabase();
	console.log( "A figyelt témák adatbázisa konvertálva az új verzióknak megfelelően!" );
}
var hotkeysDatabase = new HotkeysDatabase();

var requestListener = function ( request, notUsed /* chrome paraméter, felesleges számomra */, callBack ) {
	switch ( request.requestSource ) {
		case "options" :
			switch ( request.action ) {
				case "get" :
					callBack( Options );
					break;
				case "set" :
					Options.set( request.key, request.value );
					break;
				case "getTopics" :
					callBack( observedTopicsDatabase.getAll() );
					break;
				case "setTopic" :
					observedTopicsDatabase.set( request.topic, request.data );
					break;
				case "delTopic" :
					observedTopicsDatabase.del( request.topic );
					break;
			}
			break;
		case "popup" :
			switch ( request.action ) {
				case "numNew" :
					callBack( {
						messages: tbi.getMessagesCounter(),
						topics: tbi.getTopicCounter(),
						observedTopics: observedTopicsDatabase.getAll()
					} );
					break;
				case "messages" :
					callBack( MSG.getPopupData() );
					break;
				case "topics" :
					callBack( {
						topics: observedTopicsDatabase.getAll(),
						notifications: ObserverBG.notifications
					} );
					break;
				case "deleteObservedTopic" :
					observedTopicsDatabase.del( request.topic );
					ObserverBG.cleanNotifications();
					callBack( null );
					break;
				case "readObservedTopic" :
					ObserverBG.setRead( request.topic );
					ObserverBG.cleanNotifications();
					callBack( null );
					break;
			}
			break;
		case "observer" :
			switch ( request.action ) {
				case "get" :
					if ( request.topic )
						callBack( observedTopicsDatabase.get( request.topic ) );
					break;
				case "store" :
					observedTopicsDatabase.set( request.topic, request.observedTopics );
					break;
				case "notification" :
					switch ( request.method ) {
						case "get" :
							if ( typeof request.topic == 'undefined' )
								callBack( { posts: ObserverBG.notifications } );
							else
								callBack( { notification: ObserverBG.getNotification( request.topic ) } );
							break;
						case "set" :
							ObserverBG.setNofitication( request.topic, request.data );
							ObserverBG.notification();
							break;
					}
					break;
			}
			break;
		case "hotkeys" :
			switch ( request.action ) {
				case "enabled" :
					callBack( { enabled: Options.hotkeysEnabled } );
					break;
				case "get" :
					if ( request.hotkey ) {
						hotkey = hotkeysDatabase.get( request.hotkey );
						if ( hotkey )
							callBack( hotkey );
					} else {
						tmp = hotkeysDatabase.getAll();
						hotkeys = { };
						tmp.each( function ( hotkey ) {
							hotkeys[hotkey.id] = hotkey.value;
						} );
						callBack( { data: hotkeys } );
					}
					break;
				case "set" :
					hotkeysDatabase.set( request.hotkey, { id: request.hotkey, value: request.value } );
					break;
			}
			break;
	}
};

chrome.extension.onMessage.addListener( requestListener );

function parseVersionString ( str ) {
	if ( typeof( str ) != 'string' )
		return false;
	var x = str.split( '.' );
	var maj = parseInt( x[0] ) || 0;
	var min = parseInt( x[1] ) || 0;
	var fix = parseInt( x[2] ) || 0;
	return {
		major: maj,
		minor: min,
		fix: fix
	};
}

function compareVersions () {
	av = parseVersionString( Options.lastVersion );
	bv = parseVersionString( extensionVersion );
	if ( av.major < bv.major )
		return "major";
	if ( av.minor < bv.minor )
		return "minor";
	if ( av.fix < bv.fix )
		return "fix";
	if ( av.major == bv.major && av.minor == bv.minor && av.fix == bv.fix )
		return "same";
	return false;
}

document.addEvent( 'domready', function () {
	cv = compareVersions();
	if ( cv == "same" )
		console.log( new Date(), "Verzió nem változott." );
	else if ( cv == "major" || cv == "minor" ) {
		console.log( new Date(), "Verzió frissítve " + Options.lastVersion + " verzióról " + extensionVersion + " verzióra." );
		if ( window.chrome )
			Notifications.add( "update", "Új verzió!", 'A Prohardver! Eszközök frissült!<br /><a target="_blank" href="' +
				chrome.extension.getURL( 'options.html' ) + '" title="Verziótörténet">Részletek itt!</a>' );
		Options.set( "lastVersion", extensionVersion );
	} else if ( !cv || cv == "fix" ) {
		console.log( new Date(), "Verzió frissítve " + Options.lastVersion + " verzióról " + extensionVersion + " verzióra." );
		Options.set( "lastVersion", extensionVersion );
	}

	MSG.initialize( tbi );
	ObserverBG.initialize( tbi );
} );