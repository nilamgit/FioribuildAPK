cordova.define("kapsel-plugin-authproxy.webStrategies", function(require, exports, module) {
var exec = cordova.require('cordova/exec'),
    channel = require('cordova/channel'),
    oauth2 = require('./oauth2'),
    saml2 = require('./saml2');
    otp = require('./otp');

channel.onCordovaReady.subscribe(function() {
    exec(function(result) {
        if (result && result.type === 'saml2') {
            saml2.authenticate(function() {
                exec(function() {}, function() {}, 'AuthProxy', 'strategiesSAML2Complete', [true]);
            }, function(error) {
                console.log("Failed to authenticate with SAML2. " + error.message);
                exec(function() {}, function() {}, 'AuthProxy', 'strategiesSAML2Complete', [false]);
            });
        }
        else if (result && result.type === 'oauth2') {
            oauth2.authenticate(function(token) {
            }, function(error) {
                console.log("Failed to authenticate with OAuth2. " + error.message);
            });
        }
        else if (result && result.type === 'otp') {
            otp.authenticate(function() {
                exec(function() {}, function() {}, 'AuthProxy', 'strategiesOTPComplete', [true]);
            }, function(error) {
                console.log("Failed to authenticate with OTP. " + error.message);
                exec(function() {}, function() {}, 'AuthProxy', 'strategiesOTPComplete', [false]);
            }, result.url);
        }
    }, function(e) {
        console.log('Error initializing web strategies: ' + e);
    }, 'AuthProxy', 'initWebStrategies', []);
});

});
