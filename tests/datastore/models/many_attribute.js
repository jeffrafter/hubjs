// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same MyApp */

// test core array-mapping methods for ManyArray with ManyAttribute
var storeKeys, rec, rec2, rec3, rec4;
var foo1, foo2, foo3, bar1, bar2, bar3;

module("hub.ManyAttribute core methods", {
  setup: function() {
    MyApp = hub.Object.create({
      store: hub.Store.create()
    });
    
    MyApp.Foo = hub.Record.extend({
      
      // test simple reading of a pass-through prop
      firstName: hub.Record.attr(String),

      // test mapping to another internal key
      otherName: hub.Record.attr(String, { key: "firstName" }),
      
      // test mapping Date
      date: hub.Record.attr(Date),
      
      // used to test default value
      defaultValue: hub.Record.attr(String, {
        defaultValue: "default"
      }),
      
      // test toMany relationships
      fooMany: hub.Record.toMany('MyApp.Foo'),

      // test toMany relationships with different key
      fooManyKeyed: hub.Record.toMany('MyApp.Foo', {
        key: 'fooIds'
      }),

      // test many-to-many relationships with inverse
      barToMany: hub.Record.toMany('MyApp.Bar', {
        inverse: 'fooToMany', isMaster: true, orderBy: 'name'
      }),
      
      // test many-to-one relationships with inverse
      barToOne: hub.Record.toMany('MyApp.Bar', {
        inverse: 'fooToOne', isMaster: false
      })
      
    });
    
    MyApp.Bar = hub.Record.extend({
      
      // test many-to-many
      fooToMany: hub.Record.toMany('MyApp.Foo', {
        inverse: 'barToMany', isMaster: false
      }),
      
      // test many-to-one
      fooToOne: hub.Record.toOne('MyApp.Foo', {
        inverse: 'barToOne', isMaster: true
      })
    });
    
    storeKeys = MyApp.store.loadRecords(MyApp.Foo, [
      { id: 1, 
        firstName: "John", 
        lastName: "Doe",
        barToMany: ['bar1'],
        barToOne:  ['bar1', 'bar2'] 
      },
      
      { id: 2, 
        firstName: "Jane", 
        lastName: "Doe",
        barToMany: ['bar1', 'bar2'],
        barToOne:  [] 
      },
      
      { id: 3, 
        firstName: "Emily", 
        lastName: "Parker", 
        fooMany: [1,2],
        barToMany: ['bar2'],
        barToOne: [] 
      },
      
      { id: 4,
        firstName: "Johnny",
        lastName: "Cash",
        fooIds: [1,2]
      }
    ]);
    
    MyApp.store.loadRecords(MyApp.Bar, [
      { id: "bar1", name: "A", fooToMany: [1,2], fooToOne: 1 },
      { id: "bar2", name: "Z", fooToMany: [2,3], fooToOne: 1 },
      { id: "bar3", name: "C" }
    ]);
    
    foo1 = rec = MyApp.store.find(MyApp.Foo, 1);
    foo2 = rec2 = MyApp.store.find(MyApp.Foo, 2);
    foo3 = rec3 = MyApp.store.find(MyApp.Foo, 3);
    rec4 = MyApp.store.find(MyApp.Foo, 4);
    equals(rec.storeKey, storeKeys[0], 'should find record');
    
    bar1 = MyApp.store.find(MyApp.Bar, "bar1");
    bar2 = MyApp.store.find(MyApp.Bar, 'bar2');
    bar3 = MyApp.store.find(MyApp.Bar, 'bar3');
  },
  
  teardown: function() {
    MyApp = rec = rec2 = rec3 = 
    foo1 = foo2 = foo3 = bar1 = bar2 = null;
  }
});

// ..........................................................
// READING
// 

test("pass-through should return builtin value" ,function() {
  equals(rec.get('firstName'), 'John', 'reading prop should get attr value');
});

test("getting toMany relationship should map id to real records", function() {
  var rec3 = MyApp.store.find(MyApp.Foo, 3);
  equals(rec3.get('id'), 3, 'precond - should find record 3');
  equals(rec3.get('fooMany').objectAt(0), rec, 'should get rec1 instance for rec3.fooMany');
  equals(rec3.get('fooMany').objectAt(1), rec2, 'should get rec2 instance for rec3.fooMany');
});

