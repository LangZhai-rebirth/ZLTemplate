$(function () {
    $.ajax({
        url: 'code.json',
        dataType: 'json'
    }).done(function (data) {
        data.escape = function (html) {
            return html.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
        };
        $('body>article').html($('#template_article').template(data));
        eval(data.code);
        Prism.highlightAll();
    });
});