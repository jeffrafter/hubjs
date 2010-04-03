// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  hub.Record is the core model class in hub.js. It is analogous to 
  NSManagedObject in Core Data and EOEnterpriseObject in the Enterprise Objects 
  Framework (aka WebObjects), or ActiveRecord::Base in Rails.
  
  The hub.Record 'attributes' hash is used to store the values of a record in a 
  format that can be easily passed to/from the server.  The values should 
  generally be stored in their raw string form.  References to external records 
  should be stored as primary keys.
  
  Normally you do not need to work with the attributes hash directly.  Instead 
  you should use get/set on normal record properties.  If the property is not 
  defined on the object, then the record will check the attributes hash instead.
  
  You can bulk update attributes from the server using the updateAttributes() 
  method.
  
  @class
  @extends hub.Object
*/
hub.Record = hub.Object.extend(
/** @scope hub.Record.prototype */ {
  
  /**  
    Walk like a duck
  
    @property {Boolean}
  */
  isRecord: true,
  
  // ...............................
  // PROPERTIES
  //
  
  /**
    This is the primary key used to distinguish records.  If the keys match, 
    the records are assumed to be identical.
    
    FIXME: This should default to 'id'.
    
    @property {String}
  */
  primaryKey: 'guid',
  
  /**
    Returns the id for the record instance.  The id is used to uniquely 
    identify this record instance from all others of the same type.  If you 
    have a primaryKey set on this class, then the id will be the value of the
    primaryKey property on the underlying JSON hash.
    
    @property {String}
  */
  id: function(key, value) {
    if (value !== undefined) {
      this.writeAttribute(this.get('primaryKey'), value);
      return value;
    } else {
      return hub.Store.idFor(this.storeKey);
    }
  }.property('storeKey').cacheable(),
  
  /**
    All records generally have a life cycle as they are created or loaded into 
    memory, modified, committed and finally destroyed.  This life cycle is 
    managed by the status property on your record. 

    The status of a record is modelled as a finite state machine.  Based on the 
    current state of the record, you can determine which operations are 
    currently allowed on the record and which are not.
    
    In general, a record can be in one of five primary states; hub.Record.EMPTY,
    hub.Record.BUSY, hub.Record.READY, hub.Record.DESTROYED, hub.Record.ERROR. 
    These are all described in more detail in the class mixin (below) where 
    they are defined.
    
    @property {Number}
  */
  status: function() {
    var store = this.get('store') ;
    if (!store) return hub.Record.EMPTY ;
    return store.readStatus(this.storeKey) ;
  }.property('storeKey').cacheable(),

  /**
    The store that owns this record.  All changes will be buffered into this
    store and committed to the rest of the store chain through here.
    
    This property is set when the record instance is created and should not be
    changed or else it will break the record behavior.
    
    @property {hub.Store}
  */
  store: null,

  /**
    This is the store key for the record, it is used to link it back to the 
    dataHash. If a record is reused, this value will be replaced.
    
    You should not edit this store key but you may sometimes need to refer to
    this store key when implementing a Server object.
    
    @property {Number}
  */
  storeKey: null,

  /** 
    true when the record has been destroyed
    
    @property {Boolean}
  */
  isDestroyed: function() {
    return !!(this.get('status') & hub.Record.DESTROYED);  
  }.property('status').cacheable(),
  
  /**
    true when the record is in an editable state.  You can use this property to
    quickly determine whether attempting to modify the record would raise an 
    exception or not.
    
    This property is both readable and writable.  Note however that if you 
    set this property to true but the status of the record is anything but
    hub.Record.READY, the return value of this property may remain false.
    
    @property {Boolean}
  */
  isEditable: function(key, value) {
    if (value !== undefined) this._hub_screc_isEditable = value;
    if (this.get('status') & hub.Record.READY) return this._hub_screc_isEditable;
    else return false ;
  }.property('status').cacheable(),
  
  _hub_screc_isEditable: true, // default
  
  /**
    true when the record's contents have been loaded for the first time.  You 
    can use this to quickly determine if the record is ready to display.
    
    @property {Boolean}
  */
  isLoaded: function() {
    var K = hub.Record, 
        status = this.get('status');
    return !((status===K.EMPTY) || (status===K.BUSY_LOADING) || (status===K.ERROR));
  }.property('status').cacheable(),
  
  /**
    If set, this should be an array of active relationship objects that need
    to be notified whenever the underlying record properties change.  
    Currently this is only used by toMany relationships, but you could 
    possibly patch into this yourself also if you are building your own 
    relationships.
    
    Note this must be a regular Array - NOT any object implmenting hub.Array.
    
    @property {Array}
  */
  relationships: null,

  /**
    This will return the raw attributes that you can edit directly.  If you 
    make changes to this hash, be sure to call beginEditing() before you get
    the attributes and endEditing() afterwards.
  
    @property {Hash}
  **/
  attributes: function() {
    var store = this.get('store') ;
    return (store) ? store.readEditableDataHash(this.storeKey) : {} ;
  }.property(),
    
  // ...............................
  // CRUD OPERATIONS
  //

  /**
    Refresh the record from the persistent store.  If the record was loaded 
    from a persistent store, then the store will be asked to reload the 
    record data from the server.  If the record is new and exists only in 
    memory then this call will have no effect.
    
    @returns {hub.Record} receiver
  */
  refresh: function() { 
    this.get('store').refreshRecord(null, null, this.get('storeKey'));
    return this ;
  },
  
  /**
    Deletes the record along with any dependent records.  This will mark the 
    records destroyed in the store as well as changing the isDestroyed 
    property on the record to true.  If this is a new record, this will avoid 
    creating the record in the first place.
    
    @returns {hub.Record} receiver
  */
  destroy: function() { 
    this.get('store').destroyRecord(null, null, this.get('storeKey'));
    this.propertyDidChange('status');
    return this ;
  },

  /**
    You can invoke this method anytime you need to make the record as dirty.
    This will cause the record to be commited when you commitChanges()
    on the underlying store.
    
    If you use the writeAttribute() primitive, this method will be called for 
    you.
    
    If you pass the key that changed it will ensure that observers are fired
    only once for the changed property instead of allPropertiesDidChange()
    
    @param {String} key that changed (optional)
    @returns {hub.Record} receiver
  */
  recordDidChange: function(key) {
    this.get('store').recordDidChange(null, null, this.get('storeKey'), key);
    this.notifyPropertyChange('status');
    return this ;
  },
  
  // ...............................
  // ATTRIBUTES
  //

  /** @private
    Current edit level.  Used to defer editing changes. 
  */
  _hub_editLevel: 0 ,
  
  /**
    Defers notification of record changes until you call a matching 
    endEditing() method.  This method is called automatically whenever you
    set an attribute, but you can call it yourself to group multiple changes.
    
    Calls to beginEditing() and endEditing() can be nested.
    
    @returns {hub.Record} receiver
  */
  beginEditing: function() {
    this._hub_editLevel++;
    return this ;
  },

  /**
    Notifies the store of record changes if this matches a top level call to
    beginEditing().  This method is called automatically whenever you set an
    attribute, but you can call it yourself to group multiple changes.
    
    Calls to beginEditing() and endEditing() can be nested.
    
    @param {String} key that changed (optional)
    @returns {hub.Record} receiver
  */
  endEditing: function(key) {
    if(--this._hub_editLevel <= 0) {
      this._hub_editLevel = 0; 
      this.recordDidChange(key);
    }
    return this ;
  },
  
  /**
    Reads the raw attribute from the underlying data hash.  This method does
    not transform the underlying attribute at all.
  
    @param {String} key the attribute you want to read
    @returns {Object} the value of the key, or null if it doesn't exist
  */
  readAttribute: function(key) {
    var store = this.get('store'), storeKey = this.storeKey;
    var attrs = store.readDataHash(storeKey);
    return attrs ? attrs[key] : undefined ; 
  },

  /**
    Updates the passed attribute with the new value.  This method does not 
    transform the value at all.  If instead you want to modify an array or 
    hash already defined on the underlying json, you should instead get 
    an editable version of the attribute using editableAttribute()
  
    @param {String} key the attribute you want to read
    @param {Object} value the value you want to write
    @param {Boolean} ignoreDidChange only set if you do NOT want to flag 
      record as dirty
    @returns {hub.Record} receiver
  */
  writeAttribute: function(key, value, ignoreDidChange) {
    var store    = this.get('store'), 
        storeKey = this.storeKey,
        status   = store.peekStatus(storeKey),
        recordAttr = this[key],
        recordType = hub.Store.recordTypeFor(storeKey),
        attrs;
    
    attrs = store.readEditableDataHash(storeKey);
    if (!attrs) throw hub.Record.BAD_STATE_ERROR;

    // if value is the same, do not flag record as dirty
    if (value !== attrs[key]) {
      if(!ignoreDidChange) this.beginEditing();
      attrs[key] = value;
      if(!ignoreDidChange) this.endEditing(key);
    }
    
    // if value is primaryKey of record, write it to idsByStoreKey
    if (key===this.get('primaryKey')) {
      hub.Store.idsByStoreKey[storeKey] = attrs[key] ;
      this.propertyDidChange('id'); // Reset computed value
    }
    
    // if any aggregates, propagate the state
    if(!recordType.aggregates || recordType.aggregates.length>0) {
      this.propagateToAggregates();
    }
    
    return this ;  
  },
  
  /**
    This will also ensure that any aggregate records are also marked dirty
    if this record changes.
    
    Should not have to be called manually.
  */
  propagateToAggregates: function() {
    var storeKey = this.get('storeKey'),
        recordType = hub.Store.recordTypeFor(storeKey), 
        idx, len, key, val, recs;
    
    var aggregates = recordType.aggregates;
    
    // if recordType aggregates are not set up yet, make sure to 
    // create the cache first
    if(!aggregates) {
      var dataHash = this.get('store').readDataHash(storeKey),
          aggregates = [];
      for(k in dataHash) {
        if(this[k] && this[k].get && this[k].get('aggregate')===true) {
          aggregates.push(k);
        }
      }
      recordType.aggregates = aggregates;
    }
    
    // now loop through all aggregate properties and mark their related
    // record objects as dirty
    for(idx=0,len=aggregates.length;idx<len;idx++) {
      key = aggregates[idx];
      val = this.get(key);
      
      recs = hub.kindOf(val, hub.ManyArray) ? val : [val];
      recs.forEach(function(rec) {
        // write the dirty status
        if(rec) { 
          rec.get('store').writeStatus(rec.get('storeKey'), this.get('status'));
          rec.storeDidChangeProperties(true);
        }
      }, this);
    }
    
  },
  
  /**
    Called by the store whenever the underlying data hash has changed.  This
    will notify any observers interested in data hash properties that they
    have changed.
    
    @param {Boolean} statusOnly changed
    @param {String} key that changed (optional)
    @returns {hub.Record} receiver
  */
  storeDidChangeProperties: function(statusOnly, keys) {
    if (statusOnly) this.notifyPropertyChange('status');
    else {      
      if (keys) {
        this.beginPropertyChanges();
        keys.forEach(function(k) { this.notifyPropertyChange(k); }, this);
        this.notifyPropertyChange('status'); 
        this.endPropertyChanges();
        
      } else this.allPropertiesDidChange(); 
    
      // also notify manyArrays
      var manyArrays = this.relationships,
          loc        = manyArrays ? manyArrays.length : 0 ;
      while(--loc>=0) manyArrays[loc].recordPropertyDidChange(keys);
    }
  },
  
  /**
    Normalizing a record will ensure that the underlying hash conforms
    to the record attributes such as their types (transforms) and default 
    values. 
    
    This method will write the conforming hash to the store and return
    the materialized record.
    
    By normalizing the record, you can use .attributes() and be
    assured that it will conform to the defined model. For example, this
    can be useful in the case where you need to send a JSON representation
    to some server after you have used .createRecord(), since this method
    will enforce the 'rules' in the model such as their types and default
    values. You can also include null values in the hash with the 
    includeNull argument.
    
    @param {Boolean} includeNull will write empty (null) attributes
    @returns {hub.Record} the normalized record
  */
  
  normalize: function(includeNull) {
    
    var primaryKey = this.primaryKey, 
        dataHash   = {}, 
        recordId   = this.get('id'), 
        store      = this.get('store'), 
        storeKey   = this.get('storeKey'), 
        recHash, attrValue, isRecord, defaultVal;
    
    dataHash[primaryKey] = recordId;
    
    for(var key in this) {
      // make sure property is a record attribute.
      if(this[key] && this[key]['typeClass']) {
        
        isRecord = hub.typeOf(this[key].typeClass())==='class';

        if (!isRecord) {
          attrValue = this.get(key);
          if(attrValue!==undefined || (attrValue===null && includeNull)) {
            dataHash[key] = attrValue;
          }
        }
        else if(isRecord) {
          recHash = store.readDataHash(storeKey);

          if(recHash[key]!==undefined) {
            // write value already there
            dataHash[key] = recHash[key];

          // or write default
          } else {
            defaultVal = this[key].get('defaultValue');

            // computed default value
            if (hub.typeOf(defaultVal)===hub.T_FUNCTION) {
              dataHash[key] = defaultVal();
            
            // plain value
            } else {
              dataHash[key] = defaultVal;
            }
          }
        }
      }
    }
    
    store.writeDataHash(storeKey, dataHash);
    return store.materializeRecord(storeKey);
  },
  
  /**
    If you try to get/set a property not defined by the record, then this 
    method will be called. It will try to get the value from the set of 
    attributes.
    
    This will also check is ignoreUnknownProperties is set on the recordType
    so that they will not be written to dataHash unless explicitly defined
    in the model schema.
  
    @param {String} key the attribute being get/set
    @param {Object} value the value to set the key to, if present
    @returns {Object} the value
  */
  unknownProperty: function(key, value) {
    
    if (value !== undefined) {
      
      // first check if we should ignore unknown properties for this 
      // recordType
      var storeKey = this.get('storeKey'),
        recordType = hub.Store.recordTypeFor(storeKey);
      
      if(recordType.ignoreUnknownProperties===true) {
        this[key] = value;
        return value;
      }
      
      // if we're modifying the PKEY, then hub.Store needs to relocate where 
      // this record is cached. store the old key, update the value, then let 
      // the store do the housekeeping...
      var primaryKey = this.get('primaryKey');
      this.writeAttribute(key,value);

      // update ID if needed
      if (key === primaryKey) {
        hub.Store.replaceIdFor(storeKey, value);
      }
      
    }
    return this.readAttribute(key);
  },
  
  /**
    Lets you commit this specific record to the store which will trigger
    the appropriate methods in the data source for you.
    
    @param {Hash} params optional additonal params that will passed down
      to the data source
    @returns {hub.Record} receiver
  */
  commitRecord: function(params) {
    var store = this.get('store');
    store.commitRecord(undefined, undefined, this.get('storeKey'), params);
    return this ;
  },
  
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
    Returns the receiver if the record is in an error state.  Returns null
    otherwise.
    
    @property {hub.Record}
  */
  errorValue: function() {
    return this.get('isError') ? hub.val(this.get('errorObject')) : null ;
  }.property('isError').cacheable(),
  
  /**
    Returns the current error object only if the record is in an error state.
    If no explicit error object has been set, returns hub.Record.GENERIC_ERROR.
    
    @property {hub.Error}
  */
  errorObject: function() {
    if (this.get('isError')) {
      var store = this.get('store');
      return store.readError(this.get('storeKey')) || hub.Record.GENERIC_ERROR;
    } else return null ;
  }.property('isError').cacheable(),
  
  // ...............................
  // PRIVATE
  //
  
  /** @private
    Creates string representation of record, with status.
    
    @returns {String}
  */
  
  toString: function() {
    var attrs = this.get('attributes');
    return "%@(%@) %@".fmt(this.constructor.toString(), hub.inspect(attrs), this.statusString());
  },
  
  /** @private
    Creates string representation of record, with status.
    
    @returns {String}
  */
  
  statusString: function() {
    var ret = [], status = this.get('status');
    
    for(var prop in hub.Record) {
      if(prop.match(/[A-Z_]$/) && hub.Record[prop]===status) {
        ret.push(prop);
      }
    }
    
    return ret.join(" ");
  }
      
}) ;

