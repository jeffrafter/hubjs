// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  Standard Error that should be raised when you try to modify a frozen object.
  
  @property {Error}
*/
hub.FROZEN_ERROR = new Error("Cannot modify a frozen object");

/** 
  The hub.Freezable mixin implements some basic methods for marking an object
  as frozen.  Once an object is frozen it should be read only.  No changes 
  may be made the internal state of the object.
  
  h2. Enforcement

  To fully support freezing in your subclass, you must include this mixin and
  override any method that might alter any property on the object to instead
  raise an exception.  You can check the state of an object by checking the
  isFrozen property.

  Although future versions of JavaScript may support language-level freezing
  of objects, that is not the case today.  Even if an object is freezable, it 
  is still technically possible to modify the object, even though it could
  break other parts of your application that do not expect a frozen object to
  change.  It is, therefore, very important that you always respect the 
  isFrozen property on all freezable objects.
  
  h2. Example

  The example below shows a simple object that implement the hub.Freezable 
  mixin.
  
  {{{
    Contact = hub.Object.extend(hub.Freezable, {
      
      firstName: null,
      
      lastName: null,
      
      // swaps the names
      swapNames: function() {
        if (this.get('isFrozen')) throw hub.FROZEN_ERROR;
        var tmp = this.get('firstName');
        this.set('firstName', this.get('lastName'));
        this.set('lastName', tmp);
        return this;
      }
      
    });
    
    c = Context.create({ firstName: "John", lastName: "Doe" });
    c.swapNames();  => returns c
    c.freeze();
    c.swapNames();  => EXCEPTION
    
  }}}
  
  h2. Copying
  
  Usually the hub.Freezable mixin is implemented in cooperation with the
  hub.Copyable mixin, which defines a frozenCopy() method that will return
  a frozen object, if the object implements this method as well.
  
  @mixin
*/
hub.Freezable = {
  
  /**
    Walk like a duck.
    
    @property {Boolean}
  */
  isFreezable: true,
  
  /**
    Set to true when the object is frozen.  Use this property to detect whether
    your object is frozen or not.
    
    @property {Boolean}
  */
  isFrozen: false,
  
  /**
    Freezes the object.  Once this method has been called the object should
    no longer allow any properties to be edited.
    
    @returns {Object} reciever
  */
  freeze: function() {
    // NOTE: Once someone actually implements Object.freeze() in the browser,
    // add a call to that here also.
    
    if (this.set) this.set('isFrozen', true);
    else this.isFrozen = true;
    return this;
  }
};

// Add to Array
hub.mixin(Array.prototype, hub.Freezable);
