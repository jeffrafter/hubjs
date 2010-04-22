// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub */

/**
  hub.Catalog provides easy access to the raw contents of a Hub. Most of the 
  hub.Catalog record types are read-only.
  
  To get an instance of hub.Catalog, do:
    
    var myHub ; // Assume this Hub instance already exists.
    
    // Get the catalog for an existing Hub instance.
    var myHubCatalog = myHub.get('catalog') ;
    
    // You may now access the myHubCatalog record arrays.
    var numOfCommits = myHubCatalog.commits.get('length') ;
  
  Be sure to include catalog.hub.js first! This is not part of the normal 
  hub.js install.
*/
hub.Catalog = hub.Store.extend({
  
  /**
    The Hub this catalog is associated with.
    @type {hub.Hub}
  */
  hub: null,
  
  /** @type {hub.RecordArray} */
  commits: null,
  
  /** @type {hub.RecordArray} */
  branches: null,
  
  /** @type {hub.RecordArray} */
  users: null,
  
  /** @type {hub.RecordArray} */
  devices: null,
  
  /** @type {hub.RecordArray} */
  recordTypes: null,
  
  init: function() {
    arguments.callee.base.apply(this, arguments) ;
    
    this.commits = this.find(hub.Query.create({
      recordType: 'hub.Commit'
    }));
    
    this.branches = this.find(hub.Query.create({
      recordType: 'hub.Branch'
    }));
    
    this.users = this.find(hub.Query.create({
      recordType: 'hub.User'
    }));
    
    this.devices = this.find(hub.Query.create({
      recordType: 'hub.Device'
    }));
    
    this.recordTypes = this.find(hub.Query.create({
      recordType: 'hub.RecordType'
    }));
  }
  
});

hub.Branch = hub.Record.extend({
  
  primaryKey: 'key'
  
});

hub.Commit = hub.Record.extend({
  
  primaryKey: 'key',
  
  name: hub.attr(String, { readOnly: true }),
  
  // FIXME: How is this different from the primary key?
  commit_id: hub.attr(Number, { readOnly: true })
  
  UTI: hub.attr(String, { key: 'commit_uti', readOnly: true }),  
  creator: hub.attr(hub.Key, { key: 'commit_creator', readOnly: true }),
  editor: hub.attr(hub.Key, { key: 'commit_editor', readOnly: true }),
  
  merger: hub.attr(hub.Key, { readOnly: true }),
  created: hub.attr(Date, { key: 'created_on', readOnly: true }),
  
  // TODO: Do we need this property?
  ancestorCount: hub.attr(Number, { key: 'ancestor_count', readOnly: true }),
  
  // TODO: Do we really need to track this? It's the same as the length of the 
  // bytes property! (This is primarily for SQL/App Engine, not hub.js per se.)
  totalStorage: hub.attr(Number, { key: 'total_storage', readOnly: true }),
  
  // TODO: Do we really need to track this? It's the same as the length of the 
  // bytes property! (This is primarily for SQL/App Engine, not hub.js per se.)
  commitStorage: hub.attr(Number, { key: 'commit_storage', readOnly: true }),
  
  // TODO: Do we really need to track this? It's the same as the length of the 
  // bytes property! (This is primarily for SQL/App Engine, not hub.js per se.)
  historyStorage: hub.attr(Number, { key: 'history_storage', readOnly: true }),
  
  data_key,
  commit_data,
  committer,
  ancestors
  
});

hub.Data = hub.Record.extend({
  
  primaryKey: 'key',
  
  // TODO: Do we really need to track this? It's the same as the length of the 
  // bytes property! (This is primarily for SQL/App Engine, not hub.js per se.)
  storage: hub.attr(Number, { readOnly: true }),
  
  bytes: hub.attr(String, { readOnly: true }),
  
  // TODO: Do we need this property?
  matadataCount: hub.attr(Number, { key: 'metadata_count', readOnly: true }),
  storeKey: hub.attr(Number, { key: 'store_key', readOnly: true }),
  
  /** @private The commit this data object was first added on. */
  commit_id: hub.attr(Number, { readOnly: true })
  
});

hub.Metadata = hub.Record.extend({
  
  primaryKey: 'key',
  
  name: hub.attr(String, { readOnly: true }),
  UTI: hub.attr(String, { key: 'meta_uti', readOnly: true }),  
  creator: hub.attr(hub.Key, { key: 'meta_creator', readOnly: true }),
  editor: hub.attr(hub.Key, { key: 'meta_editor', readOnly: true }),
  targetUTI: hub.attr(String, { key: 'target_uti', readOnly: true }),
  targetCreator: hub.attr(hub.Key, { key: 'target_creator', readOnly: true }),
  targetEditor: hub.attr(hub.Key, { key: 'target_editor', readOnly: true }),
  targetPosition: hub.attr(Number, { readOnly: true }),
  
  // TODO: Do we really need to track this? It's the same as the length of the 
  // bytes property! (This is primarily for SQL/App Engine, not hub.js per se.)
  storage: hub.attr(Number, { readOnly: true }),
  
  // FIXME: These next three properties are really relationships. Perhaps 
  // source should be source_key and target should be target_key. Also, perhaps 
  // commit_id below should actually be commit_key.
  source:   hub.attr(hub.Key, { readOnly: true }),
  target:   hub.attr(hub.Key, { readOnly: true }),
  data_key: hub.attr(hub.Key, { readOnly: true }),
  
  /** @private The commit this data object was first added on. */
  commit_id: hub.attr(Number, { readOnly: true })
  
});

/**
  You do not need to subclass this class. hub.js will introspect on the actual 
  record classes based on the provided recordType/primaryKey.
*/
hub.RecordType = hub.Record.extend({
  
  primaryKey: 'recordType'
  
});

/**
  This should be subclassed by the application with app-specific attributes.
*/
hub.User = hub.Record.extend({
  
  primaryKey: 'key'
  
});

/**
  This should be subclassed by the application with app-specific attributes.
*/
hub.Device = hub.Record.extend({
  
  primaryKey: 'key'
  
});
