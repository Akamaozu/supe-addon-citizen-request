var require_dir = require( 'require-directory' );

module.exports = function( citizen, config ){

  citizen.request = {};
  citizen.request.pending = {};

  require_dir( module, './modules', { visit: run_found_module, recursive: false });

  function run_found_module( found ){
    found( citizen );
  }
}