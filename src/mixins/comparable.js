// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  Implements some standard methods for comparing objects. Add this mixin to
  any class you create that can compare its instances.
  
  You MUST implement the compare() method.
  
  FIXME: Consider removing this mixin.
  
  @mixin
*/
hub.Comparable = {
  
  /**
    Walk like a duck. Indicates that the object can be compared.
    
    @type Boolean
  */
  isComparable: true,
  
  /**
    Override to return the result of the comparison of the two parameters. The
    compare method should return
      -1 if a < b
       0 if a == b
       1 if a > b
    
    The default implementation raises an exception.
    
    @param a {Object} the first object to compare
    @param b {Object} the second object to compare
    @returns {Integer} the result of the comparison
  */
  compare: function(a, b) {
    throw hub.fmt("%@.compare() is not implemented", this.toString()) ;
  }
  
};
