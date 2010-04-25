// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  @class
  @extend hub.DataSource
*/
hub.LocalStorageDataSource = hub.DataSource.extend(
/** @scope hub.DataSource.prototype */
{

  /** Walk like a duck. */
  isDataSource: true,

  setup: function(hub) {
    return false ; // do not handle anything!
  },
  
  startUp: function(hub) {
    return false ; // do not handle anything!
  },


  /**
    Maintain data source states, this is separate from the primary hub states

      a: waiting
      b: running SQL 
      c: error
  */
  _hub_state: "a",
  
  /** 
    Move from one writing state to the next, for more info see :state
  */
  _hub_transition: function(newState) {
    hub.debug(hub.fmt("Going to data source state: %@", newState)) ;
    this._hub_state = newState ;
  },

  _hub_createDatabase: function(store, query) {
    return false ; // do not handle anything!
  },

  // Holds databases for 'Hub' and <hubKey>
  _hub_dbs: {},
  _hub_sqlQueue: [],
  _hub_sqlInternalQueue: [],

  /** 
    Add State check, and only run when not touching DB.
    If not in correct state, then add to FIFO queue, and invoke later and send
  */
  send: function(callback, onFinish, internal, isHub) {
    hub_precondition(this.state !== 'c', "Database is in error state.");
    var self = this, 
    database;
    
    // If we are writing (state==b), then we want to wait to execute this call. 
    // We will instead add it to the queue and invoke this call with a 
    // half-second delay.
    // This used to be here too : || (hub.state === 4 && this._hub_sqlInternalQueue.length > 0 && !internal)) 
    if (this._hub_state === "b") {    
      if (internal) {
        this._hub_sqlInternalQueue.push(arguments);
      } else {
        this._hub_sqlQueue.push(arguments);
      }
      setTimeout(function() { self.invoke.apply(self); }, 500);
      return;
    }

    // Transition to the writing state
    this._hub_transition("b");
    
    // Is this a metadata call or are we writing data for this hub (by key)
    if (isHub) {
      database = "Hub";
    } else {
      database = self._hub.key;
    }

    // TODO: this seems bad, the query might not have been added to a queue
    if (!database) {
      hub.debug("No Hub yet, wait till we have one.");
      self.invoke.apply(self);
      return;
    }
    
    // Check if we are setup
    if (!isHub && !self._hub.setup) {
      self.setup();
    }

    // If the database exists, then run this query inside of a transaction    
    if (self._hub_dbs[database]) {
      hub.debug("Running query with existing database.");
      self._hub_dbs[database].transaction(callback,
        function(error) {
          self._hub_transition("c");
          hub.debug("ERROR: Transaction Errored.");
          hub_error(error);
        },
        function() {
          if (onFinish) onFinish.apply(self);
          self._hub_transition("a");        
          self.invoke.apply(self);
        }
      );
    } else {
      //TODO we need to initialize the database because we haven't yet.
    }
  },

  /** 
    Invoke allows you to invoke a call to send after a delay (usually a
    half-second). If the data source is currently writing (state=b) then
    we will delay the call again. If we have delayed 10 times then we will 
    discard.
  */
  invokeCount: 0,
  invoke: function() {
    var self = this,
    args;
    if (this._hub_state === "b") {
      hub.debug("Invoke later");
      self.invokeCount++;
      //TODO Should we error out here, instead of just discarding?
      if (self.invokeCount < 10) {
        setTimeout(function() { self.invoke.apply(self); }, 500);
      }
      return false;
    }
    self.invokeCount = 0;
    if (self._hub_sqlInternalQueue.length > 0) {
      args = this._hub_sqlInternalQueue.shift();
      return self.send.apply(self, args);
    } else if (self._hub_sqlQueue.length > 0) {
      args = this._hub_sqlQueue.shift();
      return self.send.apply(self, args);
    }
  },
  




    
});
