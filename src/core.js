// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/* This test always happens, even in production builds.
  
  NOTE: `hub.allege()`, not `hub_allege()`. (We don't want to pollute the 
  global namespace in production code.)
  
  @static
*/
hub.allege = function(test, msg) {
  if (!test) throw "HUB_ALLEGE: " + msg ;
};

/**
  Adds properties to a target object.
  
  Takes the root object and adds the attributes for any additional 
  arguments passed.
  
  @param target {Object} the target object to extend
  @param properties {Object} one or more objects with properties to copy.
  @returns {Object} the target object.
  @static
*/
hub.mixin = function() {
  // copy reference to target object
  var target = arguments[0] || {},
      idx = 1,
      len = arguments.length,
      options, key;

  // Handle case where we have only one item...extend hub
  if (len===1) {
    target = this || {} ;
    idx = 0 ;
  }

  for (; idx<len; ++idx) {
    if (!(options = arguments[idx])) continue ;
    for(key in options) {
      if (!options.hasOwnProperty(key)) continue ;
      var copy = options[key] ;
      if (target===copy) continue ; // prevent never-ending loop
      if (copy !== undefined) target[key] = copy ;
    }
  }

  return target ;
};

/**
  Adds properties to a target object.  Unlike hub.mixin, however, if the target
  already has a value for a property, it will not be overwritten.
  
  Takes the root object and adds the attributes for any additional 
  arguments passed.
  
  TODO: Merge this implementation with hub.mixin(); the code is almost 
  identical.
  
  @param target {Object} the target object to extend
  @param properties {Object} one or more objects with properties to copy.
  @returns {Object} the target object.
  @static
*/
hub.supplement = function() {
  // copy reference to target object
  var target = arguments[0] || {};
  var idx = 1;
  var length = arguments.length ;
  var options ;

  // Handle case where we have only one item...extend hub
  if (length === 1) {
    target = this || {};
    idx=0;
  }

  for ( ; idx < length; idx++ ) {
    if (!(options = arguments[idx])) continue ;
    for(var key in options) {
      if (!options.hasOwnProperty(key)) continue ;
      var src = target[key] ;
      var copy = options[key] ;
      if (target===copy) continue ; // prevent never-ending loop
      if (copy !== undefined  &&  src === undefined) target[key] = copy ;
    }
  }
  
  return target;
} ;

/** 
  Alternative to mixin.  Provided for compatibility with jQuery.
  @function 
*/
hub.extend = hub.mixin ;

// ..........................................................
// CORE FUNCTIONS
// 
// Enough with the bootstrap code.  Let's define some core functions.

