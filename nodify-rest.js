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

      if( options.origin ) {
        var origin_allowed = false;
        switch( typeof options.origin ) {
        case 'string':
          origin_allowed = (options.origin === ic.hostname);
          _complete( origin_allowed );
          break;
        case 'object':
          for( var i=0, il=options.origin.length; i < il; i++ ) {
            origin_allowed = (options.origin[i] === ic.hostname);
            if( origin_allowed ) {
              break;
            }
          }
          _complete( origin_allowed );
          break;
        case 'function':
          options.origin( ic.hostname, _complete );
          break;
        }
      } else {
        _complete( true );
      }

      function _complete( allowed ) {
        var verb;

        if( ! allowed ) {
          return next( 403 );
        }

        var proto = endpoints[ path[0] ];
        if( ! proto ) {
          return next( 404 );
        }

        params.path = path.slice(1);
        var instance = new proto( params );
        verb = request.method.toLowerCase();
        var method = instance[ verb ];
        if( ! method ) {
          if( 'options' !== verb ) {
            return next( 405 );
          }
          _respond( "" );
        }

        method.apply( instance, [ _respond ] );

        function _respond( rv ) {
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

          if( options.origin ) {
            headers[ 'Access-Control-Allow-Origin' ] = 'http://' + ic.hostname;
            if( 'options' === verb ) {
              headers[ 'Access-Control-Request-Method' ] = verb;
            }
          }

          headers[ 'Content-Length' ] = output.length;
          response.writeHead( 200, headers );
          response.end( output );
        };
      };
    }
  };
} ) ( );