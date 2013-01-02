( function() {
  var g;
  var f;

  var info;

  function _info() {
  }

  _info.prototype.get = function( callback ) {
    console.log( callback.toString() );
    callback( info );
  };

  if( module && module.exports ) {
    module.exports = function( globals, facilities ) {
      g = globals;
      f = facilities;

      info  = {
        success: true,
        login: '/seed'
      };

      for( var i in g.info ) {
        info[ i ] = g.info[ i ];
      }

      return _info;
    }
  }
} ) ();
