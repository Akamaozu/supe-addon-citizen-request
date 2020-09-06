module.exports = function( citizen ){

  citizen.request.ignore = ignore_request;

  function ignore_request( name ){
     citizen.hook.delete( 'citizen-request', 'handle-'+ name +'-requests' );
  }
}