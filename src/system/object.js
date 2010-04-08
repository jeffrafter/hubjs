// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

hub.BENCHMARK_OBJECTS = false;

// ..........................................................
// PRIVATE HELPER METHODS
// 
// Private helper methods.  These are not kept as part of the class
// definition because hub.Object is copied frequently and we want to keep the
// number of class methods to a minimum.

/** @private
  Augments a base object by copying the properties from the extended hash.
  In addition to simply copying properties, this method also performs a 
  number of optimizations that can make init'ing a new object much faster
  including:
  
  - concating concatenatedProperties
  - prepping a list of bindings, observers, and dependent keys
  - caching local observers so they don't need to be manually constructed.

  @param {Hash} base hash
  @param {Hash} extension
  @returns {Hash} base hash
*/
hub._hub_object_extend = function _hub_object_extend(base, ext) {
  // Don't blow up when the user passes a protocol as if it were a mixin.
  if (!ext) ext = {} ;

  // set _kvo_cloned for later use
  base._hub_kvo_cloned = null;

  // get some common vars
  var key, idx, len, cur, cprops = base.concatenatedProperties, K = hub.K ;
  var p1,p2;

  // first, save any concat props.  use old or new array or concat
  idx = (cprops) ? cprops.length : 0 ;
  var concats = (idx>0) ? {} : null;
  while(--idx>=0) {
    key = cprops[idx]; p1 = base[key]; p2 = ext[key];

    if (p1) {
      if (!(p1 instanceof Array)) p1 = hub.$A(p1);
      concats[key] = (p2) ? p1.concat(p2) : p2 ;
    } else {
      if (!(p2 instanceof Array)) p2 = hub.$A(p2);
      concats[key] = p2 ;
    }
  }

  // setup arrays for bindings, observers, and properties.  Normally, just
  // save the arrays from the base.  If these need to be changed during 
  // processing, then they will be cloned first.
  var bindings = base._hub_bindings, clonedBindings = false;
  var observers = base._hub_observers, clonedObservers = false;
  var properties = base._hub_properties, clonedProperties = false;
  var paths, pathLoc, local ;

  // outlets are treated a little differently because you can manually 
  // name outlets in the passed in hash. If this is the case, then clone
  // the array first.
  var outlets = base.outlets, clonedOutlets = false ;
  if (ext.outlets) { 
    outlets = (outlets || hub.EMPTY_ARRAY).concat(ext.outlets);
    clonedOutlets = true ;
  }

  // now copy properties, add superclass to func.
  for(key in ext) {

    if (key === '_kvo_cloned') continue; // do not copy

    // avoid copying builtin methods
    if (!ext.hasOwnProperty(key)) continue ; 

    // get the value.  use concats if defined
    var value = (concats.hasOwnProperty(key) ? concats[key] : null) || ext[key] ;

    // Possibly add to a bindings.
    if (key.slice(-7) === "Binding") {
      if (!clonedBindings) {
        bindings = (bindings || hub.EMPTY_ARRAY).slice() ;
        clonedBindings = true ;
      }

      if (bindings === null) bindings = (base._hub_bindings || hub.EMPTY_ARRAY).slice();
      bindings[bindings.length] = key ;

    // Also add observers, outlets, and properties for functions...
    } else if (value && (value instanceof Function)) {

      // add super to funcs.  Be sure not to set the base of a func to 
      // itself to avoid infinite loops.
      if (!value.superclass && (value !== (cur=base[key]))) {
        value.superclass = value.base = cur || K;
      }

      // handle regular observers
      if (value.propertyPaths) {
        if (!clonedObservers) {
          observers = (observers || hub.EMPTY_ARRAY).slice() ;
          clonedObservers = true ;
        }
        observers[observers.length] = key ;

      // handle local properties
      } else if (paths = value.localPropertyPaths) {
        pathLoc = paths.length;
        while(--pathLoc >= 0) {
          local = base._hub_kvo_for(hub.keyFor('_kvo_local', paths[pathLoc]), hub.Set);
          local.add(key);
          base._hub_kvo_for('_kvo_observed_keys', hub.CoreSet).add(paths[pathLoc]);
        }

      // handle computed properties
      } else if (value.dependentKeys) {
        if (!clonedProperties) {
          properties = (properties || hub.EMPTY_ARRAY).slice() ;
          clonedProperties = true ;
        }
        properties[properties.length] = key ;

      // handle outlets
      } else if (value.autoconfiguredOutlet) {
        if (!clonedOutlets) {
          outlets = (outlets || hub.EMPTY_ARRAY).slice();
          clonedOutlets = true ;
        }
        outlets[outlets.length] = key ;          
      }
    }

    // copy property
    base[key] = value ;
  }
  
  // Manually set base on toString() because some JS engines (such as IE8) do
  // not enumerate it
  if (ext.hasOwnProperty('toString')) {
    key = 'toString';
    // get the value.  use concats if defined
    value = (concats.hasOwnProperty(key) ? concats[key] : null) || ext[key] ;
    if (!value.superclass && (value !== (cur=base[key]))) {
      value.superclass = value.base = cur || K ;
    }
    // copy property
    base[key] = value ;
  }


  // copy bindings, observers, and properties 
  base._hub_bindings = bindings || [];
  base._hub_observers = observers || [] ;
  base._hub_properties = properties || [] ;
  base.outlets = outlets || [];

  return base ;
} ;

