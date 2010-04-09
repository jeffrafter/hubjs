// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

// IMPORTANT NOTE:  This file actually defines two classes: 
// hub.Set is a fully observable set class documented below. 
// hub.CoreSet is just like hub.Set but is not observable.  This is required
// because hub.Observable is built on using sets and requires sets without 
// observability.
//
// We use pointer swizzling below to swap around the actual definitions so 
// that the documentation will turn out right.  (The docs should only 
// define hub.Set - not hub.CoreSet.)

/**
  An unordered collection of objects.

  A Set works a bit like an array except that its items are not ordered.  
  You can create a set to efficiently test for membership for an object. You 
  can also iterate through a set just like an array, even accessing objects
  by index, however there is no gaurantee as to their order.

  Note that hub.Set is a primitive object, like an array.  It does implement
  limited key-value observing support but it does not extend from hub.Object
  so you should not subclass it.

  h1. Creating a Set

  You can create a set like you would most objects using hub.Set.create().  
  Most new sets you create will be empty, but you can also initialize the set 
  with some content by passing an array or other enumerable of objects to the 
  constructor.

  Finally, you can pass in an existing set and the set will be copied.  You
  can also create a copy of a set by calling hub.Set#clone().

  {{{
    // creates a new empty set
    var foundNames = hub.Set.create();

    // creates a set with four names in it.
    var names = hub.Set.create(["Charles", "Peter", "Chris", "Erich"]) ;

    // creates a copy of the names set.
    var namesCopy = hub.Set.create(names);

    // same as above.
    var anotherNamesCopy = names.clone();
  }}}

  h1. Adding/Removing Objects

  You generally add or removed objects from a set using add() or remove().
  You can add any type of object including primitives such as numbers,
  strings, and booleans.

  Note that objects can only exist one time in a set.  If you call add() on
  a set with the same object multiple times, the object will only be added 
  once.  Likewise, calling remove() with the same object multiple times will
  remove the object the first time and have no effect on future calls until 
  you add the object to the set again.

  Note that you cannot add/remove null or undefined to a set.  Any attempt to
  do so will be ignored.  

  In addition to add/remove you can also call push()/pop().  Push behaves just
  like add() but pop(), unlike remove() will pick an arbitrary object, remove
  it and return it.  This is a good way to use a set as a job queue when you
  don't care which order the jobs are executed in.

  h1. Testing for an Object

  To test for an object's presence in a set you simply call hub.Set#contains().
  This method tests for the object's hash, which is generally the same as the
  object's _guid but if you implement the hash() method on the object, it will
  use the return value from that method instead.

  @class
  @extends hub.Enumerable 
  @extends hub.Observable
  @extends hub.Copyable
  @extends hub.Freezable
*/
hub.Set = hub.mixin({},
  hub.Enumerable, hub.Observable, hub.Copyable, hub.Freezable,
/** @scope hub.Set.prototype */ {

  /** 
    Creates a new set, with the optional array of items included in the 
    return set.

    @param {hub.Enumerable} items items to add
    @return {hub.Set}
  */
  create: function(items) {
    var ret, idx, pool = hub.Set._hub_pool, isObservable = this.isObservable;
    if (!isObservable && items===undefined && pool.length>0) ret = pool.pop();
    else {
      ret = hub.beget(this);
      if (isObservable) ret.initObservable();
      
      if (items && items.isEnumerable && items.get('length')>0) {

        ret.isObservable = false; // suspend change notifications
        
        // arrays and sets get special treatment to make them a bit faster
        if (items.isHubArray) {
          idx = items.get ? items.get('length') : items.length;
          while(--idx>=0) ret.add(items.objectAt(idx));
        
        } else if (items.isSet) {
          idx = items.length;
          while(--idx>=0) ret.add(items[idx]);
          
        // otherwise use standard hub.Enumerable API
        } else items.forEach(function(i) { ret.add(i); }, this);
        
        ret.isObservable = isObservable;
      }
    }
    return ret ;
  },
  
  /**
    Walk like a duck
    
    @property {Boolean}
  */
  isSet: true,
  
  /**
    This property will change as the number of objects in the set changes.

    @property {Number}
  */
  length: 0,

  /**
    Returns the first object in the set or null if the set is empty
    
    @property {Object}
  */
  firstObject: function() {
    return (this.length>0) ? this[0] : undefined ;
  }.property(),
  
  /**
    Clears the set 
    
    @returns {hub.Set}
  */
  clear: function() { 
    if (this.isFrozen) throw hub.FROZEN_ERROR;
    this.length = 0;
    return this ;
  },

  /**
    Call this method to test for membership.
    
    @returns {Boolean}
  */
  contains: function(obj) {

    // because of the way a set is "reset", the guid for an object may 
    // still be stored as a key, but points to an index that is beyond the
    // length.  Therefore the found idx must both be defined and less than
    // the current length.
    if (obj === null) return false ;
    var idx = this[hub.hashFor(obj)] ;
    return (!hub.none(idx) && (idx < this.length) && (this[idx]===obj)) ;
  },
  
  /**
    Returns true if the passed object is also a set that contains the same 
    objects as the receiver.
  
    @param {hub.Set} obj the other object
    @returns {Boolean}
  */
  isEqual: function(obj) {
    // fail fast
    if (!obj || !obj.isSet || (obj.get('length') !== this.get('length'))) {
      return false ;
    }
    
    var loc = this.get('length');
    while(--loc>=0) {
      if (!obj.contains(this[loc])) return false ;
    }
    
    return true;
  },

  /**
    Call this method to add an object. performs a basic add.

    If the object is already in the set it will not be added again.

    @param obj {Object} the object to add
    @returns {hub.Set} receiver
  */
  add: function(obj) {
    if (this.isFrozen) throw hub.FROZEN_ERROR;
    
    // cannot add null to a set.
    if (obj===null || obj===undefined) return this; 

    var guid = hub.hashFor(obj) ;
    var idx = this[guid] ;
    var len = this.length ;
    if ((idx===null || idx===undefined) || (idx >= len) || (this[idx]!==obj)){
      this[len] = obj ;
      this[guid] = len ;
      this.length = len+1;
    }
    
    if (this.isObservable) this.enumerableContentDidChange();
    
    return this ;
  },

  /**
    Add all the items in the passed array or enumerable

    @returns {hub.Set} receiver
  */
  addEach: function(objects) {
    if (this.isFrozen) throw hub.FROZEN_ERROR;
    if (!objects || !objects.isEnumerable) {
      throw hub.fmt("%@.addEach must pass enumerable", this);
    }

    var idx, isObservable = this.isObservable ;
    
    if (isObservable) this.beginPropertyChanges();
    if (objects.isHubArray) {
      idx = objects.get('length');
      while(--idx >= 0) this.add(objects.objectAt(idx)) ;
    } else if (objects.isSet) {
      idx = objects.length;
      while(--idx>=0) this.add(objects[idx]);
      
    } else objects.forEach(function(i) { this.add(i); }, this);
    if (isObservable) this.endPropertyChanges();
    
    return this ;
  },  

  /**
    Removes the object from the set if it is found.

    If the object is not in the set, nothing will be changed.

    @param obj {Object} the object to remove
    @returns {hub.Set} receiver
  */  
  remove: function(obj) {
    if (this.isFrozen) throw hub.FROZEN_ERROR;

    if (hub.none(obj)) return this ;
    var guid = hub.hashFor(obj);
    var idx = this[guid] ;
    var len = this.length;

    // not in set.
    if (hub.none(idx) || (idx >= len) || (this[idx] !== obj)) return this; 

    // clear the guid key
    delete this[guid] ;

    // to clear the index, we will swap the object stored in the last index.
    // if this is the last object, just reduce the length.
    if (idx < (len-1)) {
      obj = this[idx] = this[len-1];
      this[hub.hashFor(obj)] = idx ;
    }

    // reduce the length
    this.length = len-1;
    if (this.isObservable) this.enumerableContentDidChange();
    return this ;
  },

  /**
    Removes an arbitrary object from the set and returns it.

    @returns {Object} an object from the set or null
  */
  pop: function() {
    if (this.isFrozen) throw hub.FROZEN_ERROR;
    var obj = (this.length > 0) ? this[this.length-1] : null ;
    if (obj) this.remove(obj) ;
    return obj ;
  },

  /**
    Removes all the items in the passed array.

    @returns {hub.Set} receiver
  */
  removeEach: function(objects) {
    if (this.isFrozen) throw hub.FROZEN_ERROR ;
    if (!objects || !objects.isEnumerable) {
      throw hub.fmt("%@.addEach must pass enumerable", this) ;
    }
    
    var idx, isObservable = this.isObservable ;
    
    if (isObservable) this.beginPropertyChanges();
    if (objects.isHubArray) {
      idx = objects.get('length');
      while(--idx >= 0) this.remove(objects.objectAt(idx)) ;
    } else if (objects.isSet) {
      idx = objects.length;
      while(--idx>=0) this.remove(objects[idx]);
    } else objects.forEach(function(i) { this.remove(i); }, this);
    if (isObservable) this.endPropertyChanges();
    
    return this ;
  },
  
  /**
    Clones the set into a new set.
    
    @returns {hub.Set} new copy
  */
  copy: function() { return this.constructor.create(this); },
  
  /**
    Return a set to the pool for reallocation.
    
    @returns {hub.Set} receiver
  */
  destroy: function() {
    this.isFrozen = false ; // unfreeze to return to pool
    if (!this.isObservable) hub.Set._hub_pool.push(this.clear()) ;
    return this ;
  },
  
  // .......................................
  // PRIVATE 
  //

  /** @private - optimized */
  forEach: function(iterator, target) {
    var len = this.length;
    if (!target) target = this ;
    for(var idx=0;idx<len;idx++) iterator.call(target, this[idx], idx, this);
    return this ;
  },

  /** @private */
  toString: function() {
    var len = this.length, idx, ary = [];
    for(idx=0;idx<len;idx++) ary[idx] = this[idx];
    return hub.fmt("hub.Set<%@>", ary.join(',')) ;
  },
  
  // the pool used for non-observable sets
  _hub_pool: [],

  /** @private */
  isObservable: true

}) ;

hub.Set.constructor = hub.Set;

// Make hub.Set look a bit more like other enumerables

/** @private */
hub.Set.clone = hub.Set.copy ;

/** @private */
hub.Set.push = hub.Set.unshift = hub.Set.add ;

/** @private */
hub.Set.shift = hub.Set.pop ;

// add generic add/remove enumerable support

/** @private */
hub.Set.addObject = hub.Set.add ;

/** @private */
hub.Set.removeObject = hub.Set.remove;

hub.Set._hub_pool = [];

// ..........................................................
// CORE SET
// 

/**
  CoreSet is just like set but not observable.  If you want to use the set 
  as a simple data structure with no observing, CoreSet is slightly faster
  and more memory efficient.
  
  @class
  @extends hub.Set
*/
hub.CoreSet = hub.beget(hub.Set);

/** @private */
hub.CoreSet.isObservable = false ;

/** @private */
hub.CoreSet.constructor = hub.CoreSet;