// Class Methods
hub.Record.mixin( /** @scope hub.Record */ {

  /**
    Whether to ignore unknown properties when they are being set on the record
    object. This is useful if you want to strictly enforce the model schema
    and not allow dynamically expanding it by setting new unknown properties
    
    @property {Boolean}
  */
  ignoreUnknownProperties: false,

  // ..........................................................
  // CONSTANTS
  // 

  /** 
    Generic state for records with no local changes.
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  CLEAN:            0x0001, // 1

  /** 
    Generic state for records with local changes.
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  DIRTY:            0x0002, // 2
  
  /** 
    State for records that are still loaded.  
    
    A record instance should never be in this state.  You will only run into 
    it when working with the low-level data hash API on hub.Store. Use a 
    logical AND (single &) to test record status
  
    @property {Number}
  */
  EMPTY:            0x0100, // 256

  /** 
    State for records in an error state.
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  ERROR:            0x1000, // 4096
  
  /** 
    Generic state for records that are loaded and ready for use
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  READY:            0x0200, // 512

  /** 
    State for records that are loaded and ready for use with no local changes
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  READY_CLEAN:      0x0201, // 513


  /** 
    State for records that are loaded and ready for use with local changes
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  READY_DIRTY:      0x0202, // 514


  /** 
    State for records that are new - not yet committed to server
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  READY_NEW:        0x0203, // 515
  

  /** 
    Generic state for records that have been destroyed
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  DESTROYED:        0x0400, // 1024


  /** 
    State for records that have been destroyed and committed to server
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  DESTROYED_CLEAN:  0x0401, // 1025


  /** 
    State for records that have been destroyed but not yet committed to server
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  DESTROYED_DIRTY:  0x0402, // 1026
  

  /** 
    Generic state for records that have been submitted to data source
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  BUSY:             0x0800, // 2048


  /** 
    State for records that are still loading data from the server
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  BUSY_LOADING:     0x0804, // 2052


  /** 
    State for new records that were created and submitted to the server; 
    waiting on response from server
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  BUSY_CREATING:    0x0808, // 2056


  /** 
    State for records that have been modified and submitted to server
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  BUSY_COMMITTING:  0x0810, // 2064


  /** 
    State for records that have requested a refresh from the server.
    
    Use a logical AND (single &) to test record status.
  
    @property {Number}
  */
  BUSY_REFRESH:     0x0820, // 2080


  /** 
    State for records that have requested a refresh from the server.
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  BUSY_REFRESH_CLEAN:  0x0821, // 2081

  /** 
    State for records that have requested a refresh from the server.
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  BUSY_REFRESH_DIRTY:  0x0822, // 2082

  /** 
    State for records that have been destroyed and submitted to server
    
    Use a logical AND (single &) to test record status
  
    @property {Number}
  */
  BUSY_DESTROYING:  0x0840, // 2112


  // ..........................................................
  // ERRORS
  // 
  
  /**
    Error for when you try to modify a record while it is in a bad 
    state.
    
    @property {hub.Error}
  */
  BAD_STATE_ERROR:     hub.$error("Internal Inconsistency"),

  /**
    Error for when you try to create a new record that already exists.
    
    @property {hub.Error}
  */
  RECORD_EXISTS_ERROR: hub.$error("Record Exists"),

  /**
    Error for when you attempt to locate a record that is not found
    
    @property {hub.Error}
  */
  NOT_FOUND_ERROR:     hub.$error("Not found "),

  /**
    Error for when you try to modify a record that is currently busy
    
    @property {hub.Error}
  */
  BUSY_ERROR:          hub.$error("Busy"),

  /**
    Generic unknown record error
    
    @property {hub.Error}
  */
  GENERIC_ERROR:       hub.$error("Generic Error"),
  
  // ..........................................................
  // CLASS METHODS
  // 
  
  /**
    Helper method returns a new hub.RecordAttribute instance to map a simple
    value or to-one relationship.  At the very least, you should pass the 
    type class you expect the attribute to have.  You may pass any additional
    options as well.
    
    Use this helper when you define hub.Record subclasses. 
    
    h4. Example
    
    {{{
      MyApp.Contact = hub.Record.extend({
        firstName: hub.Record.attr(String, { isRequired: true })
      });
    }}}
    
    @param {Class} type the attribute type
    @param {Hash} opts the options for the attribute
    @returns {hub.RecordAttribute} created instance
  */
  attr: function(type, opts) { 
    return hub.RecordAttribute.attr(type, opts); 
  },
  
  /**
    Returns an hub.RecordAttribute that describes a fetched attribute.  When 
    you reference this attribute, it will return an hub.RecordArray that uses
    the type as the fetch key and passes the attribute value as a param.
    
    Use this helper when you define hub.Record subclasses. 
    
    h4. Example
    
    {{{
      MyApp.Group = hub.Record.extend({
        contacts: hub.Record.fetch('MyApp.Contact')
      });
    }}}
    
    @param {hub.Record|String} recordType The type of records to load
    @param {Hash} opts the options for the attribute
    @returns {hub.RecordAttribute} created instance
  */
  fetch: function(recordType, opts) {
    return hub.FetchedAttribute.attr(recordType, opts) ;
  },
  
  /**
    Returns an hub.ManyAttribute that describes a record array backed by an 
    array of guids stored in the underlying JSON.  You can edit the contents
    of this relationship.
    
    If you set the inverse and isMaster: false key, then editing this array will
    modify the underlying data, but the inverse key on the matching record
    will also be edited and that record will be marked as needing a change.
    
    @param {hub.Record|String} recordType The type of record to create
    @param {Hash} opts the options for the attribute
    @returns {hub.ManyAttribute} created instance
  */
  toMany: function(recordType, opts) {
    return hub.ManyAttribute.attr(recordType, opts);
  },
  
  /**
    Returns a hub.SingleAttribute that converts the underlying ID to a single
    record.  If you modify this property, it will rewrite the underyling ID. 
    It will also modify the inverse of the relationship, if you set it.
    
    @param {hub.Record|String} recordType the type of the record to create
    @param {Hash} opts additional options
    @returns {hub.SingleAttribute} created instance
  */
  toOne: function(recordType, opts) {
    return hub.SingleAttribute.attr(recordType, opts);
  },
    
  /**
    Returns all storeKeys mapped by Id for this record type.  This method is
    used mostly by the hub.Store and the Record to coordinate.  You will rarely
    need to call this method yourself.
    
    @returns {Hash}
  */
  storeKeysById: function() {
    var key = hub.keyFor('storeKey', hub.guidFor(this)),
        ret = this[key];
    if (!ret) ret = this._hub_storeKeysById = this[key] = {};
    return ret;
  },
  
  /**
    Given a primaryKey value for the record, returns the associated
    storeKey.  If the primaryKey has not been assigned a storeKey yet, it 
    will be added.
    
    For the inverse of this method see hub.Store.idFor() and 
    hub.Store.recordTypeFor().
    
    @param {String} id a record id
    @returns {Number} a storeKey.
  */
  storeKeyFor: function(id) {
    var storeKeysById = this._hub_storeKeysById ;
    if (!storeKeysById) storeKeysById = this.storeKeysById() ;
    var ret = storeKeysById[id] ;
    
    if (!ret) {
      ret = hub.Store.generateStoreKey();
      hub.Store.idsByStoreKey[ret] = id ;
      hub.Store.recordTypesByStoreKey[ret] = this ;
      storeKeysById[id] = ret ;
    }
    
    return ret ;
  },
  
  /**
    Given a primaryKey value for the record, returns the associated
    storeKey.  As opposed to storeKeyFor() however, this method
    will NOT generate a new storeKey but returned undefined.
    
    @param {String} id a record id
    @returns {Number} a storeKey.
  */
  storeKeyExists: function(id) {
    var storeKeysById = this._hub_storeKeysById ;
    if (!storeKeysById) storeKeysById = this.storeKeysById() ;
    return storeKeysById[id] ;
  },
  
  /** 
    Returns a record with the named ID in store.
    
    @param {hub.Store} store the store
    @param {String} id the record id or a query
    @returns {hub.Record} record instance
  */
  find: function(store, id) {
    return store.find(this, id);
  },
  
  /** @private - enhance extend to notify hub.Query as well. */
  extend: function() {
    var ret = hub.Object.extend.apply(this, arguments);
    hub.Query._hub_scq_didDefineRecordType(ret);
    return ret ;
  }
  
});