/**
  hub.Object is the root class for most classes defined by hub.js.  It builds 
  on top of the native object support provided by JavaScript to provide support 
  for class-like inheritance, automatic bindings, properties observers, and 
  more.
  
  Most of the classes you define in your model layer should inherit from 
  hub.Object or one of its subclasses, typically hub.Record.  If you are 
  writing objects of your own, you should read this documentation to learn some 
  of the details of how hub.Object's behave and how they differ from other 
  libraries.
  
  @class
  @extends hub.Observable 
*/
hub.Object = function(props) { return this._hub_object_init(props); };

hub.mixin(hub.Object, /** @scope hub.Object */ {

  /**
    Adds the passed properties to the object's class definition.  You can 
    pass as many hashes as you want, including Mixins, and they will be 
    added in the order they are passed.

    This is a shorthand for calling hub.mixin(MyClass, props...);
    
    @params {Hash} props the properties you want to add.
    @returns {Object} receiver
  */
  mixin: function(props) {
    var len = arguments.length, loc ;
    for(loc =0;loc<len;loc++) hub.mixin(this, arguments[loc]);
    return this ;
  },

  // ..........................................
  // CREATING CLASSES AND INSTANCES
  //

  /**
    Points to the superclass for this class.  You can use this to trace a
    class hierarchy.
    
    @property {hub.Object}
  */
  superclass: null,
  
  /**
    Creates a new subclass of the receiver, adding any passed properties to
    the instance definition of the new class.  You should use this method
    when you plan to create several objects based on a class with similar 
    properties.

    h2. Init

    If you define an init() method, it will be called when you create 
    instances of your new class.  Since hub.js uses the init() method to
    do important setup, you must be sure to always call 
    arguments.callee.base.apply(this, arguments) somewhere in your init() to 
    allow the normal setup to proceed.

    @params {Hash} props the methods of properties you want to add
    @returns {Class} A new object class
  */
  extend: function(props) {   
    var bench = hub.BENCHMARK_OBJECTS ;
    if (bench) hub.Benchmark.start('hub.Object.extend') ;

    // build a new constructor and copy class methods.  Do this before 
    // adding any other properties so they are not overwritten by the copy.
    var prop, ret = function(props) { return this._hub_object_init(props); } ;
    for(prop in this) {
      if (!this.hasOwnProperty(prop)) continue ;
      ret[prop] = this[prop];
    }
    
    // manually copy toString() because some JS engines do not enumerate it
    if (this.hasOwnProperty('toString')) ret.toString = this.toString;

    // now setup superclass, guid
    ret.superclass = this ;
    hub.generateGuid(ret); // setup guid

    ret.subclasses = hub.Set.create();
    this.subclasses.add(ret); // now we can walk a class hierarchy

    // setup new prototype and add properties to it
    var base = (ret.prototype = hub.beget(this.prototype));
    var idx, len = arguments.length;
    for(idx=0;idx<len;idx++) hub._hub_object_extend(base, arguments[idx]) ;
    base.constructor = ret; // save constructor

    if (bench) hub.Benchmark.end('hub.Object.extend') ;
    return ret ;
  },

  /**
    Creates a new instance of the class.

    Unlike most frameworks, you do not pass paramters into the init funciton
    for an object.  Instead, you pass a hash of additonal properties you 
    want to have assigned to the object when it is first created.  This is
    functionally like creating a anonymous subclass of the receiver and then
    instantiating it, but more efficient.

    You can use create() like you would a normal constructor in a 
    class-based system, or you can use it to create highly customized 
    singleton objects such as controllers or app-level objects.  This is 
    often more efficient than creating subclasses and than instantiating 
    them.

    You can pass any hash of properties to this method, including mixins.
    
    @param {Hash} props 
      optional hash of method or properties to add to the instance.
      
    @returns {hub.Object} new instance of the receiver class.
  */
  create: function(props) { var C=this; return new C(arguments); },

  /**
    Walk like a duck.  You can use this to quickly test classes.
    
    @property {Boolean}
  */
  isClass: true,

  /**
    Set of subclasses that extend from this class.  You can observe this 
    array if you want to be notified when the object is extended.
    
    @property {hub.Set}
  */
  subclasses: hub.Set.create(),
  
  /** @private */
  toString: function() { return hub._hub_object_className(this); },

  // ..........................................
  // PROPERTY SUPPORT METHODS
  //

  /** 
    Returns true if the receiver is a subclass of the named class.  If the 
    receiver is the class passed, this will return false since the class is not
    a subclass of itself.  See also kindOf().

    h2. Example
    
    {{{
      ClassA = hub.Object.extend();
      ClassB = ClassA.extend();

      ClassB.subclassOf(ClassA) => true
      ClassA.subclassOf(ClassA) => false
    }}}
    
    @param {Class} hubClass class to compare
    @returns {Boolean} 
  */
  subclassOf: function(hubClass) {
    if (this === hubClass) return false ;
    var t = this ;
    while(t = t.superclass) if (t === hubClass) return true ;
    return false ;
  },
  
  /**
    Returns true if the passed object is a subclass of the receiver.  This is 
    the inverse of subclassOf() which you call on the class you want to test.
    
    @param {Class} hubClass class to compare
    @returns {Boolean}
  */
  hasSubclass: function(hubClass) {
    return (hubClass && hubClass.subclassOf) ? hubClass.subclassOf(this) : false;
  },

  /**
    Returns true if the receiver is the passed class or is a subclass of the 
    passed class.  Unlike subclassOf(), this method will return true if you
    pass the receiver itself, since class is a kind of itself.  See also 
    subclassOf().

    h2. Example

    {{{
      ClassA = hub.Object.extend();
      ClassB = ClassA.extend();

      ClassB.kindOf(ClassA) => true
      ClassA.kindOf(ClassA) => true
    }}}
    
    @param {Class} hubClass class to compare
    @returns {Boolean} 
  */
  kindOf: function(hubClass) { 
    return (this === hubClass) || this.subclassOf(hubClass) ;
  }  
  
}) ;

