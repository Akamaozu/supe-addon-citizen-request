module.exports = function( citizen ){

  citizen.hook.add( 'citizen-mail', 'detect-citizen-request', function( envelope, handle_mail ){
    if( ! envelope.msg.hasOwnProperty( 'type' ) ) return;
    if( envelope.msg.type !== 'request' ) return;

    if( ! envelope.msg.hasOwnProperty( 'request' ) ) return;
    if( ! envelope.msg.hasOwnProperty( 'id' ) ) return;

    citizen.hook.run( 'citizen-request', envelope, handle_mail );

    citizen.hook.end(); // end citizen-mail:detect-citizen-request
  });
}