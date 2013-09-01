(function(win, doc, SCRIPT, analyticsURL, GA, scriptElement) {
    win['GoogleAnalyticsObject'] = GA;
    win[GA] = win[GA] || function() {
        (win[GA].q = win[GA].q || []).push(arguments)
    };
    win[GA].l = 1 * new Date();
    scriptElement = doc.createElement(SCRIPT);
    scriptElement.src = analyticsURL;
    doc.body.appendChild(scriptElement);
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-43421564-1', 'n12v.com');
ga('send', 'pageview');
