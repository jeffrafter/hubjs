    // *************************************************************************
    // function(func, noDB, onFinish, internal, isHub) {
    //CATALOG *setup*
    /**
      This method is designed to setup the hub based on stored values in the 
      data source. It needs to
      
        1. Obtain the current maximum storage key (and add one) so that the
        next store key can be generated. Auto-incrementing is handled within
        the hub.Store code, not in the database.
        
        2. Checkout the latest (aka, open HEAD).
        
        3. Once we have HEAD, find out what the currentCommitId would be
        (will these ever be differnt?)
        
        4. Setup a hash of commmit_id and key so that we can quickly look
        them up in memory without another request to the database. Maybe
        this should be done in the datastore.
    */
    self.sendToDB(
      function(tx) {
        // Set the max storeKey for the store.
        tx.executeSql("SELECT MAX(store_key)+1 AS max FROM data", [],
          function(tx, results) {
            var max;
            try {
              max = parseInt(results.rows.item(0)['max'], 10);
            } catch(e) {
              max = 1;
            }
            if (isNaN(max)) max = 1;
            hub_precondition(typeof max === hub.T_NUMBER);
            self.setMaxStoreKey(max); //**
            self.checkoutLatest.call(self); //**
          },
          self._hub_error);


        // Get the current max commit count.
        tx.executeSql("SELECT MAX(commit_id) as max FROM commits", [],
          function(tx, res) {
            var max = parseInt(res.rows.item(0)['max'], 10);
            if (isNaN(max)) max = 0;
            self.currentCommitId = max;
          },
          self._hub_error);


        tx.executeSql("SELECT commit_id, key FROM commits", [],
          function(tx, res) {
            var i = res.rows.length,
            row;
            while (i--) {
              row = res.rows.item(i);
              // self.commitKeys.add(row['key']) ; // This is now done in startUp, from the hubs DB
              self.commitIdsByKey[row['key']] = parseInt(row['commit_id'], 10);
            }
          },
          self._hub_error);
      },
      // noDB
      null,
      // onFinish
      function() {
        // self.sync(store);
        self._hub.setup = true;
        self.settingUp = false;
        // TODO: Make startup Hook?
      },
      // internal
      true
    ); // sendToDB(store)
    // * end *******************************************************************
  
  
    // *************************************************************************
    // function(func, noDB, onFinish, internal, isHub) {
    //CATALOG *startup*
    /**
       This method is run when the hub starts up. When complete it will call 
       setup which will grab the latest information and finalize the preparation.
       It needs to:
       
       1. Retrieve the _hub properties (eventually this will go away) or it 
       needs to create a hub
       
    */
    self.sendToDB(
      function(tx) {
        tx.executeSql("SELECT * FROM hub WHERE meta_uti = ?", [self.get('uti')],
          function(tx, res) {
            if (res.rows.length > 0) {
              var row = res.rows.item(0);
              self._hub.key = row['key'];
              self._hub['name'] = row['name'];
              self._hub.head = row['head'];
              hub.debug(hub.fmt("Loading hub: %@; %@", self._hub.key, self._hub.name));
            } else {
              self.createHub.call(self, tx, {
                version: 'empty',
                creator: self.get('currentTask'),
                editor: ''
              });
            }

            tx.executeSql("SELECT * FROM hub_commit WHERE hub = ?", [self._hub.key],
              function(tx, res) {
                var i = res.rows.length,
                row;
                // hub.debug(hub.fmt("^ adding %@ commits for hub %@", i, self._hub.key)) ;
                while (i--) {
                  row = res.rows.item(i);
                  // hub.debug(hub.fmt("Adding commit %@", row['commit'])) ;
                  self.commitKeys.add(row['commit']);
                  self.commitIdsByKey[row['commit']] = parseInt(row['commit_id'], 10);
                }
                // hub.debug(self.commitKeys.toString()) ;
              },
              self._hub_error);
          },
          self._hub_error);

      },
      //noDB, onFinish, internal, isHub
      null, self.setup, true, true); // sendToDB('hub')
    // * end *******************************************************************


    //CATALOG *createHub*
    insertHubSql = self.insertSQL['Hub'],
    insertHubValues = [self._hub.key, name, self.get('uti'), params.creator, params.editor || "", 0, 0, params.version, "", ""];
    tx.executeSql(insertHubSql, insertHubValues,
    function(tx, res) {
      hub.debug(hub.fmt("Created Hub: %@: %@", self._hub.name, self._hub.key));
    },
    self._hub_error);


    //CATALOG *checkoutLatest*
    this.sendToDB(function(tx) {
      // Select the first hub that is part of this application.
      var sql = "SELECT * FROM commits WHERE key = ?";
      tx.executeSql(sql, [self._hub.head],
      function(tx, res) {
        if (res.rows.length > 0) {
          // We have a hub, so checkout the latest commit from that hub.
          var row = res.rows.item(0);
          commit = row['key'];
          self.databaseDesc = self.databaseName = row['hub_name'];
        }
      });
    },
    //noDB, onFinish, internal, isHub
    null,
    function() {
      if (commit) {
        hub.debug(hub.fmt("Checking out %@", commit));
        self.checkout.call(self, commit);
      } else {
        hub.debug("Found no commits to checkout.");
      }
    },
    true);



    //CATALOG *checkout*
    this.sendToDB(function(tx) {
      var storeKeySql = "SELECT data.store_key, data.key, commits.key as commitKey, src_md.name as type, data.bytes" + " FROM data" + " JOIN meta_data ON (data.key = meta_data.target)" + " JOIN meta_data AS src_md ON (meta_data.source = src_md.target)" + " JOIN commits ON (commits.commit_id = src_md.commit_id)" + " WHERE data.store_key IS NOT NULL" + " AND commits.key IN (?,?)",
      storeKeyValues = [currentCommit, version];
      tx.executeSql(storeKeySql, storeKeyValues,
      function(tx, res) {
        var si = res.rows.length,
        S = hub.Store,
        K = hub.Record,
        data, recordType, recordId, storeKeysById, storeKey, opts;
        while (si--) {
          var row = res.rows.item(si),
          sKey = parseInt(row['store_key'], 10);
          if (row['commitKey'] == currentCommit) {
            currentKeys.add(sKey);
          } else {
            targetKeys.add(sKey);
          }
          dataByKey[sKey] = {
            type: row['type'],
            pk: row['key'],
            bytes: JSON.parse(row['bytes'])
          };
        }
        var toDelete = currentKeys.copy().removeEach(targetKeys),
        toCreate = targetKeys.copy().removeEach(currentKeys);

        opts = this.changedRecords ? {
          recordChange: true
        }: undefined;
        toDelete.forEach(function(storeKey) {
          hub_precondition(typeof storeKey === hub.T_NUMBER);
          // data = dataByKey[storeKey];
          self.removeRecord(storeKey, opts);
        });

        toCreate.forEach(function(storeKey) {
          hub_precondition(typeof storeKey === hub.T_NUMBER);
          data = dataByKey[storeKey];
          recordType = hub.objectForPropertyPath(data['type']);
          recordId = data.bytes[recordType.prototype.primaryKey];
          storeKeysById = recordType.storeKeysById();
          storeKeysById[recordId] = storeKey;
          S.idsByStoreKey[storeKey] = data['key'];
          S.recordTypesByStoreKey[storeKey] = recordType;
          self.writeDataHash(storeKey, data['bytes'], K.READY_CLEAN); // TODO: is this right?
          self.dataHashDidChange(storeKey);
          if (opts) { // we are in a nestedHub
            this.changedRecords.add(recordId); // So, lets record what has changed.
            this.changesById[recordId] = K.DIRTY; // and how it was changed.
          }
        });
      },
      function(tx, err) {
        hub.debug("Error in Checkout.");
        hub.debug(err);
        return false;
      });
    },
    //noDB, onFinish, internal, isHub
    null,
    function() {
      self.set('currentCommit', version);
      self.set('checkingOut', null);
      this.goState(0);
    },
    true);


    //CATALOG *addCommit*
    self.sendToDB(function(tx) {

      hubKey = self._hub.key,
      insertHubCommitSql = self.insertSQL['HubCommit'],
      insertHubCommitValues = [hubKey, key],
      updateSql = "UPDATE hub SET head = ?, name = ? WHERE key = ?",
      updateValues = [key, hubName, hubKey];

      tx.executeSql(updateSql, updateValues,
      function(tx, res) {},
      self._hub_error);

      tx.executeSql(insertHubCommitSql, insertHubCommitValues,
      function(tx, res) {},
      self._hub_error);
      self._hub.head = key;

    },
    //noDB, onFinish, internal, isHub
    null, null, true, true); // sendToDB('hub')
    tx.executeSql(insertCommitSql, insertCommitValues,
    function(tx, res) {
      // success
      hub.debug("Added Commit");
      self.sendPack.call(self, key, p.commit_id);
    },
    self._hub_error);



    //CATALOG *addRecords*
    this.sendToDB(function(tx) {
      self.goState(2);
      var typeMetaKeys = [],
      typeMetaByKey = {};
      
      // Then Types Types
      self._hub_types.forEach(function(type) {
        var type_bytes = JSON.stringify(type),
        type_time = currentTime,
        childMetaDataKeys = [],
        metaDataByKey = {};

        // Walk through each instance
        self._hub_keysByType[type].forEach(function(instanceKey) {
          var data = self._hub_recordsByKey[instanceKey];
          // hub.debug(hub.fmt("saving data for: %@", data.storeKey));
          tx.executeSql(insert_data_sql, [data.key, data.created_on, data.storage, data.bytes, 0, data.storeKey, commit_id],
          function() {
            // hub.debug(hub.fmt("Saved instance data entry %@", data.key));
          },
          function(tx, error) {
            // hub.debug("Error saving data entry 144");
            hub.debug(error);
          });
          var meta_data, ret, instkey;
          
          // Generate first pass key and store data
          ret = self.metaData[data.recordId];
          if (!ret) {
            ret = {
              name: data.recordId,
              meta_uti: "com.hub.link",
              meta_creator: currentTask,
              meta_editor: "",
              target_uti: "com.hub.instance",
              target_creator: currentTask,
              target_editor: "",
              target_position: -1,
              data: ''
            };
            self.metaData[data.recordId] = ret;
          } else {
            ret.meta_editor = currentTask;
            ret.target_editor = currentTask;
          }
          ret.commit_id = commit_id;
          ret.target = data.key;
          ret.source = type;
          ret.storage = data.storage;

          instkey = self.getMetaDataKey(ret);
          childMetaDataKeys.push(instkey);
          metaDataByKey[instkey] = ret;
          totalStorage += data.storage;
          self.dataSourceDidComplete(data.storeKey, null, data.recordId);
        }); // end each instance
        
        // Add The Record Type.
        var type_key = hub.SHA256("" + type_bytes + childMetaDataKeys.sort().join(""));
        tx.executeSql(insert_data_sql, [type_key, type_time, 0, type_bytes, 1, null, commit_id],
        function() {
          // hub.debug(hub.fmt("Saved type data entry %@", type_key));
        },
        function(tx, error) {
          // hub.debug("Error saving type data entry");
          hub.debug(error);
        });
        // Get info for Link between Store and Record Type
        var tmData = self.metaData[type];
        if (!tmData) {
          tmData = {
            name: type,
            meta_uti: "com.hub.link",
            meta_creator: currentTask,
            meta_editor: "",
            target_uti: "com.hub.record",
            target_creator: currentTask,
            target_editor: "",
            target_position: -1,
            storage: 0,
            data: null
          };
          self.metaData[type] = tmData;
        } else {
          tmData.meta_editor = currentTask;
          tmData.target_editor = currentTask;
        }
        tmData.commit_id = commit_id;
        tmData.source = store_key;
        tmData.target = type_key;

        var tmKey = self.getMetaDataKey(tmData);
        typeMetaKeys.push(tmKey);
        typeMetaByKey[tmKey] = tmData;

        var mi = childMetaDataKeys.length;
        while (mi--) {
          var mdata = metaDataByKey[childMetaDataKeys[mi]];
          mdata.source = type_key;
          self.addMetaData.call(self, tx, mdata);
        }

      }); // end each type
      
      // Now create the Store
      store_key = hub.SHA256("" + store_bytes + typeMetaKeys.sort().join(""));
      tx.executeSql(insert_data_sql, [store_key, store_time, store_bytes.length, store_bytes, 0, null, commit_id],
      function() {
        // hub.debug(hub.fmt("Saved store data entry %@", type_key));
      },
      function(tx, error) {
        // hub.debug("Error saving store data entry");
        hub.debug(error);
      });

      var ti = typeMetaKeys.length;
      while (ti--) {
        var tdata = typeMetaByKey[typeMetaKeys[ti]];
        tdata.source = store_key;
        self.addMetaData.call(self, tx, tdata);
      }

      // Add the commit.
      self.addCommit.call(self, tx, {
        name: "commit",
        meta_uti: "com.hub.commit",
        meta_creator: currentTask,
        meta_editor: currentTask,
        merger: currentTask,
        created_on: currentTime,
        totalStorage: totalStorage,
        commit_storage: 0,
        history_storage: 0,
        data: store_key,
        meta_data: null,
        committer: currentActor,
        commit_id: commit_id
      });
      // hub.debug("Commit'd!");
      tx.executeSql("UPDATE data SET metadata_count = (SELECT COUNT(*) FROM meta_data where target = data.key)", [], undefined, self._hub_error);

    },
    //noDB, onFinish, internal, isHub
    null,
    function() { // Run when Send to db is finished.
      self.goState(3);
      self.cleanup();
    },
    true // true = this is an internal call.
    ); // end sendToDB



    //CATALOG *sendPack*
    self.sendToDB(function(tx) {
      var pack = [],
      toAdd = {};
      tx.executeSql("SELECT * FROM data WHERE commit_id = ?", [commit_id],
      function(tx, result) {
        var i = result.rows.length,
        row, item, key, data;
        while (i--) {
          row = result.rows.item(i);
          key = row.key;
          data = {
            metadata_count: row.metadata_count,
            storage: parseInt(row.storage, 10),
            created_on: parseInt(row.created_on, 10),
            bytes: row.bytes
          };
          item = {
            "pk": key,
            "model": "Data",
            "fields": data
          };
          hub.debug(hub.inspect(item.fields));
          pack.push(item);
        }
        toAdd["data"] = true;
        self._hub_sendPack.call(self, version, pack, toAdd);
      });
      tx.executeSql("SELECT * FROM meta_data WHERE commit_id = ?", [commit_id],
      function(tx, result) {
        var j = result.rows.length,
        row, item, key;
        while (j--) {
          row = result.rows.item(j);
          key = row.key;
          delete row.key;
          delete row.commit_id;
          item = {
            "pk": key,
            "model": "MetaData",
            "fields": row
          };
          pack.push(item);
        }
        toAdd["metaData"] = true;
        self._hub_sendPack.call(self, version, pack, toAdd);
      });
      hub.debug(hub.fmt("Finding commit with id: %@", commit_id));
      tx.executeSql("SELECT * FROM commits WHERE commit_id = ?", [commit_id],
      function(tx, result) {
        var row = result.rows.item(0),
        key = row.key,
        data;
        data = hub.clone(row);
        delete data.key;
        delete data.commit_id;
        data.created_on = parseInt(data.created_on, 10);
        var item = {
          "pk": key,
          "model": "Commit",
          "fields": data
        };
        pack.push(item);
        toAdd["commit"] = true;
        self._hub_sendPack.call(self, version, pack, toAdd);
      });
    });
      //noDB, onFinish, internal, isHub



    //CATALOG *receivePack*
    self.sendToDB.call(self,
    function(tx) {
      while (i--) {
        item = pack[i];
        data = item.fields;
        sql = insertSQL[item.model];

        switch (item.model) {
        case 'Data':
          values = [
          item.pk, new Date(data.created_on).getTime(), data.storage, data.bytes, data.metadata_count, hub.Store.generateStoreKey(), commit_id];
          break;

        case 'MetaData':
          values = [item.pk, data.name, data.meta_uti, data.meta_creator, data.meta_editor, data.target_uti, data.target_creator, data.target_editor, data.target_position, data.storage, data.source, data.target, data.data_key, commit_id];
          break;

        case 'Commit':
          values = [item.pk, data.name, commit_id, data.commit_uti, // 4
          data.commit_creator, data.commit_editor, data.merger, // 3
          new Date(data.created_on).getTime(), data.ancestor_count, data.total_storage, //3
          data.commit_storage, data.history_storage, data.data_key, // 3
          data.commit_data, data.committer, // 3
          data.ancestors]; // 1
          break;
        }

        tx.executeSql(sql, values, undefined,
        function(tx, err) {
          hub.debug(err);
          hub.debug(sql);
          hub.debug(values);
        });
      }
    },
    //noDB, onFinish, internal, isHub
    null,
    function() {
      self.commitKeys.add(version);
      self.commitIdsByKey[version] = commit_id;
      self.goState(0);
      if (doCheckout) {
        hub.debug("Checking out after sync");
        self._hub.head = version; // TODO: remove this, and setup mergeing properly. This is just for the demo.
        self.checkoutLatest.call(self);
      } else {
        hub.debug("Not checking out just yet");
      }
      // self.applyCommits(version);
    },
    true);


    //CATALOG *retrieveRecord*
    this.sendToDB(function(tx) {
      tx.executeSql("SELECT * FROM data WHERE store_key = ?", [storeKey],
      function(tx, result) {
        if (result.rows.length > 0) {
          var row = result.rows.item(0),
          record = JSON.parse(row['bytes']);
          // Bonsai.debug['row'] = row;
          self.dataSourceDidComplete(storeKey, record);
        } else {
          hub_error();
        }
      },
      function(tx, error) {
        self.dataSourceDidError(storeKey, error);
      });
    }
    //noDB, onFinish, internal, isHub

    );

























  _hub_dbs: {},
  // Holds databases for 'SproutHub' and <hubKey>
  _hub_sqlQueue: [],
  _hub_sqlInternalQueue: [],
  /** 
    Add State check, and only run when not touching DB.
    If not in correct state, then add to FIFO queue, and invokeLater sendToDB
  */
  sendToDB: function(func, noDB, onFinish, internal, isHub) {
    hub_precondition(this.kindOf && this.kindOf(hub.Hub)); // Make sure we are in the correct context.
    hub_precondition(this.dbState !== 'c', "Database is in error state.");
    var self = this,
    dbName, dbDesc;
    if (this.dbState === "b" || (this.state === 4 && this._hub_sqlInternalQueue.length > 0 && !internal)) {
      if (internal) {
        this._hub_sqlInternalQueue.push(arguments);
      } else {
        this._hub_sqlQueue.push(arguments);
      }
      // this.invokeLast("invokeSendToDB");
      setTimeout(function() {
        self.invokeSendToDB.apply(self);
      },
      500);
      return;
    }

    this.goDbState("b");
    if (isHub) {
      dbName = "SproutHub";
      dbDesc = "SproutHub Metadata";
    } else {
      dbName = self._hub.key;
      dbDesc = dbName + " DataStore";
    }
    if (!dbName) {
      hub.debug('No Hub yet, wait till we have one.');
      self.invokeLater.apply(self);
      return;
    }
    if (!isHub && !self.settingUp && !self._hub.setup) {
      self.setup();
    }
    if (self._hub_dbs[dbName]) {
      hub.debug("Running Query with existing database.");
      self._hub_dbs[dbName].transaction(function(tx) {
        func(tx);
      },
      function(error) {
        self.goDbState("c");
        hub.debug("ERROR: Transaction Errored.");
        hub.debug(error);
        hub_error();
      },
      function() {
        if (onFinish) onFinish.apply(self);
        self.goDbState("a");
        self.invokeSendToDB.apply(self);
      });
    } else {
      if (noDB) {
        noDB();
        if (onFinish) onFinish.apply(self);
        self.goDbState("a");
        return self.invokeSendToDB.apply(self);
      }
      var errmsg = "Sorry, No DB today.",
      new_db = null;
      try {
        if (window.openDatabaseSync || window.openDatabase || (google.gears.factory && google.gears.factory.create)) {
          if (window.openDatabaseSync) {
            new_db = window.openDatabaseSync(dbName, "1.1", dbDesc, 5000000);
            new_db.addListener("commit",
            function() {
              hub.debug("COMMIT");
            });

            new_db.addListener("update",
            function(operation, database, table, rowid) {
              hub.debug("update " + operation + " " + database + "." + table + " " + rowid);
            });
          } else if (window.openDatabase) {
            new_db = window.openDatabase(dbName, "1.1", dbDesc, 5000000);
          } else {
            // Must be google gears
            new_db = Gears.openDatabase(dbName, "1.1");
          }
          if (!new_db) {
            alert(errmsg + " Couldn't open, maybe bad version or run out of DB quota.");
          } else {
            // We have a database, now test to see if we have a table.
            // Just just need to test for 1 table, thanks to transactions we should
            // have all or none.
            //CATALOG init ==start
            new_db.transaction(function(tx) {
              tx.executeSql(hub.fmt("SELECT COUNT(*) FROM %@", isHub ? "hub": "data"), [],
              function(tx) {
                hub.debug("We have our data tables.");
                self._hub_dbs[dbName] = new_db;
                func(tx);
              },
              function(tx, err) {
                hub.debug("We don't have the data table ...");
                if (isHub) {
                  self._createHubTables(tx);
                } else {
                  self._createStoreTables(tx);
                }
                // tx.executeSql('COMMIT') ;
                // tx.executeSql('BEGIN TRANSACTION') ;
                func(tx);
                hub.debug('end callback');
                return false; // Let the transaction know that we handelled the error.
              });
            },
            function(error) {
              hub.debug("ERROR: Transaction Errored! " + error.message);
              self.goDbState("c");
              hub_error("transaction error");
              // self.invokeSendToDB.apply(self);
            },
            function() {
              if (onFinish) onFinish.apply(self);
              self.goDbState("a");
              self.invokeSendToDB.apply(self);
            });
          }
        } else if (window.google.factory && window.google.factory.create) {

} else {
          alert(errmsg + " Your browser doesn't support it.");
        }
      } catch(err) {
        alert(errmsg + " Something bad happened: " + err);
      }
    }
  },
  invokeCount: 0,
  invokeSendToDB: function() {
    var self = this,
    args;
    if (this.dbState === "b") {
      hub.debug("Invokeing DB later");
      self.invokeCount++;
      if (self.invokeCount < 10) {
        setTimeout(function() {
          self.invokeSendToDB.apply(self);
        },
        500);
      }
      return false;
    }
    self.invokeCount = 0;
    if (self._hub_sqlInternalQueue.length > 0) {
      args = this._hub_sqlInternalQueue.shift();
      return self.sendToDB.apply(self, args);
    } else if (self._hub_sqlQueue.length > 0) {
      args = this._hub_sqlQueue.shift();
      return self.sendToDB.apply(self, args);
    }
  },
  
  
  insertSQL: {
    "Data": "INSERT OR IGNORE INTO data (key, created_on, storage, bytes, metadata_count, store_key, commit_id) VALUES (?,?,?, ?,?,?, ?)",
    "MetaData": "INSERT OR IGNORE INTO meta_data (key, name, meta_uti, meta_creator, meta_editor, target_uti, target_creator, target_editor, target_position, storage, source, target, data_key, commit_id)" + " VALUES (?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?);",
    //14
    "Commit": "INSERT OR IGNORE INTO commits (key, name, commit_id, commit_uti, commit_creator," + // 5
    " commit_editor, merger, created_on, ancestor_count, total_storage," + // 5
    " commit_storage, history_storage, data_key, commit_data, committer," + // 5
    " ancestors)" + // 1 = 16
    " VALUES (?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?,?, ?)",
    // 16
    "Hub": "INSERT OR REPLACE INTO hub (key, name, meta_uti, meta_creator, meta_editor, is_private, is_archived, head, forked_from, meta_data)" + " VALUES (?,?,?, ?,?,?, ?,?,?, ?)",
    // 10
    "HubCommit": "INSERT OR IGNORE INTO hub_commit (hub, 'commit') VALUES (?,?)"
  },

  _createStoreTables: function(tx, error) {
    // There is no tables ... yet
    hub.debug("start creating data tables.");
    tx.executeSql("CREATE TABLE 'actor' (email TEXT, public_key TEXT)", [], null, this._hub_error);
    tx.executeSql("CREATE TABLE 'data' (key TEXT, store_key INTEGER, created_on TEXT, storage INTEGER, bytes BLOB, metadata_count INTEGER, commit_id INTEGER)", [], null, this._hub_error);
    tx.executeSql("CREATE TABLE 'meta_data' (key TEXT, name TEXT, meta_uti TEXT, meta_creator TEXT, meta_editor TEXT, target_uti TEXT, target_creator TEXT, target_editor TEXT, target_position INTEGER, storage INTEGER, source TEXT, target TEXT, data_key TEXT, commit_id INTEGER)", [], null, this._hub_error);
    tx.executeSql("CREATE TABLE 'commits' (key TEXT, name TEXT, commit_id INTEGER, commit_uti TEXT, commit_creator TEXT, commit_editor TEXT, merger TEXT, created_on INTEGER, ancestor_count INTEGER, total_storage INTEGER, commit_storage INTEGER, history_storage INTEGER, data_key TEXT, data_uti TEXT, data_editor TEXT, data_creator TEXT, commit_data TEXT, committer TEXT, ancestors TEXT)", [], null, this._hub_error);
    tx.executeSql('CREATE UNIQUE INDEX IF NOT EXISTS "UniqueDataKey" ON "data" ("key");');
    tx.executeSql('CREATE UNIQUE INDEX IF NOT EXISTS "UniqueDataStoreKey" ON "data" ("store_key");');
    tx.executeSql('CREATE UNIQUE INDEX IF NOT EXISTS "UniqueCommitKey" ON "commits" ("key");');
    tx.executeSql('CREATE UNIQUE INDEX IF NOT EXISTS "UniqueMetaKey" ON "meta_data" ("key");');
  },
  
  _createHubTables: function(tx, error) {
    hub.debug("start creating hub tables.");
    tx.executeSql("CREATE TABLE 'hub' (key TEXT, name TEXT, meta_uti TEXT, meta_creator TEXT, meta_editor TEXT, is_private INTEGER, is_archived INTEGER, head TEXT, forked_from TEXT, meta_data TEXT)", [], null, this._hub_error);
    tx.executeSql("CREATE TABLE 'hub_commit' (hub TEXT, 'commit' TEXT)", [], null, this._hub_error);
    tx.executeSql("CREATE TABLE 'hub_reference' (name TEXT, meta_uti TEXT, meta_creator TEXT, meta_editor TEXT, hub TEXT, 'commit' TEXT, committer TEXT, meta_data TEXT)", [], null, this._hub_error);
    tx.executeSql("CREATE TABLE 'hub_committer' (is_owner TEXT, hub TEXT, committer TEXT, head TEXT)", [], null, this._hub_error);
    tx.executeSql("CREATE TABLE 'hub_observer' (hub TEXT, observer TEXT)", [], null, this._hub_error);
    tx.executeSql('CREATE UNIQUE INDEX IF NOT EXISTS "UniqueHubKey" ON "hub" ("key");');
    hub.debug("finish creating hub tables.");
  }
