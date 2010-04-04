// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub GLOBAL module test ok equals same AB */

module("Cyclical relationships", { 
  setup: function() {

    // define the application space
    GLOBAL.AB = hub.Object.create({
      store: hub.Store.create().from(hub.Record.fixtures)
    }); 

    // ..........................................................
    // MODEL
    // 
    
    // Describes a single contact
    AB.Contact = hub.Record.extend({
      name: hub.Record.attr(String),
      group: hub.Record.toOne('AB.Group'),
      isFavorite: hub.Record.attr(Boolean)
    });
    
    AB.Group = hub.Record.extend({
      name: hub.Record.attr(String),
      
      // dynamically discover contacts for a group using a foreign key
      contacts: function() {
        var q = hub.Query.local(AB.Contact, "group = {record}", {
          record: this
        });  
        return this.get('store').find(q);
      }.property().cacheable(),
      
      // discover favorite contacts only
      favoriteContacts: function() {
        return this.get('contacts').filterProperty('isFavorite', true);
      }.property('contacts').cacheable(),
      
      // we need to reset favoriteContacts whenever the contacts themselves
      // change
      contactsContentDidChange: function() {
        this.notifyPropertyChange('favoriteContacts');
      }.observes('.contacts*[]')
      
    });
    
    AB.Group.FIXTURES = [
      { guid: 100, name: "G1" },
      { guid: 101, name: "G2" }
    ];

    AB.Contact.FIXTURES = [
      { guid: 1,
        name: "G1-Fav1",
        group: 100,
        isFavorite: true },

      { guid: 2,
        name: "G1-Fav2",
        group: 100,
        isFavorite: true },

      { guid: 3,
        name: "G1-Norm1",
        group: 100,
        isFavorite: false },

      { guid: 4,
        name: "G2-Fav1",
        group: 101,
        isFavorite: true },

      { guid: 5,
        name: "G1-Norm1",
        group: 101,
        isFavorite: false }
    ];
    
    
    hub.RunLoop.begin();
    
  },
  
  teardown: function() {
    hub.RunLoop.end(); 
    AB = null;
  }
});

test("getting all contacts in a group", function() {
  var group  = AB.store.find(AB.Group, 100);
  var expected = AB.store.find(AB.Contact).filterProperty('group', group);
  same(group.get('contacts'), expected, 'contacts');
});

test("finding favoriteContacts", function() {
  var group  = AB.store.find(AB.Group, 100);
  var expected = AB.store.find(AB.Contact)
    .filterProperty('group', group)
    .filterProperty('isFavorite', true);
    
  same(group.get('favoriteContacts'), expected, 'contacts');
  
  var c = AB.store.find(AB.Contact, 4) ;
  c.set('group', group); // move to group...
  hub.RunLoop.end();
  hub.RunLoop.begin();
  
  expected.push(c);
  same(group.get('favoriteContacts'), expected, 'favoriteContacts after adding extra');
  
});