// ..........................................
// DEFAULT OBJECT INSTANCE
// 
hub.Object.prototype = {
  
  _hub_kvo_enabled: true,
  
  /** @private
    This is the first method invoked on a new instance.  It will first apply
    any added properties to the new instance and then calls the real init()
    method.
    
    @param {Array} extensions an array-like object with hashes to apply.
    @returns {Object} receiver
  */
  _hub_object_init: function(extensions) {
    // apply any new properties
    var idx, len = (extensions) ? extensions.length : 0;
    for(idx=0;idx<len;idx++) hub._hub_object_extend(this, extensions[idx]) ;
    hub.generateGuid(this) ; // add guid
    this.init() ; // call real init
    
    // Call 'initMixin' methods to automatically setup modules.
    var inits = this.initMixin; len = (inits) ? inits.length : 0 ;
    for(idx=0;idx < len; idx++) inits[idx].call(this);
    
    return this ; // done!
  },
  
  /**
    You can call this method on an object to mixin one or more hashes of 
    properties on the receiver object.  In addition to simply copying 
    properties, this method will also prepare the properties for use in 
    bindings, computed properties, etc.
    
    If you plan to use this method, you should call it before you call
    the inherited init method from hub.Object or else your instance may not 
    function properly.
    
    h2. Example
    
    {{{
      // dynamically apply a mixin specified in an object property
      var MyClass = hub.Object.extend({
         extraMixin: null,
         
         init: function() {
           this.mixin(this.extraMixin);
           arguments.callee.base.apply();
         }
      });
      
      var ExampleMixin = { foo: "bar" };
      
      var instance = MyClass.create({ extraMixin: ExampleMixin }) ;
      
      instance.get('foo') => "bar"
    }}}

    @param {Hash} ext a hash to copy.  Only one.
    @returns {Object} receiver
  */
  mixin: function() {
    var idx, len = arguments.length;
    for(idx=0;idx<len;idx++) hub.mixin(this, arguments[idx]) ;

    // call initMixin
    for(idx=0;idx<len;idx++) {
      var init = arguments[idx].initMixin ;
      if (init) init.call(this) ;
    }
    return this ;
  },

  /**
    This method is invoked automatically whenever a new object is 
    instantiated.  You can override this method as you like to setup your
    new object.  

    Within your object, be sure to call arguments.callee.base.apply() to ensure 
    that the built-in init method is also called or your observers and computed 
    properties may not be configured.

    Although the default init() method returns the receiver, the return 
    value is ignored.

    @returns {void}
  */
  init: function() {
    this.initObservable();
    return this ;
  },

  /**
    Set to false once this object has been destroyed. 
    
    @property {Boolean}
  */
  isDestroyed: false,

  /**
    Call this method when you are finished with an object to teardown its
    contents.  Because JavaScript is garbage collected, you do not usually 
    need to call this method.  However, you may choose to do so for certain
    objects, especially views, in order to let them reclaim memory they 
    consume immediately.

    If you would like to perform additional cleanup when an object is
    finished, you may override this method.  Be sure to call 
    arguments.callee.base.apply(this, arguments).
    
    @returns {hub.Object} receiver
  */
  destroy: function() {
    if (this.get('isDestroyed')) return this; // nothing to do
    this.set('isDestroyed', true);

    // destroy any mixins
    var idx, inits = this.destroyMixin, len = (inits) ? inits.length : 0 ;
    for(idx=0;idx < len; idx++) inits[idx].call(this);

    return this ;
  },

  /**
    Walk like a duck. Always true since this is an object and not a class.
    
    @property {Boolean}
  */
  isObject: true,

  /**
    Returns true if the named value is an executable function.

    @param methodName {String} the property name to check
    @returns {Boolean}
  */
  respondsTo: function( methodName ) {
    return !!(hub.typeOf(this[methodName]) === hub.T_FUNCTION);
  },
  
  /**
    Attemps to invoked the named method, passing the included two arguments.  
    Returns true if the method is either not implemented or if the handler 
    returns false (indicating that it did not handle the event).  This method 
    is invoked to deliver actions from menu items and to deliver events.  
    You can override this method to provide additional handling if you 
    prefer.

    @param {String} methodName
    @param {Object} arg1
    @param {Object} arg2
    @returns {Boolean} true if handled, false if not handled
  */
  tryToPerform: function(methodName, arg1, arg2) {
    return this.respondsTo(methodName) && (this[methodName](arg1, arg2) !== false);
  },

  /**  
    EXPERIMENTAL:  You can use this to invoke a superclass implementation in
    any method.  This does not work in Safari 2 or earlier.  If you need to
    target Safari 2, use arguments.callee.base.apply(this, arguments);
    
    h2. Example
    
    All of the following methods will call the superclass implementation of
    your method:
    
    {{{
      hub.Object.create({
        
        // DOES NOT WORK IN SAFARI 2 OR EARLIER
        method1: function() {
          this.superclass();
        },
        
        // WORKS ANYTIME
        method3: function() {
          arguments.callee.base.apply(this, arguments);
        }
      });
    }}}

    @params args {*args} any arguments you want to pass along.
    @returns {Object} return value from super
  */
  superclass: function(args) {
    var caller = arguments.callee.caller; 
    if (!caller) throw "superclass cannot determine the caller method" ;
    return caller.superclass ? caller.superclass.apply(this, arguments) : null;
  },

  /**  
    returns true if the receiver is an instance of the named class.  See also
    kindOf().

    h2. Example
    
    {{{
      var ClassA = hub.Object.extend();
      var ClassB = hub.Object.extend();
      
      var instA = ClassA.create();
      var instB = ClassB.create();
      
      instA.instanceOf(ClassA) => true
      instB.instanceOf(ClassA) => false
    }}}
    
    @param {Class} hubClass the class
    @returns {Boolean}
  */
  instanceOf: function(hubClass) {
    return this.constructor === hubClass ;  
  },

  /**  
    Returns true if the receiver is an instance of the named class or any 
    subclass of the named class.  See also instanceOf().

    h2. Example
    
    {{{
      var ClassA = hub.Object.extend();
      var ClassB = hub.Object.extend();
      
      var instA = ClassA.create();
      var instB = ClassB.create();
      
      instA.kindOf(ClassA) => true
      instB.kindOf(ClassA) => true
    }}}

    @param hubClass {Class} the class
    @returns {Boolean}
  */
  kindOf: function(hubClass) { return this.constructor.kindOf(hubClass); },

  /** @private */
  toString: function() {
    if (!this._hub_object_toString) {
      // only cache the string if the klass name is available
      var klassName = hub._hub_object_className(this.constructor) ;
      var string = "%@:%@".fmt(klassName, hub.guidFor(this));
      if (klassName) this._hub_object_toString = string ;
      else return string ;
    } 
    return this._hub_object_toString ;
  },

  /**  
    Activates any outlet connections in object and syncs any bindings.  This
    method is called automatically for view classes but may be used for any
    object.
    
    @returns {void}
  */
  awake: function(key) { 
    this.outlets.forEach(function(key) { this.get(key); },this) ;
    this.bindings.invoke('sync'); 
  },

  /**
    The properties named in this array will be concatenated in subclasses
    instead of replaced.  This allows you to name special properties that
    should contain any values you specify *plus* values specified by parents.

    It is used by hub.js and is available for your use, though you 
    should limit the number of properties you include in this list as it 
    adds a slight overhead to new class and instance creation.

    @property {Array}
  */
  concatenatedProperties: ['concatenatedProperties', 'initMixin', 'destroyMixin']  

} ;

