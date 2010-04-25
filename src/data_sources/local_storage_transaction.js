

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
  hub.Transaction wraps a SQLite database transaction. Uses the proposed HTML 5 
  SQLite API when available and attempts to access Google Gears as a fallback.
  
  @class
  @extends hub.Object
*/
hub.LocalStorageTransaction = hub.Object.extend(
  /** @scope hub.Transaction */ {
  _hub_db: null,
  _hub_transaction: null,
  
  callback: null,
  onError: null,
  onFinish: null,
  
  init: function() {
    arguments.callee.base.apply(this, arguments);

    var self = this;
    // Must be attached to a database
    if (self._hub_db == undefined) hub_error("You cannot start a transaction without a database");        
    if (self._hub_db.transaction != undefined) {
      // On Webkit/HTML we want a proper transaction, for everyone else we fake it      
      self._hub_db.transaction(
        function (tx) {
          self._hub_transaction = tx;
          if (self.callback) self.callback.apply(self, [self]);
        },
        function (error) {
          if (self.onError) self.onError.apply(self, [error]);                  
        },
        function () {
          if (self.onFinish) self.onFinish.apply(self, []);                  
        }
      );
    } else {
      // Build the transaction manually
      self._hub_db.execute('BEGIN');
      try {
        if (self.callback) self.callback.apply(self, [self]); 
        self._hub_db.execute('COMMIT');            
        if (self.onFinish) self.onFinish.apply(self, []);                  
      } catch(ex) {
        self._hub_db.execute('ROLLBACK');      
        if (self.onError) self.onError.apply(self, [error]);                  
      } 
    }    
    return this;
  },
 
  /** 
    Executes a sql query or command on underlying database implementation. This 
    is handled transparently for the various adapters. The sql can include ? 
    placeholders to allow for safe parameter inclusion. The success method
    will pass an array of row objects which are each hashes of names and values.
    
    For example:
    
      var db = hub.LocalStorageDatabase.connect("things");
      db.transaction(function(tx) {
        tx.execute("SELECT * FROM things WHERE key = ?", [1], 
          function(rows) {
            for (row in rows) {
              hub.debug("key: " + row['key'])
            }
          }, 
          function(error) {
            hub.debug("There was a massive error, all is lost: " + error);
          });
      });
        
    @param {String} sql the actual query or command you want to execute
    @param {String} params an array of parameters used for replacement
    @param {Function} onSuccess function to execute when the command completes
    @param {Function} onError function to execute if the command fails
  */
  execute: function(sql, params, onSuccess, onError) {
    var self = this;
    if (self._hub_transaction != undefined) {
      // Webkit / HTML 5
      self._hub_transaction.executeSql(sql, params, 
        function(tx, results) {
          if (onSuccess) {
            // Convert the result to something more common and hubified
            var rows = [];
            for (row in results.rows) {
              rows.pushObject(row);
            }
            onSuccess.apply(self, [self, rows]);
          }
        },
        function(tx, error) {
          hub.debug("ERROR:\n"+error.message);

          // We need to handle the onError result and raise an error to stop
          // the transaction (unless it was handled)          
          if (onError) return onError.apply(self, [self, error.message]);
        }
      );
    } else {
      // Google gears / AIR adapter
      try {
        // TODO!
      } catch(ex) {
        var throwError = true;
        if (onError) throwError = onError.apply(self, [ex.getMessage()]);
        if (throwError) throw new Error("Could not execute command: " + ex.getMessage());
      }
    }
  },  
  
  
});