hub.mixin(/** @scope hub */ {
  
  // ........................................
  // GLOBAL CONSTANTS
  // 
  T_ERROR:     'error',
  T_OBJECT:    'object',
  T_NULL:      'null',
  T_CLASS:     'class',
  T_HASH:      'hash',
  T_FUNCTION:  'function',
  T_UNDEFINED: 'undefined',
  T_NUMBER:    'number',
  T_BOOL:      'boolean',
  T_ARRAY:     'array',
  T_STRING:    'string',
  
  // ........................................
  // TYPING & ARRAY MESSAGING
  //   

  /**
    Returns a consistant type for the passed item.

    Use this instead of the built-in typeOf() to get the type of an item. 
    It will return the same result across all browsers and includes a bit 
    more detail.  Here is what will be returned:

    | Return Value Constant | Meaning |
    | hub.T_STRING | String primitive |
    | hub.T_NUMBER | Number primitive |
    | hub.T_BOOLEAN | Boolean primitive |
    | hub.T_NULL | Null value |
    | hub.T_UNDEFINED | Undefined value |
    | hub.T_FUNCTION | A function |
    | hub.T_ARRAY | An instance of Array |
    | hub.T_CLASS | A hub.js class (created using hub.Object.extend()) |
    | hub.T_OBJECT | A hub.js object instance |
    | hub.T_HASH | A JavaScript object not inheriting from hub.Object |

    @param item {Object} the item to check
    @returns {String} the type
  */  
  typeOf: function(item) {
    if (item === undefined) return hub.T_UNDEFINED ;
    if (item === null) return hub.T_NULL ; 
    var ret = typeof(item) ;
    if (ret == "object") {
      if (item instanceof Array) {
        ret = hub.T_ARRAY ;
      } else if (item instanceof Function) {
        ret = item.isClass ? hub.T_CLASS : hub.T_FUNCTION ;

      // NB: typeOf() may be called before hub.Error has had a chance to load
      // so this code checks for the presence of hub.Error first just to make
      // sure.  No error instance can exist before the class loads anyway so
      // this is safe.
      } else if (hub.Error && (item instanceof hub.Error)) {
        ret = hub.T_ERROR ;        
      } else if (item.isObject === true) {
        ret = hub.T_OBJECT ;
      } else ret = hub.T_HASH ;
    } else if (ret === hub.T_FUNCTION) ret = (item.isClass) ? hub.T_CLASS : hub.T_FUNCTION;
    return ret ;
  },

  /**
    Returns true if the passed value is null or undefined.  This avoids errors
    from JSLint complaining about use of ==, which can be technically 
    confusing.
    
    @param {Object} obj value to test
    @returns {Boolean}
  */
  none: function(obj) {
    return obj===null || obj===undefined;  
  },

  /**
    Verifies that a value is either null or an empty string.  Return false if
    the object is not a string.
    
    @param {Object} obj value to test
    @returns {Boolean}
  */
  empty: function(obj) {
    return obj===null || obj===undefined || obj==='';
  },
  
  /**
    Returns true if the passed object is an array or array-like. Instances
    of the NodeList class return false.

    Unlike hub.typeOf this method returns true even if the passed object is 
    not formally array but appears to be array-like (i.e. has a length 
    property, responds to .objectAt, etc.)

    @param obj {Object} the object to test
    @returns {Boolean} 
  */
  isArray: function(obj) {
    if (obj && obj.objectAt) return true ; // fast path

    var len = (obj ? obj.length : null), type = hub.typeOf(obj);
    return !(hub.none(len) || (type === hub.T_FUNCTION) || (type === hub.T_STRING) || obj.setInterval) ;
  },

  /**
    Makes an object into an Array if it is not array or array-like already.
    Unlike hub.A(), this method will not clone the object if it is already
    an array.
    
    @param {Object} obj object to convert
    @returns {Array} Actual array
  */
  makeArray: function(obj) {
    return hub.isArray(obj) ? obj : hub.A(obj);
  },
  
  /**
    Converts the passed object to an Array.  If the object appears to be 
    array-like, a new array will be cloned from it.  Otherwise, a new array
    will be created with the item itself as the only item in the array.
    
    @param object {Object} any enumerable or array-like object.
    @returns {Array} Array of items
  */
  A: function(obj) {
    // null or undefined -- fast path
    if (hub.none(obj)) return [] ;
    
    // primitive -- fast path
    if (obj.slice instanceof Function) {
      // do we have a string?
      if (typeof(obj) === 'string') return [obj] ;
      else return obj.slice() ;
    }
    
    // enumerable -- fast path
    if (obj.toArray) return obj.toArray() ;
    
    // if not array-like, then just wrap in array.
    if (!hub.isArray(obj)) return [obj];
    
    // when all else fails, do a manual convert...
    var ret = [], len = obj.length;
    while(--len >= 0) ret[len] = obj[len];
    return ret ;
  },
  
  // ..........................................................
  // GUIDS & HASHES
  // 
  
  guidKey: "_hub_guid_" + new Date().getTime(),

  // Used for guid generation...
  _hub_nextGUID: 0, _hub_numberGuids: [], _hub_stringGuids: {}, _hub_keyCache: {},

  /**
    Returns a unique GUID for the object.  If the object does not yet have
    a guid, one will be assigned to it.  You can call this on any object,
    hub.Object-based or not, but be aware that it will add a _guid property.

    You can also use this method on DOM Element objects.

    @param obj {Object} any object, string, number, Element, or primitive
    @returns {String} the unique guid for this instance.
  */
  guidFor: function(obj) {
    
    // special cases where we don't want to add a key to object
    if (obj === undefined) return "(undefined)" ;
    if (obj === null) return '(null)' ;
    if (obj === Object) return '(Object)';
    if (obj === Array) return '(Array)';
    
    var guidKey = this.guidKey ;
    if (obj[guidKey]) return obj[guidKey] ;

    switch(typeof obj) {
      case hub.T_NUMBER:
        return (this._hub_numberGuids[obj] = this._hub_numberGuids[obj] || ("nu" + obj));
      case hub.T_STRING:
        return (this._hub_stringGuids[obj] = this._hub_stringGuids[obj] || ("st" + obj));
      case hub.T_BOOL:
        return (obj) ? "(true)" : "(false)" ;
      default:
        return hub.generateGuid(obj);
    }
  },

  /**
    Returns a key name that combines the named key + prefix.  This is more 
    efficient than simply combining strings because it uses a cache  
    internally for performance.
    
    @param {String} prefix the prefix to attach to the key
    @param {String} key key
    @returns {String} result 
  */
  keyFor: function(prefix, key) {
    var ret, pcache = this._hub_keyCache[prefix];
    if (!pcache) pcache = this._hub_keyCache[prefix] = {}; // get cache for prefix
    ret = pcache[key];
    if (!ret) ret = pcache[key] = prefix + '_' + key ;
    return ret ;
  },

  /**
    Generates a new guid, optionally saving the guid to the object that you
    pass in.  You will rarely need to use this method.  Instead you should
    call hub.guidFor(obj), which return an existing guid if available.

    @param {Object} obj the object to assign the guid to
    @returns {String} the guid
  */
  generateGuid: function(obj) { 
    var ret = ("hub" + (this._hub_nextGUID++)); 
    if (obj) obj[this.guidKey] = ret ;
    return ret ;
  },

  /**
    Returns a unique hash code for the object.  If the object implements
    a hash() method, the value of that method will be returned.  Otherwise,
    this will return the same value as guidFor().  

    Unlike guidFor(), this method allows you to implement logic in your 
    code to cause two separate instances of the same object to be treated as
    if they were equal for comparisons and other functions.

    IMPORTANT:  If you implement a hash() method, it MUST NOT return a 
    number or a string that contains only a number.  Typically hash codes 
    are strings that begin with a "%".

    @param obj {Object} the object
    @returns {String} the hash code for this instance.
  */
  hashFor: function(obj) {
    return (obj && obj.hash && (typeof obj.hash === hub.T_FUNCTION)) ? obj.hash() : this.guidFor(obj) ;
  },
    
  /**
    This will compare the two object values using their hash codes.

    @param a {Object} first value to compare
    @param b {Object} the second value to compare
    @returns {Boolean} true if the two have equal hash code values.

  */
  isEqual: function(a,b) {
    // shortcut a few places.
    if (a === null) {
      return b === null ;
    } else if (a === undefined) {
      return b === undefined ;

    // finally, check their hash-codes
    } else return this.hashFor(a) === this.hashFor(b) ;
  },
  
  
  /**
   This will compare two javascript values of possibly different types.
   It will tell you which one is greater than the other by returning
   -1 if the first is smaller than the second,
    0 if both are equal,
    1 if the first is greater than the second.
  
   The order is calculated based on hub.ORDER_DEFINITION , if types are different.
   In case they have the same type an appropriate comparison for this type is made.

   @param v {Object} first value to compare
   @param w {Object} the second value to compare
   @returns {NUMBER} -1 if v < w, 0 if v = w and 1 if v > w.

  */
  compare: function (v, w) {
    var type1 = hub.typeOf(v);
    var type2 = hub.typeOf(w);
    var type1Index = hub.ORDER_DEFINITION.indexOf(type1);
    var type2Index = hub.ORDER_DEFINITION.indexOf(type2);
    
    if (type1Index < type2Index) return -1;
    if (type1Index > type2Index) return 1;
    
    // ok - types are equal - so we have to check values now
    switch (type1) {
      case hub.T_BOOL:
      case hub.T_NUMBER:
        if (v<w) return -1;
        if (v>w) return 1;
        return 0;

      case hub.T_STRING:
        if (v.localeCompare(w)<0) return -1;
        if (v.localeCompare(w)>0) return 1;
        return 0;

      case hub.T_ARRAY:
        var l = Math.min(v.length,w.length);
        var r = 0;
        var i = 0;
        while (r===0 && i < l) {
          r = arguments.callee(v[i],w[i]);
          if ( r !== 0 ) return r;
          i++;
        }
      
        // all elements are equal now
        // shorter array should be ordered first
        if (v.length < w.length) return -1;
        if (v.length > w.length) return 1;
        // arrays are equal now
        return 0;
        
      case hub.T_OBJECT:
        if (typeof v.constructor.compare === 'function') return v.constructor.compare(v, w);
        return 0;

      default:
        return 0;
    }
  },
  
  // ..........................................................
  // OBJECT MANAGEMENT
  // 
  
  /** 
    Empty function.  Useful for some operations. 
    
    @returns {Object}
  */
  K: function() { return this; },

  /** 
    Empty array.  Useful for some optimizations.
  
    @property {Array}
  */
  EMPTY_ARRAY: [],

  /**
    Empty hash.  Useful for some optimizations.
  
    @property {Hash}
  */
  EMPTY_HASH: {},

  /**
    Empty range. Useful for some optimizations.
    
    @property {Range}
  */
  EMPTY_RANGE: {start: 0, length: 0},
  
  /**
    Creates a new object with the passed object as its prototype.

    This method uses JavaScript's native inheritence method to create a new 
    object.    

    You cannot use beget() to create new hub.Object-based objects, but you
    can use it to beget Arrays, Hashes, Sets and objects you build yourself.
    Note that when you beget() a new object, this method will also call the
    didBeget() method on the object you passed in if it is defined.  You can
    use this method to perform any other setup needed.

    In general, you will not use beget() often as hub.Object is much more 
    useful, but for certain rare algorithms, this method can be very useful.

    For more information on using beget(), see the section on beget() in 
    Crockford's JavaScript: The Good Parts.

    @param obj {Object} the object to beget
    @returns {Object} the new object.
  */
  beget: function(obj) {
    if (hub.none(obj)) return null ;
    var K = hub.K; K.prototype = obj ;
    var ret = new K();
    K.prototype = null ; // avoid leaks
    if (hub.typeOf(obj.didBeget) === hub.T_FUNCTION) ret = obj.didBeget(ret); 
    return ret ;
  },

  /**
    Creates a clone of the passed object.  This function can take just about
    any type of object and create a clone of it, including primitive values
    (which are not actually cloned because they are immutable).

    If the passed object implements the clone() method, then this function
    will simply call that method and return the result.

    @param object {Object} the object to clone
    @returns {Object} the cloned object
  */
  copy: function(object) {
    var ret = object ;
    
    // fast path
    if (object && object.isCopyable) return object.copy();
    
    switch (hub.typeOf(object)) {
    case hub.T_ARRAY:
      if (object.clone && hub.typeOf(object.clone) === hub.T_FUNCTION) {
        ret = object.clone() ;
      } else ret = object.slice() ;
      break ;

    case hub.T_HASH:
    case hub.T_OBJECT:
      if (object.clone && hub.typeOf(object.clone) === hub.T_FUNCTION) {
        ret = object.clone() ;
      } else {
        ret = {} ;
        for(var key in object) ret[key] = object[key] ;
      }
    }

    return ret ;
  },

  /**
    Returns a new object combining the values of all passed hashes.

    @param object {Object} one or more objects
    @returns {Object} new Object
  */
  merge: function() {
    var ret = {}, len = arguments.length, idx;
    for(idx=0;idx<len;idx++) hub.mixin(ret, arguments[idx]);
    return ret ;
  },

  /**
    Returns all of the keys defined on an object or hash.  This is useful
    when inspecting objects for debugging.

    @param {Object} obj
    @returns {Array} array of keys
  */
  keys: function(obj) {
    var ret = [];
    for(var key in obj) ret.push(key);
    return ret;
  },

  /**
    Convenience method to inspect an object.  This method will attempt to 
    convert the object into a useful string description.
  */
  inspect: function(obj) {
    var v, ret = [] ;
    for(var key in obj) {
      v = obj[key] ;
      if (v === 'toString') continue ; // ignore useless items
      if (hub.typeOf(v) === hub.T_FUNCTION) v = "function() { ... }" ;
      ret.push(key + ": " + v) ;
    }
    return "{" + ret.join(" , ") + "}" ;
  },

  /**
    Returns a tuple containing the object and key for the specified property 
    path.  If no object could be found to match the property path, then 
    returns null.

    This is the standard method used throughout hub.js to resolve property
    paths.

    @param path {String} the property path
    @param root {Object} optional parameter specifying the place to start
    @returns {Array} array with [object, property] if found or null
  */
  tupleForPropertyPath: function(path, root) {

    // if the passed path is itself a tuple, return it
    if (hub.typeOf(path) === hub.T_ARRAY) return path ;

    // find the key.  It is the last . or first *
    var key ;
    var stopAt = path.indexOf('*') ;
    if (stopAt < 0) stopAt = path.lastIndexOf('.') ;
    key = (stopAt >= 0) ? path.slice(stopAt+1) : path ;

    // convert path to object.
    var obj = this.objectForPropertyPath(path, root, stopAt) ;
    return (obj && key) ? [obj,key] : null ;
  },

  /** 
    Finds the object for the passed path or array of path components.  This is 
    the standard method used in hub.js to traverse object paths.

    @param path {String} the path
    @param root {Object} optional root object.  window is used otherwise
    @param stopAt {Integer} optional point to stop searching the path.
    @returns {Object} the found object or undefined.
  */
  objectForPropertyPath: function(path, root, stopAt) {

    var loc, nextDotAt, key, max ;

    if (!root) root = hub.root ;

    // faster method for strings
    if (hub.typeOf(path) === hub.T_STRING) {
      if (stopAt === undefined) stopAt = path.length ;
      loc = 0 ;
      while((root) && (loc < stopAt)) {
        nextDotAt = path.indexOf('.', loc) ;
        if ((nextDotAt < 0) || (nextDotAt > stopAt)) nextDotAt = stopAt;
        key = path.slice(loc, nextDotAt);
        root = root.get ? root.get(key) : root[key] ;
        loc = nextDotAt+1; 
      }
      if (loc < stopAt) root = undefined; // hit a dead end. :(

    // older method using an array
    } else {

      loc = 0; max = path.length; key = null;
      while((loc < max) && root) {
        key = path[loc++];
        if (key) root = (root.get) ? root.get(key) : root[key] ;
      }
      if (loc < max) root = undefined ;
    }

    return root ;
  },
  
  
  // ..........................................................
  // LOCALIZATION SUPPORT
  // 
  
  /**
    Known loc strings
    
    @property {Hash}
  */
  STRINGS: {},
  
  /**
    This is a simplified handler for installing a bunch of strings.  This
    ignores the language name and simply applies the passed strings hash.
    
    @param {String} lang the language the strings are for
    @param {Hash} strings hash of strings
    @returns {hub} receiver
  */
  stringsFor: function(lang, strings) {
    hub.mixin(hub.STRINGS, strings);
    return this ;
  }
  
  
}); // end mixin

