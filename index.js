var uuid = require( 'uuid/v4' ),
    pending_requests = {};

module.exports = function( citizen, config ){
  if( 'request' in citizen ) throw new Error( 'citizen instance given already has a "request" property' );
  if( 'handle_request' in citizen ) throw new Error( 'citizen instance given already has a "handle_request" property' );

  citizen.request = create_request;
  citizen.handle_request = handle_request;

  citizen.hook.add( 'citizen-mail', 'detect-citizen-request', function( envelope, handle_mail ){
    if( ! envelope.msg.hasOwnProperty( 'type' ) ) return;
    if( ! envelope.msg.type !== 'request' ) return;

    if( ! envelope.msg.hasOwnProperty( 'request' ) ) return;
    if( ! envelope.msg.hasOwnProperty( 'id' ) ) return;

    citizen.hook.run( 'citizen-request', envelope, handle_mail );

    citizen.hook.end(); // end citizen-mail:detect-citizen-request
  });

  function create_request( citizen, name, data, callback ){
    if( arguments.length == 3 ){
      callback = data;
      data = {};
    }

    if( ! citizen ) throw new Error( 'citizen to make request to not specified' );
    if( ! name ) throw new Error( 'request name not specified' );
    if( ! callback ) throw new Error( 'request callback not specified' );

    if( typeof citizen != 'string' ) throw new Error( 'citizen name must be a string' );
    if( typeof name != 'string' ) throw new Error( 'request name must be a string' );
    if( typeof callback != 'function' ) throw new Error( 'request callback must be a function' );

    var request_id = uuid();

    while( pending_requests.hasOwnProperty( request_id ) ){
      request_id = uuid();
    }

    pending_requests[ request_id ] = callback;

    citizen.mail.send({ to: citizen }, {
      type: 'request',
      id: request_id,
      request: name,
      data: data
    });
  }

  function handle_request( name, handler ){
    if( ! name ) throw new Error( 'request name not specified' );
    if( ! handler ) throw new Error( 'request handler not specified' );

    if( typeof name != 'string' ) throw new Error( 'request name must be a string' );
    if( typeof handler != 'function' ) throw new Error( 'request handler must be a function' );

    citizen.hook.add( 'citizen-request', 'handle-'+ name +'-requests', function( envelope, handle_request ){
      var details = envelope.msg;
      if( details.request != name ) return;

      var ack = handle_request();

      handler( envelope, end_request_handling );

      citizen.hook.end();

      function end_request_handling( error, data ){
        var response = {
          requester: envelope.from,
          request: details.request,
          id: details.id
        };

        if( error ){
          response.success = false;
          response.error = error.message || error;
        }

        else {
          response.success = true;
          response.data = data;
        }

        citizen.noticeboard.notify( citizen.get_name() +'-request-response', response );
        ack();
      }
    });
  }
}