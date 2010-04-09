// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  An error, used to represent an error state.
  
  Many API's within hub.js will return an instance of this class when an error 
  occurs.  hub.Error includes an error code, description, and an optional human-
  readable label that indicates the what failed.
  
  Depending on the error, other properties may also be added to the object
  to help you recover from the error.
  
  You can easily determine if the value returned by some API is an error or not 
  using the helper hub.ok(value).
  
  h2. Faking Error Objects
  
  You can actually make any object you want be treated like an Error object
  by simply implementing two properties: isError and errorValue.  If you set 
  isError to true, then calling hub.ok(obj) on your object will return false.
  If isError is true, then hub.val(obj) will return your errorValue property 
  instead of the receiver.
  
  @class
  @extends hub.Object
*/
hub.Error = hub.Object.extend(
/** @scope hub.Error.prototype */ {
  
  /**
    error code.  Used to designate the error type.
    
    @property {Number}
  */
  code: -1,
  
  /**
    Human readable description of the error.  This can also be a non-localized
    key.
    
    @property {String}
  */
  message: '',
  
  /**
    The value the error represents.  This is used when wrapping a value inside
    of an error to represent the validation failure.
    
    @property {Object}
  */
  errorValue: null,
  
  /**
    The original error object.  Normally this will return the receiver.  
    However, sometimes another object will masquarade as an error; this gives
    you a way to get at the underyling error.
    
    @property {hub.Error}
  */
  errorObject: function() {
    return this;
  }.property().cacheable(),
  
  /**
    Human readable name of the item with the error.
    
    @property {String}
  */
  label: null,

  /** @private */
  toString: function() {
    return hub.fmt("hub.Error:%@:%@ (%@)",
      hub.guidFor(this),
      this.get('message'),
      this.get('code')
    );
  },
  
  /**
    Walk like a duck.
    
    @property {Boolean}
  */
  isError: true
}) ;

/**
  Creates a new hub.Error instance with the passed description, label, and
  code.  All parameters are optional.
  
  @param description {String} human readable description of the error
  @param label {String} human readable name of the item with the error
  @param code {Number} an error code to use for testing.
  @returns {hub.Error} new error instance.
*/
hub.Error.desc = function(description, label, value, code) {
  var opts = { message: description } ;
  if (label !== undefined) opts.label = label ;
  if (code !== undefined) opts.code = code ;
  if (value !== undefined) opts.errorValue = value ;
  return this.create(opts) ;
} ;

/**
  Shorthand form of the hub.Error.desc method.

  @param description {String} human readable description of the error
  @param label {String} human readable name of the item with the error
  @param code {Number} an error code to use for testing.
  @returns {hub.Error} new error instance.
*/
hub.$error = function(description, label, value, c) { 
  return hub.Error.desc(description,label, value, c); 
} ;

/**
  Returns true if the passed value is an error object or false.
  
  @param {Object} ret object value
  @returns {Boolean}
*/
hub.ok = function(ret) {
  return (ret !== false) && !(ret && ret.isError);
};

/** @private FIXME remove */
hub.$ok = hub.ok;

/**
  Returns the value of an object.  If the passed object is an error, returns
  the value associated with the error; otherwise returns the receiver itself.
  
  @param {Object} obj the object
  @returns {Object} value 
*/
hub.val = function(obj) {
  if (obj && obj.isError) {
    return obj.get ? obj.get('errorValue') : null ; // Error has no value
  } else return obj ;
};

/** @private FIXME remove */
hub.$val = hub.val;

// STANDARD ERROR OBJECTS

/**
  Standard error code for errors that do not support multiple values.
  
  @property {Number}
*/
hub.Error.HAS_MULTIPLE_VALUES = -100 ;
