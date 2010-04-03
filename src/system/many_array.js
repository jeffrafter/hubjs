// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  A ManyArray is used to map an array of record ids back to their 
  record objects which will be materialized from the owner store on demand.
  
  Whenever you create a toMany() relationship, the value returned from the 
  property will be an instance of ManyArray.  You can generally customize the
  behavior of ManyArray by passing settings to the toMany() helper.
  
  @class
  @extends hub.Enumerable
  @extends hub.Array
*/

hub.ManyArray = hub.Object.extend(hub.Enumerable, hub.Array,
  /** @scope hub.ManyArray.prototype */ {

  /**
    recordType will tell what type to transform the record to when
    materializing the record.

    @property {String}
  */
  recordType: null,
  
  /**
    If set, the record will be notified whenever the array changes so that 
    it can change its own state
    
    @property {hub.Record}
  */
  record: null,
  
  /**
    If set will be used by the many array to get an editable version of the
    storeIds from the owner.
    
    @property {String}
  */
  propertyName: null,
  
  
  /**
    The ManyAttribute that created this array.
  
    @property {hub.ManyAttribute}
  */
  manyAttribute: null,
  
  /**
    The store that owns this record array.  All record arrays must have a 
    store to function properly.

    @property {hub.Store}
  */
  store: function() {
    return this.get('record').get('store');
  }.property('record').cacheable(),
  
  /**
    The storeKey for the parent record of this many array.  Editing this 
    array will place the parent record into a READY_DIRTY state.

    @property {Number}
  */
  storeKey: function() {
    return this.get('record').get('storeKey');
  }.property('record').cacheable(),


  /**
    Returns the storeIds in read only mode.  Avoids modifying the record 
    unnecessarily.
    
    @property {hub.Array}
  */
  readOnlyStoreIds: function() {
    return this.get('record').readAttribute(this.get('propertyName'));
  }.property(),
  
  
  /**
    Returns an editable array of storeIds.  Marks the owner records as 
    modified. 
    
    @property {hub.Array}
  */
  editableStoreIds: function() {
    var store    = this.get('store'),
        storeKey = this.get('storeKey'),
        pname    = this.get('propertyName'),
        ret, hash;
        
    ret = store.readEditableProperty(storeKey, pname);    
    if (!ret) {
      hash = store.readEditableDataHash(storeKey);
      ret = hash[pname] = [];      
    }
    
    if (ret !== this._hub_prevStoreIds) this.recordPropertyDidChange();
    return ret ;
  }.property(),
  
  
  // ..........................................................
  // COMPUTED FROM OWNER
  // 
  
  /**
    Computed from owner many attribute
    
    @property {Boolean}
  */
  isEditable: function() {
    // NOTE: can't use get() b/c manyAttribute looks like a computed prop
    var attr = this.manyAttribute;
    return attr ? attr.get('isEditable') : false;
  }.property('manyAttribute').cacheable(),
  
  /**
    Computed from owner many attribute
    
    @property {String}
  */
  inverse: function() {
    // NOTE: can't use get() b/c manyAttribute looks like a computed prop
    var attr = this.manyAttribute;
    return attr ? attr.get('inverse') : null;
  }.property('manyAttribute').cacheable(),
  
  /**
    Computed from owner many attribute
    
    @property {Boolean}
  */
  isMaster: function() {
    // NOTE: can't use get() b/c manyAttribute looks like a computed prop
    var attr = this.manyAttribute;
    return attr ? attr.get('isMaster') : null;
  }.property("manyAttribute").cacheable(),

  /**
    Computed from owner many attribute
    
    @property {Array}
  */
  orderBy: function() {
    // NOTE: can't use get() b/c manyAttribute looks like a computed prop
    var attr = this.manyAttribute;
    return attr ? attr.get('orderBy') : null;
  }.property("manyAttribute").cacheable(),
  
  // ..........................................................
  // ARRAY PRIMITIVES
  // 

  /** @private
    Returned length is a pass-through to the storeIds array.
    
    @property {Number}
  */
  length: function() {
    var storeIds = this.get('readOnlyStoreIds');
    return storeIds ? storeIds.get('length') : 0;
  }.property('readOnlyStoreIds').cacheable(),

  /** @private
    Looks up the store id in the store ids array and materializes a
    records.
  */
  objectAt: function(idx) {
    var recs      = this._hub_records, 
        storeIds  = this.get('readOnlyStoreIds'),
        store     = this.get('store'),
        recordType = this.get('recordType'),
        storeKey, ret, storeId ;
        
    if (!storeIds || !store) return undefined; // nothing to do
    if (recs && (ret=recs[idx])) return ret ; // cached

    // not in cache, materialize
    if (!recs) this._hub_records = recs = [] ; // create cache
    storeId = storeIds.objectAt(idx);
    if (storeId) {

      // if record is not loaded already, then ask the data source to 
      // retrieve it
      storeKey = store.storeKeyFor(recordType, storeId);
      
      if (store.readStatus(storeKey) === hub.Record.EMPTY) {
        store.retrieveRecord(recordType, null, storeKey);
      }
      
      recs[idx] = ret = store.materializeRecord(storeKey);
    }
    return ret ;
  },

  /** @private
    Pass through to the underlying array.  The passed in objects must be
    records, which can be converted to storeIds.
  */
  replace: function(idx, amt, recs) {
    
    if (!this.get('isEditable')) {
      throw "%@.%@[] is not editable".fmt(this.get('record'), this.get('propertyName'));
    }
    
    var storeIds = this.get('editableStoreIds'), 
        len      = recs ? (recs.get ? recs.get('length') : recs.length) : 0,
        record   = this.get('record'),
        pname    = this.get('propertyName'),
        i, keys, ids, toRemove, inverse, attr, inverseRecord;

    // map to store keys
    ids = [] ;
    for(i=0;i<len;i++) ids[i] = recs.objectAt(i).get('id');

    // if we have an inverse - collect the list of records we are about to 
    // remove
    inverse = this.get('inverse');
    if (inverse && amt>0) {
      toRemove = hub.ManyArray._hub_toRemove;
      if (toRemove) hub.ManyArray._hub_toRemove = null; // reuse if possible
      else toRemove = [];
      
      for(i=0;i<amt;i++) toRemove[i] = this.objectAt(i);
    }
    
    // pass along - if allowed, this should trigger the content observer 
    storeIds.replace(idx, amt, ids);

    // ok, notify records that were removed then added; this way reordered
    // objects are added and removed
    if (inverse) {
      
      // notive removals
      for(i=0;i<amt;i++) {
        inverseRecord = toRemove[i];
        attr = inverseRecord ? inverseRecord[inverse] : null;
        if (attr && attr.inverseDidRemoveRecord) {
          attr.inverseDidRemoveRecord(inverseRecord, inverse, record, pname);
        }
      }

      if (toRemove) {
        toRemove.length = 0; // cleanup
        if (!hub.ManyArray._hub_toRemove) hub.ManyArray._hub_toRemove = toRemove;
      }

      // notify additions
      for(i=0;i<len;i++) {
        inverseRecord = recs.objectAt(i);
        attr = inverseRecord ? inverseRecord[inverse] : null;
        if (attr && attr.inverseDidAddRecord) {
          attr.inverseDidAddRecord(inverseRecord, inverse, record, pname);
        }
      }
      
    }

    // only mark record dirty if there is no inverse or we are master
    if (record && (!inverse || this.get('isMaster'))) {
      record.recordDidChange(pname);
    } 
    
    return this;
  },
  
  // ..........................................................
  // INVERSE SUPPORT
  // 
  
  /**
    Called by the ManyAttribute whenever a record is removed on the inverse
    of the relationship.
    
    @param {hub.Record} inverseRecord the record that was removed
    @returns {hub.ManyArray} receiver
  */
  removeInverseRecord: function(inverseRecord) {
    
    if (!inverseRecord) return this; // nothing to do
    var id = inverseRecord.get('id'),
        storeIds = this.get('editableStoreIds'),
        idx      = (storeIds && id) ? storeIds.indexOf(id) : -1,
        record;
    
    if (idx >= 0) {
      storeIds.removeAt(idx);
      if (this.get('isMaster') && (record = this.get('record'))) {
        record.recordDidChange(this.get('propertyName'));
      }
    }
  },

  /**
    Called by the ManyAttribute whenever a record is added on the inverse
    of the relationship.
    
    @param {hub.Record} record the record this array is a part of
    @param {String} key the key this array represents
    @param {hub.Record} inverseRecord the record that was removed
    @param {String} inverseKey the name of inverse that was changed
    @returns {hub.ManyArray} receiver
  */
  addInverseRecord: function(inverseRecord) {
    
    if (!inverseRecord) return this;
    var id = inverseRecord.get('id'),
        storeIds = this.get('editableStoreIds'),
        orderBy  = this.get('orderBy'),
        len      = storeIds.get('length'),
        idx, record;
        
    // find idx to insert at.
    if (orderBy) {
      idx = this._hub_findInsertionLocation(inverseRecord, 0, len, orderBy);
    } else idx = len;
    
    storeIds.insertAt(idx, inverseRecord.get('id'));
    if (this.get('isMaster') && (record = this.get('record'))) {
      record.recordDidChange(this.get('propertyName'));
    }
  },
  
  // binary search to find insertion location
  _hub_findInsertionLocation: function(rec, min, max, orderBy) {
    var idx   = min+Math.floor((max-min)/2),
        cur   = this.objectAt(idx),
        order = this._hub_compare(rec, cur, orderBy);
    if (order < 0) {
      if (idx===0) return idx;
      else return this._hub_findInsertionLocation(rec, 0, idx, orderBy);
    } else if (order > 0) {
      if (idx >= max) return idx;
      else return this._hub_findInsertionLocation(rec, idx, max, orderBy);
    } else return idx;
  },

  _hub_compare: function(a, b, orderBy) {
    var t = hub.typeOf(orderBy),
        ret, idx, len;
        
    if (t === hub.T_FUNCTION) ret = orderBy(a, b);
    else if (t === hub.T_STRING) ret = hub.compare(a,b);
    else {
      len = orderBy.get('length');
      ret = 0;
      for(idx=0;(ret===0) && (idx<len);idx++) ret = hub.compare(a,b);
    }

    return ret ;
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  //  

  /** @private 
    Invoked whenever the storeIds array changes.  Observes changes.
  */
  recordPropertyDidChange: function(keys) {
    
    if (keys && !keys.contains(this.get('propertyName'))) return this;
    
    var storeIds = this.get('readOnlyStoreIds');
    var prev = this._hub_prevStoreIds, f = this._hub_storeIdsContentDidChange;

    if (storeIds === prev) return this; // nothing to do

    if (prev) prev.removeObserver('[]', this, f);
    this._hub_prevStoreIds = storeIds;
    if (storeIds) storeIds.addObserver('[]', this, f);

    var rev = (storeIds) ? storeIds.propertyRevision : -1 ;
    this._hub_storeIdsContentDidChange(storeIds, '[]', storeIds, rev);
    
  },

  /** @private
    Invoked whenever the content of the storeIds array changes.  This will
    dump any cached record lookup and then notify that the enumerable content
    has changed.
  */
  _hub_storeIdsContentDidChange: function(target, key, value, rev) {
    this._hub_records = null ; // clear cache
    this.enumerableContentDidChange();
  },
  
  /** @private */
  unknownProperty: function(key, value) {
    var ret = this.reducedProperty(key, value);
    return ret === undefined ? arguments.callee.base.apply(this, arguments) : ret ;
  },

  /** @private */
  init: function() {
    arguments.callee.base.apply(this, arguments) ;
    this.recordPropertyDidChange() ;
  }
  
});
