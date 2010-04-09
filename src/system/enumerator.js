// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  An object that iterates over all of the values in an enumerable object.
  
  An instance of this object is returned when you call the enumerator() method 
  on an object that implements the hub.Enumerable mixin.
  
  Once you create an enumerator instance, you can call nextObject() on it
  until you can iterated through the entire collection.  Once you have
  exhausted the enumerator, you can reuse it if you want by calling reset().
  
  NOTE: This class is not observable.
  
  @class
*/
hub.Enumerator = function(enumerableObject) {
  this.enumerable = enumerableObject ;
  this.reset() ;
  return this ;
};

hub.Enumerator.prototype = {
  
  /** 
    Returns the next object in the enumeration or undefined when complete.
    
    @returns {Object} the next object or undefined
  */
  nextObject: function() {
    var index = this._hub_index ;
    var len = this._hub_length;
    if (index >= len) return undefined ; // nothing to do
    
    // get the value
    var ret = this.enumerable.nextObject(index, this._hub_previousObject, this._hub_context) ;
    this._hub_previousObject = ret ;
    this._hub_index = index + 1 ;
    
    if (index >= len) {
      this._hub_context = hub.Enumerator._hub_pushContext(this._hub_context); 
    }
    
    return ret ;
  },
  
  /**
    Resets the enumerator to the beginning.  This is a nice way to reuse an 
    existing enumerator.
    
    @returns {hub.Enumerator} receiver
  */
  reset: function() {
    var e = this.enumerable ;
    if (!e) throw hub.E("Enumerator has been destroyed");
    this._hub_length = e.get ? e.get('length') : e.length ;
    var len = this._hub_length;
    this._hub_index = 0;
    this._hub_previousObject = null ;
    this._hub_context = (len > 0) ? hub.Enumerator._hub_popContext() : null;
  },
  
  /**
    Releases the enumerators enumerable object.  You cannot use this object
    anymore.  This is not often needed but it is useful when you need to 
    make sure memory gets cleared.
    
    @returns {void}
  */
  destroy: function() {
    this.enumerable = this._hub_length = this._hub_index = null ;
    this._hub_previousObject = this._hub_context = null ;
  }
  
} ;

/**
  Use this method to manually create a new Enumerator object.  Usually you
  will not access this method directly but instead call enumerator() on the
  item you want to enumerate.

  @param {hub.Enumerable} enumerableObject
  @returns {hub.Enumerator}
*/
hub.Enumerator.create = function(enumerableObject) {
  return new hub.Enumerator(enumerableObject) ;
};

// Private context caching methods.  This avoids recreating lots of context 
// objects.

/* @private */
hub.Enumerator._hub_popContext = function() {
  var ret = this._hub_contextCache ? this._hub_contextCache.pop() : null ;
  return ret || {} ;
} ;

/* @private */
hub.Enumerator._hub_pushContext = function(context) {
  this._hub_contextCache = this._hub_contextCache || [] ;
  var cache = this._hub_contextCache;
  cache.push(context);
  return null ;
};
