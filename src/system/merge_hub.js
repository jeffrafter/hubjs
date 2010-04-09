// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  During a merge, each head is represented by a MergeHub instance.
  
  MergeHubs are hub.ChildStores with additional Hub-related information, such 
  as the commit they are at, the device that made the commit, etc.
  
  You can still call MergeHub#createEditingContext() if you need an editing 
  context to work with.
  
  @class
  @extends Hub
  @extends hub.ChildStore
*/
hub.MergeHub = hub.Hub.extend(hub.ChildStore,
  /** @scope hub.MergeHub.prototype */ {
  
  changedRecords: hub.CoreSet.create(),
  changesById: {},
  
  _hub_currentCommit: null,
  
  currentCommit: function() {
    if(this._hub_currentCommit) {
      return this._hub_currentCommit ;
    } else {
      var pstore = this.get('parentStore') ;
      hub_assert(pstore && pstore.isHub) ;
      pstore.get('currentCommit') ;
    }
  }.property('_hub_currentCommit').cacheable(),
  
  goTo: function(version) {
    // var cversion = this.get('currentCommit') ;
    
    this.checkout(version) ;
    
    // select all commits between cversion and version
    // find the new storeKeys
    // apply only these changes
  }
  
});
