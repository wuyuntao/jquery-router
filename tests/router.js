(function() {

module("Route");

test("Static", function() {
    $.route('/book/', '#tmpl');
    var result = $.routeMatches('/book/?test=false');

    equals(result.route.route, '/book/');
    equals(result.args[0].path, '/book/');
    equals(result.args[0].params['test'], 'false');
});

test("Dynamic", function() {
    $.route('/book/:id/', '#tmpl');
    var result = $.routeMatches('/book/1/?test=true');

    equals(result.route.route, '/book/:id/');
    equals(result.args[0].path, '/book/1/');
    equals(result.args[0].params['test'], 'true');
    equals(result.args[1], '1');
});

test("Regex", function() {
    $.route('/note/:#\\d+#/', '#tmpl');
    var result = $.routeMatches('/note/2/?test=false&lang=en');

    equals(result.route.route, '/note/:#\\d+#/');
    equals(result.args[0].path, '/note/2/');
    equals(result.args[0].params['test'], 'false');
    equals(result.args[0].params['lang'], 'en');
    equals(result.args[1], '2');
});

test("Dynamic with Regex", function() {
    $.route('/comment/:id#\\d+#/', '#tmpl');
    var result = $.routeMatches('/comment/3/?test&lang=en');

    equals(result.route.route, '/comment/:id#\\d+#/');
    equals(result.args[0].path, '/comment/3/');
    equals(result.args[0].params['test'], true);
    equals(result.args[0].params['lang'], 'en');
    equals(result.args[1], '3');
});

module("Helper")

test("Unparam", function() {
    var hash = $.unparam("");
    ok($.isEmptyObject(hash));
});

})();
