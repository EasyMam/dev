
  EasyMam - For easy strategic Memoization & Throttling
 
  A simple Memoization & Throttling Library for use in Web UI & NodeJS environment
  It allows only one call to be made to your service at any given time
  and within your set min time
 
  NOTE 1 : IT WILL GO INTO INFINITE LOOP CALL TO YOUR SERVICE IF YOUR SET LOOP CONDITION IS MET
  
  NOTE 2 : IT WILL SEND ONE LAST CALL IF WHILE IN FLIGHT, ANY NEW REQUEST WAS MADE WHOSE RESULT HAD TO BE FETCHED FROM CACHE
 
  NOTE 3: INITIALLY IT WILL RETURN DEFAULT RESULT, SO IF YOU HAVE ONE, SET IT
  
  MORE INFO
  ==========
 
  Make as much calls as you want to easymam.execute()  then it will
  1. Call your service if
           - its the first call ever
           - or there is no call to the service currently in flight
             and the last time ago you called is more than your set min wait time
 
  2. it will return from cache if
          - there is a current call to our service in flight
          - or you are still within you set min wait time
 
 
 ```
            var option = { minWaitBetweenCalls : 2000 };

            var x = await window.easymam("any name for your context")
            
            .execute(async () => {  

              return return "Service response";

            },option);

            console.info(x);
 ```