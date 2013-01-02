/* nodify-rest.js
**
** Copyright (c) 2012, Smithee, Spelvin, Agnew & Plinge, Inc.
** All rights reserved. 
**
** @license( https://github.com/nodify/nodify-rest/raw/master/LICENSE )
**/

( function () {
  var url = require( 'url' );

  module.exports = function( options, facilities ) {
    var endpoints = options.endpoints ? options.endpoints : {};
    var f = facilities ? facilities : {};

    if( options.collections ) {
      for( var i in options.collections ) {
        var foo = require( process.cwd() + '/' + options.collections[ i ] );;
        endpoints[ i ] = foo( options, f );
      }
    }

    return function( request, response, next ) {
      var params = {};

      var ic = url.parse( 'http://' + request.headers.host + request.url );
      delete ic.href;
      delete ic.protocol;

      var path = ic.pathname.split('/').slice(1);
      params.body = request.body;

      var proto = endpoints[ path[0] ];
      if( ! proto ) {
        return next( 404 );
      }

      params.path = path.slice(1);
      var instance = new proto( params );
      var method = instance[ request.method.toLowerCase() ];
      if( ! method ) {
        return next( 405 );
      }

      method.apply( instance, [ function( rv ) {
        var output;
        var headers = {};
        
        switch( typeof rv ) {
        case 'number':
          return next( rv );
        case 'object':
          output = JSON.stringify( rv );
          headers[ 'Content-Type' ] = 'application/json';
          break;
        case 'string':
          output = rv;
          headers[ 'Content-Type' ] = 'text/plain';
          break;
        default:
          return next( 500 );
        }

        headers[ 'Content-Length' ] = output.length;
        response.writeHead( 200, headers );
        response.end( output );
      } ] );
    };
  };
} ) ( );