test("getting toMany relationship should map id to real records when using different key", function() {
  var rec4 = MyApp.store.find(MyApp.Foo, 4);
  equals(rec4.get('id'), 4, 'precond - should find record 4');
  equals(rec4.get('fooManyKeyed').objectAt(0), rec, 'should get rec1 instance for rec4.fooManyKeyed');
  equals(rec4.get('fooManyKeyed').objectAt(1), rec2, 'should get rec2 instance for rec4.fooManyKeyed');
});
 
test("getting toMany relation should not change record state", function() {
  equals(rec3.get('status'), hub.Record.READY_CLEAN, 'precond - status should be READY_CLEAN');
  
  var recs = rec3.get('fooMany');
  ok(recs, 'rec3.get(fooMany) should return records');
  equals(rec3.get('status'), hub.Record.READY_CLEAN, 'getting toMany should not change state');
});

test("reading toMany in a child store", function() {
  var recs1, recs2, store, rec3a;
  
  recs1 = rec3.get('fooMany');
  store = MyApp.store.createEditingContext();
  
  rec3a = store.find(rec3);
  recs2 = rec3a.get('fooMany');
      
  same(recs2.getEach('storeKey'), recs1.getEach('storeKey'), 'returns arrays from child store and parent store should be the same');
  ok(recs2 !== recs1, 'returned arrays should not be same instance');
  
});

test("reading a null relation", function() {
  
  // note: rec1 hash has NO array
  equals(rec.readAttribute('fooMany'), null, 'rec1.fooMany attr should be null');
  
  var ret = rec.get('fooMany');
  equals(ret.get('length'), 0, 'rec1.get(fooMany).length should be 0'); 
  same(ret.getEach('storeKey'), [], 'rec1.get(fooMany) should return empty array');
});

// ..........................................................
// WRITING
// 

test("writing to a to-many relationship should update set ids", function() {
  var rec3 = MyApp.store.find(MyApp.Foo, 3);
  equals(rec3.get('id'), 3, 'precond - should find record 3');
  equals(rec3.get('fooMany').objectAt(0), rec, 'should get rec1 instance for rec3.fooMany');
  
  rec3.set('fooMany', [rec2, rec4]);
  
  equals(rec3.get('fooMany').objectAt(0), rec2, 'should get rec2 instance for rec3.fooMany');
  equals(rec3.get('fooMany').objectAt(1), rec4, 'should get rec4 instance for rec3.fooMany');
});

test("writing to a to-many relationship should update set ids when using a different key", function() {
  var rec4 = MyApp.store.find(MyApp.Foo, 4);
  equals(rec4.get('id'), 4, 'precond - should find record 4');
  equals(rec4.get('fooManyKeyed').objectAt(0), rec, 'should get rec1 instance for rec4.fooManyKeyed');

  rec4.set('fooManyKeyed', [rec2, rec3]);

  ok(rec4.get('fooIds').isEqual([2,3]), 'should get array of ids (2, 3) for rec4.fooIds');
});

test("pushing an object to a to-many relationship attribute should update set ids", function() {
  var rec3 = MyApp.store.find(MyApp.Foo, 3);
  equals(rec3.get('id'), 3, 'precond - should find record 3');
  equals(rec3.get('fooMany').length(), 2, 'should be 2 foo instances related');
  
  rec3.get('fooMany').pushObject(rec4);
  
  equals(rec3.get('fooMany').length(), 3, 'should be 3 foo instances related');
  
  equals(rec3.get('fooMany').objectAt(0), rec, 'should get rec instance for rec3.fooMany');
  equals(rec3.get('fooMany').objectAt(1), rec2, 'should get rec2 instance for rec3.fooMany');
  equals(rec3.get('fooMany').objectAt(2), rec4, 'should get rec4 instance for rec3.fooMany');
});
 
test("modifying a toMany array should mark the record as changed", function() {
  var recs = rec3.get('fooMany');
  equals(rec3.get('status'), hub.Record.READY_CLEAN, 'precond - rec3.status should be READY_CLEAN');
  ok(!!rec4, 'precond - rec4 should be defined');
  
  recs.pushObject(rec4);
  
  equals(rec3.get('status'), hub.Record.READY_DIRTY, 'record status should have changed to dirty');

});

