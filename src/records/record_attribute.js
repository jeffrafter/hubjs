// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  hub.RecordAttribute describes a single attribute on a record.  It is used to
  generate computed properties on records that can automatically convert data
  types and verify data.
  
  When defining an attribute on an hub.Record, you can configure it this way: 
  
  {{{
    title: hub.Record.attr(String, { 
      defaultValue: 'Untitled',
      isRequired: true|false
    })
  }}}
  
  In addition to having predefined transform types, there is also a way to 
  set a computed relationship on an attribute. A typical example of this would
  be if you have record with a parentGuid attribute, but are not able to 
  determine which record type to map to before looking at the guid (or any
  other attributes). To set up such a computed property, you can attach a 
  function in the attribute definition of the hub.Record subclass:
  
  {{{
    relatedToComputed: hub.Record.toOne(function() {
      return (this.readAttribute('relatedToComputed').indexOf("foo")==0) ? MyApp.Foo : MyApp.Bar;
    })
  }}}
  
  Notice that we are not using .get() to avoid another transform which would 
  trigger an infinite loop.
  
  You usually will not work with RecordAttribute objects directly, though you
  may extend the class in any way that you like to create a custom attribute.
  
  A number of default RecordAttribute types are defined on the hub.Record.
  
  @class
  @extends hub.Object
*/
hub.RecordAttribute = hub.Object.extend(
  /** @scope hub.RecordAttribute.prototype */ {

  /**
    The default value.  If attribute is null or undefined, this default value
    will be substituted instead.  Note that defaultValues are not converted
    so the value should be in the output type expected by the attribute.
    
    @property {Object}
  */
  defaultValue: null,
  
  /**
    The attribute type.  Must be either an object class or a property path
    naming a class.  The built in handler allows all native types to pass 
    through, converts records to ids and dates to UTF strings.
    
    If you use the attr() helper method to create a RecordAttribute instance,
    it will set this property to the first parameter you pass.
    
    @property {Object|String}
  */
  type: String,
  
  /**
    The underlying attribute key name this attribute should manage.  If this
    property is left empty, then the key will be whatever property name this
    attribute assigned to on the record.  If you need to provide some kind
    of alternate mapping, this provides you a way to override it.
    
    @property {String}
  */
  key: null,
  
  /**
    If true, then the attribute is required and will fail validation unless
    the property is set to a non-null or undefined value.
    
    @property {Boolean}
  */
  isRequired: false,
  
  /**
    If false then attempts to edit the attribute will be ignored.
    
    @property {Boolean}
  */
  isEditable: true,  
  
  /**
    If set when using the Date format, expect the ISO8601 date format.  
    This is the default.
    
    @property {Boolean}
  */
  useIsoDate: true,
  
  /**
    Can only be used for toOne or toMany relationship attributes. If true,
    this flag will ensure that any related objects will also be marked
    dirty when this record dirtied. 
    
    Useful when you might have multiple related objects that you want to 
    consider in an 'aggregated' state. For instance, by changing a child
    object (image) you might also want to automatically mark the parent 
    (album) dirty as well.
    
    @property {Boolean}
  */
  aggregate: false,
  
  // ..........................................................
  // HELPER PROPERTIES
  // 
  
  /**
    Returns the type, resolved to a class.  If the type property is a regular
    class, returns the type unchanged.  Otherwise attempts to lookup the 
    type as a property path.
    
    @property {Object}
  */
  typeClass: function() {
    var ret = this.get('type');
    if (hub.typeOf(ret) === hub.T_STRING) ret = hub.objectForPropertyPath(ret);
    return ret ;
  }.property('type').cacheable(),
  
  /**
    Finds the transform handler. 
    
    @property {Function}
  */
  transform: function() {
    var klass      = this.get('typeClass') || String,
        transforms = hub.RecordAttribute.transforms,
        ret ;
        
    // walk up class hierarchy looking for a transform handler
    while(klass && !(ret = transforms[hub.guidFor(klass)])) {
      // check if super has create property to detect hub.Object's
      if(klass.superclass.hasOwnProperty('create')) klass = klass.superclass ;
      // otherwise return the function transform handler
      else klass = hub.T_FUNCTION ;
    }
    
    return ret ;
  }.property('typeClass').cacheable(),
  
  // ..........................................................
  // LOW-LEVEL METHODS
  // 
  
  /** 
    Converts the passed value into the core attribute value.  This will apply 
    any format transforms.  You can install standard transforms by adding to
    the hub.RecordAttribute.transforms hash.  See 
    hub.RecordAttribute.registerTransform() for more.
    
    @param {hub.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value
    @returns {Object} attribute value
  */
  toType: function(record, key, value) {
    var transform = this.get('transform'),
        type      = this.get('typeClass');
    
    if (transform && transform.to) {
      value = transform.to(value, this, type, record, key) ;
    }
    return value ;
  },

  /** 
    Converts the passed value from the core attribute value.  This will apply 
    any format transforms.  You can install standard transforms by adding to
    the hub.RecordAttribute.transforms hash.  See 
    hub.RecordAttribute.registerTransform() for more.

    @param {hub.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value
    @returns {Object} attribute value
  */
  fromType: function(record, key, value) {
    var transform = this.get('transform'),
        type      = this.get('typeClass');
    
    if (transform && transform.from) {
      value = transform.from(value, this, type, record, key);
    }
    return value;
  },

  /**
    The core handler.  Called from the property.
    
    @param {hub.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value if called as a setter
    @returns {Object} property value
  */
  call: function(record, key, value) {
    var attrKey = this.get('key') || key, nvalue;
    
    if (value !== undefined) {

      // careful: don't overwrite value here.  we want the return value to 
      // cache.
      nvalue = this.fromType(record, key, value) ; // convert to attribute.
      record.writeAttribute(attrKey, nvalue); 
    } else {
      value = record.readAttribute(attrKey);
      if (hub.none(value) && (value = this.get('defaultValue'))) {
        if (typeof value === hub.T_FUNCTION) {
          value = this.defaultValue(record, key, this);
          // write default value so it doesn't have to be executed again
          if(record.attributes()) record.writeAttribute(attrKey, value, true);
        }
      } else value = this.toType(record, key, value);
    }
    
    return value ;
  },

  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private - Make this look like a property so that get() will call it. */
  isProperty: true,
  
  /** @private - Make this look cacheable */
  isCacheable: true,
  
  /** @private - needed for KVO property() support */
  dependentKeys: [],
  
  /** @private */
  init: function() {
    arguments.callee.base.apply(this, arguments) ;
    // setup some internal properties needed for KVO - faking 'cacheable'
    this.cacheKey = "__hub_cache__" + hub.guidFor(this) ;
    this.lastSetValueKey = "__hub_lastValue__" + hub.guidFor(this) ;
  }
  
}) ;

