// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  FIXME: Just document manually (and remove this file).
  
  The hub.ObservableProtocol defines an optional method you can implement on 
  your objects.  It will be used if defined but is not required for observing to
  work.
  
  @protocol
*/
hub.ObservableProtocol = {
  
  /**
    Generic property observer called whenever a property on the receiver 
    changes.
    
    If you need to observe a large number of properties on your object, it
    is sometimes more efficient to implement this observer only and then to
    handle requests yourself.  Although this observer will be triggered 
    more often than an observer registered on a specific property, it also
    does not need to be registered which can make it faster to setup your 
    object instance.
    
    You will often implement this observer using a switch statement on the
    key parameter, taking appropriate action. 
    
    @param observer {null} FIXME: no longer used; usually null
    @param target {Object} the target of the change.  usually this
    @param key {String} the name of the property that changed
    @param value {Object} the new value of the property.
    @param revision {Number} a revision you can use to quickly detect changes.
    @returns {void}
  */
  propertyObserver: function(observer,target,key,value,revision) {}
  
};
