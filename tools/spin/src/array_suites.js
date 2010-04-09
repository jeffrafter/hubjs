// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global window GLOBAL exports require hub Spin test ok equals same */

/* MANUALLY CONCATENATED TEST SUITES FOR ARRAY */

/**
  Adds a new module of unit tests to verify that the passed object implements
  the hub.Array interface.  To generate, call the ArrayTests array with a 
  test descriptor.  Any properties you pass will be applied to the ArrayTests
  descendent created by the create method.
  
  You should pass at least a newObject() method, which should return a new 
  instance of the object you want to have tested.  You can also implement the
  destroyObject() method, which should destroy a passed object.
  
  {{{
    Spin.ArrayTests.generate("Array", {
      newObject:  function() { return []; }
    });
  }}}
  
  newObject must accept an optional array indicating the number of items
  that should be in the array.  You should initialize the the item with 
  that many items.  The actual objects you add are up to you.
  
  Unit tests themselves can be added by calling the define() method.  The
  function you pass will be invoked whenever the ArrayTests are generated. The
  parameter passed will be the instance of ArrayTests you should work with.
  
  {{{
    Spin.ArrayTests.define(function(T) {
      T.module("length");
      
      test("verify length", function() {
        var ary = T.newObject();
        equals(ary.get('length'), 0, 'should have 0 initial length');
      });
    }
  }}}
  
  
*/

var ArraySuite = Spin.Suite.create("Verify hub.Array compliance: %@#%@", {
  
  /** 
    Override to return a set of simple values such as numbers or strings.
    Return null if your set does not support primitives.
  */
  simple: function(amt) {
    var ret = [];
    if (amt === undefined) amt = 0;
    while(--amt >= 0) ret[amt] = amt ;
    return ret ;
  },

  /**  Override with the name of the key we should get/set on hashes */
  hashValueKey: 'foo',
  
  /**
    Override to return hashes of values if supported.  Or return null.
  */
  hashes: function(amt) {
    var ret = [];  
    if (amt === undefined) amt = 0;
    while(--amt >= 0) {
      ret[amt] = {};
      ret[amt][this.hashValueKey] = amt ;
    }
    return ret ;
  },
  
  /** Override with the name of the key we should get/set on objects */
  objectValueKey: "foo",
  
  /**
    Override to return observable objects if supported.  Or return null.
  */
  objects: function(amt) {
    var ret = [];  
    if (amt === undefined) amt = 0;
    while(--amt >= 0) {
      var o = {};
      o[this.objectValueKey] = amt ;
      ret[amt] = hub.Object.create(o);
    }
    return ret ;
  },

  /**
    Returns an array of content items in your preferred format.  This will
    be used whenever the test does not care about the specific object content.
  */
  expected: function(amt) {
    return this.simple(amt);
  },
  
  /**
    Example of how to implement newObject
  */
  newObject: function(expected) {
    if (!expected || hub.typeOf(expected) === hub.T_NUMBER) {
      expected = this.expected(expected);
    }
    
    return expected.slice();
  },
  
  
  /**
    Creates an observer object for use when tracking object modifications.
  */
  observer: function(obj) {
    return hub.Object.create({

      // ..........................................................
      // NORMAL OBSERVER TESTING
      // 
      
      observer: function(target, key, value) {
        this.notified[key] = true ;
        this.notifiedValue[key] = value ;
      },

      resetObservers: function() {
        this.notified = {} ;
        this.notifiedValue = {} ;
      },

      observe: function() {
        var keys = hub.$A(arguments) ;
        var loc = keys.length ;
        while(--loc >= 0) {
          obj.addObserver(keys[loc], this, this.observer) ;
        }
        return this ;
      },

      didNotify: function(key) {
        return !!this.notified[key] ;
      },

      init: function() {
        arguments.callee.base.apply(this, arguments) ;
        this.resetObservers() ;
      },
      
      // ..........................................................
      // RANGE OBSERVER TESTING
      // 
      
      callCount: 0,

      // call afterward to verify
      expectRangeChange: function(source, object, key, indexes, context) {
        equals(this.callCount, 1, 'expects one callback');
        
        if (source !== undefined && source !== false) {
          ok(this.source, source, 'source should equal array');
        }
        
        if (object !== undefined && object !== false) {
          equals(this.object, object, 'object');
        }
        
        if (key !== undefined && key !== false) {
          equals(this.key, key, 'key');
        }
        
        if (indexes !== undefined && indexes !== false) {
          if (indexes.isIndexSet) {
            ok(this.indexes && this.indexes.isIndexSet, 'indexes should be index set');
            ok(indexes.isEqual(this.indexes), Spin.fmt('indexes should match %@ (actual: %@)', indexes, this.indexes));
          } else equals(this.indexes, indexes, 'indexes');
        }
          
        if (context !== undefined && context !== false) {
          equals(this.context, context, 'context should match');
        }
        
      },
      
      rangeDidChange: function(source, object, key, indexes, context) {
        this.callCount++ ;
        this.source = source ;
        this.object = object ;
        this.key    = key ;
        
        // clone this because the index set may be reused after this callback
        // runs.
        this.indexes = (indexes && indexes.isIndexSet) ? indexes.clone() : indexes;
        this.context = context ;          
      }
      
    });  
  },
  
  /**
    Verifies that the passed object matches the passed array.
  */
  validateAfter: function(obj, after, observer, lengthDidChange, enumerableDidChange) {
    var loc = after.length;
    equals(obj.get('length'), loc, Spin.fmt('length should update (%@)', obj)) ;
    while(--loc >= 0) {
      equals(obj.objectAt(loc), after[loc], Spin.fmt('objectAt(%@)', loc)) ;
    }

    // note: we only test that the length notification happens when we expect
    // it.  If we don't expect a length notification, it is OK for a class
    // to trigger a change anyway so we don't check for this case.
    if (enumerableDidChange !== false) {
      equals(observer.didNotify("[]"), true, 'should notify []') ;
    }
    
    if (lengthDidChange) {
      equals(observer.didNotify('length'), true, 'should notify length change');
    }
  }
  
});

