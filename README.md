nodify-rest
===========

Simple REST routing middleware for connect or express

The nodify-rest package provides a simple interface for routing RESTful HTTP
requests to JavaScript objects representing these resources. The package
exports a single function that takes a descriptor describing your RESTful
API and returning a middleware function suitable for use by connect or
express.

The descriptor includes a mapping between URL path fragments and JavaScript
functions you construct. When the nodify-rest middleware recieves a request, it
creates a new instance of the function mapped to the request URL path and
depending on the request's HTTP method, calls one of the following methods on
that instance: options(), get(), put(), post() or delete().

After these methods complete their processing, they return a JavaScript object
via a callback which is then serialized and returned to the caller.

The advantages of using nodify-rest include:

1. automagic URL to class mapping - you deal with functions & methods, not URLs
1. automagic error handling - generates responses for common error conditions
1. limited CORS support - takes CORS processing out of the resource logic

## Example

Here's a quick example of using nodify-rest:

<pre>  var connect = require( 'connect' );
  var rest = require( 'nodify-rest' );

  function _info( params ) {
    this.path = params.path;
  }

  _info.prototype.get = function( callback ) {
    callback( {success: true, path: this.path} );
  };

  _info.prototype.put = function( callback ) {
    callback( 500 );
  };

  var options = {
    path: "/api",
    endpoints: {
      "info": _info
    }
  };

  var server = connect();

  server.use( "/api", rest( options ) );

  server.listen( 8080 );</pre>

In this example, the options descriptor maps requests to /api/info to the
_info() function. Each GET request instantiates a new _info object and calls
the get() function. The get() function passes a JavaScript object to the
callback which serializes it and returns it to the client. This example
also demonstrates HTTP PUT calls returning a 500 status code to the client.

## Putting Endpoints in Different Source Files

Larger applications may want to put different instance constructors in
different source files. You can do this with the "collections" member of the
descriptor:

<pre>  var connect = require( 'connect' );
  var rest = require( 'nodify-rest' );

  var options = {
    path: "/api",
    collections: {
      "info": "collection_info",
      "seed": "collection_session",
      "profile": "collection_profile"
    }
  };

  var server = connect();

  server.use( "/api", rest( options ) );

  server.listen( 8080 );</pre>

In this example, we use the "collections" member of the discriptor to instruct
nodify-rest to look in the files collection_info.js, colection_session.js and
collection_profile.js for "classes" to map to the paths: /api/info, /api/seed
and /api/profile.

The example included with this package provides a more complete demonstration.

## CORS Support

If you need to support Cross-Origin Resource Sharing, add an array of
host names in the descriptor like this:

<pre>  var options = {
    path: "/api",
    collections: {
      "info": "collection_info",
      "seed": "collection_session",
      "profile": "collection_profile"
    },
    origin: [ "localhost", "helium.h.sl8.us" ]
  };</pre>

Requests to the server with these Origins will be allowed. Other requests
will fail with a 403 error. For database driven applications, you can add
a function as the origin member. The function will be called with the
request's origin and a callback. If the origin is acceptable, call the
callback, passing true as the first argument. If not, call it with a false
value:

<pre>  function _cors( origin, callback ) {
  // look in the database to see if this origin is acceptable
  if( acceptable ) {
    callback( true );
  } else {
    callback( false );
  }
}

  var options = {
    path: "/api",
    collections: {
      "info": "collection_info",
      "seed": "collection_session",
      "profile": "collection_profile"
    },
    origin: _cors
  };</pre>

## Running the Example Program

To run the example program, cd into the example directory and use this command:

<pre>  node example.js --config file://production.json</pre>

Then point your web browser at http://localhost:8080/. From there it _should_
be easy to figure out.

If you want to exercise the CORS behavior, evoke it like this:

<pre>  node example.js --config file://cors.json</pre>

Then point your web browers at http://127.0.0.1:8080/. Requests _should_ error
out. In this example, "127.0.0.1" is not a valid origin. http://localhost:8080/
will work, however, since "localhost" is in the list of approved origins. If
your machine has another host name, add it to the origin array in the
cors.json file and it _should_ allow requests from that hostname.