// bootstrap the constructor for hub.Object.
hub.Object.prototype.constructor = hub.Object;

// Add observable to mixin
hub.mixin(hub.Object.prototype, hub.Observable) ;

// ..........................................................
// CLASS NAME SUPPORT
// 

/** @private
  This is a way of performing brute-force introspection.  This searches 
  through all the top-level properties looking for classes.  When it finds
  one, it saves the class path name.
*/
function findClassNames() {

  if (hub._hub_object_foundObjectClassNames) return ;
  hub._hub_object_foundObjectClassNames = true ;

  var seen = [] ;
  var searchObject = function(root, object, levels) {
    levels-- ;

    // not the fastest, but safe
    if (seen.indexOf(object) >= 0) return ;
    seen.push(object) ;

    for(var key in object) {
      if (key == '__scope__') continue ;
      if (key == 'superclass') continue ;
      if (!key.match(/^[A-Z0-9]/)) continue ;

      var path = (root) ? [root,key].join('.') : key ;
      var value = object[key] ;


      switch(hub.typeOf(value)) {
      case hub.T_CLASS:
        if (!value._hub_object_className) value._hub_object_className = path;
        if (levels>=0) searchObject(path, value, levels) ;
        break ;

      case hub.T_OBJECT:
        if (levels>=0) searchObject(path, value, levels) ;
        break ;

      case hub.T_HASH:
        if (((root) || (path==='hub')) && (levels>=0)) searchObject(path, value, levels) ;
        break ;

      default:
        break;
      }
    }
  } ;

  searchObject(null, window, 2) ;
}

