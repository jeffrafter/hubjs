// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            ©2010 Jeff Rafter
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub google Gears */

/**
  hub.Database wraps a SQLite database of serving as a backing store for the 
  data and indices of a hub.Hub object.   Uses the proposed HTML 5 SQLite API 
  when available and attempts to access Google Gears as a fallback.
  
  @class
  @extends hub.Object
*/
hub.Database = hub.Object.extend(
  /** @scope hub.Database */ {
  _hub_name: null,
  _hub_desc: null,
  _hub_db: null,
  
  init: function() {
    // FIXME: why does initObservable not exist?
    // arguments.callee.base.apply()
    try {
      var errmsg = "Sorry, No DB today." ;

      if (window.openDatabaseSync || window.openDatabase || (google.gears.factory && google.gears.factory.create)) {
        if (window.openDatabaseSync) {
          this._hub_db = window.openDatabaseSync(this._hub_name, "1.1", this._hub_desc, 5000000) ;
          this._hub_db.addListener("commit", function() {
            hub.debug("COMMIT") ;
          }) ;
          this._hub_db.addListener("update", function(operation, database, table, rowid) {
            hub.debug("update " + operation + " " + database + "." + table + " " + rowid) ;
          }) ;
        } else if (window.openDatabase) {
          this._hub_db = window.openDatabase(this._hub_name, "1.1", this._hub_desc, 5000000) ;
        } else {
          // Must be google gears
          this._hub_db = Gears.openDatabase(this._hub_name, "1.1") ;
        }
        if (!this._hub_db) {
          alert(errmsg + " Couldn't open, maybe bad version or run out of DB quota.") ;
        }
      } else if (window.google.factory && window.google.factory.create) {
        alert(errmsg + " More work to do on google gears.") ;  
      } else {
        alert(errmsg + " Your browser doesn't support it.") ;
      }
    } catch(err) {
      alert(errmsg + " Something bad happened: " + err) ;
    }  
    return this ;
  },
 
  database: function() {
    hub.debug("Returning database: " + this._hub_db);
    return this._hub_db;
  }
});
  
/** 
  Convenience metohd returns a new database object with a default name and
  description already provided.
  
  @param {String} name the name of the database
  @param {String} desc the database description
  @returns {hub.Database}
*/
hub.Database.connect = function(name, desc) {
  return this.create({ _hub_name: name, _hub_desc: desc }) ;
};