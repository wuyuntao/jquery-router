====================
jQuery Router Plugin
====================

**jQuery Router** maps URLs to method calls with jQuery-style chaining syntax, inspired by Bottle_.

This enables history / back button support and allows methods to be called by
anchors without adding event handlers or additional code.

.. _Bottle: http://bottle.paws.de/

Include Javascripts in your page
================================

We are using `Cross-Browser split`_ to fix regex-split issues under IE, so `cbsplit.js`_ should be included before jQuery Router::

  <script type="text/javascript" src="lib/cbsplit.js"></script>
  <script type="text/javascript" src="src/jquery.router.js"></script>

.. _Cross-Browser Split: http://blog.stevenlevithan.com/archives/cross-browser-split

.. _cbsplit.js: http://github.com/wuyuntao/jquery-router/blob/master/lib/cbsplit.js

Add routes and start the router
===============================

Use the ``route()`` to add URLs to router and ``get()`` to bind handler functions to URLs.::

  $.router.route('/')
      .get(function() { alert("index"); });

  $.router.run();

Bind multiple URLs to multiple handler functions in a jQuery-style chain.::

  $.router
      .route('/book/')
          .get(function() { alert("book list"); })
          .end()
      .route('/book/:id/')
          .get(function(id) { alert("book " + id); })
          .get(function(id) { alert("anothor call on book " + id); })
          .end();

Named parameters and regexp parameters are supported just like Bottle_.

If URL is followed by a query string, e.g. ``/book/1/chapter/2/?view=landscape``, You may access the query string via ``this.params`` in the handler function::

  $.router
      .route('/book/:bid#[0-9]+#/chapter/:cid#[0-9]+#/')
          .get(function(bid, cid) {
              alert("chapter " + cid + " / book " + bid);
              alert(this.path);           // /book/1/chapter/2/
              alert(this.params.view);    // landscape
          });

Set a URL manually::

  $.router.load('/book/1/')

Demos and Testcases
===================

Clone the repo and open `demos/demos.html`_ and `tests/router.html`_ in your browser.

.. _demos/demos.html: http://github.com/wuyuntao/jquery-router/blob/master/demos/demos.html

.. _tests/router.html: http://github.com/wuyuntao/jquery-router/blob/master/tests/router.html

License
=======

**jQuery Router** is licensed under the MIT_ licenses.

.. _MIT: http://www.opensource.org/licenses/mit-license.php

Author
======

Created by `Wu Yuntao`_

.. _Wu Yuntao: http://twitter.com/wuyuntao
