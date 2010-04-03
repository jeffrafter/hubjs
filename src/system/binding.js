// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  Debug parameter you can turn on.  This will log all bindings that fire to
  the console.  This should be disabled in production code.  Note that you
  can also enable this from the console or temporarily.
  
  @property {Boolean}
*/
hub.LOG_BINDINGS = false ;

/**
  Performance paramter.  This will benchmark the time spent firing each 
  binding.
  
  @property {Boolean}
*/
hub.BENCHMARK_BINDING_NOTIFICATIONS = false ;

/**
  Performance parameter.  This will benchmark the time spend configuring each
  binding.  
  
  @property {Boolean}
*/
hub.BENCHMARK_BINDING_SETUP = false;
  
/** 
  Default placeholder for multiple values in bindings.
  
  @property {String}
*/
hub.MULTIPLE_PLACEHOLDER = '@@MULT@@' ;

/**
  Default placeholder for null values in bindings.
  
  @property {String}
*/
hub.NULL_PLACEHOLDER = '@@NULL@@' ;

/**
  Default placeholder for empty values in bindings.
  
  @property {String}
*/
hub.EMPTY_PLACEHOLDER = '@@EMPTY@@' ;


/**
  A binding simply connects the properties of two objects so that whenever the
  value of one property changes, the other property will be changed also.  You
  do not usually work with Binding objects directly but instead describe
  bindings in your class definition using something like:
  
  {{{
    valueBinding: "MyApp.someController.title"
  }}}
    
  This will create a binding from "MyApp.someController.title" to the "value"
  property of your object instance automatically.  Now the two values will be
  kept in sync.
  
  h2. Customizing Your Bindings
  
  In addition to synchronizing values, bindings can also perform some basic 
  transforms on values.  These transforms can help to make sure the data fed 
  into one object always meets the expectations of that object regardless of
  what the other object outputs.
  
  To customize a binding, you can use one of the many helper methods defined 
  on hub.Binding like so:
  
  {{{
    valueBinding: hub.Binding.single("MyApp.someController.title") 
  }}}
    
  This will create a binding just like the example above, except that now the
  binding will convert the value of MyApp.someController.title to a single 
  object (removing any arrays) before applying it to the "value" property of
  your object.
  
  You can also chain helper methods to build custom bindings like so:
  
  {{{
    valueBinding: hub.Binding.single("MyApp.someController.title").notEmpty("(EMPTY)")
  }}}
    
  This will force the value of MyApp.someController.title to be a single value
  and then check to see if the value is "empty" (null, undefined, empty array,
  or an empty string).  If it is empty, the value will be set to the string 
  "(EMPTY)".
  
  h2. One Way Bindings
  
  One especially useful binding customization you can use is the oneWay() 
  helper.  This helper tells hub.js that you are only interested in receiving 
  changes on the object you are binding from.  For example, if you are binding 
  to a preference and you want to be notified if the preference has changed, 
  but your object will not be changing the preference itself, you could do:
  
  {{{
    bigTitlesBinding: hub.Binding.oneWay("MyApp.preferencesController.bigTitles")
  }}}
    
  This way if the value of MyApp.preferencesController.bigTitles changes the
  "bigTitles" property of your object will change also.  However, if you 
  change the value of your "bigTitles" property, it will not update the 
  preferencesController.
  
  One way bindings are almost twice as fast to setup and twice as fast to 
  execute because the binding only has to worry about changes to one side.
  
  You should consider using one way bindings anytime you have an object that 
  may be created frequently and you do not intend to change a property; only 
  to monitor it for changes. (such as in the example above).
      
  h2. Adding Custom Transforms
  
  In addition to using the standard helpers provided by hub.js, you can also 
  define your own custom transform functions which will be used to convert the 
  value.  To do this, just define your transform function and add it to the 
  binding with the transform() helper.  The following example will not allow 
  Integers less than ten.  Note that it checks the value of the bindings and 
  allows all other values to pass:
  
  {{{
    valueBinding: hub.Binding.transform(function(value, binding) {
      return ((hub.typeOf(value) === hub.T_NUMBER) && (value < 10)) ? 10 : value;      
    }).from("MyApp.someController.value")
  }}}
  
  If you would like to instead use this transform on a number of bindings,
  you can also optionally add your own helper method to hub.Binding.  This
  method should simply return the value of this.transform(). The example 
  below adds a new helper called notLessThan() which will limit the value to
  be not less than the passed minimum:
  
  {{{
    hub.Binding.notLessThan = function(minValue) {
      return this.transform(function(value, binding) {
        return ((hub.typeOf(value) === hub.T_NUMBER) && (value < minValue)) ? minValue : value ;
      }) ;
    } ;
  }}}
  
  You could specify this in your core.js file, for example.  Then anywhere in 
  your application you can use it to define bindings like so:
  
  {{{
    valueBinding: hub.Binding.from("MyApp.someController.value").notLessThan(10)
  }}}
  
  Also, remember that helpers are chained so you can use your helper along with
  any other helpers.  The example below will create a one way binding that 
  does not allow empty values or values less than 10:
  
  {{{
    valueBinding: hub.Binding.oneWay("MyApp.someController.value").notEmpty().notLessThan(10)
  }}}
  
  Note that the built in helper methods all allow you to pass a "from" 
  property path so you don't have to use the from() helper to set the path.  
  You can do the same thing with your own helper methods if you like, but it 
  is not required.
  
  h2. Creating Custom Binding Templates
  
  Another way you can customize bindings is to create a binding template.  A
  template is simply a binding that is already partially or completely 
  configured.  You can specify this template anywhere in your app and then use 
  it instead of designating your own custom bindings.  This is a bit faster on
  app startup but it is mostly useful in making your code less verbose.
  
  For example, let's say you will be frequently creating one way, not empty 
  bindings that allow values greater than 10 throughout your app.  You could
  create a binding template in your core.js like this:
  
  {{{
    MyApp.LimitBinding = hub.Binding.oneWay().notEmpty().notLessThan(10);
  }}}
  
  Then anywhere you want to use this binding, just refer to the template like 
  so:

  {{{
    valueBinding: MyApp.LimitBinding.beget("MyApp.someController.value")
  }}}
    
  Note that when you use binding templates, it is very important that you 
  always start by using beget() to extend the template.  If you do not do 
  this, you will end up using the same binding instance throughout your app 
  which will lead to erratic behavior.
  
  h2. How to Manually Activate a Binding

  All of the examples above show you how to configure a custom binding, but 
  the result of these customizations will be a binding template, not a fully 
  active binding.  The binding will actually become active only when you 
  instantiate the object the binding belongs to.  It is useful however, to 
  understand what actually happens when the binding is activated.
  
  For a binding to function it must have at least a "from" property and a "to"
  property.  The from property path points to the object/key that you want to
  bind from while the to path points to the object/key you want to bind to.  
  
  When you define a custom binding, you are usually describing the property 
  you want to bind from (such as "MyApp.someController.value" in the examples
  above).  When your object is created, it will automatically assign the value
  you want to bind "to" based on the name of your binding key.  In the 
  examples above, during init, hub.js objects will effectively call something 
  like this on your binding:
  
  {{{
    binding = this.valueBinding.beget().to("value", this) ;
  }}}
    
  This creates a new binding instance based on the template you provide, and 
  sets the to path to the "value" property of the new object.  Now that the 
  binding is fully configured with a "from" and a "to", it simply needs to be
  connected to become active.  This is done through the connect() method:
  
  {{{
    binding.connect() ;
  }}}
    
  Now that the binding is connected, it will observe both the from and to side 
  and relay changes.
  
  If you ever needed to do so (you almost never will, but it is useful to 
  understand this anyway), you could manually create an active binding by 
  doing the following:
  
  {{{
    hub.Binding.from("MyApp.someController.value")
     .to("MyApp.anotherObject.value")
     .connect();
  }}}
     
  You could also use the bind() helper method provided by hub.Object. (This is 
  the same method used by hub.Object.init() to setup your bindings):
  
  {{{
    MyApp.anotherObject.bind("value", "MyApp.someController.value") ;
  }}}

  Both of these code fragments have the same effect as doing the most friendly
  form of binding creation like so:
  
  {{{
    MyApp.anotherObject = hub.Object.create({
      valueBinding: "MyApp.someController.value",
      
      // OTHER CODE FOR THIS OBJECT...
      
    }) ;
  }}}
  
  hub.js's built in binding creation method make it easy to automatically
  create bindings for you.  You should always use the highest-level APIs 
  available, even if you understand how to it works underneath.
  
  NOTE: The binding object's themselves are not observable.
  
  @class
*/
hub.Binding = {
  
  /**
    This is the core method you use to create a new binding instance.  The
    binding instance will have the receiver instance as its parent which means
    any configuration you have there will be inherited.  
    
    The returned instance will also have its parentBinding property set to the 
    receiver.

    @param fromPath {String} optional from path.
    @returns {hub.Binding} new binding instance
  */
  beget: function(fromPath) {
    var ret = hub.beget(this) ;
    ret.parentBinding = this;
    if (fromPath !== undefined) ret = ret.from(fromPath) ;
    return ret ;
  },
  
  /**
    Returns a builder function for compatibility.  
  */
  builder: function() {
    var binding = this ;
    var ret = function(fromProperty) { return binding.beget().from(fromProperty); };
    ret.beget = function() { return binding.beget(); } ;
    return ret ;
  },
  
  /**
    This will set "from" property path to the specified value.  It will not
    attempt to resolve this property path to an actual object/property tuple
    until you connect the binding.

    The binding will search for the property path starting at the root level 
    unless you specify an alternate root object as the second paramter to this 
    method.  Alternatively, you can begin your property path with either "." or
    "*", which will use the root object of the to side be default.  This special
    behavior is used to support the high-level API provided by hub.Object.
    
    @param propertyPath {String|Tuple} A property path or tuple
    @param root {Object} optional root object to use when resolving the path.
    @returns {hub.Binding} this
  */
  from: function(propertyPath, root) {
    
    // if the propertyPath is null/undefined, return this.  This allows the
    // method to be called from other methods when the fromPath might be 
    // optional. (cf single(), multiple())
    if (!propertyPath) return this ;
    
    // beget if needed.
    var binding = (this === hub.Binding) ? this.beget() : this ;
    binding._hub_fromPropertyPath = propertyPath ;
    binding._hub_fromRoot = root ;
    binding._hub_fromTuple = null ;
    return binding ;
  },
  
  /**
   This will set the "to" property path to the specified value.  It will not 
   attempt to reoslve this property path to an actual object/property tuple
   until you connect the binding.
    
    @param propertyPath {String|Tuple} A property path or tuple
    @param root {Object} optional root object to use when resolving the path.
    @returns {hub.Binding} this
  */
  to: function(propertyPath, root) {
    // beget if needed.
    var binding = (this === hub.Binding) ? this.beget() : this ;
    binding._hub_toPropertyPath = propertyPath ;
    binding._hub_toRoot = root ;
    binding._hub_toTuple = null ; // clear out any existing one.
    return binding ;
  },

  /**
    Attempts to connect this binding instance so that it can receive and relay
    changes.  This method will raise an exception if you have not set the 
    from/to properties yet.
    
    @returns {hub.Binding} this
  */
  connect: function() {
    // If the binding is already connected, do nothing.
    if (this.isConnected) return this ;
    this.isConnected = true ;
    this._hub_connectionPending = true ; // its connected but not really...    
    this._hub_syncOnConnect = true ;
    hub.Binding._hub_connectQueue.add(this) ;
    return this; 
  },
  
  /** @private
    Actually connects the binding.  This is done at the end of the runloop
    to give you time to setup your entire object graph before the bindings 
    try to activate.
  */
  _hub_connect: function() {
    if (!this._hub_connectionPending) return; //nothing to do
    this._hub_connectionPending = false ;

    var path, root ;
    var bench = hub.BENCHMARK_BINDING_SETUP;

    if (bench) hub.Benchmark.start("hub.Binding.connect()");
    
    // try to connect the from side.
    // as a special behavior, if the from property path begins with either a 
    // . or * and the fromRoot is null, use the toRoot instead.  This allows 
    // for support for the hub.Object shorthand:
    //
    // contentBinding: "*owner.value"
    //
    path = this._hub_fromPropertyPath; root = this._hub_fromRoot ;
    if (hub.typeOf(path) === hub.T_STRING) {
      
      // if the first character is a '.', this is a static path.  make the 
      // toRoot the default root.
      if (path.indexOf('.') === 0) {
        path = path.slice(1);
        if (!root) root = this._hub_toRoot ;
        
      // if the first character is a '*', then setup a tuple since this is a 
      // chained path.
      } else if (path.indexOf('*') === 0) {
        path = [this._hub_fromRoot || this._hub_toRoot, path.slice(1)] ;
        root = null ;
      }
    }
    hub.Observers.addObserver(path, this, this.fromPropertyDidChange, root) ;
    
    // try to connect the to side
    if (!this._hub_oneWay) {
      path = this._hub_toPropertyPath; root = this._hub_toRoot ;
      hub.Observers.addObserver(path, this, this.toPropertyDidChange, root) ;  
    }

    if (bench) hub.Benchmark.end("hub.Binding.connect()");

    // now try to sync if needed
    if (this._hub_syncOnConnect) {
      this._hub_syncOnConnect = false ;
      if (bench) hub.Benchmark.start("hub.Binding.connect().sync()");
      this.sync();
      if (bench) hub.Benchmark.end("hub.Binding.connect().sync()");
    }
  },
  
  /**
    Disconnects the binding instance.  Changes will no longer be relayed.  You
    will not usually need to call this method.
    
    @returns {hub.Binding} this
  */
  disconnect: function() {
    if (!this.isConnected) return this; // nothing to do.
    
    // if connection is still pending, just cancel
    if (this._hub_connectionPending) {
      this._hub_connectionPending = false ;
      
    // connection is completed, disconnect.
    } else {
      hub.Observers.removeObserver(this._hub_fromPropertyPath, this, this.fromPropertyDidChange, this._hub_fromRoot) ;
      if (!this._hub_oneWay) {
        hub.Observers.removeObserver(this._hub_toPropertyPath, this, this.toPropertyDidChange, this._hub_toRoot) ;
      }
    }
    
    this.isConnected = false ;
    return this ;  
  },

  /**
    Invoked whenever the value of the "from" property changes.  This will mark
    the binding as dirty if the value has changed.
  */
  fromPropertyDidChange: function(target, key) {
    var v = target ? target.get(key) : null;

    // if the new value is different from the current binding value, then 
    // schedule to register an update.
    if (v !== this._hub_bindingValue) {

      this._hub_setBindingValue(target, key) ;
      this._hub_changePending = true ;
      hub.Binding._hub_changeQueue.add(this) ; // save for later.  
    }
  },

  /**
    Invoked whenever the value of the "to" property changes.  This will mark the
    binding as dirty only if:
    
    - the binding is not one way
    - the value does not match the stored transformedBindingValue
    
    if the value does not match the transformedBindingValue, then it will 
    become the new bindingValue. 
  */
  toPropertyDidChange: function(target, key) {
    if (this._hub_oneWay) return; // nothing to do
    
    var v = target.get(key) ;
    
    // if the new value is different from the current binding value, then 
    // schedule to register an update.
    if (v !== this._hub_transformedBindingValue) {
      this._hub_setBindingValue(target, key) ;
      this._hub_changePending = true ;
      hub.Binding._hub_changeQueue.add(this) ; // save for later.  
    }
  },
  
  /** @private
    Saves the source location for the binding value.  This will be used later
    to actually update the binding value.
  */
  _hub_setBindingValue: function(source, key) {
    this._hub_bindingSource = source;
    this._hub_bindingKey    = key;
  },
  
  /** @private 
    Updates the binding value from the current binding source if needed.  This
    should be called just before using this._bindingValue.
  */
  _hub_computeBindingValue: function() {
    var source = this._hub_bindingSource,
        key    = this._hub_bindingKey,
        v;
        
    if (!source) return ; // nothing to do
    this._hub_bindingValue = v = source.getPath(key);
    
    // apply any transforms to get the to property value also
    var transforms = this._hub_transforms;
    if (transforms) {
      var len = transforms.length ;
      for(var idx=0;idx<len;idx++) {
        var transform = transforms[idx] ;
        v = transform(v, this) ;
      }
    }

    // if error objects are not allowed, and the value is an error, then
    // change it to null.
    if (this._hub_noError && hub.typeOf(v) === hub.T_ERROR) v = null ;
    
    this._hub_transformedBindingValue = v;
  },
  
  _hub_connectQueue: hub.CoreSet.create(),
  _hub_alternateConnectQueue: hub.CoreSet.create(),
  _hub_changeQueue: hub.CoreSet.create(),
  _hub_alternateChangeQueue: hub.CoreSet.create(),
  _hub_changePending: false,

  /**
    Call this method on hub.Binding to flush all bindings with changed pending.
    
    @returns {Boolean} true if changes were flushed.
  */
  flushPendingChanges: function() {
    
    // don't allow flushing more than one at a time
    if (this._hub_isFlushing) return false; 
    this._hub_isFlushing = true ;
    hub.Observers.suspendPropertyObserving();

    var didFlush = false ;
    var log = hub.LOG_BINDINGS ;
    
    // connect any bindings
    var queue, binding ;
    while((queue = this._hub_connectQueue).length >0) {
      this._hub_connectQueue = this._hub_alternateConnectQueue ;
      this._hub_alternateConnectQueue = queue ;
      while(binding = queue.pop()) binding._hub_connect() ;
    }
    
    // loop through the changed queue...
    while ((queue = this._hub_changeQueue).length > 0) {
      if (log) hub.debug("BEGIN", "Trigger changed bindings.") ;
      
      didFlush = true ;
      
      // first, swap the change queues.  This way any binding changes that
      // happen while we flush the current queue can be queued up.
      this._hub_changeQueue = this._hub_alternateChangeQueue ;
      this._hub_alternateChangeQueue = queue ;
      
      // next, apply any bindings in the current queue.  This may cause 
      // additional bindings to trigger, which will end up in the new active 
      // queue.
      while(binding = queue.pop()) binding.applyBindingValue() ;
      
      // now loop back and see if there are additional changes pending in the
      // active queue.  Repeat this until all bindings that need to trigger 
      // have triggered.
      if (log) hub.debug("END", "Trigger changed bindings.") ;
    }
    
    // clean up
    this._hub_isFlushing = false ;
    hub.Observers.resumePropertyObserving();

    return didFlush ;
  },
  
  /**
    This method is called at the end of the Run Loop to relay the changed 
    binding value from one side to the other.
  */
  applyBindingValue: function() {
    this._hub_changePending = false ;

    // compute the binding targets if needed.
    this._hub_computeBindingTargets() ;
    this._hub_computeBindingValue();
    
    var v = this._hub_bindingValue ;
    var tv = this._hub_transformedBindingValue ;
    var bench = hub.BENCHMARK_BINDING_NOTIFICATIONS ;
    var log = hub.LOG_BINDINGS ; 
    
    // the from property value will always be the binding value, update if 
    // needed.
    if (!this._hub_oneWay && this._hub_fromTarget) {
      if (log) hub.debug(this, "%@ -> %@".fmt(v, tv)) ;
      if (bench) hub.Benchmark.start(this.toString() + "->") ;
      this._hub_fromTarget.setPathIfChanged(this._hub_fromPropertyKey, v) ;
      if (bench) hub.Benchmark.end(this.toString() + "->") ;
    }
    
    // update the to value with the transformed value if needed.
    if (this._hub_toTarget) {
      if (log) hub.debug(this, "%@ <- %@".fmt(v, tv)) ;
      if (bench) hub.Benchmark.start(this.toString() + "<-") ;
      this._hub_toTarget.setPathIfChanged(this._hub_toPropertyKey, tv) ;
      if (bench) hub.Benchmark.start(this.toString() + "<-") ;
    }
  },

  /**
    Calling this method on a binding will cause it to check the value of the 
    from side of the binding matches the current expected value of the 
    binding. If not, it will relay the change as if the from side's value has 
    just changed.
    
    This method is useful when you are dynamically connecting bindings to a 
    network of objects that may have already been initialized.
  */
  sync: function() {

    // do nothing if not connected
    if (!this.isConnected) return this;
    
    // connection is pending, just note that we should sync also
    if (this._hub_connectionPending) {
      this._hub_syncOnConnect = true ;
      
    // we are connected, go ahead and sync
    } else {
      this._hub_computeBindingTargets() ;
      var target = this._hub_fromTarget ;
      var key = this._hub_fromPropertyKey ;
      if (!target || !key) return this ; // nothing to do

      // get the new value
      var v = target.getPath(key) ;

      // if the new value is different from the current binding value, then 
      // schedule to register an update.
      if (v !== this._hub_bindingValue) {
        this._hub_setBindingValue(target, key) ;
        this._hub_changePending = true ;
        hub.Binding._hub_changeQueue.add(this) ; // save for later.  
      }
    }
    
    return this ;
  },
  
  // set if you call sync() when the binding connection is still pending.
  _hub_syncOnConnect: false,
  
  _hub_computeBindingTargets: function() {
    if (!this._hub_fromTarget) {

      var path, root, tuple ;
      
      // if the fromPropertyPath begins with a . or * then we may use the 
      // toRoot as the root object.  Similar code exists in connect() so if 
      // you make a change to one be sure to update the other.
      path = this._hub_fromPropertyPath; root = this._hub_fromRoot ;
      if (hub.typeOf(path) === hub.T_STRING) {
        
        // static path beginning with the toRoot
        if (path.indexOf('.') === 0) {
          path = path.slice(1) ; // remove the .
          if (!root) root = this._hub_toRoot; // use the toRoot optionally
          
        // chained path beginning with toRoot.  Setup a tuple
        } else if (path.indexOf('*') === 0) {
          path = [root || this._hub_toRoot, path.slice(1)];
          root = null ;
        }
      }
      
      tuple = hub.tupleForPropertyPath(path, root) ;
      if (tuple) {
        this._hub_fromTarget = tuple[0]; this._hub_fromPropertyKey = tuple[1] ;
      }
    }

    if (!this._hub_toTarget) {
      path = this._hub_toPropertyPath; root = this._hub_toRoot ;
      tuple = hub.tupleForPropertyPath(path, root) ;
      if (tuple) {
        this._hub_toTarget = tuple[0]; this._hub_toPropertyKey = tuple[1] ;
      }
    }
  },
  
  /**
    Configures the binding as one way.  A one-way binding will relay changes
    on the "from" side to the "to" side, but not the other way around.  This
    means that if you change the "to" side directly, the "from" side may have 
    a different value.
    
    @param fromPath {String} optional from path to connect.
    @param aFlag {Boolean} Optionally pass false to set the binding back to two-way
    @returns {hub.Binding} this
  */
  oneWay: function(fromPath, aFlag) {
    
    // If fromPath is a bool but aFlag is undefined, swap.
    if ((aFlag === undefined) && (hub.typeOf(fromPath) === hub.T_BOOL)) {
      aFlag = fromPath; fromPath = null ;
    }
    
    // beget if needed.
    var binding = this.from(fromPath) ;
    if (binding === hub.Binding) binding = binding.beget() ;
    binding._hub_oneWay = (aFlag === undefined) ? true : aFlag ;
    return binding ;
  },
  
  /**
    Adds the specified transform function to the array of transform functions.
    
    The function you pass must have the following signature:
    
    {{{
      function(value) {} ;
    }}}
    
    It must return either the transformed value or an error object.  
        
    Transform functions are chained, so they are called in order.  If you are
    extending a binding and want to reset the transforms, you can call
    resetTransform() first.
    
    @param transformFunc {Function} the transform function.
    @returns {hub.Binding} this
  */
  transform: function(transformFunc) {
    var binding = (this === hub.Binding) ? this.beget() : this ;
    var t = binding._hub_transforms ;
    
    // clone the transform array if this comes from the parent
    if (t && (t === binding.parentBinding._hub_transform)) {
      t = binding._hub_transforms = t.slice() ;
    }
    
    // create the transform array if needed.
    if (!t) t = binding._hub_transforms = [] ;
    
    // add the transform function
    t.push(transformFunc) ;
    return binding;
  },
  
  /**
    Resets the transforms for the binding.  After calling this method the 
    binding will no longer transform values.  You can then add new transforms
    as needed.
  
    @returns {hub.Binding} this
  */
  resetTransforms: function() {
    var binding = (this === hub.Binding) ? this.beget() : this ;
    binding._hub_transforms = null ; return binding ;
  },
  
  /**
    Specifies that the binding should not return error objects.  If the value
    of a binding is an Error object, it will be transformed to a null value
    instead.
    
    Note that this is not a transform function since it will be called at the
    end of the transform chain.
    
    @param fromPath {String} optional from path to connect.
    @param aFlag {Boolean} optionally pass false to allow error objects again.
    @returns {hub.Binding} this
  */
  noError: function(fromPath, aFlag) {
    // If fromPath is a bool but aFlag is undefined, swap.
    if ((aFlag === undefined) && (hub.typeOf(fromPath) === hub.T_BOOL)) {
      aFlag = fromPath; fromPath = null ;
    }
    
    // beget if needed.
    var binding = this.from(fromPath) ;
    if (binding === hub.Binding) binding = binding.beget() ;
    binding._hub_noError = (aFlag === undefined) ? true : aFlag ;
    return binding ;
  },
  
  /**
    Adds a transform to the chain that will allow only single values to pass.
    This will allow single values, nulls, and error values to pass through.  If
    you pass an array, it will be mapped as so:
    
    {{{
      [] => null
      [a] => a
      [a,b,c] => Multiple Placeholder
    }}}
    
    You can pass in an optional multiple placeholder or it will use the 
    default.
    
    Note that this transform will only happen on forwarded valued.  Reverse
    values are send unchanged.
    
    @param fromPath {String} from path or null
    @param placeholder {Object} optional placeholder value.
    @returns {hub.Binding} this
  */
  single: function(fromPath, placeholder) {
    if (placeholder === undefined) {
      placeholder = hub.MULTIPLE_PLACEHOLDER ;
    }
    return this.from(fromPath).transform(function(value, isForward) {
      if (value && value.isEnumerable) {
        var len = value.get('length');
        value = (len>1) ? placeholder : (len<=0) ? null : value.firstObject();
      }
      return value ;
    }) ;
  },
  
  /** 
    Adds a transform that will return the placeholder value if the value is 
    null, undefined, an empty array or an empty string.  See also notNull().
    
    @param fromPath {String} from path or null
    @param placeholder {Object} optional placeholder.
    @returns {hub.Binding} this
  */
  notEmpty: function(fromPath, placeholder) {
    if (placeholder === undefined) placeholder = hub.EMPTY_PLACEHOLDER ;
    return this.from(fromPath).transform(function(value, isForward) {
      if (hub.none(value) || (value === '') || (hub.isArray(value) && value.length === 0)) {
        value = placeholder ;
      }
      return value ;
    }) ;
  },
  
  /**
    Adds a transform that will return the placeholder value if the value is
    null.  Otherwise it will passthrough untouched.  See also notEmpty().
    
    @param fromPath {String} from path or null
    @param placeholder {Object} optional placeholder;
    @returns {hub.Binding} this
  */
  notNull: function(fromPath, placeholder) {
    if (placeholder === undefined) placeholder = hub.EMPTY_PLACEHOLDER ;
    return this.from(fromPath).transform(function(value, isForward) {
      if (hub.none(value)) value = placeholder ;
      return value ;
    }) ;
  },

  /** 
    Adds a transform that will convert the passed value to an array.  If 
    the value is null or undefined, it will be converted to an empty array.

    @param fromPath {String} optional from path
    @returns {hub.Binding} this
  */
  multiple: function(fromPath) {
    return this.from(fromPath).transform(function(value) {
      if (!hub.isArray(value)) value = (value == null) ? [] : [value] ;
      return value ;
    }) ;
  },
  
  /**
    Adds a transform to convert the value to a bool value.  If the value is
    an array it will return true if array is not empty.  If the value is a string
    it will return true if the string is not empty.
  
    @param fromPath {String} optional from path
    @returns {hub.Binding} this
  */
  bool: function(fromPath) {
    return this.from(fromPath).transform(function(v) {
      var t = hub.typeOf(v) ;
      if (t === hub.T_ERROR) return v ;
      return (t == hub.T_ARRAY) ? (v.length > 0) : (v === '') ? false : !!v ;
    }) ;
  },
  
  /**
    Adds a transform to convert the value to the inverse of a bool value.  This
    uses the same transform as bool() but inverts it.
    
    @param fromPath {String} optional from path
    @returns {hub.Binding} this
  */
  not: function(fromPath) {
    return this.from(fromPath).transform(function(v) {
      var t = hub.typeOf(v) ;
      if (t === hub.T_ERROR) return v ;
      return !((t == hub.T_ARRAY) ? (v.length > 0) : (v === '') ? false : !!v) ;
    }) ;
  },
  
  /**
    Adds a transform that will return true if the value is null, false otherwise.
    
    @returns {hub.Binding} this
  */
  isNull: function(fromPath) {
    return this.from(fromPath).transform(function(v) { 
      var t = hub.typeOf(v) ;
      return (t === hub.T_ERROR) ? v : hub.none(v) ;
    });
  },
  
  toString: function() {
    var from = this._hub_fromRoot ? "<%@>:%@".fmt(this._hub_fromRoot,this._hub_fromPropertyPath) : this._hub_fromPropertyPath;

    var to = this._hub_toRoot ? "<%@>:%@".fmt(this._hub_toRoot,this._hub_toPropertyPath) : this._hub_toPropertyPath;
    
    var oneWay = this._hub_oneWay ? '[oneWay]' : '';
    return "hub.Binding%@(%@ -> %@)%@".fmt(hub.guidFor(this), from, to, oneWay);
  }  
} ;

/** 
  Shorthand method to define a binding.  This is the same as calling:
  
  {{{
    hub.binding(path) = hub.Binding.from(path)
  }}}
*/
hub.binding = function(path, root) { return hub.Binding.from(path,root); };
