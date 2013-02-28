window.addEvent( 'domready', function () {
	$$( '.face b, .arc b' ).each( function ( v ) {
		var nameTag = $( v );
		var classifiedsLink = new Element( 'a', {
			href: 'http://hardverapro.hu/aprok/keres.php?suser=' + nameTag.get( 'text' ).trim(),
			title: 'Apróhirdetései',
			target: '_blank',
			html: 'Apróhirdetései'
		} );
		classifiedsLink.inject(
			new Element( 'div' )
				.inject( nameTag.getParent( 'div' ) )
		);
	} );
} );