/**  
  Same as the instance method, but lets you check instanceOf without having to 
  first check if instanceOf exists as a method.
  
  @param {Object} hubObject the object to check instance of
  @param {Class} hubClass the class
  @returns {Boolean} if hubObject is instance of class
*/
hub.instanceOf = function(hubObject, hubClass) {
  return !!(hubObject && hubObject.constructor === hubClass) ;  
};

/**
  Same as the instance method, but lets you check kindOf without having to 
  first check if kindOf exists as a method.
  
  @param {Object} hubObject object to check kind of
  @param {Class} hubClass the class to check
  @returns {Boolean} if hubObject is an instance of hubClass or subclass
*/
hub.kindOf = function(hubObject, hubClass) {
  if (hubObject && !hubObject.isClass) hubObject = hubObject.constructor;
  return !!(hubObject && hubObject.kindOf && hubObject.kindOf(hubClass));
};

/** @private
  Returns the name of this class.  If the name is not known, triggers
  a search.  This can be expensive the first time it is called.
  
  This method is used to allow classes to determine their own name.
*/
hub._hub_object_className = function(obj) {
  if (!hub.isReady) return ''; // class names are not available until ready
  if (!obj._hub_object_className) findClassNames() ;
  if (obj._hub_object_className) return obj._hub_object_className ;

  // if no direct classname was found, walk up class chain looking for a 
  // match.
  var ret = obj ;
  while(ret && !ret._hub_object_className) ret = ret.superclass; 
  return (ret && ret._hub_object_className) ? ret._hub_object_className : 'Anonymous';
};
