module.exports = function( citizen ){

  citizen.request.handle = handle_request;

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
          request_id: details.id
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