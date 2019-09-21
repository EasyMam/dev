/**
 * 
 *
 * @param {number} first The First Number
 * @param {number} second The Second Number
 * @returns {number}
 */

 /*
 var a = new Date();
alert("Wait a few seconds, then click OK");

var b = new Date();
var difference = (b - a) / 1000;

alert("You waited: " + difference + " seconds");
 */


(function(win) {
  win.easymam = function(
    serverCall,
    loopCond,
    callBackSuccess,
    callBackErrorOnLast,
    callBackSuccessOnExit,
    minWaitMillisecondsBetweenCalls,
    con,
    force,
    callCount
  ) {
      callCount = callCount||0;
    con && con.log && con.log("EASYMAM - NEW CALL RESULT : ...");
    return new Promise(function(resolve, reject) {
      if (!serverCall) {
        try {
          callBackErrorOnLast();
        } catch (err) {}
        reject();
        return;
      }
win.easymam.lastCallAt = win.easymam.lastCallAt ||new Date();

var seconds = (new Date() - win.easymam.lastCallAt) ;

var pastLastCallPeriod = seconds > minWaitMillisecondsBetweenCalls;
if(pastLastCallPeriod){
    win.easymam.lastCallAt = new Date();
}
  if (!force && win.easymam.inFlight ) {
    if (win.easymam.result) {
      con &&
        con.log &&
        con.log("EASYMAM - RETURNING STORED RESULT : ..." + callCount);
      callBackSuccess(win.easymam.result);
      resolve(win.easymam.result);
      return;
    } else {
      con &&
        con.log &&
        con.log("EASYMAM - NO STORED RESULT TO RETURN ..." + callCount);
    }
  }
      if (!force && win.easymam.inFlight && win.easymam.result) {
      } else {
           
        win.easymam.inFlight = true;
        // setTimeout(() => {
        try {
          con &&
            con.log &&
            con.log(
              "EASYMAM - LOOP CONDITION MET - CALLING SERVER NOW ..." +
                callCount
            );
          serverCall(x => {
            win.easymam.result = x;
            var canCallAgain = loopCond && loopCond(x);
            if (canCallAgain) {
              con &&
                con.log &&
                con.log(
                  "EASYMAM - LOOP CONDITION MET - CALLING SERVER IN LOOP STARTS ..."+callCount
                );
              win.easymam(
                serverCall,
                loopCond,
                callBackSuccess,
                callBackErrorOnLast,
                callBackSuccessOnExit,
                minWaitMillisecondsBetweenCalls,
                con,
callCount+1,
                true
              );
            } else {
              win.easymam.inFlight = false;
              if (force) {
                callBackSuccessOnExit(win.easymam.result);
              }
            }
            callBackSuccess(win.easymam.result);

            resolve(win.easymam.result);
            return;
          });
        } catch (error) {
          con && con.log && con.log("EASYMAM - SERVER ERROR..." + callCount);
          win.easymam.inFlight = false;

          try {
            callBackErrorOnLast(error);
          } catch (err) {}
          reject(error);
          return;
        }
        //}, minWaitMillisecondsBetweenCalls || 0);
      }
    });
  };
})(window);
