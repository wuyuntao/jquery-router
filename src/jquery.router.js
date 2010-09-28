/**
 * jQuery Router Plugin
 *
 * Copyright (c) 2010 Wu Yuntao
 *
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

// (function($) {

/**
 * Represents a single route and can parse the dynamic route syntax
 */
var Route = function(route, target, name, static) {
    this.init(route, target, name, static);
};

$.extend(Route.prototype, {
    // JavaScript does not support negative lookbehind assertion
    // syntax: /(?<!\\):([a-zA-Z_]+)?(?:#(.*?)#)?/i,
    syntax: /:([a-zA-Z_]+)?(?:#(.*?)#)?/i,

    default: '[^/]+',

    /**
     * Create a Route.
     * The route string may contain `:key`, `:key#regexp#` or `:#regexp#` tokens
     * for each dynamic part of the route. These can be escaped with a backslash
     * in front of the `:` and are completely ignored if static is true.
     * A name may be used to refer to this route later (depends on Router)
     */
    init: function(route, target, name, static) {
        this.route = route.replace('\\:', ':');
        this.target = target;
        this.name = name;
        this.realroute = static ? route.replace(':', '\\:') : route;
        this.tokens = this.realroute.split(this.syntax);
    },

    /**
     * Return a regexp pattern with groups
     */
    group: function() {
        out = '';
        $.each(this.tokens, $.proxy(function(i, part) {
            if (i % 3 == 0) {
                out += part.replace('\:', ':').replace('(', '\\(').replace(')', '\\)');
            } else if (i % 3 == 1) {
                out += '(';   // Javascript does not support named groups
            } else {
                out += (part || this.default) + ')';
            }
        }, this));
        return out;
    },

    /**
     * Return a format string with named fields.
     */
    format: function() {
        var out = '', c = 0;
        $.each(this.tokens, function(i, part) {
            if (i % 3 == 0) {
                out += part.replace('\\:', ':').replace('%', '%%');
            } else if (i % 3 == 1) {
                if (!part) part = 'anon' + (c++);
                out += '#{' + part + '}';
            }
        });
        return out;
    },

    static: function() {
        return this.tokens.length == 1;
    },

    equals: function(route) {
        return this.realroute === route.realroute;
    }
});

/**
 * A route associates a string (e.g. URL) with an object (e.g. function)
 * Some dynamic routes may extract parts of the string and provide them as
 * a dictionary. This router matches a string against multiple routes and
 * returns the associated object along with the extracted data.
 */
var Router = function() {
    this.init();
}

$.extend(Router.prototype, {
    init: function() {
        this.routes  = [];  // List of all installed routes
        this.named   = {};  // Cache for named routes and their format strings
        this.static  = {};  // Cache for static routes
        this.dynamic = [];  // Search structure for dynamic routes
        this.compiled = false;
    },

    /**
     * Add a route->target pair or a :class:`Route` object to the Router.
     * Return the Route object. See :class:`Route` for details.
     */
    add: function(route, target, options) {
        options = options || {};
        if (typeof route == 'string') {
            route = new Route(route, target, options.name, options.static);
        }
        var known = this.get(route);
        if (known) return known;
        this.routes.push(route);
        this.reset();
        if (options.compile) this.compile();
        return route;
    },

    /**
     * Set compiled flag to false and clean route caches
     */
    reset: function() {
        this.compiled = false;
        this.named = {};
        this.static = {};
        this.dynamic = [];
    },

    /**
     * Get a route from the router by specifying either the same
     * parameters as in :meth:`add` or comparing to an instance of
     * :class:`Route`. Note that not all parameters are considered by the
     * compare function.
     */
    get: function(route, target, options) {
        options = options || {};
        if (typeof route == 'string') {
            route = new Route(route, target, options.name, options.static);
        }
        for (var i = 0, len = this.routes.length; i < len; ++i) {
            if (route.equals(this.routes[i])) {
                return this.routes[i];
            }
        }
    },

    /**
     * Match an URI and return a (target, urlargs) tuple
     */
    match: function(uri) {
        if (uri in this.static) {
            return [this.static[uri], []];
        }
        for (var i = 0, len = this.dynamic.length; i < len; ++i) {
            match = uri.match(this.dynamic[i][0]);
            if (!match) continue;
            return [this.dynamic[i][1], match.slice(1, match.length)];
        }
        // Late check to reduce overhead on hits
        if (!this.compiled) {
            // Compile and try again.
            this.compile();
            return this.match(uri);
        }
        return [null, []];
    },

    /**
     * Build an URI out of a named route and values for the wildcards.
     */
    build: function(name, options) {
        if (name in this.named) {
            return this.format(this.named[name], options);
        } else {
            // Late check to reduce overhead on hits
            if (!this.compiled) {
                // Compile and try again.
                this.compile();
                return this.build(name, options);
            }
        }
    },

    format: function(template, options) {
        for (var key in options)
            template = template.replace('#{' + key + '}', options[key]);
        return template;
    },

    /**
     * Build the search structures. Call this before actually using the router.
     */
    compile: function() {
        this.reset();
        for (var i = 0, len = this.routes.length, route = null; i < len; ++i) {
            route = this.routes[i];
            if (route.name) {
                this.named[route.name] = route.format();
            }
            if (route.static()) {
                this.static[route.route] = route.target;
                continue;
            }
            var regexp = new RegExp('^' + route.group() + '$', 'i');
            this.dynamic.push([regexp, route.target]);
        }
        this.dynamic.reverse();
        this.compiled = true;
    },

    equals: function(router) {
        return this.routes == router.routes;
    }
});

// })(jQuery);
