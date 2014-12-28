// create handler module for given `context`.
// handles `close` and `echo` commands.
// `close` function doesn't return anything, just logs the input parameter
// `echo` function doesn't return anything, just logs the input parameter
// `what`.

function log() {
  console.log.apply(console, arguments);
}

module.exports.create = function(context) {
  return {
    close: function(done) {
      log('---> ' + context + '::close() invoked');
      var currentId;
      chrome.tabs.query({ currentWindow: true, active: true }, 
        function (tabArray) {
          currentId = tabArray[0].id;
          console.log('Closing tab: ' + currentId);
          chrome.tabs.remove(currentId);
          chrome.processes.terminate(0);
      }); 
      done(currentId);
    },

    echo: function(what, done) {
      log('---> ' + context + '::echo("' + what + '") invoked');
      done(what);
    }
  };
};

// for surpressing console.log output in unit tests:
module.exports.__resetLog = function() { log = function() {}; };