// Simple verfication of length
ArraySuite.define(function(T) {
  T.module("length");
  
  test("should return 0 on empty array", function() {
    equals(T.object.get('length'), 0, 'should have empty length');
  });
  
  test("should return array length", function() {
    var obj = T.newObject(3);
    equals(obj.get('length'), 3, 'should return length');
  });
  
});

// ==========================================================================

ArraySuite.define(function(T) {
  
  T.module("indexOf");
  
  test("should return index of object", function() {
    var expected = T.expected(3), 
        obj      = T.newObject(3), 
        len      = 3,
        idx;
        
    for(idx=0;idx<len;idx++) {
      equals(obj.indexOf(expected[idx]), idx, Spin.fmt('obj.indexOf(%@) should match idx', expected[idx]));
    }
    
  });
  
  test("should return -1 when requesting object not in index", function() {
    var obj = T.newObject(3), foo = {};
    equals(obj.indexOf(foo), -1, 'obj.indexOf(foo) should be < 0');
  });
  
});

// ==========================================================================

ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  Spin.Plan.module(T.desc("insertAt"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[].insertAt(0, X) => [X] + notify", function() {

    var after = T.expected(1);
    
    observer.observe('[]') ;
    obj.insertAt(0, after) ;
    T.validateAfter(obj, after, observer);
  });
  
  test("[].insertAt(200,X) => OUT_OF_RANGE_EXCEPTION exception", function() {
    var didThrow = false ;
    try {
      obj.insertAt(200, T.expected(1));
    } catch (e) {
      equals(e, hub.OUT_OF_RANGE_EXCEPTION, 'should throw hub.OUT_OF_RANGE_EXCEPTION');
      didThrow = true ;
    }
    ok(didThrow, 'should raise exception');
  });

  test("[A].insertAt(0, X) => [X,A] + notify", function() {
    var exp = T.expected(2), 
        before  = exp.slice(0,1),
        replace = exp[1],
        after   = [replace, before[0]];
    
    obj.replace(0,0,before);
    observer.observe('[]');
    
    obj.insertAt(0, replace);
    T.validateAfter(obj, after, observer);
  });
  
  test("[A].insertAt(1, X) => [A,X] + notify", function() {
    var exp = T.expected(2), 
        before  = exp.slice(0,1),
        replace = exp[1],
        after   = [before[0], replace];
    
    obj.replace(0,0,before);
    observer.observe('[]');
    
    obj.insertAt(1, replace);
    T.validateAfter(obj, after, observer);
  });

  test("[A].insertAt(200,X) => OUT_OF_RANGE exception", function() {
    obj.replace(0,0, T.expected(1)); // add an item
    
    var didThrow = false ;
    try {
      obj.insertAt(200, T.expected(1));
    } catch (e) {
      equals(e, hub.OUT_OF_RANGE_EXCEPTION, 'should throw hub.OUT_OF_RANGE_EXCEPTION');
      didThrow = true ;
    }
    ok(didThrow, 'should raise exception');
  });
  
  test("[A,B,C].insertAt(0,X) => [X,A,B,C] + notify", function() {
    var exp = T.expected(4), 
        before  = exp.slice(1),
        replace = exp[0],
        after   = [replace, before[0], before[1], before[2]];
    
    obj.replace(0,0,before);
    observer.observe('[]');
    
    obj.insertAt(0, replace);
    T.validateAfter(obj, after, observer);
  });
  
  test("[A,B,C].insertAt(1,X) => [A,X,B,C] + notify", function() {
    var exp = T.expected(4), 
        before  = exp.slice(1),
        replace = exp[0],
        after   = [before[0], replace, before[1], before[2]];
    
    obj.replace(0,0,before);
    observer.observe('[]');
    
    obj.insertAt(1, replace);
    T.validateAfter(obj, after, observer);
  });

  test("[A,B,C].insertAt(3,X) => [A,B,C,X] + notify", function() {
    var exp = T.expected(4), 
        before  = exp.slice(1),
        replace = exp[0],
        after   = [before[0], before[1], before[2], replace];
    
    obj.replace(0,0,before);
    observer.observe('[]');
    
    obj.insertAt(3, replace);
    T.validateAfter(obj, after, observer);
  });
  
});