test("modifying a toMany array within a child store", function() {
  var child = MyApp.store.createEditingContext() ; // get a child store
  var parentFooMany = rec3.get('fooMany') ; // base foo many
  
  var childRec3 = child.find(rec3); 
  var childFooMany = childRec3.get('fooMany'); // get the nested fooMany
  
  // save store keys before modifying for easy testing
  var expected = parentFooMany.getEach('storeKey');
  
  // now trying modifying...
  var childRec4 = child.find(rec4);
  equals(childFooMany.get('length'), 2, 'precond - childFooMany should be like parent');
  childFooMany.pushObject(childRec4);
  equals(childFooMany.get('length'), 3, 'childFooMany should have 1 more item');
  
  same(parentFooMany.getEach('storeKey'), expected, 'parent.fooMany should not have changed yet');
  equals(rec3.get('status'), hub.Record.READY_CLEAN, 'parent rec3 should still be READY_CLEAN');
  
  expected = childFooMany.getEach('storeKey'); // update for after commit
  
  child.commitChanges();
  
  // NOTE: not getting fooMany from parent again also tests changing an array
  // underneath.  Does it clear caches, etc?
  equals(parentFooMany.get('length'), 3, 'parent.fooMany length should have changed');
  same(parentFooMany.getEach('storeKey'), expected, 'parent.fooMany should now have changed form child store');
  equals(rec3.get('status'), hub.Record.READY_DIRTY, 'parent rec3 should now be READY_DIRTY');
  
});

test("should be able to modify an initially empty record", function() {
  same(rec.get('fooMany').getEach('storeKey'), [], 'precond - fooMany should be empty');
  rec.get('fooMany').pushObject(rec4);
  same(rec.get('fooMany').getEach('storeKey'), [rec4.get('storeKey')], 'after edit should have new array');
});


// ..........................................................
// MANY-TO-MANY RELATIONSHIPS
// 

function checkAllClean() {
  hub.A(arguments).forEach(function(r) {
    equals(r.get('status'), hub.Record.READY_CLEAN, hub.fmt('PRECOND - %@.status should be READY_CLEAN', r.get('id')));
  }, this);
}

test("removing a record from a many-to-many", function() {
  ok(foo1.get('barToMany').indexOf(bar1) >= 0, 'PRECOND - foo1.barToMany should contain bar1');
  ok(bar1.get('fooToMany').indexOf(foo1) >= 0, 'PRECOND - bar1.fooToMany should contain foo1');
  checkAllClean(foo1, bar1);
  
  foo1.get('barToMany').removeObject(bar1);

  ok(foo1.get('barToMany').indexOf(bar1) < 0, 'foo1.barToMany should NOT contain bar1');
  ok(bar1.get('fooToMany').indexOf(foo1) < 0, 'bar1.fooToMany should NOT contain foo1');

  equals(foo1.get('status'), hub.Record.READY_DIRTY, 'foo1.status should be READY_DIRTY');
  equals(bar1.get('status'), hub.Record.READY_CLEAN, 'bar1.status should be READY_CLEAN');
  
});

test("removing a record from a many-to-many; other side", function() {
  ok(foo1.get('barToMany').indexOf(bar1) >= 0, 'PRECOND - foo1.barToMany should contain bar1');
  ok(bar1.get('fooToMany').indexOf(foo1) >= 0, 'PRECOND - bar1.fooToMany should contain foo1');
  checkAllClean(foo1, bar1);
  
  bar1.get('fooToMany').removeObject(foo1);

  ok(foo1.get('barToMany').indexOf(bar1) < 0, 'foo1.barToMany should NOT contain bar1');
  ok(bar1.get('fooToMany').indexOf(foo1) < 0, 'bar1.fooToMany should NOT contain foo1');

  equals(foo1.get('status'), hub.Record.READY_DIRTY, 'foo1.status should be READY_DIRTY');
  equals(bar1.get('status'), hub.Record.READY_CLEAN, 'bar1.status should be READY_CLEAN');
  
});

test("adding a record to a many-to-many; bar side", function() {
  ok(foo2.get('barToMany').indexOf(bar3) < 0, 'PRECOND - foo1.barToMany should NOT contain bar1');
  ok(bar3.get('fooToMany').indexOf(foo2) < 0, 'PRECOND - bar3.fooToMany should NOT contain foo1');
  checkAllClean(foo2, bar3);
  
  bar3.get('fooToMany').pushObject(foo2);

  // v-- since bar3 is added throught inverse, it should follow orderBy
  equals(foo2.get('barToMany').indexOf(bar3), 1, 'foo1.barToMany should contain bar1');
  ok(bar3.get('fooToMany').indexOf(foo2) >= 0, 'bar1.fooToMany should contain foo1');

  equals(foo2.get('status'), hub.Record.READY_DIRTY, 'foo1.status should be READY_DIRTY');
  equals(bar1.get('status'), hub.Record.READY_CLEAN, 'bar1.status should be READY_CLEAN');
});


