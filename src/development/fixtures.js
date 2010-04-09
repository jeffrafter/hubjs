// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  @class
  @extends hub.DataSource
*/
hub.FixturesDataSource = hub.DataSource.extend(
  /** @scope hub.FixturesDataSource.prototype */ {

  /**
    If true then the data source will asyncronously respond to data requests
    from the server.  If you plan to replace the fixture data source with a 
    data source that talks to a real remote server (using Ajax for example),
    you should leave this property set to true so that Fixtures source will
    more accurately simulate your remote data source.

    If you plan to replace this data source with something that works with 
    local storage, for example, then you should set this property to false to 
    accurately simulate the behavior of your actual data source.
    
    @property {Boolean}
  */
  simulateRemoteResponse: false,
  
  /**
    If you set simulateRemoteResponse to true, then the fixtures soure will
    assume a response latency from your server equal to the msec specified
    here.  You should tune this to simulate latency based on the expected 
    performance of your server network.  Here are some good guidelines:
    
    - 500: Simulates a basic server written in PHP, Ruby, or Python (not twisted) without a CDN in front for caching.
    - 250: (Default) simulates the average latency needed to go back to your origin server from anywhere in the world.  assumes your servers itself will respond to requests < 50 msec
    - 100: simulates the latency to a "nearby" server (i.e. same part of the world).  Suitable for simulating locally hosted servers or servers with multiple data centers around the world.
    - 50: simulates the latency to an edge cache node when using a CDN.  Life is really good if you can afford this kind of setup.
    
    @property {Number}
  */
  latency: 50,
  
  // ..........................................................
  // CANCELLING
  // 
  
  /** @private */
  cancel: function(store, storeKeys) {
    return false;
  },
  
  
  // ..........................................................
  // FETCHING
  // 
  
  /** @private */
  fetch: function(store, query) {
    
    // can only handle local queries out of the box
    if (query.get('location') !== hub.Query.LOCAL) {
      throw hub.$error('hub.Fixture data source can only fetch local queries');
    }

    if (!query.get('recordType') && !query.get('recordTypes')) {
      throw hub.$error('hub.Fixture data source can only fetch queries with one or more record types');
    }
    
    if (this.get('simulateRemoteResponse')) {
      this.invokeLater(this._hub_fetch, this.get('latency'), store, query);
      
    } else this._hub_fetch(store, query);
  },
  
  /** @private
    Actually performs the fetch.  
  */
  _hub_fetch: function(store, query) {
    
    // NOTE: Assumes recordType or recordTypes is defined.  checked in fetch()
    var recordType = query.get('recordType'),
        recordTypes = query.get('recordTypes') || [recordType];
        
    // load fixtures for each recordType
    recordTypes.forEach(function(recordType) {
      if (hub.typeOf(recordType) === hub.T_STRING) {
        recordType = hub.objectForPropertyPath(recordType);
      }
      
      if (recordType) this.loadFixturesFor(store, recordType);
    }, this);
    
    // notify that query has now loaded - puts it into a READY state
    store.dataSourceDidFetchQuery(query);
  },
  
  // ..........................................................
  // RETRIEVING
  // 
  
  /** @private */
  retrieveRecords: function(store, storeKeys) {
    // first let's see if the fixture data source can handle any of the
    // storeKeys
    var latency = this.get('latency'),
        ret     = this.hasFixturesFor(storeKeys) ;
    if (!ret) return ret ;
    
    if (this.get('simulateRemoteResponse')) {
      this.invokeLater(this._hub_retrieveRecords, latency, store, storeKeys);
    } else this._hub_retrieveRecords(store, storeKeys);
    
    return ret ;
  },
  
  _hub_retrieveRecords: function(store, storeKeys) {
    
    storeKeys.forEach(function(storeKey) {
      var ret        = [], 
          recordType = hub.Store.recordTypeFor(storeKey),
          id         = store.idFor(storeKey),
          hash       = this.fixtureForStoreKey(store, storeKey);
      ret.push(storeKey);
      store.dataSourceDidComplete(storeKey, hash, id);
    }, this);
  },
  
  // ..........................................................
  // UPDATE
  // 
  
  /** @private */
  updateRecords: function(store, storeKeys, params) {
    // first let's see if the fixture data source can handle any of the
    // storeKeys
    var latency = this.get('latency'),
        ret     = this.hasFixturesFor(storeKeys) ;
    if (!ret) return ret ;
    
    if (this.get('simulateRemoteResponse')) {
      this.invokeLater(this._hub_updateRecords, latency, store, storeKeys);
    } else this._hub_updateRecords(store, storeKeys);
    
    return ret ;
  },
  
  _hub_updateRecords: function(store, storeKeys) {
    storeKeys.forEach(function(storeKey) {
      var hash = store.readDataHash(storeKey);
      this.setFixtureForStoreKey(store, storeKey, hash);
      store.dataSourceDidComplete(storeKey);  
    }, this);
  },


  // ..........................................................
  // CREATE RECORDS
  // 
  
  /** @private */
  createRecords: function(store, storeKeys, params) {
    // first let's see if the fixture data source can handle any of the
    // storeKeys
    var latency = this.get('latency');
    
    if (this.get('simulateRemoteResponse')) {
      this.invokeLater(this._hub_createRecords, latency, store, storeKeys);
    } else this._hub_createRecords(store, storeKeys);
    
    return true ;
  },

  _hub_createRecords: function(store, storeKeys) {
    storeKeys.forEach(function(storeKey) {
      var id         = store.idFor(storeKey),
          recordType = store.recordTypeFor(storeKey),
          dataHash   = store.readDataHash(storeKey), 
          fixtures   = this.fixturesFor(recordType);

      if (!id) id = this.generateIdFor(recordType, dataHash, store, storeKey);
      this._hub_invalidateCachesFor(recordType, storeKey, id);
      fixtures[id] = dataHash;

      store.dataSourceDidComplete(storeKey, null, id);
    }, this);
  },

  // ..........................................................
  // DESTROY RECORDS
  // 
  
  /** @private */
  destroyRecords: function(store, storeKeys, params) {
    // first let's see if the fixture data source can handle any of the
    // storeKeys
    var latency = this.get('latency'),
        ret     = this.hasFixturesFor(storeKeys) ;
    if (!ret) return ret ;
    
    if (this.get('simulateRemoteResponse')) {
      this.invokeLater(this._hub_destroyRecords, latency, store, storeKeys);
    } else this._hub_destroyRecords(store, storeKeys);
    
    return ret ;
  },
  

  _hub_destroyRecords: function(store, storeKeys) {
    storeKeys.forEach(function(storeKey) {
      var id         = store.idFor(storeKey),
          recordType = store.recordTypeFor(storeKey),
          fixtures   = this.fixturesFor(recordType);

      this._hub_invalidateCachesFor(recordType, storeKey, id);
      if (id) delete fixtures[id];
      store.dataSourceDidDestroy(storeKey);  
    }, this);
  },
  
  // ..........................................................
  // INTERNAL METHODS/PRIMITIVES
  // 

  /**
    Load fixtures for a given fetchKey into the store
    and push it to the ret array.
    
    @param {hub.Store} store the store to load into
    @param {hub.Record} recordType the record type to load
    @param {hub.Array} ret is passed, array to add loaded storeKeys to.
    @returns {hub.Fixture} receiver
  */
  loadFixturesFor: function(store, recordType, ret) {
    var hashes   = [],
        dataHashes, i, storeKey ;
    
    dataHashes = this.fixturesFor(recordType);
    
    for(i in dataHashes){
      storeKey = recordType.storeKeyFor(i);
      if (store.peekStatus(storeKey) === hub.Record.EMPTY) {
        hashes.push(dataHashes[i]);
      }
      if (ret) ret.push(storeKey);
    }

    // only load records that were not already loaded to avoid infinite loops
    if (hashes && hashes.length>0) store.loadRecords(recordType, hashes);
    
    return this ;
  },
  

  /**
    Generates an id for the passed record type.  You can override this if 
    needed.  The default generates a storekey and formats it as a string.
    
    @param {Class} recordType Subclass of hub.Record
    @param {Hash} dataHash the data hash for the record
    @param {hub.Store} store the store 
    @param {Number} storeKey store key for the item
    @returns {String}
  */
  generateIdFor: function(recordType, dataHash, store, storeKey) {
    return ["@id", hub.Store.generateStoreKey()].join('') ;
  },
  
  /**
    Based on the storeKey it returns the specified fixtures
    
    @param {hub.Store} store the store 
    @param {Number} storeKey the storeKey
    @returns {Hash} data hash or null
  */
  fixtureForStoreKey: function(store, storeKey) {
    var id         = store.idFor(storeKey),
        recordType = store.recordTypeFor(storeKey),
        fixtures   = this.fixturesFor(recordType);
    return fixtures ? fixtures[id] : null;
  },
  
  /**
    Update the data hash fixture for the named store key.  
    
    @param {hub.Store} store the store 
    @param {Number} storeKey the storeKey
    @param {Hash} dataHash 
    @returns {hub.FixturesDataSource} receiver
  */
  setFixtureForStoreKey: function(store, storeKey, dataHash) {
    var id         = store.idFor(storeKey),
        recordType = store.recordTypeFor(storeKey),
        fixtures   = this.fixturesFor(recordType);
    this._hub_invalidateCachesFor(recordType, storeKey, id);
    fixtures[id] = dataHash;
    return this ;
  },
  
  /** 
    Get the fixtures for the passed record type and prepare them if needed.
    Return cached value when complete.
    
    @param {hub.Record} recordType
    @returns {Hash} data hashes
  */
  fixturesFor: function(recordType) {
    // get basic fixtures hash.
    if (!this._hub_fixtures) this._hub_fixtures = {};
    var fixtures = this._hub_fixtures[hub.guidFor(recordType)];
    if (fixtures) return fixtures ; 
    
    // need to load fixtures.
    var dataHashes = recordType ? recordType.FIXTURES : null,
        len        = dataHashes ? dataHashes.length : 0,
        primaryKey = recordType ? recordType.prototype.primaryKey : 'guid',
        idx, dataHash, id ;

    this._hub_fixtures[hub.guidFor(recordType)] = fixtures = {} ; 
    for(idx=0;idx<len;idx++) {      
      dataHash = dataHashes[idx];
      id = dataHash[primaryKey];
      if (!id) id = this.generateIdFor(recordType, dataHash); 
      fixtures[id] = dataHash;
    }  
    return fixtures;
  },
  
  /**
    Returns true if fixtures for a given recordType have already been loaded
    
    @param {hub.Record} recordType
    @returns {Boolean} storeKeys
  */
  fixturesLoadedFor: function(recordType) {
    if (!this._hub_fixtures) return false;
    var ret = [], fixtures = this._hub_fixtures[hub.guidFor(recordType)];
    return fixtures ? true: false;
  },
  
  /**
    Returns true or hub.MIXED_STATE if one or more of the storeKeys can be 
    handled by the fixture data source.
    
    @param {Array} storeKeys the store keys
    @returns {Boolean} true if all handled, MIXED_STATE if some handled
  */
  hasFixturesFor: function(storeKeys) {
    var ret = false ;
    storeKeys.forEach(function(storeKey) {
      if (ret !== hub.MIXED_STATE) {
        var recordType = hub.Store.recordTypeFor(storeKey),
            fixtures   = recordType ? recordType.FIXTURES : null ;
        if (fixtures && fixtures.length && fixtures.length>0) {
          if (ret === false) ret = true ;
        } else if (ret === true) ret = hub.MIXED_STATE ;
      }
    }, this);
    
    return ret ;
  },
  
  /** @private
    Invalidates any internal caches based on the recordType and optional 
    other parameters.  Currently this only invalidates the storeKeyCache used
    for fetch, but it could invalidate others later as well.
    
    @param {hub.Record} recordType the type of record modified
    @param {Number} storeKey optional store key
    @param {String} id optional record id
    @returns {hub.FixturesDataSource} receiver
  */
  _hub_invalidateCachesFor: function(recordType, storeKey, id) {
    var cache = this._hub_storeKeyCache;
    if (cache) delete cache[hub.guidFor(recordType)];
    return this ;
  }
  
});

/**
  Default fixtures instance for use in applications.
  
  @property {hub.FixturesDataSource}
*/
hub.Record.fixtures = hub.FixturesDataSource.create() ;