// ..........................................................
// CLASS METHODS
// 

/**
  The default method used to create a record attribute instance.  Unlike 
  create(), takes an attributeType as the first parameter which will be set 
  on the attribute itself.  You can pass a string naming a class or a class
  itself.
  
  @param {Object|String} attributeType the assumed attribute type
  @param {Hash} opts optional additional config options
  @returns {hub.RecordAttribute} new instance
*/
hub.RecordAttribute.attr = function(attributeType, opts) {
  if (!opts) opts = {} ;
  if (!opts.type) opts.type = attributeType || String ;
  return this.create(opts);
};

/** @private
  Hash of registered transforms by class guid. 
*/
hub.RecordAttribute.transforms = {};

/**
  Call to register a transform handler for a specific type of object.  The
  object you pass can be of any type as long as it responds to the following
  methods:

  | *to(value, attr, klass, record, key)* | converts the passed value (which will be of the class expected by the attribute) into the underlying attribute value |
  | *from(value, attr, klass, record, key)* | converts the underyling attribute value into a value of the class |
  
  @param {Object} klass the type of object you convert
  @param {Object} transform the transform object
  @returns {hub.RecordAttribute} receiver
*/
hub.RecordAttribute.registerTransform = function(klass, transform) {
  hub.RecordAttribute.transforms[hub.guidFor(klass)] = transform;
};

// ..........................................................
// STANDARD ATTRIBUTE TRANSFORMS
// 

// Object, String, Number just pass through.

/** @private - generic converter for Boolean records */
hub.RecordAttribute.registerTransform(Boolean, {
  /** @private - convert an arbitrary object value to a boolean */
  to: function(obj) {
    return hub.none(obj) ? null : !!obj;
  }
});

/** @private - generic converter for Numbers */
hub.RecordAttribute.registerTransform(Number, {
  /** @private - convert an arbitrary object value to a Number */
  to: function(obj) {
    return hub.none(obj) ? null : Number(obj) ;
  }
});

/** @private - generic converter for Strings */
hub.RecordAttribute.registerTransform(String, {
  /** @private - 
    convert an arbitrary object value to a String 
    allow null through as that will be checked separately
  */
  to: function(obj) {
    if (!(typeof obj === hub.T_STRING) && !hub.none(obj) && obj.toString) {
      obj = obj.toString();
    }
    return obj;
  }
});

