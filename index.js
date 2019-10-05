/*
  EasyMam - Your Easy strategic Memoization & Throttling

  A simple Memoization & Throttling Library for use in Web UI & NodeJS environment
  It allows only one call to be made to your service at any given time
  and within your set min time

  serviceMethod is a promise or an async method that returns the result of your service when called
  window.easymam(contextName).execute(serviceMethod, options);
*/
var easymam = (function() {
  if (typeof easymam === "object") {
    throw "easymam lib already defined / included";
  }
  if (typeof $easymam === "object") {
    throw "$easymam lib already defined / included";
  }
  var hanger = {};
  var noop = function() {};
  function mergeOptions(options) {
    options = options || {};
    options.loopCond = options.loopCond || noop;
    options.callBackSuccess = options.callBackSuccess || noop;
    options.callBackErrorOnLast = options.callBackErrorOnLast || noop;
    options.callBackSuccessOnExit = options.callBackSuccessOnExit || noop;
    options.onReturnFromCache = options.onReturnFromCache || noop;
    options.allowAllInitialCallsToPass = options.allowAllInitialCallsToPass || true;
    options.minWaitBetweenCalls = options.minWaitBetweenCalls || 0;
    options.callBackOnCacheUpdated = options.callBackOnCacheUpdated|| noop;
    options.console = options.console || { log: function() {} };
    return options;
  }
  function guid() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }
  var app = function(context) {
    context = context || guid();
    return {
      newGuid:guid,
      promisify: function(f) {
        return function(){
            return new Promise(function(resolve, reject) {
              f(resolve, reject);
            });
        }
      },
      wait:async function(t) {
        return await this.promisify(function(resolve) {
          setTimeout(resolve, t);
        })();
      },
      execute: function(serviceMethod, options, force, callCount) {
        hanger.cache = hanger.cache || {};
        hanger.cache[context] = hanger.cache[context] || {};
        hanger.cache[context].lastCallAt =
          hanger.cache[context].lastCallAt || new Date();

        options = mergeOptions(options);
        callCount = callCount || 0;
        options.console.log("EASYMAM - NEW CALL RESULT : ...");
        return new Promise(async (resolve, reject) => {
          if (!serviceMethod) {
            try {
              options.callBackErrorOnLast();
            } catch (err) {}
            reject();
            return;
          }else{
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
                   options.console.log(
                     "EASYMAM - WAIT TIME OVER ! ..." + sinature
                   );
                   hanger.cache[context].lastCallAt = new Date();
                 } else {
                   options.console.log(
                     "EASYMAM -STILL WAITING FOR THE WAIT TIME TO BE OVER. SO FAR..." +
                       sinature
                   );
                 }

                 /*
                 ||
                  
                */
               var firstTime =
                 options.allowAllInitialCallsToPass &&
                 !hanger.cache[context].hasExecutedAtLeastOnce;
                 if (!firstTime &&
                  ( (!force && hanger.cache[context].inFlight) ||
                   !pastLastCallPeriod)
                 ) {
                   hanger.cache[context].hasRunAtLeastOnce = true;
                   if (hanger.cache[context].result) {
                     options.console.log(
                       "EASYMAM - RETURNING RESULT ..." + sinature
                     );
                     options.onReturnFromCache({
                       data: hanger.cache[context].result,
                       context: context,
                       inLoop: force,
                       position: callCount,
                       secondsPast: seconds,
                       pastLastCallPeriod: pastLastCallPeriod
                     });
                     options.callBackSuccess(hanger.cache[context].result);
                     hanger.cache[context].isPending = true;

                      if (options.loopCond(hanger.cache[context].result)) {
                      await easymam(context).wait(options.minWaitBetweenCalls);
                        easymam(context).execute(
                          serviceMethod,
                          options,
                          true,
                          callCount + 1
                        );
                      }
                        resolve(hanger.cache[context].result);
                     return;
                   } else {
                     options.console.log("EASYMAM - NO STORED ..." + sinature);
                     resolve(options.defaultResult);
                     return;
                   }
                 } else {
                   hanger.cache[context].hasRunAtLeastOnce = true;
                   hanger.cache[context].inFlight = true;
                   hanger.cache[context].isPending = false;
                   try {
                     options.console.log(
                       "EASYMAM - CALLING FUN ..." + sinature
                     );
                     var x = await serviceMethod();
                     hanger.cache[context].hasExecutedAtLeastOnce = true;
                     hanger.cache[context].result = x ||  hanger.cache[context].result;
                     options.callBackOnCacheUpdated(hanger.cache[context].result);
                     if (hanger.cache[context].isPending) {
                       options.console.log(
                         "EASYMAM - THERE WAS A PENDING CALL SO I WILL MAKE ONE LAST CALL ..." +
                           sinature
                       );
                     }
                     var canCallAgain =
                       hanger.cache[context].isPending || options.loopCond(x);
                     if (canCallAgain) {
                       options.console.log(
                         "EASYMAM - LOOP CONDITION MET " + callCount
                       );
                       try {
                        await easymam(context).wait(options.minWaitBetweenCalls);
                        easymam(context).execute(
                         serviceMethod,
                         options,
                         true,
                         callCount + 1
                       );
                       } catch (error) {
                         console.warn(error);
                         //TODO : SOMETIME app BECONEs not defined. not sure why yet. catching it for now
                         options.callBackSuccessOnExit(
                           hanger.cache[context].result
                         );
                         hanger.cache[context].inFlight = false;
                       }
                     } else {
                       hanger.cache[context].inFlight = false;
                       if (force) {
                         options.callBackSuccessOnExit(
                           hanger.cache[context].result
                         );
                       }
                     }
                     options.callBackSuccess(hanger.cache[context].result);
                     resolve(hanger.cache[context].result);
                     return;
                   } catch (error) {
                     hanger.cache[context].hasExecutedAtLeastOnce = true;
                     hanger.cache[context].hasFailedAtLeastOnce = true;
                     options.console.log(
                       "EASYMAM - SERVER ERROR..." + sinature
                     );
                     hanger.cache[context].inFlight = false;
                     try {
                       options.callBackErrorOnLast(error);
                     } catch (err) {}
                     reject(error);
                     return;
                   }
                 }
               }

        
        });
      }
    };
  };
  
  return app;
})();
var $easymam = function(f,opt,context){
 return easymam(context).execute(f,opt);
};
if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = easymam;
}
