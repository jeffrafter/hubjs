// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  hub.CascadeDataSource forwards requests onto an array of additional data 
  sources, stopping when one of the data sources returns true, indicating that 
  it handled the request.
  
  You can use a cascade data source to tie together multiple data sources,
  treating them as if they were a single, combined data source.
  
  h2. Configuring a Cascade Data Source
  
  You will usually define your cascadie data source in your main() method after
  all the classes you have are loaded.
  
  {{{
    MyApp.dataSource = hub.CascadeDataSource.create({
      dataSources: hub.w("prefs youtube photos"),
      
      prefs:   MyApp.PrefsDataSource.create({ root: "/prefs" }),
      youtube: YouTube.YouTubeDataSource.create({ apiKey: "123456" }),
      photos:  MyApp.PhotosDataSource.create({ root: "photos" })
      
    });
    
    MyApp.store.set('dataSource', MyApp.dataSource);
  }}}
  
  Note that the order you define your dataSources property will determine the
  order in which requests will cascade from the store.
  
  Alternatively, you can use a more jQuery-like API for defining your data
  sources:
  
  {{{
    MyApp.dataSource = hub.CascadeDataSource.create()
      .from(MyApp.PrefsDataSource.create({ root: "/prefs" }))
      .from(YouTube.YouTubeDataSource.create({ apiKey: "123456" }))
      .from(MyApp.PhotosDataSource.create({ root: "photos" }));

    MyApp.store.set('dataSource', MyApp.dataSource);
  }}}

  In this case, the order you call from() will determine the order the request
  will cascade.
  
  @class
  @extends hub.DataSource
*/
hub.CascadeDataSource = hub.DataSource.extend( 
  /** @scope hub.CascadeDataSource.prototype */ {

  /**
    The data sources used by the cascade, in the order that they are to be 
    followed.  Usually when you define the cascade, you will define this
    array.
    
    @property {Array}
  */
  dataSources: null,

  /**
    Add a data source to the list of sources to use when cascading.  Used to
    build the data source cascade effect.

    @param {hub.DataSource} dataSource a data source instance to add.
    @returns {hub.CascadeDataSource} receiver
  */
  from: function(dataSource) {
    var dataSources = this.get('dataSources');
    if (!dataSources) this.set('dataSources', dataSources = []);
    dataSources.push(dataSource);
    return this ;
  },
    
  // ..........................................................
  // hub.Store ENTRY POINTS
  // 
  
  /** @private - just cascades */
  fetch: function(store, query) {
    var sources = this.get('dataSources'), 
        len     = sources ? sources.length : 0,
        ret     = false,
        cur, source, idx;
    
    for(idx=0; (ret !== true) && idx<len; idx++) {
      source = sources.objectAt(idx);
      cur = source.fetch ? source.fetch.call(source, store, query) : false;
      ret = this._hub_handleResponse(ret, cur);
    }
    
    return ret ;
  },
  
  
  /** @private - just cascades */
  retrieveRecords: function(store, storeKeys) {
    var sources = this.get('dataSources'), 
        len     = sources ? sources.length : 0,
        ret     = false,
        cur, source, idx;
    
    for(idx=0; (ret !== true) && idx<len; idx++) {
      source = sources.objectAt(idx);
      cur = source.retrieveRecords.call(source, store, storeKeys);
      ret = this._hub_handleResponse(ret, cur);
    }
    
    return ret ;
  },

  /** @private - just cascades */
  commitRecords: function(store, createStoreKeys, updateStoreKeys, destroyStoreKeys) {
    var sources = this.get('dataSources'), 
        len     = sources ? sources.length : 0,
        ret     = false,
        cur, source, idx;
    
    for(idx=0; (ret !== true) && idx<len; idx++) {
      source = sources.objectAt(idx);
      cur = source.commitRecords.call(source, store, createStoreKeys, updateStoreKeys, destroyStoreKeys);
      ret = this._hub_handleResponse(ret, cur);
    }
    
    return ret ;
  },

  /** @private - just cascades */
  cancel: function(store, storeKeys) {
    var sources = this.get('dataSources'), 
        len     = sources ? sources.length : 0,
        ret     = false,
        cur, source, idx;
    
    for(idx=0; (ret !== true) && idx<len; idx++) {
      source = sources.objectAt(idx);
      cur = source.cancel.call(source, store, storeKeys);
      ret = this._hub_handleResponse(ret, cur);
    }
    
    return ret ;
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private */
  init: function() {
    arguments.callee.base.apply(this, arguments) ;
    
    // if a dataSources array is defined, look for any strings and lookup 
    // the same on the data source.  Replace.
    var sources = this.get('dataSources'),
        idx     = sources ? sources.get('length') : 0,
        source;
    while(--idx>=0) {
      source = sources[idx];
      if (hub.typeOf(source) === hub.T_STRING) sources[idx] = this.get(source);
    }
    
  },

  /** @private - Determine the proper return value. */
  _hub_handleResponse: function(current, response) {
    if (response === true) return true ;
    else if (current === false) return (response === false) ? false : hub.MIXED_STATE ;
    else return hub.MIXED_STATE ;
  }
    
});