/** @private Alias for hub.clone() */
hub.clone = hub.copy ;

/** @private Alias for hub.A() */
hub.$A = hub.A;

/** @private Used by hub.compare */
hub.ORDER_DEFINITION = [ hub.T_ERROR,
                         hub.T_UNDEFINED,
                         hub.T_NULL,
                         hub.T_BOOL,
                         hub.T_NUMBER,
                         hub.T_STRING,
                         hub.T_ARRAY,
                         hub.T_HASH,
                         hub.T_OBJECT,
                         hub.T_FUNCTION,
                         hub.T_CLASS ];


// ........................................
// FUNCTION ENHANCEMENTS
//

hub.mixin(Function.prototype, 
/** @lends Function.prototype */ {
  
  /**
    Indicates that the function should be treated as a computed property.
    
    Computed properties are methods that you want to treat as if they were
    static properties.  When you use get() or set() on a computed property,
    the object will call the property method and return its value instead of 
    returning the method itself.  This makes it easy to create "virtual 
    properties" that are computed dynamically from other properties.
    
    Consider the following example:
    
    {{{
      contact = hub.Object.create({

        firstName: "Charles",
        lastName: "Jolley",
        
        // This is a computed property!
        fullName: function() {
          return this.getEach('firstName','lastName').compact().join(' ') ;
        }.property('firstName', 'lastName'),
        
        // this is not
        getFullName: function() {
          return this.getEach('firstName','lastName').compact().join(' ') ;
        }
      });

      contact.get('firstName') ;
      --> "Charles"
      
      contact.get('fullName') ;
      --> "Charles Jolley"
      
      contact.get('getFullName') ;
      --> function()
    }}}
    
    Note that when you get the fullName property, hub.js will call the
    fullName() function and return its value whereas when you get() a property
    that contains a regular method (such as getFullName above), then the 
    function itself will be returned instead.
    
    h2. Using Dependent Keys

    Computed properties are often computed dynamically from other member 
    properties.  Whenever those properties change, you need to notify any
    object that is observing the computed property that the computed property
    has changed also.  We call these properties the computed property is based
    upon "dependent keys".
    
    For example, in the contact object above, the fullName property depends on
    the firstName and lastName property.  If either property value changes,
    any observer watching the fullName property will need to be notified as 
    well.
    
    You inform hub.js of these dependent keys by passing the key names
    as parameters to the property() function.  Whenever the value of any key
    you name here changes, the computed property will be marked as changed
    also.
    
    You should always register dependent keys for computed properties to 
    ensure they update.
    
    h2. Using Computed Properties as Setters
    
    Computed properties can be used to modify the state of an object as well
    as to return a value.  Unlike many other key-value system, you use the 
    same method to both get and set values on a computed property.  To 
    write a setter, simply declare two extra parameters: key and value.
    
    Whenever your property function is called as a setter, the value 
    parameter will be set.  Whenever your property is called as a getter the
    value parameter will be undefined.
    
    For example, the following object will split any full name that you set
    into a first name and last name components and save them.
    
    {{{
      contact = hub.Object.create({
        
        fullName: function(key, value) {
          if (value !== undefined) {
            var parts = value.split(' ') ;
            this.beginPropertyChanges()
              .set('firstName', parts[0])
              .set('lastName', parts[1])
            .endPropertyChanges() ;
          }
          return this.getEach('firstName', 'lastName').compact().join(' ');
        }.property('firstName','lastName')
        
      }) ;
      
    }}}
    
    h2. Why Use The Same Method for Getters and Setters?
    
    Most property-based frameworks expect you to write two methods for each
    property but hub.js only uses one. We do this because most of the time
    when you write a setter is is basically a getter plus some extra work.
    There is little added benefit in writing both methods when you can
    conditionally exclude part of it. This helps to keep your code more
    compact and easier to maintain.
    
    @param dependentKeys {String...} optional set of dependent keys
    @returns {Function} the declared function instance
  */
  property: function() {
    this.dependentKeys = hub.$A(arguments) ;
    var guid = hub.guidFor(this) ;
    this.cacheKey = "__hub_cache__" + guid ;
    this.lastSetValueKey = "__hub_lastValue__" + guid ;
    this.isProperty = true ;
    return this ;
  },
  
  /**
    You can call this method on a computed property to indicate that the 
    property is cacheable (or not cacheable).  By default all computed 
    properties are not cached.  Enabling this feature will allow hub.js
    to cache the return value of your computed property and to use that
    value until one of your dependent properties changes or until you 
    invoke propertyDidChange() and name the computed property itself.
    
    If you do not specify this option, computed properties are assumed to be
    not cacheable.
    
    @param {Boolean} aFlag optionally indicate cacheable or no, default true
    @returns {Function} reciever
  */
  cacheable: function(aFlag) {
    this.isProperty = true ;  // also make a property just in case
    if (!this.dependentKeys) this.dependentKeys = [] ;
    this.isCacheable = (aFlag === undefined) ? true : aFlag ;
    return this ;
  },
  
  /**
    Indicates that the computed property is volatile.  Normally hub.js 
    assumes that your computed property is idempotent.  That is, calling 
    set() on your property more than once with the same value has the same
    effect as calling it only once.  
    
    All non-computed properties are idempotent and normally you should make
    your computed properties behave the same way.  However, if you need to
    make your property change its return value everytime your method is
    called, you may chain this to your property to make it volatile.
    
    If you do not specify this option, properties are assumed to be 
    non-volatile. 
    
    @param {Boolean} aFlag optionally indicate state, default to true
    @returns {Function} receiver
  */
  idempotent: function(aFlag) {
    this.isProperty = true;  // also make a property just in case
    if (!this.dependentKeys) this.dependentKeys = [] ;
    this.isVolatile = (aFlag === undefined) ? true : aFlag ;
    return this ;
  },
  
  /**
    Declare that a function should observe an object at the named path.  Note
    that the path is used only to construct the observation one time.
    
    @returns {Function} receiver
  */
  observes: function(propertyPaths) { 
    // sort property paths into local paths (i.e just a property name) and
    // full paths (i.e. those with a . or * in them)
    var loc = arguments.length, local = null, paths = null ;
    while(--loc >= 0) {
      var path = arguments[loc] ;
      // local
      if ((path.indexOf('.')<0) && (path.indexOf('*')<0)) {
        if (!local) local = this.localPropertyPaths = [] ;
        local.push(path);
        
      // regular
      } else {
        if (!paths) paths = this.propertyPaths = [] ;
        paths.push(path) ;
      }
    }
    return this ;
  }
  
});

