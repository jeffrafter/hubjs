// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub hub_precondition hub_error hub_assert google Gears */

// FIXME: Code is not using proper prefixes in private properties and methods.
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

  hasSocket: false,

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

  uti: "com.sprouthub.app",
  _hub: {
    name: null,
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
      a: waiting
      b: running SQL 
      c: error
    3: cleaning up
    4: checking out
    5: sending Pack
    6: setting up
  */
  state: 0,
  dbState: "a",
  goState: function(newState) {
    hub.debug(hub.fmt("Going to state: %@", newState)) ;
    this.state = newState ;
  },
  goDbState: function(newState) {
    hub.debug(hub.fmt("Going to DB state: %@", newState)) ;
    this.dbState = newState ;
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
      dataHash = created[idx] ;
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
      dataHash = created[idx] ;
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
      this.ensureHubName();
    }
    if (this.state !== 0) {
      hub_error();
      alert("Data Source is Busy, please save again later.");
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
      alert("Attempting to add Records while in wrong state (" + this.state + ")");
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
    this.sendToDB(function(tx) {
      self.goState(2);
      var typeMetaKeys = [],
      typeMetaByKey = {};
      
      // Then Types Types
      self._hub_types.forEach(function(type) {
        var type_bytes = JSON.stringify(type),
        type_time = currentTime,
        childMetaDataKeys = [],
        metaDataByKey = {};

        // Walk through each instance
        self._hub_keysByType[type].forEach(function(instanceKey) {
          var data = self._hub_recordsByKey[instanceKey];
          // hub.debug(hub.fmt("saving data for: %@", data.storeKey));
          tx.executeSql(insert_data_sql, [data.key, data.created_on, data.storage, data.bytes, 0, data.storeKey, commit_id],
          function() {
            // hub.debug(hub.fmt("Saved instance data entry %@", data.key));
          },
          function(tx, error) {
            // hub.debug("Error saving data entry 144");
            hub.debug(error);
          });
          var meta_data, ret, instkey;
          
          // Generate first pass key and store data
          ret = self.metaData[data.recordId];
          if (!ret) {
            ret = {
              name: data.recordId,
              meta_uti: "com.hub.link",
              meta_creator: currentTask,
              meta_editor: "",
              target_uti: "com.hub.instance",
              target_creator: currentTask,
              target_editor: "",
              target_position: -1,
              data: ''
            };
            self.metaData[data.recordId] = ret;
          } else {
            ret.meta_editor = currentTask;
            ret.target_editor = currentTask;
          }
          ret.commit_id = commit_id;
          ret.target = data.key;
          ret.source = type;
          ret.storage = data.storage;

          instkey = self.getMetaDataKey(ret);
          childMetaDataKeys.push(instkey);
          metaDataByKey[instkey] = ret;
          totalStorage += data.storage;
          self.dataSourceDidComplete(data.storeKey, null, data.recordId);
        }); // end each instance
        
        // Add The Record Type.
        var type_key = hub.SHA256("" + type_bytes + childMetaDataKeys.sort().join(""));
        tx.executeSql(insert_data_sql, [type_key, type_time, 0, type_bytes, 1, null, commit_id],
        function() {
          // hub.debug(hub.fmt("Saved type data entry %@", type_key));
        },
        function(tx, error) {
          // hub.debug("Error saving type data entry");
          hub.debug(error);
        });
        // Get info for Link between Store and Record Type
        var tmData = self.metaData[type];
        if (!tmData) {
          tmData = {
            name: type,
            meta_uti: "com.hub.link",
            meta_creator: currentTask,
            meta_editor: "",
            target_uti: "com.hub.record",
            target_creator: currentTask,
            target_editor: "",
            target_position: -1,
            storage: 0,
            data: null
          };
          self.metaData[type] = tmData;
        } else {
          tmData.meta_editor = currentTask;
          tmData.target_editor = currentTask;
        }
        tmData.commit_id = commit_id;
        tmData.source = store_key;
        tmData.target = type_key;

        var tmKey = self.getMetaDataKey(tmData);
        typeMetaKeys.push(tmKey);
        typeMetaByKey[tmKey] = tmData;

        var mi = childMetaDataKeys.length;
        while (mi--) {
          var mdata = metaDataByKey[childMetaDataKeys[mi]];
          mdata.source = type_key;
          self.addMetaData.call(self, tx, mdata);
        }

      }); // end each type
      
      // Now create the Store
      store_key = hub.SHA256("" + store_bytes + typeMetaKeys.sort().join(""));
      tx.executeSql(insert_data_sql, [store_key, store_time, store_bytes.length, store_bytes, 0, null, commit_id],
      function() {
        // hub.debug(hub.fmt("Saved store data entry %@", type_key));
      },
      function(tx, error) {
        // hub.debug("Error saving store data entry");
        hub.debug(error);
      });

      var ti = typeMetaKeys.length;
      while (ti--) {
        var tdata = typeMetaByKey[typeMetaKeys[ti]];
        tdata.source = store_key;
        self.addMetaData.call(self, tx, tdata);
      }

      // Add the commit.
      self.addCommit.call(self, tx, {
        name: "commit",
        meta_uti: "com.hub.commit",
        meta_creator: currentTask,
        meta_editor: currentTask,
        merger: currentTask,
        created_on: currentTime,
        totalStorage: totalStorage,
        commit_storage: 0,
        history_storage: 0,
        data: store_key,
        meta_data: null,
        committer: currentActor,
        commit_id: commit_id
      });
      // hub.debug("Commit'd!");
      tx.executeSql("UPDATE data SET metadata_count = (SELECT COUNT(*) FROM meta_data where target = data.key)", [], undefined, self._hub_error);

    },
    null,
    function() { // Run when Send to db is finished.
      self.goState(3);
      self.cleanup();
    },
    true // true = this is an internal call.
    ); // end sendToDB
  },

  addCommit: function(tx, p) {
    hub.debug('addCommit');
    if (this.state !== 2) {
      alert("Add Commit called with wrong state: (" + this.state + ")");
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
    self.sendToDB(function(tx) {

      self.ensureHubName.call(self);

      var hubName = self._hub.name,
      hubKey = self._hub.key,
      insertHubCommitSql = self.insertSQL['HubCommit'],
      insertHubCommitValues = [hubKey, key],
      updateSql = "UPDATE hub SET head = ?, name = ? WHERE key = ?",
      updateValues = [key, hubName, hubKey];

      tx.executeSql(updateSql, updateValues,
      function(tx, res) {},
      self._hub_error);

      tx.executeSql(insertHubCommitSql, insertHubCommitValues,
      function(tx, res) {},
      self._hub_error);
      self._hub.head = key;

    },
    null, null, true, true); // sendToDB('hub')
    tx.executeSql(insertCommitSql, insertCommitValues,
    function(tx, res) {
      // success
      hub.debug("Added Commit");
      self.sendPack.call(self, key, p.commit_id);
    },
    self._hub_error);
  },

  addMetaData: function(tx, params) {
    hub.debug("addMetaData");
    var self = this;
    if (self.state !== 2) {
      alert("Add MetaData called with wrong state: (" + self.state + ")");
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

  _hub_sendPackURL: '/packs/?pk=%@',
  _hub_receivePackURL: '/packs/?pk=%@',

  sendPack: function(version, commit_id) {
    var state = this.state;
    // if (state !== 0 && state !== 2) {
    //   hub.debug(hub.fmt("Can't push to server in this state (%@)", state));
    //   alert(hub.fmt("Can't push to server in this state (%@)", state));
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
    self.sendToDB(function(tx) {
      var pack = [],
      toAdd = {};
      tx.executeSql("SELECT * FROM data WHERE commit_id = ?", [commit_id],
      function(tx, result) {
        var i = result.rows.length,
        row, item, key, data;
        while (i--) {
          row = result.rows.item(i);
          key = row.key;
          data = {
            metadata_count: row.metadata_count,
            storage: parseInt(row.storage, 10),
            created_on: parseInt(row.created_on, 10),
            bytes: row.bytes
          };
          item = {
            "pk": key,
            "model": "Data",
            "fields": data
          };
          hub.debug(hub.inspect(item.fields));
          pack.push(item);
        }
        toAdd["data"] = true;
        self._hub_sendPack.call(self, version, pack, toAdd);
      });
      tx.executeSql("SELECT * FROM meta_data WHERE commit_id = ?", [commit_id],
      function(tx, result) {
        var j = result.rows.length,
        row, item, key;
        while (j--) {
          row = result.rows.item(j);
          key = row.key;
          delete row.key;
          delete row.commit_id;
          item = {
            "pk": key,
            "model": "MetaData",
            "fields": row
          };
          pack.push(item);
        }
        toAdd["metaData"] = true;
        self._hub_sendPack.call(self, version, pack, toAdd);
      });
      hub.debug(hub.fmt("Finding commit with id: %@", commit_id));
      tx.executeSql("SELECT * FROM commits WHERE commit_id = ?", [commit_id],
      function(tx, result) {
        var row = result.rows.item(0),
        key = row.key,
        data;
        data = hub.clone(row);
        delete data.key;
        delete data.commit_id;
        data.created_on = parseInt(data.created_on, 10);
        var item = {
          "pk": key,
          "model": "Commit",
          "fields": data
        };
        pack.push(item);
        toAdd["commit"] = true;
        self._hub_sendPack.call(self, version, pack, toAdd);
      });
    });
    this.goState(0);

  },
  _hub_sendPack: function(version, pack, toAdd) {
    if (toAdd.data && toAdd.metaData && toAdd.commit) {
      var dataHash = pack,
      url = hub.fmt(this._hub_sendPackURL, version);
      hub.debug("Calling packCommited call back");
      // if (this.get('hasSocket')) { // Send Via Socket if we have one.
      //   SproutDB.webSocket.send(version+":"+JSON.stringify(pack)) ;
      // } else { // Else send via ajax.
      //   hub.Request.postUrl(url).set('isJSON', true)
      //     .notify(this, this._didSendPack, {
      //       version: version
      //     }).send(dataHash) ;
      // }
      this.packCommitted(version, pack);
    } else {
      hub.debug("Not yet sending pack.");
    }
  },
  packCommitted: function(version, pack) {
    hub.debug("No callback has been created for commits. " + "To be notified of commits assign a callback packCommitted(commitId, packData)");
  },
  // _didSendPack: function(request, params) {
  //   var response  = request.get('response') ;
  //   if (hub.ok(response)) {
  //     hub.debug('sendPack Success!') ;
  //   } else {
  //     hub.debug("sendPack FAILED!") ;
  //   }
  // },
  getPack: function(version, doCheckout) {
    var self = this,
    url = hub.fmt(this._hub_receivePackURL, version);
    if (!doCheckout) doCheckout = false;
    hub.Request.getUrl(url).set('isJSON', true).notify(this, this.receivePack, {
      version: version,
      dataSource: self,
      doCheckout: doCheckout
    }).send();
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
    self.sendToDB.call(self,
    function(tx) {
      while (i--) {
        item = pack[i];
        data = item.fields;
        sql = insertSQL[item.model];

        switch (item.model) {
        case 'Data':
          values = [
          item.pk, new Date(data.created_on).getTime(), data.storage, data.bytes, data.metadata_count, hub.Store.generateStoreKey(), commit_id];
          break;

        case 'MetaData':
          values = [item.pk, data.name, data.meta_uti, data.meta_creator, data.meta_editor, data.target_uti, data.target_creator, data.target_editor, data.target_position, data.storage, data.source, data.target, data.data_key, commit_id];
          break;

        case 'Commit':
          values = [item.pk, data.name, commit_id, data.commit_uti, // 4
          data.commit_creator, data.commit_editor, data.merger, // 3
          new Date(data.created_on).getTime(), data.ancestor_count, data.total_storage, //3
          data.commit_storage, data.history_storage, data.data_key, // 3
          data.commit_data, data.committer, // 3
          data.ancestors]; // 1
          break;
        }

        tx.executeSql(sql, values, undefined,
        function(tx, err) {
          hub.debug(err);
          hub.debug(sql);
          hub.debug(values);
        });
      }
    },
    null,
    function() {
      self.commitKeys.add(version);
      self.commitIdsByKey[version] = commit_id;
      self.goState(0);
      if (doCheckout) {
        hub.debug("Checking out after sync");
        self._hub.head = version; // TODO: remove this, and setup mergeing properly. This is just for the demo.
        self.checkoutLatest.call(self);
      } else {
        hub.debug("Not checking out just yet");
      }
      // self.applyCommits(version);
    },
    true);

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
    this.sendToDB(function(tx) {
      tx.executeSql("SELECT * FROM data WHERE store_key = ?", [storeKey],
      function(tx, result) {
        if (result.rows.length > 0) {
          var row = result.rows.item(0),
          record = JSON.parse(row['bytes']);
          // Bonsai.debug['row'] = row;
          self.dataSourceDidComplete(storeKey, record);
        } else {
          hub_error();
        }
      },
      function(tx, error) {
        self.dataSourceDidError(storeKey, error);
      });
    });
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

  openHubDialog: function(viewFun) {
    var self = this;
    this.sendToDB(function(tx) {
      var sql = "SELECT * FROM hubs WHERE meta_uti = ?";
      tx.executeSql(sql, [self.get('uti')],
      function(tx, res) {
        var i = res.rows.length,
        row, hub, hubs = [];
        while (i--) {
          row = res.rows.item(i);
          hubs.unshift({
            key: row['key'],
            name: row['name']
          });
          viewFun(hubs);
        }
      },
      self._hub_error);
    },
    null, null, true, true);
  },
  openHub: function(hubKey, hubName) {
    this._hub = {
      key: hubKey,
      name: hubName,
      head: null,
      setup: false,
      db: null
    };
    this.checkoutLatest();
  },

  saveAsDialog: function() {

},
  saveAs: function(hubKey, hubName) {
    var self = this;
    this.sendToDB(function(tx) {
      var sql = "UPDATE hub SET name = ? WHERE key = ?",
      values = [hubName, hubKey];

      tx.executeSql(sql, values,
      function(tx, res) {

},
      self._hub_error);
    });
  },

  ensureHubName: function() {
    hub_precondition(this.kindOf && this.kindOf(hub.Hub));
    if (hub.empty(this._hub.name)) {
      var newHubName = prompt("What name do you want to save this sproutHub file as?", "MyHub");
      this._hub['name'] = newHubName ? newHubName: 'MyHub';
    }
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
      alert("Checkout called with wrong state: (" + this.state + ")");
      return false;
    }
    if (this.get('currentCommit') === version) {
      hub.debug("Already checked out this version");
      return true ;
    }
    this.set('checkingOut', version);
    this.goState(4);
    if (!this.isClean()) {
      alert('You tried to checkout while the store was not clean. Please commit changes first.');
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
    this.sendToDB(function(tx) {
      var storeKeySql = "SELECT data.store_key, data.key, commits.key as commitKey, src_md.name as type, data.bytes" + " FROM data" + " JOIN meta_data ON (data.key = meta_data.target)" + " JOIN meta_data AS src_md ON (meta_data.source = src_md.target)" + " JOIN commits ON (commits.commit_id = src_md.commit_id)" + " WHERE data.store_key IS NOT NULL" + " AND commits.key IN (?,?)",
      storeKeyValues = [currentCommit, version];
      tx.executeSql(storeKeySql, storeKeyValues,
      function(tx, res) {
        var si = res.rows.length,
        S = hub.Store,
        K = hub.Record,
        data, recordType, recordId, storeKeysById, storeKey, opts;
        while (si--) {
          var row = res.rows.item(si),
          sKey = parseInt(row['store_key'], 10);
          if (row['commitKey'] == currentCommit) {
            currentKeys.add(sKey);
          } else {
            targetKeys.add(sKey);
          }
          dataByKey[sKey] = {
            type: row['type'],
            pk: row['key'],
            bytes: JSON.parse(row['bytes'])
          };
        }
        var toDelete = currentKeys.copy().removeEach(targetKeys),
        toCreate = targetKeys.copy().removeEach(currentKeys);

        opts = this.changedRecords ? {
          recordChange: true
        }: undefined;
        toDelete.forEach(function(storeKey) {
          hub_precondition(typeof storeKey === hub.T_NUMBER);
          // data = dataByKey[storeKey];
          self.removeRecord(storeKey, opts);
        });

        toCreate.forEach(function(storeKey) {
          hub_precondition(typeof storeKey === hub.T_NUMBER);
          data = dataByKey[storeKey];
          recordType = hub.objectForPropertyPath(data['type']);
          recordId = data.bytes[recordType.prototype.primaryKey];
          storeKeysById = recordType.storeKeysById();
          storeKeysById[recordId] = storeKey;
          S.idsByStoreKey[storeKey] = data['key'];
          S.recordTypesByStoreKey[storeKey] = recordType;
          self.writeDataHash(storeKey, data['bytes'], K.READY_CLEAN); // TODO: is this right?
          self.dataHashDidChange(storeKey);
          if (opts) { // we are in a nestedHub
            this.changedRecords.add(recordId); // So, lets record what has changed.
            this.changesById[recordId] = K.DIRTY; // and how it was changed.
          }
        });
      },
      function(tx, err) {
        hub.debug("Error in Checkout.");
        hub.debug(err);
        return false;
      });
    },
    null,
    function() {
      self.set('currentCommit', version);
      self.set('checkingOut', null);
      this.goState(0);
    },
    true);
  },
  checkoutLatest: function() {
    hub_precondition(this.kindOf(hub.Hub));
    if (!this._hub || !this._hub.head) return;
    hub_precondition(this._hub.head);
    var commit, self = this;
    hub.debug("* checkoutLatest");
    this.sendToDB(function(tx) {
      // Select the first hub that is part of this application.
      var sql = "SELECT * FROM commits WHERE key = ?";
      tx.executeSql(sql, [self._hub.head],
      function(tx, res) {
        if (res.rows.length > 0) {
          // We have a hub, so checkout the latest commit from that hub.
          var row = res.rows.item(0);
          commit = row['key'];
          self.databaseDesc = self.databaseName = row['hub_name'];
        }
      });
    },
    null,
    function() {
      if (commit) {
        hub.debug(hub.fmt("Checking out %@", commit));
        self.checkout.call(self, commit);
      } else {
        hub.debug("Found no commits to checkout.");
      }
    },
    true);
  },

  createHub: function(tx, params) {
    if (!this._hub.key) this._hub.key = hub.uuid();
    var self = this,
    insertHubSql = self.insertSQL['Hub'],
    name = (self._hub.name || "DefaultName"),
    insertHubValues = [self._hub.key, name, self.get('uti'), params.creator, params.editor || "", 0, 0, params.version, "", ""];
    self._hub.name = name;
    // TODO: Make sure this actually does stuff
    // insertHubSql = "COMMIT; BEGIN TRANSACTION; "+insertHubSql+"; COMMIT; BEGIN TRANSACTION; ";
    tx.executeSql(insertHubSql, insertHubValues,
    function(tx, res) {
      hub.debug(hub.fmt("Created Hub: %@: %@", self._hub.name, self._hub.key));
    },
    self._hub_error);
  },

  startUp: function() {
    hub_precondition(this.kindOf(hub.Hub));
    var self = this;
    hub.debug("* startUp hub");
    self.sendToDB(function(tx) {
      tx.executeSql("SELECT * FROM hub WHERE meta_uti = ?", [self.get('uti')],
      function(tx, res) {
        if (res.rows.length > 0) {
          var row = res.rows.item(0);
          self._hub.key = row['key'];
          self._hub['name'] = row['name'];
          self._hub.head = row['head'];
          hub.debug(hub.fmt("Loading hub: %@; %@", self._hub.key, self._hub.name));
        } else {
          self.createHub.call(self, tx, {
            version: 'empty',
            creator: self.get('currentTask'),
            editor: ''
          });
        }

        tx.executeSql("SELECT * FROM hub_commit WHERE hub = ?", [self._hub.key],
        function(tx, res) {
          var i = res.rows.length,
          row;
          // hub.debug(hub.fmt("^ adding %@ commits for hub %@", i, self._hub.key)) ;
          while (i--) {
            row = res.rows.item(i);
            // hub.debug(hub.fmt("Adding commit %@", row['commit'])) ;
            self.commitKeys.add(row['commit']);
            self.commitIdsByKey[row['commit']] = parseInt(row['commit_id'], 10);
          }
          // hub.debug(self.commitKeys.toString()) ;
        },
        self._hub_error);

      },
      self._hub_error);

    },
    null, self.setup, true, true); // sendToDB('hub')
  },

  settingUp: false,
  setup: function() { // Run after we have done the previous
    var self = this;
    if (hub.empty(self._hub.key)) return; // we don't have a hub setup yet, so wait until we do.
    hub_precondition(!self.settingUp);
    self.settingUp = true;
    hub.debug("* startUp store");
    self.sendToDB(function(tx) {
      // Set the max storeKey for the store.
      tx.executeSql("SELECT MAX(store_key)+1 AS max FROM data", [],
      function(tx, results) {
        var max;
        try {
          max = parseInt(results.rows.item(0)['max'], 10);
        } catch(e) {
          max = 1;
        }
        if (isNaN(max)) max = 1;
        hub_precondition(typeof max === hub.T_NUMBER);
        self.setMaxStoreKey(max);
        self.checkoutLatest.call(self);
      },
      self._hub_error);

      // Get the current max commit count.
      tx.executeSql("SELECT MAX(commit_id) as max FROM commits", [],
      function(tx, res) {
        var max = parseInt(res.rows.item(0)['max'], 10);
        if (isNaN(max)) max = 0;
        self.currentCommitId = max;
      },
      self._hub_error);

      tx.executeSql("SELECT commit_id, key FROM commits", [],
      function(tx, res) {
        var i = res.rows.length,
        row;
        while (i--) {
          row = res.rows.item(i);
          // self.commitKeys.add(row['key']) ; // This is now done in startUp, from the hubs DB
          self.commitIdsByKey[row['key']] = parseInt(row['commit_id'], 10);
        }
      },
      self._hub_error);
    },
    null,
    function() {
      // self.sync(store);
      self._hub.setup = true;
      self.settingUp = false;
      // TODO: Make startup Hook?
    },
    true); // sendToDB(store)
  },

  _hub_dbs: {},
  // Holds databases for 'SproutHub' and <hubKey>
  _hub_sqlQueue: [],
  _hub_sqlInternalQueue: [],
  /** 
    Add State check, and only run when not touching DB.
    If not in correct state, then add to FIFO queue, and invokeLater sendToDB
  */
  sendToDB: function(func, noDB, onFinish, internal, isHub) {
    hub_precondition(this.kindOf && this.kindOf(hub.Hub)); // Make sure we are in the correct context.
    hub_precondition(this.dbState !== 'c', "Database is in error state.");
    var self = this,
    dbName, dbDesc;
    if (this.dbState === "b" || (this.state === 4 && this._hub_sqlInternalQueue.length > 0 && !internal)) {
      if (internal) {
        this._hub_sqlInternalQueue.push(arguments);
      } else {
        this._hub_sqlQueue.push(arguments);
      }
      // this.invokeLast("invokeSendToDB");
      setTimeout(function() {
        self.invokeSendToDB.apply(self);
      },
      500);
      return;
    }

    this.goDbState("b");
    if (isHub) {
      dbName = "SproutHub";
      dbDesc = "SproutHub Metadata";
    } else {
      dbName = self._hub.key;
      dbDesc = dbName + " DataStore";
    }
    if (!dbName) {
      hub.debug('No Hub yet, wait till we have one.');
      self.invokeLater.apply(self);
      return;
    }
    if (!isHub && !self.settingUp && !self._hub.setup) {
      self.setup();
    }
    if (self._hub_dbs[dbName]) {
      hub.debug("Running Query with existing database.");
      self._hub_dbs[dbName].transaction(function(tx) {
        func(tx);
      },
      function(error) {
        self.goDbState("c");
        hub.debug("ERROR: Transaction Errored.");
        hub.debug(error);
        hub_error();
      },
      function() {
        if (onFinish) onFinish.apply(self);
        self.goDbState("a");
        self.invokeSendToDB.apply(self);
      });
    } else {
      if (noDB) {
        noDB();
        if (onFinish) onFinish.apply(self);
        self.goDbState("a");
        return self.invokeSendToDB.apply(self);
      }
      var errmsg = "Sorry, No DB today.",
      new_db = null;
      try {
        if (window.openDatabaseSync || window.openDatabase || (google.gears.factory && google.gears.factory.create)) {
          if (window.openDatabaseSync) {
            new_db = window.openDatabaseSync(dbName, "1.1", dbDesc, 5000000);
            new_db.addListener("commit",
            function() {
              hub.debug("COMMIT");
            });

            new_db.addListener("update",
            function(operation, database, table, rowid) {
              hub.debug("update " + operation + " " + database + "." + table + " " + rowid);
            });
          } else if (window.openDatabase) {
            new_db = window.openDatabase(dbName, "1.1", dbDesc, 5000000);
          } else {
            // Must be google gears
            new_db = Gears.openDatabase(dbName, "1.1");
          }
          if (!new_db) {
            alert(errmsg + " Couldn't open, maybe bad version or run out of DB quota.");
          } else {
            // We have a database, now test to see if we have a table.
            // Just just need to test for 1 table, thanks to transactions we should
            // have all or none.
            new_db.transaction(function(tx) {
              tx.executeSql(hub.fmt("SELECT COUNT(*) FROM %@", isHub ? "hub": "data"), [],
              function(tx) {
                hub.debug("We have our data tables.");
                self._hub_dbs[dbName] = new_db;
                func(tx);
              },
              function(tx, err) {
                hub.debug("We don't have the data table ...");
                if (isHub) {
                  self._createHubTables(tx);
                } else {
                  self._createStoreTables(tx);
                }
                // tx.executeSql('COMMIT') ;
                // tx.executeSql('BEGIN TRANSACTION') ;
                func(tx);
                hub.debug('end callback');
                return false; // Let the transaction know that we handelled the error.
              });
            },
            function(error) {
              hub.debug("ERROR: Transaction Errored! " + error.message);
              self.goDbState("c");
              hub_error("transaction error");
              // self.invokeSendToDB.apply(self);
            },
            function() {
              if (onFinish) onFinish.apply(self);
              self.goDbState("a");
              self.invokeSendToDB.apply(self);
            });
          }
        } else if (window.google.factory && window.google.factory.create) {

} else {
          alert(errmsg + " Your browser doesn't support it.");
        }
      } catch(err) {
        alert(errmsg + " Something bad happened: " + err);
      }
    }
  },
  invokeCount: 0,
  invokeSendToDB: function() {
    var self = this,
    args;
    if (this.dbState === "b") {
      hub.debug("Invokeing DB later");
      self.invokeCount++;
      if (self.invokeCount < 10) {
        setTimeout(function() {
          self.invokeSendToDB.apply(self);
        },
        500);
      }
      return false;
    }
    self.invokeCount = 0;
    if (self._hub_sqlInternalQueue.length > 0) {
      args = this._hub_sqlInternalQueue.shift();
      return self.sendToDB.apply(self, args);
    } else if (self._hub_sqlQueue.length > 0) {
      args = this._hub_sqlQueue.shift();
      return self.sendToDB.apply(self, args);
    }
  },

  /*
    Generic Error callback.
  */
  _hub_error: function(tx, e, msg) {
    hub.debug("Error!: " + msg);
    hub.debug(e);
    return false;
  },

  insertSQL: {
    "Data": "INSERT OR IGNORE INTO data (key, created_on, storage, bytes, metadata_count, store_key, commit_id) VALUES (?,?,?, ?,?,?, ?)",
    "MetaData": "INSERT OR IGNORE INTO meta_data (key, name, meta_uti, meta_creator, meta_editor, target_uti, target_creator, target_editor, target_position, storage, source, target, data_key, commit_id)" + " VALUES (?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?);",
    //14
    "Commit": "INSERT OR IGNORE INTO commits (key, name, commit_id, commit_uti, commit_creator," + // 5
    " commit_editor, merger, created_on, ancestor_count, total_storage," + // 5
    " commit_storage, history_storage, data_key, commit_data, committer," + // 5
    " ancestors)" + // 1 = 16
    " VALUES (?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?,?, ?)",
    // 16
    "Hub": "INSERT OR REPLACE INTO hub (key, name, meta_uti, meta_creator, meta_editor, is_private, is_archived, head, forked_from, meta_data)" + " VALUES (?,?,?, ?,?,?, ?,?,?, ?)",
    // 10
    "HubCommit": "INSERT OR IGNORE INTO hub_commit (hub, 'commit') VALUES (?,?)"
  },

  _createStoreTables: function(tx, error) {
    // There is no tables ... yet
    hub.debug("start creating data tables.");
    tx.executeSql("CREATE TABLE 'actor' (email TEXT, public_key TEXT)", [], null, this._hub_error);
    tx.executeSql("CREATE TABLE 'data' (key TEXT, store_key INTEGER, created_on TEXT, storage INTEGER, bytes BLOB, metadata_count INTEGER, commit_id INTEGER)", [], null, this._hub_error);
    tx.executeSql("CREATE TABLE 'meta_data' (key TEXT, name TEXT, meta_uti TEXT, meta_creator TEXT, meta_editor TEXT, target_uti TEXT, target_creator TEXT, target_editor TEXT, target_position INTEGER, storage INTEGER, source TEXT, target TEXT, data_key TEXT, commit_id INTEGER)", [], null, this._hub_error);
    tx.executeSql("CREATE TABLE 'commits' (key TEXT, name TEXT, commit_id INTEGER, commit_uti TEXT, commit_creator TEXT, commit_editor TEXT, merger TEXT, created_on INTEGER, ancestor_count INTEGER, total_storage INTEGER, commit_storage INTEGER, history_storage INTEGER, data_key TEXT, data_uti TEXT, data_editor TEXT, data_creator TEXT, commit_data TEXT, committer TEXT, ancestors TEXT)", [], null, this._hub_error);
    tx.executeSql('CREATE UNIQUE INDEX IF NOT EXISTS "UniqueDataKey" ON "data" ("key");');
    tx.executeSql('CREATE UNIQUE INDEX IF NOT EXISTS "UniqueDataStoreKey" ON "data" ("store_key");');
    tx.executeSql('CREATE UNIQUE INDEX IF NOT EXISTS "UniqueCommitKey" ON "commits" ("key");');
    tx.executeSql('CREATE UNIQUE INDEX IF NOT EXISTS "UniqueMetaKey" ON "meta_data" ("key");');
  },
  
  _createHubTables: function(tx, error) {
    hub.debug("start creating hub tables.");
    tx.executeSql("CREATE TABLE 'hub' (key TEXT, name TEXT, meta_uti TEXT, meta_creator TEXT, meta_editor TEXT, is_private INTEGER, is_archived INTEGER, head TEXT, forked_from TEXT, meta_data TEXT)", [], null, this._hub_error);
    tx.executeSql("CREATE TABLE 'hub_commit' (hub TEXT, 'commit' TEXT)", [], null, this._hub_error);
    tx.executeSql("CREATE TABLE 'hub_reference' (name TEXT, meta_uti TEXT, meta_creator TEXT, meta_editor TEXT, hub TEXT, 'commit' TEXT, committer TEXT, meta_data TEXT)", [], null, this._hub_error);
    tx.executeSql("CREATE TABLE 'hub_committer' (is_owner TEXT, hub TEXT, committer TEXT, head TEXT)", [], null, this._hub_error);
    tx.executeSql("CREATE TABLE 'hub_observer' (hub TEXT, observer TEXT)", [], null, this._hub_error);
    tx.executeSql('CREATE UNIQUE INDEX IF NOT EXISTS "UniqueHubKey" ON "hub" ("key");');
    hub.debug("finish creating hub tables.");
  }
});
