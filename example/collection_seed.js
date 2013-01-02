( function () {
  var g;
  var f;

  var users = {
    'jlee': {
      password: 'supertaster',
      fullname: 'John Lee'
    },
    'tuser': {
      password: 'whatever',
      fullname: 'Test User'
    }
  };

  function _seed( params ) {
    this.path = params.path;
    this.body = params.body;
  };

  _seed.prototype.post = function ( callback ) {
    if( 0 === this.path.length ) {
      if( (! this.body.username) || ( ! users[ this.body.username ] ) ) {
        return _baduser();
      }
      if( ( ! this.body.password ) ||
          ( this.body.password !== users[ this.body.username ].password ) ) {
        return _baduser();
      }

      var seedid = Math.floor( Math.random() * 1000000 );

      f.seeds[ seedid ] = users[ this.body.username ];
      callback( { success: true, seed: '/app/seed/' + seedid } );
    } else if( 1 === this.path.length ) {
      if( ! f.seeds[ this.path[0] ] ) {
        return callback( 404 );
      }
      
      var services = {};

      if( this.body.services ) {
        for( var i = 0, il = this.body.services.length; i < il; i++ ) {
          switch( this.body.services[ i ] ) {
          case 'profile':
            var profileid = Math.floor( Math.random() * 1000000 );
            f.profiles[ profileid ] = { user: f.seeds[ this.path[0] ] };
            services[ 'profile' ] = '/app/profile/' + profileid;
            break;
          }
        }

        callback( { success: true, services: services } );

        function _baduser() {
          callback( { success: false, error: 'Bad Username or Password' } );
        }
      }
    } else {
      return callback( 404 );
    }
  };

  if( module && module.exports ) {
    module.exports = function( globals, facilities ) {
      g = globals;
      f = facilities;
      f.seeds = {};
      return _seed;
    }
  }
} ) ();