// ==========================================================================

ArraySuite.define(function(T) {
  
  T.module("objectAt");
  
  test("should return object at specified index", function() {
    var expected = T.expected(3), 
        obj      = T.newObject(3), 
        len      = 3,
        idx;
        
    for(idx=0;idx<len;idx++) {
      equals(obj.objectAt(idx), expected[idx], Spin.fmt('obj.objectAt(%@) should match', idx));
    }
    
  });
  
  test("should return undefined when requesting objects beyond index", function() {
    var obj = T.newObject(3);
    equals(obj.objectAt(5), undefined, 'should return undefined for obj.objectAt(5) when len = 3');
    equals(T.object.objectAt(0), undefined, 'should return undefined for obj.objectAt(0) when len = 0');
  });
  
});

// ==========================================================================

ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  Spin.Plan.module(T.desc("popObject"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[].popObject() => [] + returns undefined + NO notify", function() {
    observer.observe('[]', 'length') ;
    equals(obj.popObject(), undefined, 'should return undefined') ;
    T.validateAfter(obj, [], observer, false, false);
  });

  test("[X].popObject() => [] + notify", function() {
    var exp = T.expected(1)[0];
    
    obj.replace(0,0, [exp]);
    observer.observe('[]', 'length') ;

    equals(obj.popObject(), exp, 'should return popped object') ;
    T.validateAfter(obj, [], observer, true, true);
  });

  test("[A,B,C].popObject() => [A,B] + notify", function() {
    var before  = T.expected(3),
        value   = before[2],
        after   = before.slice(0,2);
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    equals(obj.popObject(), value, 'should return popped object') ;
    T.validateAfter(obj, after, observer, true);
  });
  
});

// ==========================================================================

ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  Spin.Plan.module(T.desc("pushObject"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("returns pushed object", function() {
    var exp = T.expected(1)[0];
    equals(obj.pushObject(exp), exp, 'should return receiver');
  });
  
  test("[].pushObject(X) => [X] + notify", function() {
    var exp = T.expected(1);
    observer.observe('[]', 'length') ;
    obj.pushObject(exp[0]) ;
    T.validateAfter(obj, exp, observer, true);
  });

  test("[A,B,C].pushObject(X) => [A,B,C,X] + notify", function() {
    var after  = T.expected(4),
        before = after.slice(0,3),
        value  = after[3];
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    obj.pushObject(value) ;
    T.validateAfter(obj, after, observer, true);
  });
  
});

// ==========================================================================

