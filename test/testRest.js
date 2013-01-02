var rest = require( '../nodify-rest.js' );
var status;
var headers;
var data;
var assert = require( 'assert' );

var response = {
  writeHead: function( s, h ) {
    status = s;
    headers = h;
  },
  end: function( d ) {
    data = JSON.parse( d );
  }
};

function _info( params ) {
  this.path = params.path;
}

_info.prototype.get = function( callback ) {
  callback( {success: true} );
};

var test_model = {};

function _test ( params ) {
  this.path = params.path;
  this.body = params.body;
}

_test.prototype.options = function( callback ) {
  callback( { success: true, info: '/info' } );
};

_test.prototype.post = function( callback ) {
  var id = Math.floor( Math.random( 1 ) * 1000 );
  test_model[ id ] = { info: this.body.info };
  callback( { success: true, id: '/test/' + id } );
};

_test.prototype.get = function( callback ) {
  if( this.path.length < 1 ) {
    return callback( 404 );
  }

  var current = test_model[ this.path[0] ];
  if( ! current ) {
    return callback( 404 );
  }

  callback( { success: true, info: current.info } );
};

_test.prototype.put = function( callback ) {
  if( this.path.length < 1 ) {
    return callback( 404 );
  }

  var current = test_model[ this.path[0] ];
  if( ! current ) {
    return callback( 404 );
  }

  current.info = this.body.info;

  callback( { success: true } );
};

_test.prototype.delete = function( callback ) {
  if( this.path.length < 1 ) {
    return callback( 404 );
  }

  var current = test_model[ this.path[0] ];
  if( ! current ) {
    return callback( 404 );
  }

  delete test_model[ this.path[0] ];

  callback( { success: true } );
};

var options_01 = {
  endpoints: {
    info: _info,
    test: _test
  }
};

var func_01 = rest( options_01 );
var request_01 = { headers: { host: 'localhost:8080' }, url: '/info', method: 'GET' };

func_01( request_01, response, function( err ) {
  assert.fail( null, null, "fail: " + err.toString() );
} );

assert.equal( 200, status );
assert.equal( 'application/json', headers[ 'Content-Type' ] );
assert.equal( 16, headers[ 'Content-Length' ] );
assert.equal( true, data.success );

var request_02 = { headers: { host: 'localhost:8080' }, url: '/test', method: 'OPTIONS' };
func_01( request_02, response, function( err ) {
  assert.fail( null, null, "fail: " + err.toString() );
} );

assert.equal( 200, status );
assert.equal( 'application/json', headers[ 'Content-Type' ] );
assert.equal( 31, headers[ 'Content-Length' ] );
assert.equal( true, data.success );

request_02.method = 'POST';
request_02.body = { info: 'whatever' };
func_01( request_02, response, function( err ) {
  assert.fail( null, null, "fail: " + err.toString() );
} );
assert.equal( 200, status );
assert.equal( 'application/json', headers[ 'Content-Type' ] );
assert.equal( true, data.success );

request_02.url = data.id;
request_02.method = 'GET';
delete request_02.body;
func_01( request_02, response, function( err ) {
  assert.fail( null, null, "fail: " + err.toString() );
} );
assert.equal( 200, status );
assert.equal( 'application/json', headers[ 'Content-Type' ] );
assert.equal( true, data.success );
assert.equal( 'whatever', data.info );

request_02.method = 'PUT';
request_02.body = { info: 'dingo' };
func_01( request_02, response, function( err ) {
  assert.fail( null, null, "fail: " + err.toString() );
} );
assert.equal( 200, status );
assert.equal( 'application/json', headers[ 'Content-Type' ] );
assert.equal( 16, headers[ 'Content-Length' ] );
assert.equal( true, data.success );

request_02.method = 'DELETE';
delete request_02.body;
func_01( request_02, response, function( err ) {
  assert.fail( null, null, "fail: " + err.toString() );
} );
assert.equal( 200, status );
assert.equal( 'application/json', headers[ 'Content-Type' ] );
assert.equal( 16, headers[ 'Content-Length' ] );
assert.equal( true, data.success );