// ..........................................................
// STRING FUNCTIONS
// 

/**
  Apply formatting options to the string.  This will look for occurrences
  of %@ in your string and substitute them with the arguments you pass into
  this method.  If you want to control the specific order of replacement, 
  you can add a number after the key as well to indicate which argument 
  you want to insert.  

  Ordered insertions are most useful when building loc strings where values
  you need to insert may appear in different orders.

  h3. Examples
  
  {{{
    hub.fmt("Hello %@ %@", 'John', 'Doe') => "Hello John Doe"
    hub.fmt("Hello %@2, %@1", 'John', 'Doe') => "Hello Doe, John"
  }}}
  
  @param str {String, ...} a String followed by optional arguments
  @returns {String} formatted string
*/
hub.fmt = function(str) {
  // first, replace any ORDERED replacements.
  var args = arguments,
      idx  = 1; // the current index for non-numerical replacements
  
  return str.replace(/%@([0-9]+)?/g, function(s, argIndex) {
    argIndex = (argIndex) ? parseInt(argIndex,0)-1 : idx++ ;
    s = args[argIndex];
    return ((s===null) ? '(null)' : (s===undefined) ? '' : s).toString(); 
  }) ;
};

/**
  Splits the string into words, separated by spaces. Empty strings are
  removed from the results.
  
  @returns {Array} an array of non-empty strings
*/
hub.w = function(w) {
  var ary = [], ary2 = w.split(' '), len = ary2.length ;
  for (var idx=0; idx<len; ++idx) {
    var str = ary2[idx] ;
    if (str.length !== 0) ary.push(str) ; // skip empty strings
  }
  return ary ;
};
