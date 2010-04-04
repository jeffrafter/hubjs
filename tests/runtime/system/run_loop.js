// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var binding1, binding2, first, second, third ;

module("System:run_loop() - chained binding", {
  setup: function() {
    first = hub.Object.create({ 
    output: 'first' 
  }) ;
    
  second = hub.Object.create({ 
      input: 'second',
      output: 'second',
      
      inputDidChange: function() {
        this.set("output", this.get("input")) ;
      }.observes("input") 

    }) ;
    
    third = hub.Object.create({ 
    input: "third" 
  }) ;
  }
});

test("Should propograte bindings after the RunLoop completes (using hub.RunLoop)", function() {
  hub.RunLoop.begin();
    //Binding of output of first object to input of second object
      binding1 = hub.Binding.from("output", first).to("input", second).connect() ;
      
    //Binding of output of second object to input of third object
    binding2 = hub.Binding.from("output", second).to("input", third).connect() ;
    
    hub.Binding.flushPendingChanges() ; // actually sets up the connection
    
    //Based on the above binding if you change the output of first object it should
    //change the all the variable of first,second and third object
    first.set("output", "change") ;
    
    //Changes the output of the first object
    equals(first.get("output"), "change") ;
    
    //since binding has not taken into effect the value still remains as change.
    equals(second.get("output"), "first") ;
  hub.RunLoop.end(); // allows bindings to trigger...
  
  //Value of the output variable changed to 'change'
  equals(first.get("output"), "change") ;
  
  //Since binding triggered after the end loop the value changed to 'change'.
  equals(second.get("output"), "change") ;
});

test("Should propograte bindings after the RunLoop completes (using hub.beginRunLoop)", function() {
  hub.beginRunLoop();
    //Binding of output of first object to input of second object
      binding1 = hub.Binding.from("output", first).to("input", second).connect() ;
      
    //Binding of output of second object to input of third object
    binding2 = hub.Binding.from("output", second).to("input", third).connect() ;
    
    hub.Binding.flushPendingChanges() ; // actually sets up the connection
    
    //Based on the above binding if you change the output of first object it should
    //change the all the variable of first,second and third object
    first.set("output", "change") ;
    
    //Changes the output of the first object
    equals(first.get("output"), "change") ;
    
    //since binding has not taken into effect the value still remains as change.
    equals(second.get("output"), "first") ;
  hub.endRunLoop(); // allows bindings to trigger...
  hub.Binding.flushPendingChanges() ; // actually sets up the connection
  
  //Value of the output variable changed to 'change'
  equals(first.get("output"), "change") ;
  
  //Since binding triggered after the end loop the value changed to 'change'.
  equals(second.get("output"), "change") ;
});

test("Should propograte bindings after the RunLoop completes (checking invokeOnce() function)", function() {
  hub.RunLoop.begin();
    //Binding of output of first object to input of second object
      binding1 = hub.Binding.from("output", first).to("input", second).connect() ;
      
    //Binding of output of second object to input of third object
    binding2 = hub.Binding.from("output", second).to("input", third).connect() ;
    
    hub.Binding.flushPendingChanges() ; // actually sets up the connection
    
    //Based on the above binding if you change the output of first object it should
    //change the all the variable of first,second and third object
    first.set("output", "change") ;
    
    //Changes the output of the first object
    equals(first.get("output"), "change") ;
    
    //since binding has not taken into effect the value still remains as change.
    equals(second.get("output"), "first") ;
    
    // Call the invokeOnce function to set the function which needs to be called once
    second.invokeOnce('second','inputDidChange');
    
  hub.RunLoop.end(); // allows bindings to trigger...
  
  //Value of the output variable changed to 'change'
  equals(first.get("output"), "change") ;
  
  //Since binding triggered after the end loop the value changed to 'change'.
  equals(second.get("output"), "change") ;
  
  //Set the output for the first so that the 'inputDidChange' function in the second object is called again
  first.set("output", "againChanged") ;
  
  //Value of the output variable changed to 'change'
  equals(first.get("output"), "againChanged") ;
  
  //Since the invoker function is called only once the value of output did not change.
  equals(second.get("output"), "change") ;
  
});
