// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals GLOBAL hub module test ok equals same */

var store, childStore, Application, dataSource;

module("hub.NestedStore Core Methods", {
  setup: function() {
    dataSource = hub.DataSource.create();
    
    Application = {};
    Application._hub_nameDidChange = 0;
    
    Application.File = hub.Record.extend({ 
      
      nameDidChange: function(object, key) {
        Application._hub_nameDidChange++;
      }.observes('name', 'url', 'isDirectory')
      
    });
    Application.FileDisk = hub.Record.extend({ });
    
    Application.Data = {
      
      "FileDisk": [
        { id: '14', name: 'Main Drive', parent: null, children: null }
      ],
    
      "File": [
        { id: '10', name: 'Home', url: '/emily_parker', isDirectory: true, parent: null, children: 'Collection'},
        { id: '11', name: 'Documents', fileType: 'documents', url: '/emily_parker/Documents', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
        { id: '137',name: 'Library', fileType: 'library', url: '/emily_parker/Library', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
        { id: '12', name: 'Movies', fileType: 'movies', url: '/emily_parker/Movies', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true},
        { id: '134',name: 'Music', fileType: 'music', url: '/emily_parker/Music', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true},
        { id: '135',name: 'Pictures', fileType: 'pictures', url: '/emily_parker/Pictures', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true},
        { id: '13', name: 'Auto Insurance', fileType: 'folder', url: '/emily_parker/Documents/Auto%20Insurance', isDirectory: true, parent: '11', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
        { id: '14', name: 'Birthday Invitation.pdf', fileType: 'file', url: '/emily_parker/Documents/Birthday%20Invitation', isDirectory: false, parent: '11', createdAt: 'October 17, 2007', modifiedAt: 'October 21, 2007', filetype: 'pdf', isShared: false},
        { id: '136', name: 'Software', fileType: 'software', url: '/emily_parker/Software', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true}
      ]
    };
    
    
    store = hub.Store.create({ name: 'Test nested store'} ).from(dataSource);
    for(var i in Application.Data) {
      store.loadRecords(Application[i], Application.Data[i]);
    }
    
    
    // make sure RecordType by String can map
    GLOBAL.Application = Application;
    
    childStore = store.createEditingContext();
  }    
});

test("Make sure that setting an attribute on a record will only notify respective observers once", function() {
  
  var file = childStore.find(Application.File, '14');
  Application._hub_nameDidChange = 0 ;
  
  
  file.writeAttribute('name', 'My Great New Name');
  
  
  equals(Application._hub_nameDidChange, 1, 'observer was only fired once');

});