test("adding a record to a many-to-many; foo side", function() {
  ok(foo2.get('barToMany').indexOf(bar3) < 0, 'PRECOND - foo1.barToMany should NOT contain bar3');
  ok(bar3.get('fooToMany').indexOf(foo2) < 0, 'PRECOND - bar3.fooToMany should NOT contain foo1');
  checkAllClean(foo2, bar3);
  
  foo2.get('barToMany').pushObject(bar3);

  ok(foo2.get('barToMany').indexOf(bar3) >= 0, 'foo1.barToMany should contain bar3');
  ok(bar3.get('fooToMany').indexOf(foo2) >= 0, 'bar1.fooToMany should contain foo3');

  equals(foo2.get('status'), hub.Record.READY_DIRTY, 'foo1.status should be READY_DIRTY');
  equals(bar1.get('status'), hub.Record.READY_CLEAN, 'bar3.status should be READY_CLEAN');
});

// ..........................................................
// ONE-TO-MANY RELATIONSHIPS
// 

test("removing a record from a one-to-many", function() {
  ok(foo1.get('barToOne').indexOf(bar1) >= 0, 'PRECOND - foo1.barToOne should contain bar1');
  equals(bar1.get('fooToOne'), foo1, 'PRECOND - bar1.fooToOne should eq foo1');
  checkAllClean(foo1, bar1);
  
  foo1.get('barToOne').removeObject(bar1);

  ok(foo1.get('barToOne').indexOf(bar1) < 0, 'foo1.barToOne should NOT contain bar1');
  equals(bar1.get('fooToOne'), null, 'bar1.fooToOne should eq null');

  equals(foo1.get('status'), hub.Record.READY_CLEAN, 'foo1.status should be READY_CLEAN');
  equals(bar1.get('status'), hub.Record.READY_DIRTY, 'bar1.status should be READY_DIRTY');
  
});


test("removing a record from a one-to-many; other-side", function() {
  ok(foo1.get('barToOne').indexOf(bar1) >= 0, 'PRECOND - foo1.barToOne should contain bar1');
  equals(bar1.get('fooToOne'), foo1, 'PRECOND - bar1.fooToOne should eq foo1');
  checkAllClean(foo1, bar1);
  
  bar1.set('fooToOne', null);

  ok(foo1.get('barToOne').indexOf(bar1) < 0, 'foo1.barToOne should NOT contain bar1');
  equals(bar1.get('fooToOne'), null, 'bar1.fooToOne should eq null');

  equals(foo1.get('status'), hub.Record.READY_CLEAN, 'foo1.status should be READY_CLEAN');
  equals(bar1.get('status'), hub.Record.READY_DIRTY, 'bar1.status should be READY_DIRTY');
  
});


test("add a record to a one-to-many; many-side", function() {
  ok(foo1.get('barToOne').indexOf(bar3) < 0, 'PRECOND - foo1.barToOne should NOT contain bar3');
  equals(bar3.get('fooToOne'), null, 'PRECOND - bar3.fooToOne should eq null');
  checkAllClean(foo1, bar1);
  
  foo1.get('barToOne').pushObject(bar3);

  ok(foo1.get('barToOne').indexOf(bar3) >= 0, 'foo1.barToOne should contain bar3');
  equals(bar3.get('fooToOne'), foo1, 'bar3.fooToOne should eq foo1');

  equals(foo1.get('status'), hub.Record.READY_CLEAN, 'foo1.status should be READY_CLEAN');
  equals(bar3.get('status'), hub.Record.READY_DIRTY, 'bar3.status should be READY_DIRTY');
  
});


test("add a record to a one-to-many; one-side", function() {
  ok(foo1.get('barToOne').indexOf(bar3) < 0, 'PRECOND - foo1.barToOne should NOT contain bar3');
  equals(bar3.get('fooToOne'), null, 'PRECOND - bar3.fooToOne should eq null');
  checkAllClean(foo1, bar1);
  
  bar3.set('fooToOne', foo1);

  ok(foo1.get('barToOne').indexOf(bar3) >= 0, 'foo1.barToOne should contain bar3');
  equals(bar3.get('fooToOne'), foo1, 'bar3.fooToOne should eq foo1');

  equals(foo1.get('status'), hub.Record.READY_CLEAN, 'foo1.status should be READY_CLEAN');
  equals(bar3.get('status'), hub.Record.READY_DIRTY, 'bar3.status should be READY_DIRTY');
  
});
