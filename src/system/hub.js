// addRecords, addCommit, sendPack; receivePack, checkout, checkoutLatest; createHub, startup, setup

    //CATALOG *addRecords*
    //CATALOG *addCommit*
    //CATALOG *sendPack*

    //CATALOG *receivePack*
    //CATALOG *checkout*
    //CATALOG *checkoutLatest*

    //CATALOG *createHub*
    //CATALOG *startup*
    //CATALOG *setup*

// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub hub_precondition hub_error hub_assert google Gears */

// FIXME: Remove the _hub private hash (promote to top-level) or better yet, 
// do something similar to the hub.Record attirbutes hash.
// FIXME: Code does not parse with the PEG grammar!

/**
  @class
  @extends hub.Store
*/
hub.Hub = hub.Store.extend(
/** @scope hub.Store.prototype */
{
  
  /** Walk like a duck. */
  isHub: true,
  
  // Store the most current metadata for the records in the store.
  metaData: {},

  currentCommit: null,
  checkingOut: null,
  currentCommitId: 0,
  commitKeys: hub.CoreSet.create(),
  commitIdsByKey: {},

  hubKeys: [],
  hubsByKey: {},

  nextCommitId: function() {
    return ++this.currentCommitId ;
  },

  /** 
    A Hash of Record Instances in the form of recordType: [dataKey, dataKey]
    i.e.:
    {
      "App.Task": {
        "0982134098",
        "8721349877"
      }
    }
  */
  _hub_keysByType: {},
  _hub_recordsByKey: {},
  _hub_types: [],
  _hub_sourceByType: {},

  uti: "com.hub.app",
  _hub: {
    key: null,
    head: null,
    setup: false,
    db: null
  },

  /**
    States:
    0: waiting
    1: reading store
    2: writing Records
    3: cleaning up
    4: checking out
    5: sending Pack
    6: setting up
  */
  state: 0,
  goState: function(newState) {
    hub.debug(hub.fmt("Going to state: %@", newState)) ;
    this.state = newState ;
  },


  // ..........................................................
  // DELEGATE SUPPORT
  // 
  /**
    Delegate used to implement fine-grained control over merging, and conflict 
    resolution.
    
    You can assign a delegate object to this property that will be consulted
    for various decisions regarding merging of 'commits', and the confolicts that
    may arise. The object you place here may implement some or all of
    the methods in hub.MergeDelegateProtocol.
    
    @type {hub.MergeDelegateProtocol}
  */
  delegate: null,

  // ..........................................................
  // CHANGESET SUPPORT
  // 
  
  /**
    Applies the changeset but does not commit the changes. Use 
    commitChangeset() if you want the changeset committed immediately.
    
    @param created {Hash|Array} An array of new objects to insert, or a hash 
        with three keys: created, updated, deleted, each containing an array.
    @param updated {Array} An array of existing objects to update.
    @param deleted {Array} An array of existing objects to delete.
    @returns {String} the commit id if the commit was successful, null if not
  */
  applyChangeset: function(created, updated, deleted) {
    var idx, len, dataHash, recordType, storeKey, id, primaryKey,
        status, K = hub.Record, changelog, defaultVal, Store = hub.Store ;
    
    // normalize arguments
    if (typeof created === hub.T_HASH) {
      updated = created.updated ;
      deleted = created.deleted ;
      created = created.created ; // created must be set last
    }
    
    hub_precondition(typeof created === hub.T_ARRAY) ;
    hub_precondition(typeof updated === hub.T_ARRAY) ;
    hub_precondition(typeof deleted === hub.T_ARRAY) ;
    
    // Do not apply the changeset unless the Hub is clean.
    if (!this.get('isClean')) return false ;
    
    // Set up these shared properties outside the loop.
    changelog = this.changelog ;
    if (!changelog) changelog = hub.Set.create() ;
    
    // Create new records.
    for (idx=0, len=created.length; idx<len; ++idx) {
      dataHash = created[idx] ;
      recordType = hub.objectForPropertyPath[dataHash.type] ;
      primaryKey = recordType.prototype.primaryKey ;
      id = dataHash[primaryKey] ;
      
      // Don't use createRecord() here. We don't want to materialize the record.
      // Don't use pushRetrieve() here; it doesn't register as "new".
      // TODO: The following is copied from createRecord(). DRY it up.
      
      // Get the storeKey - base on id if available.
      storeKey = id ? recordType.storeKeyFor(id) : Store.generateStoreKey() ;
      
      // FIXME: This assertion belongs in the two methods called above.
      hub_assert(typeof storeKey === hub.T_NUMBER) ;
      
      // Check the state and do the right thing.
      status = this.readStatus(storeKey);
      
      // Any busy or ready state or destroyed dirty state is not allowed.
      if ((status & K.BUSY)  || 
          (status & K.READY) || 
          (status == K.DESTROYED_DIRTY)) { 
        throw id ? K.RECORD_EXISTS_ERROR : K.BAD_STATE_ERROR ;
        
      // Allow error or destroyed state only with id.
      } else if (!id && (status==hub.DESTROYED_CLEAN || status==hub.ERROR)) {
        throw K.BAD_STATE_ERROR ;
      }
      
      // Add dataHash and set up initial status -- also save recordType.
      this.writeDataHash(storeKey, (dataHash ? dataHash : {}), K.READY_NEW) ;
      
      Store.replaceRecordTypeFor(storeKey, recordType) ;
      this.dataHashDidChange(storeKey) ;
      
      // Record is now in a committable state -- add storeKey to changelog.
      changelog.add(storeKey) ;
    }
    
    // Update existing records.
    for (idx=0, len=updated.length; idx<len; ++idx) {
      dataHash = updated[idx] ;
      recordType = hub.objectForPropertyPath[dataHash.type] ;
      primaryKey = recordType.prototype.primaryKey ;
      id = dataHash[primaryKey] ;
      storeKey = recordType.storeKeyFor(id) ;
      
      // Monkey-patch the internals of hub.Store and friends.
      recordType.storeKeysById()[id] = storeKey ;
      Store.idsByStoreKey[storeKey] = id ;
      Store.recordTypesByStoreKey[storeKey] = recordType ;
      
      // Manually adjust the status.
      this.writeDataHash(storeKey, dataHash, K.READY_DIRTY) ;
      this.dataHashDidChange(storeKey) ;
      
      // Record is now in a committable state -- add storeKey to changelog.
      changelog.add(storeKey) ;
    }
    
    // Delete existing records.
    for (idx=0, len=deleted.length; idx<len; ++idx) {
      dataHash = deleted[idx] ;
      recordType = hub.objectForPropertyPath[dataHash.type] ;
      primaryKey = recordType.prototype.primaryKey ;
      id = dataHash[primaryKey] ;
      storeKey = recordType.storeKeyFor(id) ;
      
      // remove the data hash, set new status
      this.writeStatus(storeKey, K.DESTROYED_DIRTY) ;
      this.dataHashDidChange(storeKey) ;
      
      // Record is now in a committable state -- add storeKey to changelog.
      changelog.add(storeKey) ;
    }
    
    return true ; // FIXME: Actually handle problems.
  },
  
  /**
    Calls this.applyChangset() and then immediately commits the changes. This 
    is usually the method you want to call.
    
    @param created {Hash|Array} An array of new objects to insert, or a hash 
        with three keys: created, updated, deleted, each containing an array.
    @param updated {Array} An array of existing objects to update.
    @param deleted {Array} An array of existing objects to delete.
    @returns {String} the commit id if the commit was successful, null if not
  */
  commitChangeset: function(created, updated, deleted) {
    var ret;
    
    try {
      ret = this.applyChangset(created, updated, deleted) ;
    } catch (e) {
      hub.debug('ERROR', e) ;
      ret = false ;
    }
    
    if (!ret) return null ; // failed to apply the changeset
    
    try {
      ret = this.commitRecords() ;
    } catch (e2) {
      hub.debug('ERROR', e2) ;
      ret = false ;
    }
    
    return ret ? this.get('currentCommit') : null ;
  },
  
  /**
    Returns a hash with three keys: created, updated, deleted, each key 
    containing an array of object hashes in the respective categories needed 
    to take a datastore at the from commit id and advance it to the to commit 
    id.
    
    @param from {String} the commit id to use as a starting point
    @param to {String} the commit id to generate a changeset to
    @returns {Hash} a hash with three keys: created, updated, and deleted
  */
  computeChangeset: function(from, to) {
    // check the changeset cache first
    var csCache = this._hub_changesetCache ;
    if (csCache && csCache[0] === from && csCache[1] === to) {
      hub_assert(typeof csCache[2] === hub.T_HASH) ;
      return csCache[2] ;
    } else {
      // actually compute the changeset
      throw "FIXME: Not implemented." ;
    }
  },
  
  // ..........................................................
  // Store Functions
  //
  addPack: function(pack, version) {
    hub_precondition(this.kindOf(hub.Hub));
    this.receivePack.call(this, pack, {
      version: version,
      dataSource: this,
      doCheckout: true,
      isInternal: true
    });
  },
  hasCommit: function(version) {
    // return this.commitKeys.contains(version);
    return !! this.commitIdsByKey[version];
  },
  extraKeys: function(remoteKeys) {
    var ourKeys = this.commitKeys.clone();
    ourKeys.removeEach(remoteKeys);
    return ourKeys; // This is now a list of keys that we have, and the server dosn't
  },
  // before commit change, get new storekeys.
  
  /**
    Committing Records is all or nothing, we don't need keys or ids.
  */
  commitRecords: function(recordTypes, ids, storeKeys, params) {
    var statuses = this.statuses,
        len = statuses.length,
        K = hub.Record,
        S = hub.Store,
        oldKeys = [],
        idx, ret, storeKey,
        changeset, created = [], updated = [], deleted = [],
        hash, recordType;

    recordTypes = [] ;
    storeKeys = [] ;

    for (storeKey in statuses) {
      storeKey = parseInt(storeKey, 10) ; // FIXME: Shouldn't have to use parseInt() here.
      hub_assert(typeof storeKey === hub.T_NUMBER) ;
      
      // collect status and process
      status = statuses[storeKey] ;

      if ((status == K.EMPTY) || (status == K.ERROR)) {
        throw K.NOT_FOUND_ERROR ;
      }
      else {
        // TODO: Compute and cache a change set here. Calls to 
        // computeChangeset() should check the cache and return it immediately. 
        // This will efficiently handle the most common situation where we need 
        // to tell an external store about a new commit that was already 
        // up-to-date with the previous commit.
        
        // TODO: Why are clean records being handled (and not skipped)?
        if (status == K.READY_CLEAN) {
          storeKeys.push(storeKey);
          recordTypes.push(S.recordTypeFor(storeKey));
          this.writeStatus(storeKey, K.BUSY_COMMITTING);
          this.dataHashDidChange(storeKey, null, true);

        } else if (status == K.READY_NEW) {
          this.writeStatus(storeKey, K.BUSY_CREATING) ;
          this.dataHashDidChange(storeKey, null, true) ;
          storeKeys.push(storeKey) ;
          recordType = S.recordTypeFor(storeKey) ;
          recordTypes.push(recordType) ;
          
          // Save for changeset cache.
          hash = hub.clone(this.readDataHash(storeKey)) ;
          hash['type'] = recordType.recordTypeName ;
          created.push(hash) ;

        } else if (status == K.READY_DIRTY) {
          // We need to make a new store key, for the changed data.
          var newKey = this.changeStoreKey(storeKey) ;
          this.writeStatus(newKey, K.BUSY_COMMITTING) ;
          this.dataHashDidChange(newKey, null, true) ;
          storeKeys.push(newKey) ;
          oldKeys.push(storeKey) ;
          recordType = S.recordTypeFor(storeKey) ;
          if (recordType) recordTypes.push(recordType) ;
          
          // Save for changeset cache.
          hash = hub.clone(this.readDataHash(storeKey)) ;
          hash['type'] = recordType.recordTypeName ;
          updated.push(hash) ;          

        } else if (status & K.DESTROYED) {
          this.writeStatus(storeKey, K.BUSY_DESTROYING) ;
          this.dataHashDidChange(storeKey, null, true) ;
          
          // Save for changeset cache.
          hash = hub.clone(this.readDataHash(storeKey)) ;
          hash['type'] = recordType.recordTypeName ;
          deleted.push(hash) ;

          // Packs don't store destroy records, so just kill it.
          this.dataSourceDidDestroy(storeKey);

        }
        // ignore K.READY_CLEAN, K.BUSY_LOADING, K.BUSY_CREATING, K.BUSY_COMMITTING, 
        // K.BUSY_REFRESH_CLEAN, K_BUSY_REFRESH_DIRTY, K.BUSY_DESTROYING
      }
    }
    
    // create the changeset
    changeset = {
      created: created,
      updated: updated,
      deleted: deleted
    };
    
    // cache it for later (we'll need to fill in the "to" commit later)
    this._hub_changesetCache = [this.get('currentCommit'), null, changeset] ;
    
    if (storeKeys.length > 0) {

      var set = hub.CoreSet.create([storeKey]);
      set.addEach(oldKeys);
      this._hub_notifyRecordArrays(set, hub.CoreSet.create(recordTypes));

      ret = this._hub_commitRecords(storeKeys, params);
    }
    //remove all commited changes from changelog
    if (ret) {
      this.changelog = null;
    }
    return ret;
  },
  
  _hub_commitRecords: function(keys, params) {
    if (!this._hub.key) {
      this._hub.key = hub.uuid();
    }
    if (this.state !== 0) {
      hub_error();
      hub.alert("Data Source is Busy, please save again later.");
      return false;
    }
    var self = this;
    self.goState(1);
    // Update and create are the same for us.
    // self.addRecords(store, keys);
    self.addRecords.call(self, keys, self.nextCommitId());

    return true;
  },

  changeStoreKey: function(storeKey, newKey) {
    hub_precondition(typeof storeKey === hub.T_NUMBER);
    var S = hub.Store;
    if (!newKey) {
      newKey = S.generateStoreKey();
    }
    hub_precondition(typeof newKey === hub.T_NUMBER);

    var recordType = this.recordTypeFor(storeKey),
    recordId = this.idFor(storeKey),
    dataHash = this.readDataHash(storeKey),
    storeKeysById = recordType.storeKeysById(); // TODO: make this faster.
    this.removeRecord(storeKey);
    storeKeysById[recordId] = newKey;
    S.idsByStoreKey[newKey] = recordId;
    S.recordTypesByStoreKey[newKey] = recordType;
    this.writeDataHash(newKey, dataHash, hub.Record.BUSY_COMMITTING); // TODO: is this right?
    this.dataHashDidChange(newKey);
    return newKey;
  },

  removeRecord: function(storeKey, recordType, opts) {
    if (!recordType) recordType = this.recordTypeFor(storeKey);
    var S = hub.Store,
    recordId = this.idFor(storeKey),
    storeKeysById = recordType.storeKeysById();
    if (opts && opts.recordChange && this.changedRecords) { // we are in a nestedHub and need to record.
      this.changedRecords.add(recordId); // So, lets record what has changed.
      this.changesById[recordId] = recordType.DESTROYED; // and how it was changed.
    }
    this.removeDataHash(storeKey, recordType.DESTROYED_CLEAN);
    this.dataHashDidChange(storeKey, null, true);
    delete storeKeysById[recordId];
    delete S.idsByStoreKey[storeKey];
    delete S.recordTypesByStoreKey[storeKey];
    // delete this.statuses[storeKey];
    delete this.revisions[storeKey];
    delete this.editables[storeKey];
    delete this.metaData[recordId];
  },

  // On start up, set next storeKey to max.
  // Call: dataSource.getMaxStoreId(this);
  init: function(uti, params) {
    arguments.callee.base.apply(this, arguments);
    this.startUp();
  },
  from: function() {
    hub_error("DEPRECATED: from is not supported on a hub");
  },
  _hub_getDataSource: function() {
    hub.debug("DEPRECATED: _hub_getDataSource is not supported on a hub");
    hub_precondition(this.kindOf(hub.Hub));
    return this;
  },

  setMaxStoreKey: function(maxStoreKey) {
    hub.debug(hub.fmt('VersionedStore.setMaxStoreKey to %@', maxStoreKey));
    hub.Store.prototype.nextStoreIndex = maxStoreKey;
    hub.Store.nextStoreKey = maxStoreKey;
  },

  isClean: function() {
    hub.debug('VersionedStore.setMaxStoreKey');
    if (!this.statuses) return true; // Status is empty, meaning we are clean
    var len = this.statuses.length;

    while (len--) {
      var status = this.statuses[len];
      // if we find anything other than READY_CLEAN or EMPTY, return false.
      if (! ((status & hub.Record.READY_CLEAN) || (status & hub.Record.EMPTY))) return false;
    }
    return true;
  },

  /**
    DataStore Functions
  */

  addRecords: function(keys, commit_id) {
    if (this.state !== 1) {
      hub.alert("Attempting to add Records while in wrong state (" + this.state + ")");
      return false;
    }
    keys.sort(); // Make sure they are in order
    var i = keys.length,
        self = this,
        // FIXME: This should reference a User and Device object
        currentTask = "foo", // hub.get('currentTask'),
        currentActor = "bar", //hub.get('currentActor'),
        currentTime = new Date().getTime(),
        totalStorage = 0;
    
    // Loop through our records creating new 
    while (i--) {
      var storeKey = parseInt(keys[i], 10),
      recordType = self.recordTypeFor(storeKey),
      pkName = recordType.prototype.primaryKey,
      dataHash = self.readDataHash(storeKey),
      recordId = dataHash[pkName],
      pk;
      if (hub.empty(recordId)) {
        recordId = hub.uuid();
        dataHash[pkName] = recordId;
      }
      var json = JSON.stringify(dataHash),
      props = {
        storeKey: storeKey,
        recordType: recordType,
        recordId: recordId,
        dataHash: dataHash,
        bytes: json,
        storage: json.length,
        key: hub.SHA256(json),
        recordTypeName: recordType.recordTypeName,
        created_on: currentTime
      };
      if (!this._hub_keysByType[props.recordTypeName]) {
        this._hub_keysByType[props.recordTypeName] = [];
        this._hub_types.push(props.recordTypeName);
      }
      this._hub_keysByType[props.recordTypeName].push(props.key);
      this._hub_recordsByKey[props.key] = props;
    }

    var store_bytes = JSON.stringify("store"),
        store_key,
        store_time = currentTime,
        insert_data_sql = self.insertSQL['Data']; // 7
    
    // It's time to insert the data
    hub.debug("* addRecords");
    //CATALOG *addRecords*
  },

  addCommit: function(tx, p) {
    hub.debug('addCommit');
    if (this.state !== 2) {
      hub.alert("Add Commit called with wrong state: (" + this.state + ")");
      return false;
    }
    hub_precondition(hub.typeOf(p.commit_id) === hub.T_NUMBER);
    var self = this,
    totalStorage = p.totalStorage,
    ancestors = JSON.stringify(p.ancestors ? p.ancestors: [this.currentCommit]),
    ancestorCount = ancestors.length,
    key = hub.SHA256("" + p.name + p.committer + p.data),
    insertCommitSql = self.insertSQL['Commit'];

    var insertCommitValues = [key, p.name, p.commit_id, p.meta_uti, p.meta_creator, p.meta_editor, // 6
    p.merger, p.created_on, ancestorCount, totalStorage, p.commit_storage, // 5
    p.history_storage, p.data, p.meta_data, p.committer, ancestors]; // 5 = 16
    
    // make the changeset cache valid now that we know the new commit id
    var csCache = this._hub_changesetCache ;
    if (csCache && csCache[0] === this.get('currentCommit')) {
      csCache[1] = key ; // makes the cache valid
    } // don't remove the cache -- an in-flight commit may have overwritten it
    
    this.set('currentCommit', key) ;
    
    this.commitKeys.add(key);
    this.commitIdsByKey[key] = p.commit_id;

    // Write to hub metadata
    hub.debug("* addCommit");
    //CATALOG *addCommit*
  },

  addMetaData: function(tx, params) {
    hub.debug("addMetaData");
    var self = this;
    if (self.state !== 2) {
      hub.alert("Add MetaData called with wrong state: (" + self.state + ")");
      return false;
    }
    if (params.name === undefined || params.name === "") {
      throw ("I think you have forgotten to give your model a name.\n" + "Please make sure that you have this in each of your models:\n" + "hub.mixin(App.Model,{modelClass: 'App.Model'});");
    }
    var storage = (params.data ? params.data.length + params.storage: params.storage),
    key = self.getMetaDataKey(params, true),
    find_sql = "SELECT count(*) as count FROM meta_data WHERE key = ?",
    sql = self.insertSQL['MetaData'],
    // 14
    p = [key, params.name, params.meta_uti, params.meta_creator, // 4
    params.meta_editor, params.target_uti, params.target_creator, // 3
    params.target_editor, params.target_position, // 2
    storage, params.source, params.target, params.data, params.commit_id]; //4 = 14
    // hub.debug(sql);
    // hub.debug(p);
    tx.executeSql(sql, p,
    function(tx, res) {
      hub.debug("MetaData Added");
    },
    function(tx, err) {
      // hub.debug("Error inserting metaData");
      hub.debug(err);
    });
    return {
      storage: storage,
      key: key
    };
  },
  getMetaDataKey: function(params, secondPass) {
    var string = "" + params.name + params.meta_uti + params.meta_creator + params.meta_editor + params.target_uti + params.target_creator + params.target_editor + params.target_position + params.target + params.data;
    if (secondPass) string += params.source;
    return hub.SHA256(string);
  },
  cleanup: function() {
    this._hub_keysByType = {};
    this._hub_recordsByKey = {};
    this._hub_types = [];
    this._hub_sourceByType = {};
    this.goState(0); // finish up.
  },

  // Fetch is called when the store wants bulk data.
  fetch: function(query) {
    // pull out store (join data to meta data)
    // pull out related record types
    // pull out instances.
  },

  sendPack: function(version, commit_id) {
    var state = this.state;
    // if (state !== 0 && state !== 2) {
    //   hub.debug(hub.fmt("Can't push to server in this state (%@)", state));
    //   hub.alert(hub.fmt("Can't push to server in this state (%@)", state));
    //   return false;
    // }
    if (hub.OfflineMode) {
      hub.debug("Offline mode, no data is being sent");
      this.goState(0);
      return;
    }
    if (!commit_id) commit_id = this.commitIdsByKey[version];
    hub.debug(hub.fmt("Preparing Pack ... %@ : %@", version, commit_id));
    hub_precondition(hub.typeOf(commit_id) === hub.T_NUMBER);
    this.goState(5);
    var self = this;
    hub.debug("* sendPack");
    //CATALOG *sendPack*
    this.goState(0);
  },
  
  _hub_sendPack: function(version, pack, toAdd) {
    if (toAdd.data && toAdd.metaData && toAdd.commit) {
      hub.debug("Calling packCommitted() callback") ;
      this.packCommitted(version, pack) ;
    } else {
      hub.debug("Not yet sending pack.") ;
    }
  },
  
  packCommitted: function(version, pack) {
    hub.debug("No callback has been created for commits. " + "To be notified of commits assign a callback packCommitted(commitId, packData)");
  },
  
  getPack: function(version, doCheckout) {
    var self = this ;
    if (!doCheckout) doCheckout = false;
    // FIXME: Retrieve pack from delegate.
  },
  
  receivePack: function(request, params) {
    var self = params.dataSource,
    version = params.version,
    commit_id = self.commitIdsByKey[version];
    if (commit_id) {
      hub.debug(hub.fmt("Already have commit %@:%@", version, commit_id));
      return;
    }
    self.goState(2); // Start writing records
    var doCheckout = params.doCheckout,
    pack = params.isInternal ? request: request.get('response'),
    insertSQL = self.insertSQL,
    i = pack.length,
    item,
    sql,
    values,
    data;
    commit_id = self.nextCommitId();

    hub.debug("* receivePack");
    //CATALOG *receivePack*
  },

  applyCommits: function(version) {
    // check if this commit is part of this hub, if not, just return.
    if (!this.commitKeys.contains(version)) {
      return;
    }

    // 1. freeze any active references/branches/nested stores during the merge
    var nestedStores = this.get('nestedStores'),
    loc1 = nestedStores ? nestedStores.get('length') : 0,
    loc2 = loc1;
    while (loc1--) {
      nestedStores[loc1].freeze();
    }

    // 2. find the least-common-ancestor of the commit that came in and the root store
    var lca = "",
    current = this.get('currentCommit'); // TODO: fine lca
    // 3. rollback the root store to the LCA
    this.checkout(lca);

    // 4. create nested store A and apply, in order, any local commits
    var storeA = this.createEditingContext({}, hub.MergeHub);
    storeA.goTo(current);

    // 5. create nested store B and apply, in order, whatever commits came in on the push after the LCA commit that is now the root store
    var storeB = this.createEditingContext({}, hub.MergeHub);
    storeB.goTo(version);

    // 6. call Hub.merge(storeA, storeB) to merge the two stores down into the root store (making a new commit – be sure to record the commit ancestors properly)
    this.merge(storeA, storeB);

    // 7. destroy the two nested stores you just created
    storeA.destroy();
    storeB.destroy();

    // 8. unfreeze the nested stores you froze in step 1
    while (loc2--) {
      nestedStores[loc2].unfreeze();
    }
  },

  merge: function(storeA, storeB) {
    var self = this,
    delegate = this.delegate;
    if (delegate && delegate.hubDidStartMerge) delegate.hubDidStartMerge(self, storeA, storeB);
    storeA.changedRecords.forEach(function(recordId) {
      if (storeB.changedRecords.contains(recordId)) {
        if (delegate && delegate.hubDidHaveConflict) {
          delegate.hubDidHaveConflict(storeA, storeB, recordId);
        }
      }
    });
  },

  /** @private Default implementation of delegate method. */
  hubDidHaveConflict: function(head1, head2, recordId) {
    var K = hub.Record;
    // if one is destroyed, automatically choose the other.
    var record1 = head1.idFor(),
    record2 = head2.idFor();
    if (head1.readStatus(record1) & K.DESTROYED) return head2.readDataHash(record2);
    if (head2.readStatus(record2) & K.DESTROYED) return head1.readDataHash(record1);

    // Else newest wins.
    if (head1.created_on > head2.created_on) {
      return head1.readDataHash(record1);
    } else {
      return head2.readDataHash(record2);
    }
  },

  retrieveRecord: function(storeKey, id) {
    hub.debug("* retrieveRecord");
  },

  packListUrl: "/packs/keys/",

  sync: function() {
    var self = this;
    // get list of remote commits.
    hub.Request.getUrl(self.packListUrl).set('isJSON', true).notify(this, this._hub_didGetPackList, {
      dataSource: self
    }).send();
  },

  _hub_didGetPackList: function(request, params) {
    // Local commits: self.commitKeys {hub.CoreSet}
    var self = params.dataSource,
    localKeys = this.commitKeys,
    remoteKeys = hub.CoreSet.create(request.get('response')),
    // figure out which need to go up
    // and which need to go down.
    toPush = localKeys.copy().removeEach(remoteKeys),
    toPull = remoteKeys.copy().removeEach(localKeys),
    pullLen = toPull.length - 1;
    // pull
    toPull.forEach(function(version, idx) {
      hub.debug(hub.fmt("  Getting Pack: %@", version));
      if (idx === pullLen) {
        hub.debug(hub.fmt(" ### get pack %@ of %@", idx, pullLen));
        self.getPack.call(self, version, true);
      } else {
        hub.debug(hub.fmt(" ## get pack %@ of %@", idx, pullLen));
        self.getPack.call(self, version);
      }
    });
    // push
    toPush.forEach(function(version) {
      var cid = self.commitIdsByKey[version];
      hub.debug(hub.fmt("  Sending Pack: %@ - %@", version, cid));
      self.sendPack.call(self, version, cid);
      hub.debug("... sent!");
    });
    // checkout latest ?
    // self.invokeLater('checkoutLatest', 800, store);
  },

  // TODO: add forced ... at some point.
  checkout: function(version, params) {
    hub_precondition(this.kindOf && this.kindOf(hub.Hub)) ;
    
    if (!version) {
      this.checkoutLatest();
      return; // FIXME: Need to return a Boolean here.
    }
    if (!params) params = {};
    if (this.get('checkingOut') === version) {
      hub.debug("Already checking out this version");
      return true ;
    }
    if (this.state !== 0) {
      hub.alert("Checkout called with wrong state: (" + this.state + ")");
      return false;
    }
    if (this.get('currentCommit') === version) {
      hub.debug("Already checked out this version");
      return true ;
    }
    this.set('checkingOut', version);
    this.goState(4);
    if (!this.isClean()) {
      hub.alert('You tried to checkout while the store was not clean. Please commit changes first.');
      this.goState(0);
      return false;
    }
    var self = this,
    currentCommit = self.currentCommit,
    storeKeys = {},
    dataByKey = {},
    currentKeys = hub.CoreSet.create(),
    targetKeys = hub.CoreSet.create();

    // if (!forced) forced = false;
    // find commit
    // Not implimented yet
    // find store
    hub.debug("* checkout");
    //CATALOG *checkout*
  },

  checkoutLatest: function() {
    hub_precondition(this.kindOf(hub.Hub));
    if (!this._hub || !this._hub.head) return;
    hub_precondition(this._hub.head);
    var commit, self = this;
    hub.debug("* checkoutLatest");
    //CATALOG *checkoutLatest*
  },

  createHub: function(tx, params) {
    if (!this._hub.key) this._hub.key = hub.uuid();
    var self = this,
    //CATALOG *createHub*
  },

  startUp: function() {
    hub_precondition(this.kindOf(hub.Hub));
    var self = this;
    hub.debug("* startUp hub");
    //CATALOG *startup*
  },

  settingUp: false,
  setup: function() { // Run after we have done the previous
    var self = this;
    if (hub.empty(self._hub.key)) return; // we don't have a hub setup yet, so wait until we do.
    hub_precondition(!self.settingUp);
    self.settingUp = true;
    hub.debug("* startUp store");
    //CATALOG *setup*
  },


  /*
    Generic Error callback.
  */
  _hub_error: function(tx, e, msg) {
    hub.debug("Error!: " + msg);
    hub.debug(e);
    return false;
  },
});

hub.Hub.prototype.insert = hub.Hub.prototype.createRecord ;
hub.Hub.prototype.destroy = hub.Hub.prototype.deleteRecord ;