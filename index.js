(function(win) {
  win.easymam = function(serverCall, loopCond, con, force) {
    return new Promise(function(resolve, reject) {
      if (!serverCall) {
        reject();
        return;
      }
      if (!force) {
        if (win.easymam.inFlight) {
          con && con.log && con.log("RETURNING STORED RESULT : ...");
          if (win.easymam.result) {
            resolve(win.easymam.result);
            return;
          } else {
          }
        }
      }

      win.easymam.inFlight = true;
      try {
        serverCall(x => {
          win.easymam.result = x;
          resolve(win.easymam.result);
          if (loopCond && loopCond(x)) {
            con &&
              con.log &&
              con.log("LOOP CONDITION MET - CALLING SERVER IN LOOP STARTS ...");
            win.easymam(serverCall, loopCond, con, true);
          } else {
            win.easymam.inFlight = false;
          }
        });
      } catch (error) {
        con && con.log && con.log("SERVER ERROR...");
        reject(error);
      }
    });
  };
})(window);
