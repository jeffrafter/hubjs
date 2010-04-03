// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

hub.needRunLoop = true ; // default FIXME: why is this here?

/**
  The run loop provides a universal system for coordinating events within
  your application.  The run loop processes timers as well as pending 
  observer notifications within your application.
  
  To use a RunLoop within your application, you should make sure your event
  handlers always begin and end with hub.RunLoop.begin() and hub.RunLoop.end()
  
  The RunLoop is important because bindings do not fire until the end of 
  your run loop is reached.  This improves the performance of your
  application.
  
  h2. Example
  
  This is how you could write your mouseup handler in jQuery:
  
  {{{
    $('#okButton').on('click', function() {
      hub.RunLoop.begin();
      
      // handle click event...
      
      hub.RunLoop.end(); // allows bindings to trigger...
    });
  }}}
  
  @class
  @extends hub.Object
*/
hub.RunLoop = hub.Object.extend(/** @scope hub.RunLoop.prototype */ {
  
  /**
    Call this method whenver you begin executing code.  
    
    This is typically invoked automatically for you from event handlers and 
    the timeout handler.  If you call setTimeout() or setInterval() yourself, 
    you may need to invoke this yourself.
    
    @returns {hub.RunLoop} receiver
  */
  beginRunLoop: function() {
    this._hub_start = new Date().getTime() ; // can't use Date.now() in runtime
    if (hub.LOG_BINDINGS || hub.LOG_OBSERVERS) {
      hub.debug("-> hub.RunLoop.beginRunLoop at %@".fmt(this._hub_start));
    } 
    hub.needRunLoop = false ;
    return this ; 
  },
  
  /**
    Call this method whenever you are done executing code.
    
    This is typically invoked automatically for you from event handlers and
    the timeout handler.  If you call setTimeout() or setInterval() yourself
    you may need to invoke this yourself.
    
    @returns {hub.RunLoop} receiver
  */
  endRunLoop: function() {
    // at the end of a runloop, flush all the delayed actions we may have 
    // stored up.  Note that if any of these queues actually run, we will 
    // step through all of them again.  This way any changes get flushed
    // out completely.
    var didChange ;

    if (hub.LOG_BINDINGS || hub.LOG_OBSERVERS) {
      hub.debug("-- hub.RunLoop.endRunLoop ~ flushing application queues");
    } 
    
    do {
      didChange = this.flushApplicationQueues() ;
      if (!didChange) didChange = this._hub_flushinvokeLastQueue() ; 
    } while(didChange) ;
    this._hub_start = null ;

    if (hub.LOG_BINDINGS || hub.LOG_OBSERVERS) {
      hub.debug("<- hub.RunLoop.endRunLoop ~ End");
    }
    hub.needRunLoop = true ;
    
    return this ; 
  },
  
  /**
    Invokes the passed target/method pair once at the end of the runloop.
    You can call this method as many times as you like and the method will
    only be invoked once.  
    
    Usually you will not call this method directly but use invokeOnce() 
    defined on hub.Object.
    
    @param {Object} target
    @param {Function} method
    @returns {hub.RunLoop} receiver
  */
  invokeOnce: function(target, method) {
    // normalize
    if (method === undefined) { 
      method = target; target = this ;
    }
    if (hub.typeOf(method) === hub.T_STRING) method = target[method];
    if (!this._hub_invokeQueue) this._hub_invokeQueue = hub.ObserverSet.create();
    this._hub_invokeQueue.add(target, method);
    return this ;
  },
  
  /**
    Invokes the passed target/method pair at the very end of the run loop,
    once all other delayed invoke queues have been flushed.  Use this to 
    schedule cleanup methods at the end of the run loop once all other work
    (including rendering) has finished.

    If you call this with the same target/method pair multiple times it will
    only invoke the pair only once at the end of the runloop.
    
    Usually you will not call this method directly but use invokeLast() 
    defined on hub.Object.
    
    @param {Object} target
    @param {Function} method
    @returns {hub.RunLoop} receiver
  */
  invokeLast: function(target, method) {
    // normalize
    if (method === undefined) { 
      method = target; target = this ;
    }
    if (hub.typeOf(method) === hub.T_STRING) method = target[method];
    if (!this._hub_invokeLastQueue) this._hub_invokeLastQueue = hub.ObserverSet.create();
    this._hub_invokeLastQueue.add(target, method);
    return this ;
  },
  
  /**
    Executes any pending events at the end of the run loop.  This method is 
    called automatically at the end of a run loop to flush any pending 
    queue changes.
    
    The default method will invoke any one time methods and then sync any 
    bindings that might have changed.  You can override this method in a 
    subclass if you like to handle additional cleanup. 
    
    This method must return true if it found any items pending in its queues
    to take action on.  endRunLoop will invoke this method repeatedly until
    the method returns NO.  This way if any if your final executing code
    causes additional queues to trigger, then can be flushed again.
    
    @returns {Boolean} true if items were found in any queue, false otherwise
  */
  flushApplicationQueues: function() {
    var hadContent = false ;
    
    // execute any methods in the invokeQueue.
    var queue = this._hub_invokeQueue;
    if (queue && queue.targets > 0) {
      this._hub_invokeQueue = null; // reset so that a new queue will be created
      hadContent = true ; // needs to execute again
      queue.invokeMethods();
    }
    
    // flush any pending changed bindings.  This could actually trigger a 
    // lot of code to execute.
    return hub.Binding.flushPendingChanges() || hadContent ;
  },
  
  _hub_flushinvokeLastQueue: function() {
    var queue = this._hub_invokeLastQueue, hadContent = false ;
    if (queue && queue.targets > 0) {
      this._hub_invokeLastQueue = null; // reset queue.
      hadContent = true; // has targets!
      if (hadContent) queue.invokeMethods();
    }
    return hadContent ;
  }
  
});

/** 
  The current run loop.  This is created automatically the first time you
  call begin(). 
  
  @property {hub.RunLoop}
*/
hub.RunLoop.currentRunLoop = null;

/**
  The default RunLoop class.  If you choose to extend the RunLoop, you can
  set this property to make sure your class is used instead.
  
  @property {Class}
*/
hub.RunLoop.runLoopClass = hub.RunLoop;

/** 
  Begins a new run loop on the currentRunLoop.  If you are already in a 
  runloop, this method has no effect.
  
  @returns {hub.RunLoop} receiver
*/
hub.RunLoop.begin = function() {    
  var runLoop = this.currentRunLoop;
  if (!runLoop) runLoop = this.currentRunLoop = this.runLoopClass.create();
  runLoop.beginRunLoop();
  return this ;
};

/**
  Ends the run loop on the currentRunLoop.  This will deliver any final 
  pending notifications and schedule any additional necessary cleanup.
  
  @returns {hub.RunLoop} receiver
*/
hub.RunLoop.end = function() {
  var runLoop = this.currentRunLoop;
  if (!runLoop) {
    throw "hub.RunLoop.end() called outside of a runloop!";
  }
  runLoop.endRunLoop();
  return this ;
} ;

/**
  Helper method executes the passed function inside of a runloop.  Normally
  not needed but useful for testing.
  
  @param {Function} callback callback to execute
  @param {Object} target context for callback
  @returns {hub} receiver
*/
hub.run = function(callback, target) {
  hub.RunLoop.begin();
  callback.call(target);
  hub.RunLoop.end();
};
