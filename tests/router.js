(function() {

module("Route");

test("Static", function() {
    var route = new Route("/book/", "book");
    equals(route.group().toString(), "\/book\/");
    equals(route.format(), "/book/");
    ok(route.static());
});

test("Dynamic", function() {
    var route = new Route("/book/:id/", "test");
    equals(route.group().toString(), "\/book\/([^\/]+)\/");
    equals(route.format(), "/book/#{id}/");
    ok(!route.static());
});

test("Regex", function() {
    var route = new Route("/book/:#\\d+#/", "test");
    equals(route.group().toString(), "\/book\/(\\d+)\/");
    equals(route.format(), "/book/#{anon0}/");
    ok(!route.static());
});

test("Dynamic with Regex", function() {
    var route = new Route("/book/:id#\\d+#/", "test");
    equals(route.group().toString(), "\/book\/(\\d+)\/");
    equals(route.format(), "/book/#{id}/");
    ok(!route.static());
});

module("Router");

var router, observer, request,
    add = function() {
        router.add.apply(router, arguments);
        router.compile();
    },
    match = function() {
        return router.match.apply(router, arguments);
    },
    reset = function() {
        router = new Router();
        observer = new Observer(router);
    },
    build = function() {
        return router.build.apply(router, arguments);
    };

test("Basic", function() {
    reset();

    add('/static/', 'static');
    equals(match('/static/')[0], 'static');
    ok($.isEmptyObject(match('/static/')[1]));

    // Not supported yet since JavaScript does not support negative lookbehind assertion
    // add('/\\:its/:#.+#/:test/:name#[a-z]+#/', 'handler');
    // equals(match('/:its/a/cruel/world/'), ['handler', {'test': 'cruel', 'name': 'world'}]);

    add('/:test', 'notail');
    equals(match('/test')[0], 'notail');
    equals(match('/test')[1][0], 'test');

    add(':test/', 'nohead');
    equals(match('test/')[0], 'nohead');
    equals(match('test/')[1][0], 'test');

    add(':test', 'fullmatch');
    equals(match('test')[0], 'fullmatch');
    equals(match('test')[1][0], 'test');

    add('/:#anon#/match', 'anon');
    equals(match('/anon/match')[0], 'anon');
    equals(match('/anon/match')[1][0], 'anon');

    ok(!match('//no/m/at/ch/')[0]);
    ok($.isEmptyObject(match('//no/m/at/ch')[1]));
});

test("Parentheses", function() {
    // Will match `notail` if router is not reset
    reset();

    add('/func(:param)', 'func');
    equals(match('/func(foo)')[0], 'func')
    equals(match('/func(foo)')[1][0], 'foo');

    add('/func2(:param#foo|bar#)', 'func2');
    equals(match('/func2(foo)')[0], 'func2');
    equals(match('/func2(foo)')[1][0], 'foo');
    equals(match('/func2(bar)')[0], 'func2');
    equals(match('/func2(bar)')[1][0], 'bar');

    ok(!match('/func2(baz)')[0]);
    ok($.isEmptyObject(match('/func2(baz)')[1]));

    add('/groups/:param#foo|bar#', 'groups');
    equals(match('/groups/foo')[0], 'groups');
    equals(match('/groups/foo')[1][0], 'foo');
    ok(!match('/groups/foo')[1][1]);
});

test("Error in pattern", function() {
});

test("Build", function() {
    reset();

    add('/:test/:name#[a-z]+#/', 'handler', {name: 'testroute'})
    add('/anon/:#.#', 'handler', {name: 'anonroute'})
    equals(build('testroute', {test: 'hello', name: 'world'}), '/hello/world/');
});

module("Observer");

test("Location", function() {
    reset();
    observer.set("location");
    equals(window.location.hash, "#location");

    equals(observer.get(), "location");
});

test("Request", function() {
    reset();
    request = observer.request("/test?redirect&v=1");
    equals(request.path, "/test");
    equals(request.params.redirect, true);
    equals(request.params.v, "1");
});

test("callback", function() {
    var book = null;
    reset();

    stop();
    add("/book/:id/?v=2", function(id) {
        book = id;
        equals(book, id);

        // Request
        equals(this.path, "/book/3/");
        equals(this.params.v, "2");
        start();
    });
    observer.start();
    observer.set("/book/3/");
});

})();
