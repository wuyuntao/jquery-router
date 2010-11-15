/**
 * jQuery Router Plugin
 *
 * Copyright (c) 2010 Wu Yuntao
 *
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

(function($) {

    var routes = [],
        statics = {},
        dynamics = [],
        compiled = false,
        // javaScript does not support negative lookbehind assertion
        // syntax: /(?<!\\):([a-zA-Z_]+)?(?:#(.*?)#)?/i,
        syntax = /:([a-zA-Z_]+)?(?:#(.*?)#)?/i,
        base = '[^/]+';

    // expose public methods
    $.extend($, {
        route: route,
        routeMatches: routeMatches,
        unparam: unparam
    });

    // a jquery plugin to create a route
    $.fn.route = function(route, callback, sync) {
        if (!this.length) return this;

        $.route(route, this, callback, sync);
        return this;
    };

    // create a route.
    // the route string may contain `:key`, `:key#regexp#` or `:#regexp#` tokens
    // for each dynamic part of the route. These can be escaped with a backslash
    // in front of the `:` and are completely ignored if static is true.
    function route(route, template, callback, async) {
        var route = {
            route: route.replace('\\:', ':'),
            realroute: route,
            template: template,
            tokens: route.split(syntax),
            callback: callback,
            async: async
        };
        if (!routeExists(route)) {
            routes.push(route);
            compiled = false;
        }
    }

    // check if route is already defined
    function routeExists(route) {
        for (var i = 0, len = routes.length; i < len; ++i)
            if (route.realroute == routes[i].realroute)
                return true;
    }

    // return a regexp pattern with groups
    function group(route) {
        out = '';
        $.each(route.tokens, function(i, part) {
            if (i % 3 == 0) {
                out += part.replace('\:', ':').replace('(', '\\(').replace(')', '\\)');
            } else if (i % 3 == 1) {
                out += '(';   // javascript does not support named groups
            } else {
                out += (part || base) + ')';
            }
        });
        return out;
    }

    // check if route is static
    function isStatic(route) {
        route.tokens.length == 1;
    }

    // match a url and return a route object
    function routeMatches(url) {
        var request = parseUrl(url);
        if (request.path in statics) {
            return {route: statics[request.path], args: [request]};
        }
        for (var i = 0, len = dynamics.length, matches; i < len; ++i) {
            matches = request.path.match(dynamics[i].regexp);
            if (matches) {
                var args = matches.slice(1, matches.length);
                args.splice(0, 0, request);
                return {route: dynamics[i].route, args: args};
            }
        }
        // late check to reduce overhead on hits
        if (!compiled) {
            compileRoutes();
            return routeMatches(url);
        }
    }
    
    // build the search structures. call this before actually using the router.
    function compileRoutes() {
        resetRoutes();
        for (var i = 0, len = routes.length, route, regexp; i < len; ++i) {
            route = routes[i];
            if (isStatic(route)) {
                statics[route.route] = route;
                continue;
            }
            regexp = new RegExp('^' + group(route) + '$', 'i');
            dynamics.push({regexp: regexp, route: route});
        }
        dynamics.reverse();
        compiled = true;
    }

    // clean route caches and set compiled flag to false
    function resetRoutes() {
        compiled = false;
        statics = {};
        dynamics = [];
    }

    // convert url into a hash
    function parseUrl(url) {
        var pieces = url.split('?', 2);
        return {path: pieces[0], params: unparam(pieces[1] || "")};
    }

    function unparam(value) {
        if (!value) return {};
        // object that holds names => values.
        var params = {},
            // get query string pieces (separated by &)
            pieces = value.split('&');

        // loop through query string pieces and assign params.
        for (var i = 0, len = pieces.length, pair; i < len; ++i) {
            pair = pieces[i].split('=', 2);
            // repeated parameters with the same name are overwritten. parameters
            // with no value get set to boolean true.
            params[decodeURIComponent(pair[0])] = (pair.length == 2 ?
                decodeURIComponent(pair[1].replace(/\+/g, ' ')) : true);
        }
        return params;
    }

})(jQuery);
