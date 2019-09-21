/**
 * Adds two numbers together
 * 
 * @param {number} first The First Number
 * @param {number} second The Second Number
 * @returns {number}
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
    force
  ) {
    con && con.log && con.log("EASYMAM - NEW CALL RESULT : ...");
    return new Promise(function(resolve, reject) {
      if (!serverCall) {
        try {
          callBackErrorOnLast();
        } catch (err) {}
        reject();
        return;
      }

      if (!force && win.easymam.inFlight) {
        if (win.easymam.result) {
          con && con.log && con.log("EASYMAM - RETURNING STORED RESULT : ...");
          callBackSuccess(win.easymam.result);
          resolve(win.easymam.result);
          return;
        } else {
          con && con.log && con.log("EASYMAM - NO STORED RESULT TO RETURN ...");
        }
      }
      if (!force && win.easymam.inFlight && win.easymam.result) {
      } else {
        win.easymam.inFlight = true;
       // setTimeout(() => {
          try {
            con && 
              con.log &&
              con.log("EASYMAM - LOOP CONDITION MET - CALLING SERVER NOW ...");
            serverCall(x => {
              win.easymam.result = x;
              var canCallAgain = loopCond && loopCond(x);
              if (canCallAgain) {
                con &&
                  con.log &&
                  con.log(
                    "EASYMAM - LOOP CONDITION MET - CALLING SERVER IN LOOP STARTS ..."
                  );
                win.easymam(
                  serverCall,
                  loopCond,
                  callBackSuccess,
                  callBackErrorOnLast,
                  callBackSuccessOnExit,
                  con,
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
            con && con.log && con.log("EASYMAM - SERVER ERROR...");
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
