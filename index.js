/**
 * EasyMam - Your Easy strategic Memoization & Throttling
 *
 * A simple Memoization & Throttling Library for use in Web UI & NodeJS environment
 * It allows only one call to be made to your service at any given time
 * and within your set min time
 *
 * NOTE 1 : IT WILL GO INTO INFINITE LOOP CALL TO YOUR SERVICE IF YOUR SET LOOP CONDITION IS MET
 * 
 * NOTE 2 : IT WILL SEND ONE LAST CALL IF WHILE IN FLIGHT, ANY NEW REQUEST WAS MADE WHOSE RESULT HAD TO BE FETCHED FROM CACHE
 *
 * NOTE 3: INITIALLY IT WILL RETURN DEFAULT RESULT, SO IF YOU HAVE ONE, SET IT
 * 
 * MORE INFO
 * ==========
 *
 * Make as much calls as you want to easymam.execute()  then it will
 * 1. Call your service if
 *          - its the first call ever
 *          - or there is no call to the service currently in flight
 *            and the last time ago you called is more than your set min wait time
 *
 * 2. it will return from cache if
 *         - there is a current call to our service in flight
 *         - or you are still within you set min wait time
 *
 */

var easymam = (function() {
  if (typeof easymam === "object") {
    throw "easymam lib already defined / included";
  }
  var hanger = {};
  var noop = function() {};
  function mergeOptions(options) {
    options = options || {};
    options.loopCond = options.loopCond || noop;
    options.callBackSuccess = options.callBackSuccess || noop;
    options.callBackErrorOnLast = options.callBackErrorOnLast || noop;
    options.callBackSuccessOnExit = options.callBackSuccessOnExit || noop;
    options.minWaitBetweenCalls = options.minWaitBetweenCalls || noop;
    options.console = options.console || { log: function() {} };
    return options;
  }
  var app = function(context) {
    context = context || "main";
    return {
      execute: function(serverCall, options, force, callCount) {
        hanger.cache = hanger.cache || {};
        hanger.cache[context] = hanger.cache[context] || {};
        hanger.cache[context].lastCallAt =
          hanger.cache[context].lastCallAt || new Date();

        options = mergeOptions(options);
        callCount = callCount || 0;
        options.console.log("EASYMAM - NEW CALL RESULT : ...");
        return new Promise(function(resolve, reject) {
          if (!serverCall) {
            try {
              options.callBackErrorOnLast();
            } catch (err) {}
            reject();
            return;
          }

          var seconds = new Date() - hanger.cache[context].lastCallAt;
          var pastLastCallPeriod =
            !hanger.cache[context].hasRunAtLeastOnce ||
            seconds > options.minWaitBetweenCalls;

          var sinature =
            "CONTEXT : " +
            context +
            " - FORCE :" +
            force +
            " - CALL COUNT :" +
            callCount +
            " - LAST RUN AGO(ms): " +
            seconds +
            " - PASSED WAIT TIME : " +
            pastLastCallPeriod;

          if (pastLastCallPeriod) {
            options.console.log("EASYMAM - WAIT TIME OVER ! ..." + sinature);
            hanger.cache[context].lastCallAt = new Date();
          } else {
            options.console.log(
              "EASYMAM -STILL WAITING FOR THE WAIT TIME TO BE OVER. SO FAR..." +
                sinature
            );
          }
          hanger.cache[context].hasRunAtLeastOnce = true;
        //   if (
        //     (!force && hanger.cache[context].inFlight) ||
        //     !pastLastCallPeriod
        //   ) {
            
        //   }
          if (
            (!force &&
              hanger.cache[context].inFlight) ||
            !pastLastCallPeriod
          ) {

            if (hanger.cache[context].result) {
              options.console.log("EASYMAM - RETURNING RESULT ..." + sinature);
              options.callBackSuccess(hanger.cache[context].result);
              hanger.cache[context].isPending = true;
              resolve(hanger.cache[context].result);
              return;
            } else {
              options.console.log("EASYMAM - NO STORED ..." + sinature);
              resolve(options.defaultResult);
              return;
            }
          } else {
            hanger.cache[context].inFlight = true;
            hanger.cache[context].isPending = false;
            try {
              options.console.log("EASYMAM - CALLING FUN ..." + sinature);
              serverCall(x => {
                hanger.cache[context].result = x;
                if (hanger.cache[context].isPending){
                     options.console.log(
                       "EASYMAM - THERE WAS A PENDING CALL SO I WILL MAKE ONE LAST CALL ..." + sinature
                     );
                }
                  var canCallAgain =
                    hanger.cache[context].isPending || options.loopCond(x);
                if (canCallAgain) {
                  options.console.log(
                    "EASYMAM - LOOP CONDITION MET " + callCount
                  );
                  try {
                    app[context].execute(
                      serverCall,
                      options,
                      callCount + 1,
                      true
                    );
                  } catch (error) {
                    //TODO : SOMETIME app BECONEs not defined. not sure why yet. catching it for now
                    options.callBackSuccessOnExit(hanger.cache[context].result);                    
                    hanger.cache[context].inFlight = false;
                  }
                } else {
                  hanger.cache[context].inFlight = false;
                  if (force) {
                    options.callBackSuccessOnExit(hanger.cache[context].result);
                  }
                }
                options.callBackSuccess(hanger.cache[context].result);
                resolve(hanger.cache[context].result);
                return;
              });
            } catch (error) {
              options.console.log("EASYMAM - SERVER ERROR..." + sinature);
              hanger.cache[context].inFlight = false;
              try {
                options.callBackErrorOnLast(error);
              } catch (err) {}
              reject(error);
              return;
            }
            //}, options.minWaitBetweenCalls || 0);
          }
        });
      }
    };
  };
  return app;
})();
if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = { easymam: easymam };
}