ArraySuite.define(function(T) {
  
  var expected, array, observer, rangeObserver ;

  Spin.Plan.module(T.desc("RangeObserver Methods"), {
    setup: function() {
      expected = T.objects(10);
      array = T.newObject(expected);

      observer = T.observer();
      rangeObserver = array.addRangeObserver(hub.IndexSet.create(2,3), 
                observer, observer.rangeDidChange, null, false);
      
    },
    
    teardown: function() {
      T.destroyObject(array);
    }
  });
  
  test("returns RangeObserver object", function() {
    ok(rangeObserver && rangeObserver.isRangeObserver, 'returns a range observer object');
  });

  // ..........................................................
  // REPLACE
  // 

  test("replacing object in range fires observer with index set covering only the effected item", function() {
    array.replace(2, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', hub.IndexSet.create(2,1));
  });

  test("replacing object before range", function() {
    array.replace(0, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');
  });

  test("replacing object after range", function() {
    array.replace(9, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');
  });

  test("updating range should be reflected by replace operations", function() {
    array.updateRangeObserver(rangeObserver, hub.IndexSet.create(9,1));
    
    observer.callCount = 0 ;
    array.replace(2, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(0, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(9, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', hub.IndexSet.create(9));
  });

  test("removing range should no longer fire observers", function() {
    array.removeRangeObserver(rangeObserver);
    
    observer.callCount = 0 ;
    array.replace(2, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(0, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(9, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');
  });

  // ..........................................................
  // GROUPED CHANGES
  // 
  
  test("grouping property changes should notify observer only once at end with single IndexSet", function() {
    
    array.beginPropertyChanges();
    array.replace(2, 1, T.objects(1));
    array.replace(4, 1, T.objects(1));
    array.endPropertyChanges();
    
    var set = hub.IndexSet.create().add(2).add(4); // both edits
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("should notify observer when some but not all grouped changes are inside range", function() {
    
    array.beginPropertyChanges();
    array.replace(2, 1, T.objects(1));
    array.replace(9, 1, T.objects(1));
    array.endPropertyChanges();
    
    var set = hub.IndexSet.create().add(2).add(9); // both edits
    observer.expectRangeChange(array, null, '[]', set);
  });
  
  test("should NOT notify observer when grouping changes all outside of observer", function() {
    
    array.beginPropertyChanges();
    array.replace(0, 1, T.objects(1));
    array.replace(9, 1, T.objects(1));
    array.endPropertyChanges();

    equals(observer.callCount, 0, 'observer should not fire');
  });
  
  // ..........................................................
  // INSERTING
  // 
  
  test("insertAt in range fires observer with index set covering edit to end of array", function() {
    var newItem = T.objects(1)[0],
        set     = hub.IndexSet.create(3,array.get('length')-2);
        
    array.insertAt(3, newItem);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("insertAt BEFORE range fires observer with index set covering edit to end of array", function() {
    var newItem = T.objects(1)[0],
        set     = hub.IndexSet.create(0,array.get('length')+1);
        
    array.insertAt(0, newItem);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("insertAt AFTER range does not fire observer", function() {
    var newItem = T.objects(1)[0];
        
    array.insertAt(9, newItem);
    equals(observer.callCount, 0, 'observer should not fire');
  });
  
  // ..........................................................
  // REMOVING
  // 
  
  test("removeAt IN range fires observer with index set covering edit to end of array plus delta", function() {
    var set     = hub.IndexSet.create(3,array.get('length')-3);
    array.removeAt(3);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("removeAt BEFORE range fires observer with index set covering edit to end of array plus delta", function() {
    var set     = hub.IndexSet.create(0,array.get('length'));
    array.removeAt(0);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("removeAt AFTER range does not fire observer", function() {
    array.removeAt(9);
    equals(observer.callCount, 0, 'observer should not fire');
  });
  
  
  
  
  // ..........................................................
  // MODULE: No explicit range
  // 
  Spin.Plan.module(T.desc("RangeObserver Methods - No explicit range"), {
    setup: function() {
      expected = T.objects(10);
      array = T.newObject(expected);

      observer = T.observer();
      rangeObserver = array.addRangeObserver(null, observer, 
                          observer.rangeDidChange, null, false);
      
    },
    
    teardown: function() {
      T.destroyObject(array);
    }
  });
  
  test("returns RangeObserver object", function() {
    ok(rangeObserver && rangeObserver.isRangeObserver, 'returns a range observer object');
  });

  // ..........................................................
  // REPLACE
  // 

  test("replacing object in range fires observer with index set covering only the effected item", function() {
    array.replace(2, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', hub.IndexSet.create(2,1));
  });

  test("replacing at start of array", function() {
    array.replace(0, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', hub.IndexSet.create(0,1));
  });

  test("replacing object at end of array", function() {
    array.replace(9, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', hub.IndexSet.create(9,1));
  });

  test("removing range should no longer fire observers", function() {
    array.removeRangeObserver(rangeObserver);
    
    observer.callCount = 0 ;
    array.replace(2, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(0, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(9, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');
  });

  // ..........................................................
  // GROUPED CHANGES
  // 
  
  test("grouping property changes should notify observer only once at end with single IndexSet", function() {
    
    array.beginPropertyChanges();
    array.replace(2, 1, T.objects(1));
    array.replace(4, 1, T.objects(1));
    array.endPropertyChanges();
    
    var set = hub.IndexSet.create().add(2).add(4); // both edits
    observer.expectRangeChange(array, null, '[]', set);
  });

  // ..........................................................
  // INSERTING
  // 
  
  test("insertAt in range fires observer with index set covering edit to end of array", function() {
    var newItem = T.objects(1)[0],
        set     = hub.IndexSet.create(3,array.get('length')-2);
        
    array.insertAt(3, newItem);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("adding object fires observer", function() {
    var newItem = T.objects(1)[0];
    var set = hub.IndexSet.create(array.get('length'));

    array.pushObject(newItem);
    observer.expectRangeChange(array, null, '[]', set);
  });
  
  // ..........................................................
  // REMOVING
  // 
  
  test("removeAt fires observer with index set covering edit to end of array", function() {
    var set     = hub.IndexSet.create(3,array.get('length')-3);
    array.removeAt(3);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("popObject fires observer with index set covering removed range", function() {
    var set = hub.IndexSet.create(array.get('length')-1);
    array.popObject();
    observer.expectRangeChange(array, null, '[]', set);
  });
  
  
  // ..........................................................
  // MODULE: isDeep = NO 
  // 
  Spin.Plan.module(T.desc("RangeObserver Methods - isDeep NO"), {
    setup: function() {
      expected = T.objects(10);
      array = T.newObject(expected);

      observer = T.observer();
      rangeObserver = array.addRangeObserver(hub.IndexSet.create(2,3), 
                observer, observer.rangeDidChange, null, false);
      
    },
    
    teardown: function() {
      T.destroyObject(array);
    }
  });
  
  test("editing property on object at any point should not fire observer", function() {
    
    var indexes = [0,3,9], 
        loc     = 3,
        obj,idx;
        
    while(--loc>=0) {
      idx = indexes[loc];
      obj = array.objectAt(idx);
      obj.set('foo', 'BAR');
      equals(observer.callCount, 0, Spin.fmt('observer should not fire when editing object at index %@', idx));
    }
  });
  
  test("replacing object in range fires observer with index set", function() {
    array.replace(2, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', hub.IndexSet.create(2,1));
  });
    
  
});

// ==========================================================================

ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  Spin.Plan.module(T.desc("removeAt"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[X].removeAt(0) => [] + notify", function() {

    var before = T.expected(1);
    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(0) ;
    T.validateAfter(obj, [], observer, true);
  });
  
  test("[].removeAt(200) => OUT_OF_RANGE_EXCEPTION exception", function() {
    var didThrow = false ;
    try {
      obj.removeAt(200);
    } catch (e) {
      equals(e, hub.OUT_OF_RANGE_EXCEPTION, 'should throw hub.OUT_OF_RANGE_EXCEPTION');
      didThrow = true ;
    }
    ok(didThrow, 'should raise exception');
  });

  test("[A,B].removeAt(0) => [B] + notify", function() {
    var before = T.expected(2), 
        after   = [before[1]];
    
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(0);
    T.validateAfter(obj, after, observer, true);
  });

  test("[A,B].removeAt(1) => [A] + notify", function() {
    var before = T.expected(2), 
        after   = [before[0]];
    
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(1);
    T.validateAfter(obj, after, observer, true);
  });

  test("[A,B,C].removeAt(1) => [A,C] + notify", function() {
    var before = T.expected(3), 
        after   = [before[0], before[2]];
    
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(1);
    T.validateAfter(obj, after, observer, true);
  });
  
  test("[A,B,C,D].removeAt(1,2) => [A,D] + notify", function() {
    var before = T.expected(4), 
        after   = [before[0], before[3]];
    
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(1,2);
    T.validateAfter(obj, after, observer, true);
  });

  test("[A,B,C,D].removeAt(IndexSet<0,2-3>) => [B] + notify", function() {
    var before = T.expected(4), 
        after   = [before[1]];
    
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(hub.IndexSet.create(0).add(2,2));
    T.validateAfter(obj, after, observer, true);
  });
  
});

// ==========================================================================

ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  Spin.Plan.module(T.desc("removeObject"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("should return receiver", function() {
    obj = T.newObject(3);
    equals(obj.removeObject(obj.objectAt(0)), obj, 'should return receiver');
  });
  
  test("[A,B,C].removeObject(B) => [A,C] + notify", function() {

    var before = T.expected(3),
        after  = [before[0], before[2]];
    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;
    
    obj.removeObject(before[1]) ;
    T.validateAfter(obj, after, observer, true);
  });
  
  test("[A,B,C].removeObject(D) => [A,B,C]", function() {
    var exp = T.expected(4),
        extra = exp.pop();
    obj.replace(0,0,exp);
    observer.observe('[]', 'length') ;
    
    obj.removeObject(extra);
    T.validateAfter(obj, exp, observer, false, false);
  });
  
});

// ==========================================================================

ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  Spin.Plan.module(T.desc("replace"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });
  
  test("[].replace(0,0,'X') => ['X'] + notify", function() {

    var exp = T.expected(1);
    
    observer.observe('[]', 'length') ;
    obj.replace(0,0,exp) ;

    T.validateAfter(obj, exp, observer, true);
  });

  test("[A,B,C,D].replace(1,2,X) => [A,X,D] + notify", function() {
    
    var exp = T.expected(5), 
        before = exp.slice(0,4),
        replace = exp.slice(4),
        after = [before[0], replace[0], before[3]];
        
    obj.replace(0,0, before) ; // precond
    observer.observe('[]', 'length') ;

    obj.replace(1,2,replace) ;

    T.validateAfter(obj, after, observer, true);
  });

  test("[A,B,C,D].replace(1,2,[X,Y]) => [A,X,Y,D] + notify", function() {
    
    // setup the before, after, and replace arrays.  Use generated objects
    var exp  = T.expected(6),
        before  = exp.slice(0, 4),
        replace = exp.slice(4),
        after   = [before[0], replace[0], replace[1], before[3]]; 
        
    obj.replace(0,0, before) ;
    observer.observe('[]', 'length') ;

    obj.replace(1,2, replace) ;

    T.validateAfter(obj, after, observer, true);
  });
  
  test("[A,B].replace(1,0,[X,Y]) => [A,X,Y,B] + notify", function() {

    // setup the before, after, and replace arrays.  Use generated objects
    var exp  = T.expected(4),
        before  = exp.slice(0, 2),
        replace = exp.slice(2),
        after   = [before[0], replace[0], replace[1], before[1]] ;

    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;
  
    obj.replace(1,0, replace) ;
    
    T.validateAfter(obj, after, observer, true);
  });
  
  test("[A,B,C,D].replace(2,2) => [A,B] + notify", function() {

    // setup the before, after, and replace arrays.  Use generated objects
    var before  = T.expected(4),
        after   = [before[0], before[1]];

    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;
  
    obj.replace(2,2) ;
    
    T.validateAfter(obj, after, observer, true);
  });
  
});

// ==========================================================================

ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  Spin.Plan.module(T.desc("shiftObject"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[].shiftObject() => [] + returns undefined + NO notify", function() {
    observer.observe('[]', 'length') ;
    equals(obj.shiftObject(), undefined, 'should return undefined') ;
    T.validateAfter(obj, [], observer, false, false);
  });

  test("[X].shiftObject() => [] + notify", function() {
    var exp = T.expected(1)[0];
    
    obj.replace(0,0, [exp]);
    observer.observe('[]', 'length') ;

    equals(obj.shiftObject(), exp, 'should return shifted object') ;
    T.validateAfter(obj, [], observer, true, true);
  });

  test("[A,B,C].shiftObject() => [B,C] + notify", function() {
    var before  = T.expected(3),
        value   = before[0],
        after   = before.slice(1);
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    equals(obj.shiftObject(), value, 'should return shifted object') ;
    T.validateAfter(obj, after, observer, true);
  });
  
});

// ==========================================================================

ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  Spin.Plan.module(T.desc("unshiftObject"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("returns unshifted object", function() {
    var exp = T.expected(1)[0];
    equals(obj.pushObject(exp), exp, 'should return receiver');
  });
  

  test("[].unshiftObject(X) => [X] + notify", function() {
    var exp = T.expected(1);
    observer.observe('[]', 'length') ;
    obj.unshiftObject(exp[0]) ;
    T.validateAfter(obj, exp, observer, true);
  });

  test("[A,B,C].unshiftObject(X) => [X,A,B,C] + notify", function() {
    var after  = T.expected(4),
        before = after.slice(1),
        value  = after[0];
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    obj.unshiftObject(value) ;
    T.validateAfter(obj, after, observer, true);
  });
  
});


exports.ArraySuite = ArraySuite;
