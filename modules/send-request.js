var uuid = require('uuid/v4');

module.exports = function( citizen ){

  citizen.request.send = send_request;

  function send_request( to, type, data, callback ){
    if( arguments.length == 3 ){
      callback = data;
      data = {};
    }

    if( ! to ) throw new Error( 'citizen to make request to not specified' );
    if( ! type ) throw new Error( 'request type not specified' );
    if( ! callback ) throw new Error( 'request callback not specified' );

    if( typeof to != 'string' ) throw new Error( 'citizen name must be a string' );
    if( typeof type != 'string' ) throw new Error( 'request type must be a string' );
    if( typeof callback != 'function' ) throw new Error( 'request callback must be a function' );

    var request_id = uuid();

    while( citizen.request.pending.hasOwnProperty( request_id ) ){
      request_id = uuid();
    }

    citizen.request.pending[ request_id ] = callback;

    citizen.mail.send({ to: to }, {
      type: 'request',
      id: request_id,
      request: type,
      data: data
    });
  }
}