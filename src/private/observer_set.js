// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  This private class is used to store information about observers on a 
  particular key.  Note that this object is not observable.  You create new
  instances by calling hub.beget(hub.ObserverSet) ;
  
  @private
*/
hub.ObserverSet = {

  /** The number of targets in the set. */
  targets: 0,
  
  _hub_membersCacheIsValid: false,
  
  /**
    Adds the named target/method observer to the set.  The method must be
    a function, not a string.
  */
  add: function(target, method, context) {
    var targetGuid = (target) ? hub.guidFor(target) : "__this__";
    
    // get the set of methods
    var methods = this[targetGuid] ;
    if (!methods) {
      methods = this[targetGuid] = hub.CoreSet.create() ;
      methods.target = target ;
      methods.isTargetSet = true ; // used for getMembers().
      this.targets++ ;
    }
    methods.add(method) ;
    
    // context is really useful sometimes but not used that often so this
    // implementation is intentionally lazy.
    if (context !== undefined) {
      var contexts = methods.contexts ;
      if (!context) contexts = {};
      contexts[hub.guidFor(method)] = context ;
    }
    
    this._hub_membersCacheIsValid = false ;
  },
  
  /**
    Removes the named target/method observer from the set.  If this is the
    last method for the named target, then the number of targets will also
    be reduced.
  
    returns true if the items was removed, false if it was not found.
  */
  remove: function(target, method) {
    var targetGuid = (target) ? hub.guidFor(target) : "__this__";
    
    // get the set of methods
    var methods = this[targetGuid] ;    
    if (!methods) return false ;
    
    methods.remove(method) ;
    if (methods.length <= 0) {
      methods.target = null;
      methods.isTargetSet = false ;
      methods.contexts = null ;
      delete this[targetGuid] ;
      this.targets-- ;
      
    } else if (methods.contexts) {
      delete methods.contexts[hub.guidFor(method)];
    }

    this._hub_membersCacheIsValid = false;
    
    return true ;
  },
  
  /**
    Invokes the target/method pairs in the receiver.  Used by hub.RunLoop
    Note: does not support context
  */
  invokeMethods: function() {
    // iterate through the set, look for sets.
    for(var key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      var value = this[key] ;
      if (value && value.isTargetSet) {
        var idx = value.length;
        var target = value.target ;
        while(--idx>=0) value[idx].call(target);
      }
    }
  },
  
  /**
    Returns an array of target/method pairs.  This is cached.
  */
  getMembers: function() {
    if (this._hub_membersCacheIsValid) return this._hub_members ;
    
    // need to recache, reset the array...
    if (!this._hub_members) {
      this._hub_members = [] ;
    } else this._hub_members.length = 0 ; // reset
    var ret = this._hub_members ;

    // iterate through the set, look for sets.
    for(var key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      var value = this[key] ;
      if (value && value.isTargetSet) {
        var idx = value.length;
        var target = value.target ;
        
        // slightly slower - only do if we have contexts
        var contexts = value.contexts ;
        if (contexts) {
          while(--idx>=0) {
            var method = value[idx] ;
            ret.push([target, method, contexts[hub.guidFor(method)]]) ;
          }
        } else {
          while(--idx>=0) ret.push([target, value[idx]]);
        }
      }
    }

    this._hub_membersCacheIsValid = true ;
    return ret ;
  },
  
  /**
    Returns a new instance of the set with the contents cloned.
  */
  clone: function() {
    var oldSet, newSet, key, ret = hub.ObserverSet.create() ;
    for(key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      oldSet = this[key];
      if (oldSet && oldSet.isTargetSet) {
        newSet = oldSet.clone();
        newSet.target = oldSet.target ;
        if (oldSet.contexts) newSet.contexts = hub.clone(oldSet.contexts);
        ret[key] = newSet ;
      }
    }
    ret.targets = this.targets ;
    ret._hub_membersCacheIsValid = false ;
    return ret ;
  },
  
  /**
    Creates a new instance of the observer set.
  */
  create: function() { return hub.beget(this); }
  
} ;

hub.ObserverSet.slice = hub.ObserverSet.clone ;
