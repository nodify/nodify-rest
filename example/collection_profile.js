( function () {
  var g;
  var f;

  function _profile( params ) {
    this.path = params.path;
    this.body = params.body;
  }

  _profile.prototype.put = function ( callback ) {
    if( ( this.path.length < 1 ) || (! f.profiles[ this.path[0] ]) ){
      return callback( 404 );
    }

    if( this.body && this.body.fullname ) {
      f.profiles[ this.path[0] ].user.fullname = this.body.fullname;
    }

    if( this.body && this.body.password ) {
      f.profiles[ this.path[0] ].user.password = this.body.password;
    }

    callback( { success: true } );
  };

  _profile.prototype.get = function ( callback ) {
    if( ( this.path.length < 1 ) || (! f.profiles[ this.path[0] ]) ){
      return callback( 404 );
    }

    callback( { success: true, profile: f.profiles[ this.path[0] ] } );
  };

  if( module && module.exports ) {
    module.exports = function( globals, facilities ) {
      g = globals;
      f = facilities;
      f.profiles = {};

      return _profile;
    };
  }

} ) ();