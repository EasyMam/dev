(function(win) {
  win.easymam = function(serverCall, loopCond, con, force) {
       con && con.log && con.log("EASYMAM - NEW CALL RESULT : ...");
    return new Promise(function(resolve, reject) {
      if (!serverCall) {
        reject();
        return;
      }

      if (!force && win.easymam.inFlight) {
     
        if (win.easymam.result) {  
             con && con.log && con.log("EASYMAM - RETURNING STORED RESULT : ...");
          resolve(win.easymam.result);
        return;
        } else {
             con && con.log && con.log("EASYMAM - NO STORED RESULT TO RETURN ...");
        }
      }
      if (!force && win.easymam.inFlight && win.easymam.result) {
      } else {
        win.easymam.inFlight = true;
        try {
          con &&
            con.log &&
            con.log(
              "EASYMAM - LOOP CONDITION MET - CALLING SERVER IN LOOP STARTS ..."
            );
          serverCall(x => {
            win.easymam.result = x;
            
            var canCallAgain = loopCond && loopCond(x);
            if (canCallAgain) {
              win.easymam(serverCall, loopCond, con, true);
            } else {
              win.easymam.inFlight = false;
            }resolve(win.easymam.result);
            return;
          });
        } catch (error) {
          con && con.log && con.log("EASYMAM - SERVER ERROR...");
          win.easymam.inFlight = false;
          reject(error);
          return;
        }
      }
    });
  };
})(window);
