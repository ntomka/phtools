window.addEvent('domready', function () {
    var nameRegex = /\/tag\/([\w-]+)\.html/i;
    $$('.face b, .arc b').each(function (nameTag) {
        if (result = nameRegex.exec(nameTag.getParents('.msg').getChildren('.head p a:nth-child(2)')[0].getProperty('href'))) {
            var classifiedsLink = new Element('a', {
                href: 'http://hardverapro.hu/tag/' + result[1].trim(),
                title: 'Apróhirdetései',
                target: '_blank',
                html: 'Apróhirdetései'
            });
            classifiedsLink.inject(
                new Element('div')
                .inject(nameTag.getParent('div'))
                );
        }
    });
});
