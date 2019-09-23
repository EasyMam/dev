

QUnit.test("returning non async 2", async assert => {

  assert.ok(await $easymam(() => 8888) == 8888, "can accept non async 2");

});

QUnit.test("returning non async", async assert => {
  
  var x = await $easymam(() => {
      return 8888;
    }); 

  assert.ok(x == 8888, "can accept non async");
});

QUnit.test("Simple Calculations 1", async assert => {
  
  var x = await $easymam( async () => {
      return "Service response";
    }); 

  assert.ok(x == "Service response", "Read Me sample ran well");
});

QUnit.test("Simple Calculations 2", async assert => {
  var expected = Math.pow(4, 3);
  var x = await $easymam( async () => {
      return Math.pow(4, 3);
    });
  assert.ok(expected==x, "");
});

QUnit.test("Read Me sample ran well", async assert => {
  var x = await window.easymam("any name for your context").execute(
    async () => {
      return "Service response";
    },
    { minWaitBetweenCalls: 2000 }
  );

  console.info(x); 

  assert.ok(x == "Service response", "Read Me sample ran well");
});

QUnit.test("Single initial call", async assert => {
  var sequenceOfEvent = "";
  var options = {
    loopCond: function(x) {
      sequenceOfEvent += "4";
      return x.processing;
    },
    callBackSuccess: function() {
      sequenceOfEvent += "5";
    },
    callBackErrorOnLast: function() {
      sequenceOfEvent += "7";
    },
    callBackSuccessOnExit: function(x) {
      sequenceOfEvent += "6";
    },
    minWaitBetweenCalls: 1000
  };
  sequenceOfEvent += "1";
  var x = await window.easymam("context").execute(async () => {
    sequenceOfEvent += "2";
    await window.easymam().wait(1000);
    sequenceOfEvent += "3";
    return {
      processing: false,
      data: new Date().getTime()
    };
  }, options);

  assert.ok(
    sequenceOfEvent == "12345",
    "Correct sequence of event was executed"
  );
});

QUnit.test("Double initial call", async assert => {
  var sequenceOfEvent = "";
  var options = {
    loopCond: function(x) {
      sequenceOfEvent += "4";
      return x.processing;
    },
    callBackSuccess: function() {
      sequenceOfEvent += "5";
    },
    callBackErrorOnLast: function() {
      sequenceOfEvent += "7";
    },
    callBackSuccessOnExit: function(x) {
      sequenceOfEvent += "6";
    },
    minWaitBetweenCalls: 1000
  };
  sequenceOfEvent += "1";

  for (let index = 0; index < 2; index++) {
    var x = await window.easymam("context").execute(async () => {
      sequenceOfEvent += "2";
      await window.easymam().wait(1000);
      sequenceOfEvent += "3";
      return {
        processing: false,
        data: new Date().getTime()
      };
    }, options);
  }

  assert.ok(
    sequenceOfEvent == "123452345",
    "Correct sequence of event was executed"
  );
});

QUnit.test(" Tripple initial call timely spaced out", async assert => {
  var sequenceOfEvent = "";
  var options = {
    loopCond: function(x) {
      sequenceOfEvent += "4";
      return x.processing;
    },
    callBackSuccess: function() {
      sequenceOfEvent += "5";
    },
    callBackErrorOnLast: function() {
      sequenceOfEvent += "7";
    },
    callBackSuccessOnExit: function(x) {
      sequenceOfEvent += "6";
    },
    minWaitBetweenCalls: 1000
  };
  sequenceOfEvent += "1";

  for (let index = 0; index < 3; index++) {
    await window.easymam().wait(1000);
    var x = await window.easymam("context").execute(async () => {
      sequenceOfEvent += "2";
      await window.easymam().wait(1000);
      sequenceOfEvent += "3";
      return {
        processing: false,
        data: new Date().getTime()
      };
    }, options);
  }

  assert.ok(
    sequenceOfEvent == "1234523452345",
    "Correct sequence of event was executed"
  );
});

QUnit.test("Single initial call - service throws", async assert => {
  var sequenceOfEvent = "";
  var options = {
    loopCond: function(x) {
      sequenceOfEvent += "4";
      return x.processing;
    },
    callBackSuccess: function() {
      sequenceOfEvent += "5";
    },
    callBackErrorOnLast: function() {
      sequenceOfEvent += "7";
    },
    callBackSuccessOnExit: function(x) {
      sequenceOfEvent += "6";
    },
    minWaitBetweenCalls: 1000
  };
  sequenceOfEvent += "1";
  try {
    var x = await window.easymam("context").execute(async () => {
      sequenceOfEvent += "2";
      await window.easymam().wait(1000);
      sequenceOfEvent += "3";

      throw "server error";
    }, options);
  } catch (error) {
    sequenceOfEvent += "8";
  }

  assert.ok(
    sequenceOfEvent == "12378",
    "Correct sequence of event was executed"
  );
});
