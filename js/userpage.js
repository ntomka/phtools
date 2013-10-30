window.addEvent('domready', function () {
    if (result = /\/tag\/([\w-]+)\.html/i.exec(window.location.href)) {
        var nickDiv = $$('div.big div.big:first-child');
        if (nickDiv && nickDiv.length) {
            nickDiv = nickDiv[0];
        }
        var link = new Element('a', {
            href: 'http://hardverapro.hu/tag/' + result[1].trim(),
            title: 'Apróhirdetései',
            html: 'Apróhirdetései',
            target: '_blank'
        });
        var div = new Element('div', {
            'style': 'margin: 5px 20px 1px 20px;'
        });
        link.inject(div);
        div.inject(nickDiv);
    }
});
