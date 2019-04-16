module.exports = function( citizen ){

  citizen.noticeboard.watch( citizen.get_name() + '-request-response', 'handle-response', function( msg ){
    var response = msg.notice,
        request_id = response.request_id;

    if( ! citizen.request.pending.hasOwnProperty( request_id ) ) {
      console.log({
        action: 'ignore-request-response',
        reason: 'request id not found',
        response: response
      });

      return;
    }

    var request_callback = citizen.request.pending[ request_id ];

    if( ! response.success ){
      var error_message = response.error || 'unspecified error';
      request_callback( new Error( error_message ) );
    }

    else request_callback( null, response.data );

    delete citizen.request.pending[ request_id ];
  });
}