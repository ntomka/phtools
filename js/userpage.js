window.addEvent('domready', function() {
	var nickDiv = $$('div.big div.big:first-child');
	if ( nickDiv && nickDiv.length )
		nickDiv = nickDiv[0];
	var text = nickDiv.getElement('h1').clone();
	text.getChildren().dispose();
	var link = new Element('a', {
		href: 'http://hardverapro.hu/tag/' + text.innerText.trim(),
		title: 'Apróhirdetései',
		html: 'Apróhirdetései',
		target: '_blank'
	});
	var div = new Element('div', {
		'style': 'margin: 5px 20px 1px 20px;'
	});
	link.inject(div);
	div.inject(nickDiv);
});