/** @private - generic converter for Array */
hub.RecordAttribute.registerTransform(Array, {
  /** @private - check if obj is an array
  */
  to: function(obj) {
    if (!hub.isArray(obj) && !hub.none(obj)) {
      obj = [];
    }
    return obj;
  }
});

/** @private - generic converter for Object */
hub.RecordAttribute.registerTransform(Object, {
  /** @private - check if obj is an object */
  to: function(obj) {
    if (!(typeof obj === 'object') && !hub.none(obj)) {
      obj = {};
    }
    return obj;
  }
});

/** @private - generic converter for hub.Record-type records */
hub.RecordAttribute.registerTransform(hub.Record, {

  /** @private - convert a record id to a record instance */
  to: function(id, attr, recordType, parentRecord) {
    var store = parentRecord.get('store');
    if (hub.none(id) || (id==="")) return null;
    else return store.find(recordType, id);
  },
  
  /** @private - convert a record instance to a record id */
  from: function(record) { return record ? record.get('id') : null; }
});

/** @private - generic converter for transforming computed record attributes */
hub.RecordAttribute.registerTransform(hub.T_FUNCTION, {

  /** @private - convert a record id to a record instance */
  to: function(id, attr, recordType, parentRecord) {
    recordType = recordType.apply(parentRecord);
    var store = parentRecord.get('store');
    return store.find(recordType, id);
  },
  
  /** @private - convert a record instance to a record id */
  from: function(record) { return record.get('id'); }
});

/** @private - generic converter for Date records */
hub.RecordAttribute.registerTransform(Date, {

  /** @private - convert a string to a Date */
  to: function(str, attr) {
    var ret ;
    
    if (attr.get('useIsoDate')) {
      var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
             "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\\.([0-9]+))?)?" +
             "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?",
          d      = str.toString().match(new RegExp(regexp)),
          offset = 0,
          date   = new Date(d[1], 0, 1),
          time ;

      if (d[3]) { date.setMonth(d[3] - 1); }
      if (d[5]) { date.setDate(d[5]); }
      if (d[7]) { date.setHours(d[7]); }
      if (d[8]) { date.setMinutes(d[8]); }
      if (d[10]) { date.setSeconds(d[10]); }
      if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
      if (d[14]) {
         offset = (Number(d[16]) * 60) + Number(d[17]);
         offset *= ((d[15] == '-') ? 1 : -1);
      }

      offset -= date.getTimezoneOffset();
      time = (Number(date) + (offset * 60 * 1000));
      
      ret = new Date();
      ret.setTime(Number(time));
    } else ret = new Date(Date.parse(str));
    return ret ;
  },
  
  _hub_dates: {},

  _hub_zeropad: function(num) { 
    return ((num<0) ? '-' : '') + ((num<10) ? '0' : '') + Math.abs(num); 
  },
  
  /** @private - convert a date to a string */
  from: function(date) { 
    var ret = this._hub_dates[date.getTime()];
    if (ret) return ret ; 
    
    // figure timezone
    var zp = this._hub_zeropad,
        tz = 0-date.getTimezoneOffset()/60;
        
    tz = (tz === 0) ? 'Z' : '%@:00'.fmt(zp(tz));
    
    this._hub_dates[date.getTime()] = ret = "%@-%@-%@T%@:%@:%@%@".fmt(
      zp(date.getFullYear()),
      zp(date.getMonth()+1),
      zp(date.getDate()),
      zp(date.getHours()),
      zp(date.getMinutes()),
      zp(date.getSeconds()),
      tz) ;
    
    return ret ;
  }
});

if (hub.DateTime && !hub.RecordAttribute.transforms[hub.guidFor(hub.DateTime)]) {
  /**
    Registers a transform to allow hub.DateTime to be used as a record attribute,
    ie hub.Record.attr(hub.DateTime);
  
    Because hub.RecordAttribute is in the datastore framework and hub.DateTime in
    the foundation framework, and we don't know which framework is being loaded
    first, this chunck of code is duplicated in both frameworks.
  
    IF YOU EDIT THIS CODE MAKE SURE YOU COPY YOUR CHANGES to record_attribute.js. 
  */

  hub.RecordAttribute.registerTransform(hub.DateTime, {
  
    /** @private
      Convert a String to a DateTime
    */
    to: function(str, attr) {
      if (hub.none(str) || hub.instanceOf(str, hub.DateTime)) return str;
      var format = attr.get('format');
      return hub.DateTime.parse(str, format ? format : hub.DateTime.recordFormat);
    },
  
    /** @private
      Convert a DateTime to a String
    */
    from: function(dt, attr) {
      if (hub.none(dt)) return dt;
      var format = attr.get('format');
      return dt.toFormattedString(format ? format : hub.DateTime.recordFormat);
    }
  });
  
}
