var monitor = (function() {
  return {
    run: async function(opt) {
      var options = {
        loopCond: function(x) {
          return true;
        },
        callBackErrorOnLast: function() {},
        callBackSuccess: function(data) {
          opt.onSuccess && opt.onSuccess(data);
        },
        minWaitBetweenCalls: opt.interval
      };

      var handle = easymam();
      //chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security
      await handle.execute(
        handle.promisify(resolve => {
          $.get(opt.url, function(data) {
            resolve(data);
          });
        }),
        options
      );
    }
  };
})();
