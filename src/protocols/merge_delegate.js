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
  
  @protocol
*/
hub.MergeDelegateProtocol = {
  
  // FIXME: Should take an array of heads
  hubDidStartMerge: function(hub, head1, head2) {},
  
  /*
    FIXME: Should take an array of heads
    
    Given 2 instances of the same record, return the record that you want to save.
    This can even be a different record, just make sure it has the same UUID.
    
    @param {hub.MergeHub} The Hub of record 1.
    @param {Number} The storeKey of record 1 (in head1).
    @param {hub.MergeHub} The Hub of record 2.
    @param {Number} The storeKey of record 2 (in head2).
    @returns {Hash} The Data Hash that we want saved.
  */
  hubDidHaveConflict: function(head1, head2, recordId) {
    var K = hub.Record ;
    // if one is destroyed, automatically choose the other.
    var record1 = head1.idFor(),
        record2 = head2.idFor() ;
    if (head1.readStatus(record1) & K.DESTROYED) return head2.readDataHash(record2) ;
    if (head2.readStatus(record2) & K.DESTROYED) return head1.readDataHash(record1) ;
    
    // Else newest wins.
    if (head1.created_on > head2.created_on) {
      return head1.readDataHash(record1) ;
    } else {
      return head2.readDataHash(record2) ;
    }
  }
  
};
