/* example.js
**
** Copyright (c) 2012, Smithee, Spelvin, Agnew & Plinge, Inc.
** All rights reserved. 
**
** @license( https://github.com/nodify/nodify-rest/raw/master/LICENSE )
**
**/

try {
  var connect   = require( 'connect' );
  var props     = require( 'node-props' );
  var fs        = require( 'fs' );
  var path      = require( 'path' );
  var rest      = require( '../nodify-rest' );
} catch( e ) {
  console.log( 'Before running this example, load prerequsite packages with the command:' );
  console.log( '  npm install node-props connect' );
  process.exit(1);
}

var _aopts = {
  flags: "a+",
  encoding: "UTF-8",
  mode: 0666
};

var g;
var app;
var statii = {
  403: "Forbidden",
  404: "Not Found",
  500: "Internal Server Error"
};

props.read( function( properties ) {
  g = properties;

  app = connect();

  if( g.favicon ) {
    app.use( connect.favicon( g.favicon.path ) );
  }

  if( g.access ) {
    if( g.access.path ) {
      g.access.stream = fs.createWriteStream( g.access.path, _aopts );
    }
    app.use( connect.logger( g.access ) );
  }

  if( g.body ) {
    app.use( connect.bodyParser() );
  }

  if( g.static && g.static.path ) {
    app.use( connect.static( g.static.path, g.static ) );
  }

  if( g.rest ) {
    app.use( g.rest.path, rest( g.rest ) );
  }
  
  app.use( function( error, request, response, next ) {
    var output;

    if( statii[ error ] ) {
      output = statii[ error ];
    } else {
      output = String( error );
      error = 500;
    }

    response.writeHead( error, {
      'Content-Type': 'text/plain',
      'Content-Length': output.length
    } );
    response.end( output );
  } );

  if( g.listen && g.listen.port ) {
    app.listen( g.listen.port, g.listen.host );
  }
} );
