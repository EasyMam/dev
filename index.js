(function(win) {
  win.EasyMam = function(serverCall, loopCond, con, force) {
    return new Promise(function(resolve, reject) {
      if (!serverCall) {
        reject();
        return;
      }
      if (!force) {
        if (win.EasyMam.inFlight) {
          con.log("RETURNING STORED RESULT : ...");
          if (win.EasyMam.result) {
            resolve(win.EasyMam.result);
            return;
          } else {
          }
        }
      }

      win.EasyMam.inFlight = true;
      try {
          serverCall(x => {
            win.EasyMam.result = x;
            resolve(win.EasyMam.result);
            if (loopCond && loopCond(x)) {
              con.log("LOOP CONDITION MET - CALLING SERVER IN LOOP STARTS ...");
              win.EasyMam(serverCall, loopCond, true);
            } else {
              win.EasyMam.inFlight = false;
            }
          });
      } catch (error) {
          con.log("SERVER ERROR...");
          reject(error);
      }
    });
  };
})(window);
