// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  hub.RecordArray wraps an array of storeKeys and, optionally, a Query object.
  When you access the items of a hub.RecordArray it will automatically convert 
  the storeKeys into actual hub.Record objects that the rest of your 
  application can work with.
  
  Normally you do not create RecordArrays directly.  Instead, a RecordArray
  is returned when you call hub.Store.find(), already properly configured.
  You can usually just work with the RecordArray instance just like another
  array.
  
  The information below about RecordArray internals is only intended for those
  who need to override this class for some reason to do some special.
  
  h2. Internal Notes
  
  Normally the RecordArray behavior is very simple.  Any array-like operations
  will be translated into similar calls onto the underlying array of 
  storeKeys.  The underlying array can be a real array or it may be a 
  SparseArray, which is how you implement incremental loading.
  
  If the RecordArray is created with an hub.Query objects as well (and it 
  almost always will have a Query object), then the RecordArray will also 
  consult the query for various delegate operations such as determining if 
  the record array should update automatically whenever records in the store
  changes.
  
  It will also ask the Query to refresh the storeKeys whenever records change
  in the store.
  
  @class
  @extends hub.Object
  @extends hub.Enumerable
  @extends hub.Array
*/

hub.RecordArray = hub.Object.extend(hub.Enumerable, hub.Array, 
  /** @scope hub.RecordArray.prototype */ {
    
  /**
    The store that owns this record array.  All record arrays must have a 
    store to function properly. 
    
    NOTE: You MUST set this property on the RecordArray when creating it or 
    else it will fail.
  
    @property {hub.Store}
  */
  store: null,

  /**
    The Query object this record array is based upon.  All record arrays MUST 
    have an associated query in order to function correctly.  You cannot 
    change this property once it has been set.

    NOTE: You MUST set this property on the RecordArray when creating it or 
    else it will fail.
    
    @property {hub.Query}
  */
  query: null,

  /**
    The array of storeKeys as retrieved from the owner store.
    
    @property {hub.Array}
  */
  storeKeys: null,

  /**
    The current status for the record array.  Read from the underlying 
    store.
    
    @property {Number}
  */
  status: hub.Record.EMPTY,
  
  /**
    The current editabile state based on the query.
    
    @property {Boolean}
  */
  isEditable: function() {
    var query = this.get('query');
    return query ? query.get('isEditable') : false;
  }.property('query').cacheable(),
  
  // ..........................................................
  // ARRAY PRIMITIVES
  // 

  /** @private
    Returned length is a pass-through to the storeKeys array.
  */
  length: function() {
    this.flush(); // cleanup pending changes
    var storeKeys = this.get('storeKeys');
    return storeKeys ? storeKeys.get('length') : 0;
  }.property('storeKeys').cacheable(),

  _hub_scra_records: null,
  
  /** @private
    Looks up the store key in the store keys array and materializes a
    records.
    
    @param {Number} idx index of the object
    @return {hub.Record} materialized record
  */
  objectAt: function(idx) {

    this.flush(); // cleanup pending if needed

    var recs      = this._hub_scra_records, 
        storeKeys = this.get('storeKeys'),
        store     = this.get('store'),
        storeKey, ret ;
    
    if (!storeKeys || !store) return undefined; // nothing to do
    if (recs && (ret=recs[idx])) return ret ; // cached
    
    // not in cache, materialize
    if (!recs) this._hub_scra_records = recs = [] ; // create cache
    storeKey = storeKeys.objectAt(idx);
    
    if (storeKey) {
      // if record is not loaded already, then ask the data source to 
      // retrieve it
      if (store.peekStatus(storeKey) === hub.Record.EMPTY) {
        store.retrieveRecord(null, null, storeKey);
      }
      recs[idx] = ret = store.materializeRecord(storeKey);
    }
    return ret ;
  },

  /** @private - optimized forEach loop. */
  forEach: function(callback, target) {
    this.flush();
    
    var recs      = this._hub_scra_records, 
        storeKeys = this.get('storeKeys'),
        store     = this.get('store'), 
        len       = storeKeys ? storeKeys.get('length') : 0,
        idx, storeKey, rec;
        
    if (!storeKeys || !store) return this; // nothing to do    
    if (!recs) recs = this._hub_scra_records = [] ;
    if (!target) target = this;
    
    for(idx=0;idx<len;idx++) {
      rec = recs[idx];
      if (!rec) {
        rec = recs[idx] = store.materializeRecord(storeKeys.objectAt(idx));
      }
      callback.call(target, rec, idx, this);
    }
    
    return this;
  },
  
  /** @private
    Pass through to the underlying array.  The passed in objects must be
    records, which can be converted to storeKeys.
    
    @param {Number} idx start index
    @param {Number} amt end index
    @param {hub.RecordArray} recs to replace with records
    @return {hub.RecordArray} 'this' after replace
  */
  replace: function(idx, amt, recs) {

    this.flush(); // cleanup pending if needed
    
    var storeKeys = this.get('storeKeys'), 
        len       = recs ? (recs.get ? recs.get('length') : recs.length) : 0,
        i, keys;
        
    if (!storeKeys) throw "storeKeys required";

    var query = this.get('query');
    if (query && !query.get('isEditable')) throw hub.RecordArray.NOT_EDITABLE;
    
    // you can't modify an array whose store keys are autogenerated from a 
    // query.
    
    // map to store keys
    keys = [] ;
    for(i=0;i<len;i++) keys[i] = recs.objectAt(i).get('storeKey');
    
    // pass along - if allowed, this should trigger the content observer 
    storeKeys.replace(idx, amt, keys);
    return this; 
  },
  
  /**
    Returns true if the passed can be found in the record array.  This is 
    provided for compatibility with hub.Set.
    
    @param {hub.Record} record the record
    @returns {Boolean}
  */
  contains: function(record) {
    return this.indexOf(record)>=0;
  },
  
  /** @private
    Returns the first index where the specified record is found.
    
    @param {hub.Record} record the record
    @param {Number} startAt optional starting index
    @returns {Number} index
  */
  indexOf: function(record, startAt) {
    if (!hub.kindOf(record, hub.Record)) return false ; // only takes records
    
    this.flush();
    
    var storeKey  = record.get('storeKey'), 
        storeKeys = this.get('storeKeys');
        
    return storeKeys ? storeKeys.indexOf(storeKey, startAt) : -1; 
  },

  /** @private 
    Returns the last index where the specified record is found.
    
    @param {hub.Record} record the record
    @param {Number} startAt optional starting index
    @returns {Number} index
  */
  lastIndexOf: function(record, startAt) {
    if (!hub.kindOf(record, hub.Record)) return false ; // only takes records

    this.flush();
    
    var storeKey  = record.get('storeKey'), 
        storeKeys = this.get('storeKeys');
    return storeKeys ? storeKeys.lastIndexOf(storeKey, startAt) : -1; 
  },

  /** 
    Adds the specified record to the record array if it is not already part 
    of the array.  Provided for compatibilty with hub.Set.
    
    @param {hub.Record} record
    @returns {hub.RecordArray} receiver
  */
  add: function(record) {
    if (!hub.kindOf(record, hub.Record)) return this ;
    if (this.indexOf(record)<0) this.pushObject(record);
    return this ;
  },
  
  /**
    Removes the specified record from the array if it is not already a part
    of the array.  Provided for compatibility with hub.Set.
    
    @param {hub.Record} record
    @returns {hub.RecordArray} receiver
  */
  remove: function(record) {
    if (!hub.kindOf(record, hub.Record)) return this ;
    this.removeObject(record);
    return this ;
  },
  
  // ..........................................................
  // HELPER METHODS
  // 

  /**
    Extends the standard hub.Enumerable implementation to return results based
    on a Query if you pass it in.
    
    @param {hub.Query} query a hub.Query object
    @returns {hub.RecordArray} 
  */
  find: function(query, target) {
    if (query && query.isQuery) {
      return this.get('store').find(query.queryWithScope(this)) ;
    } else return arguments.callee.base.apply(this, arguments) ;
  },
  
  /**
    Call whenever you want to refresh the results of this query.  This will
    notify the data source, asking it to refresh the contents.
    
    @returns {hub.RecordArray} receiver
  */
  refresh: function() {
    this.get('store').refreshQuery(this.get('query'));  
  },
  
  /**
    Destroys the record array.  Releases any storeKeys, and deregisters with
    the owner store.
    
    @returns {hub.RecordArray} receiver
  */
  destroy: function() {
    if (!this.get('isDestroyed')) {
      this.get('store').recordArrayWillDestroy(this);
    } 
    
    arguments.callee.base.apply(this, arguments) ;
  },
  
  // ..........................................................
  // STORE CALLBACKS
  // 
  
  // NOTE: storeWillFetchQuery(), storeDidFetchQuery(), storeDidCancelQuery(),
  // and storeDidErrorQuery() are tested implicitly through the related
  // methods in hub.Store.  We're doing it this way because eventually this 
  // particular implementation is likely to change; moving some or all of this
  // code directly into the store. -CAJ
  
  /** @private
    Called whenever the store initiates a refresh of the query.  Sets the 
    status of the record array to the appropriate status.
    
    @param {hub.Query} query
    @returns {hub.RecordArray} receiver
  */
  storeWillFetchQuery: function(query) {
    var status = this.get('status'),
        K      = hub.Record;
    if ((status === K.EMPTY) || (status === K.ERROR)) status = K.BUSY_LOADING;
    if (status & K.READY) status = K.BUSY_REFRESH;
    this.setIfChanged('status', status);
    return this ;
  },
  
  /** @private
    Called whenever the store has finished fetching a query.
    
    @param {hub.Query} query
    @returns {hub.RecordArray} receiver
  */
  storeDidFetchQuery: function(query) {
    this.setIfChanged('status', hub.Record.READY_CLEAN);
    return this ;
  },
  
  /** @private
    Called whenever the store has cancelled a refresh.  Sets the 
    status of the record array to the appropriate status.
    
    @param {hub.Query} query
    @returns {hub.RecordArray} receiver
  */
  storeDidCancelQuery: function(query) {
    var status = this.get('status'),
        K      = hub.Record;
    if (status === K.BUSY_LOADING) status = K.EMPTY;
    else if (status === K.BUSY_REFRESH) status = K.READY_CLEAN;
    this.setIfChanged('status', status);
    return this ;
  },

  /** @private
    Called whenever the store encounters an error while fetching.  Sets the 
    status of the record array to the appropriate status.
    
    @param {hub.Query} query
    @returns {hub.RecordArray} receiver
  */
  storeDidErrorQuery: function(query) {
    this.setIfChanged('status', hub.Record.ERROR);
    return this ;
  },
  
  /** @private
    Called by the store whenever it changes the state of certain store keys.
    If the receiver cares about these changes, it will mark itself as dirty.
    The next time you try to access the record array it will update any 
    pending changes.
    
    @param {hub.Array} storeKeys the effected store keys
    @param {hub.Set} recordTypes the record types for the storeKeys.
    @returns {hub.RecordArray} receiver
  */
  storeDidChangeStoreKeys: function(storeKeys, recordTypes) {
    var query =  this.get('query');
    // fast path exits
    if (query.get('location') !== hub.Query.LOCAL) return this;
    if (!query.containsRecordTypes(recordTypes)) return this;   
    
    // ok - we're interested.  mark as dirty and save storeKeys.
    var changed = this._hub_scq_changedStoreKeys;
    if (!changed) changed = this._hub_scq_changedStoreKeys = hub.IndexSet.create();
    changed.addEach(storeKeys);
    
    this.set('needsFlush', true);
    this.enumerableContentDidChange();

    return this;
  },
  
  /**
    Applies the query to any pending changed store keys, updating the record
    array contents as necessary.  This method is called automatically anytime
    you access the RecordArray to make sure it is up to date, but you can 
    call it yourself as well if you need to force the record array to fully
    update immediately.
    
    Currently this method only has an effect if the query location is 
    hub.Query.LOCAL.  You can call this method on any RecordArray however,
    without an error.
    
    @returns {hub.RecordArray} receiver
  */
  flush: function() {
    if (!this.get('needsFlush')) return this; // nothing to do
    this.set('needsFlush', false); // avoid running again.
    
    // fast exit
    var query = this.get('query'),
        store = this.get('store'); 
    if (!store || !query || query.get('location') !== hub.Query.LOCAL) {
      return this;
    }
    
    // OK, actually generate some results
    var storeKeys = this.get('storeKeys'),
        changed   = this._hub_scq_changedStoreKeys,
        didChange = false,
        K         = hub.Record,
        rec, status, recordType, sourceKeys, scope, included;

    // if we have storeKeys already, just look at the changed keys
    if (storeKeys) {
      if (changed) {
        changed.forEach(function(storeKey) {
          // get record - do not include EMPTY or DESTROYED records
          status = store.peekStatus(storeKey);
          if (!(status & K.EMPTY) && !((status & K.DESTROYED) || (status === K.BUSY_DESTROYING))) {
            rec = store.materializeRecord(storeKey);
            included = !!(rec && query.contains(rec));
          } else included = false ;
          
          // if storeKey should be in set but isn't -- add it.
          if (included) {
            if (storeKeys.indexOf(storeKey)<0) {
              if (!didChange) storeKeys = storeKeys.copy(); 
              storeKeys.pushObject(storeKey); 
            }
          // if storeKey should NOT be in set but IS -- remove it
          } else {
            if (storeKeys.indexOf(storeKey)>=0) {
              if (!didChange) storeKeys = storeKeys.copy();
              storeKeys.removeObject(storeKey);
            } // if (storeKeys.indexOf)
          } // if (included)
        }, this);
        // make sure resort happens
        didChange = true ;
      } // if (changed)
    
    // if no storeKeys, then we have to go through all of the storeKeys 
    // and decide if they belong or not.  ick.
    } else {
      
      // collect the base set of keys.  if query has a parent scope, use that
      if (scope = query.get('scope')) {
        sourceKeys = scope.flush().get('storeKeys');

      // otherwise, lookup all storeKeys for the named recordType...
      } else if (recordType = query.get('expandedRecordTypes')) {
        sourceKeys = hub.IndexSet.create();
        recordType.forEach(function(cur) { 
          sourceKeys.addEach(store.storeKeysFor(recordType));
        });
      }

      // loop through storeKeys to determine if it belongs in this query or 
      // not.
      storeKeys = [];
      sourceKeys.forEach(function(storeKey) {
        status = store.peekStatus(storeKey);
        if (!(status & K.EMPTY) && !((status & K.DESTROYED) || (status === K.BUSY_DESTROYING))) {
          rec = store.materializeRecord(storeKey);
          if (rec && query.contains(rec)) storeKeys.push(storeKey);
        }
      });
      
      didChange = true ;
    }

    // clear set of changed store keys
    if (changed) changed.clear();
    
    // only resort and update if we did change
    if (didChange) {
      storeKeys = hub.Query.orderStoreKeys(storeKeys, query, store);
      this.set('storeKeys', hub.clone(storeKeys)); // replace content
    }
    
    return this;
  },

  /**
    Set to true when the query is dirty and needs to update its storeKeys 
    before returning any results.  RecordArrays always start dirty and become
    clean the first time you try to access their contents.
    
    @property {Boolean}
  */
  needsFlush: true,

  // ..........................................................
  // EMULATE hub.Error API
  // 
  
  /**
    Returns true whenever the status is hub.Record.ERROR.  This will allow you 
    to put the UI into an error state.
    
    @property {Boolean}
  */
  isError: function() {
    return this.get('status') & hub.Record.ERROR;
  }.property('status').cacheable(),

  /**
    Returns the receiver if the record array is in an error state.  Returns null
    otherwise.
    
    @property {hub.Record}
  */
  errorValue: function() {
    return this.get('isError') ? hub.val(this.get('errorObject')) : null ;
  }.property('isError').cacheable(),
  
  /**
    Returns the current error object only if the record array is in an error state.
    If no explicit error object has been set, returns hub.Record.GENERIC_ERROR.
    
    @property {hub.Error}
  */
  errorObject: function() {
    if (this.get('isError')) {
      var store = this.get('store');
      return store.readQueryError(this.get('query')) || hub.Record.GENERIC_ERROR;
    } else return null ;
  }.property('isError').cacheable(),
  
  // HACK to be able to refresh a query-backed record array from the server
  refresh: function() {
    var store = this.get('store') ;
    if (!store) return ;
    var source = store._hub_getDataSource() ; // TODO why is this private?
    if (!source || source.fetch === undefined) return ;
    var fetchKey = this.get('queryKey') ;
    if (!fetchKey) return ;
    source.fetch.call(source, store, fetchKey, null) ;
    return this ;
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private 
    Invoked whenever the storeKeys array changes.  Observes changes.
  */
  _hub_storeKeysDidChange: function() {
    var storeKeys = this.get('storeKeys');
    
    var prev = this._hub_prevStoreKeys, 
        f    = this._hub_storeKeysContentDidChange,
        fs   = this._hub_storeKeysStateDidChange;
    
    if (storeKeys === prev) return this; // nothing to do
    
    if (prev) prev.removeObserver('[]', this, f);
    this._hub_prevStoreKeys = storeKeys;
    if (storeKeys) storeKeys.addObserver('[]', this, f);
    
    var rev = (storeKeys) ? storeKeys.propertyRevision : -1 ;
    this._hub_storeKeysContentDidChange(storeKeys, '[]', storeKeys, rev);
    
  }.observes('storeKeys'),
  
  /** @private
    Invoked whenever the content of the storeKeys array changes.  This will
    dump any cached record lookup and then notify that the enumerable content
    has changed.
  */
  _hub_storeKeysContentDidChange: function(target, key, value, rev) {
    if (this._hub_scra_records) this._hub_scra_records.length=0 ; // clear cache
    
    this.beginPropertyChanges()
      .notifyPropertyChange('length')
      .enumerableContentDidChange()
    .endPropertyChanges();
  },
  
  /** @private */
  init: function() {
    arguments.callee.base.apply(this, arguments) ;
    this._hub_storeKeysDidChange() ;
  }
  
});

hub.RecordArray.mixin({  
  
  /** 
    Standard error throw when you try to modify a record that is not editable
    
    @property {hub.Error}
  */
  NOT_EDITABLE: hub.Error.desc("hub.RecordArray is not editable")
});
