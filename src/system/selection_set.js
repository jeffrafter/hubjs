// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  A hub.SelectionSet contains a set of objects that represent the current 
  selection.  You can select objects by either adding them to the set directly
  or indirectly by selecting a range of indexes on a source object.
  
  FIXME: Rename hub.SelectionSet to hub.Selection.
  
  @class
  @extends hub.Object
  @extends hub.Enumerable
  @extends hub.Freezable
  @extends hub.Copyable
*/
hub.SelectionSet = hub.Object.extend(hub.Enumerable, hub.Freezable, hub.Copyable, 
  /** @scope hub.SelectionSet.prototype */ {
  
  /**
    Walk like a duck.
    
    @property {Boolean}
  */
  isSelectionSet: true,
  
  /**
    Total number of indexes in the selection set
    
    @property {Number}
  */
  length: function() {
    var ret     = 0,
        sets    = this._hub_sets,
        objects = this._hub_objects;
    if (objects) ret += objects.get('length');
    if (sets) sets.forEach(function(s) { ret += s.get('length'); });
    return ret ;
  }.property().cacheable(),

  // ..........................................................
  // INDEX-BASED SELECTION
  // 

  /**
    A set of all the source objects used in the selection set.  This 
    property changes automatically as you add or remove index sets.
    
    @property {hub.Array}
  */
  sources: function() {
    var ret  = [],
        sets = this._hub_sets,
        len  = sets ? sets.length : 0,
        idx, set, source;
        
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set && set.get('length')>0 && set.source) ret.push(set.source);
    }
    return ret ;
  }.property().cacheable(),
  
  /**
    Returns the index set for the passed source object or null if no items are
    seleted in the source.
    
    @param {hub.Array} source the source object
    @returns {hub.IndexSet} index set or null
  */
  indexSetForSource: function(source) {
    if (!source || !source.isHubArray) return null; // nothing to do
    
    var cache   = this._hub_indexSetCache,
        objects = this._hub_objects,
        ret, idx;

    // try to find in cache
    if (!cache) cache = this._hub_indexSetCache = {};
    ret = cache[hub.guidFor(source)];
    if (ret && ret._hub_sourceRevision && (ret._hub_sourceRevision !== source.propertyRevision)) {
      ret = null;
    }

    // not in cache.  generate from index sets and any saved objects
    if (!ret) {
      ret = this._hub_indexSetForSource(source, false);
      if (ret && ret.get('length')===0) ret = null;
    
      if (objects) {
        if (ret) ret = ret.copy();
        objects.forEach(function(o) {
          if ((idx = source.indexOf(o)) >= 0) {
            if (!ret) ret = hub.IndexSet.create();
            ret.add(idx);
          }
        }, this);
      }
      
      if (ret) {
        ret = cache[hub.guidFor(source)] = ret.frozenCopy();
        ret._hub_sourceRevision = source.propertyRevision;
      }
    }
    
    return ret;
  },
    
  /** 
    @private
  
    Internal method gets the index set for the source, ignoring objects
    that have been added directly.
  */
  _hub_indexSetForSource: function(source, canCreate) {
    if (canCreate === undefined) canCreate = true;

    var guid  = hub.guidFor(source),
        index = this[guid],
        sets  = this._hub_sets,
        len   = sets ? sets.length : 0,
        ret   = null;
                
    if (index >= len) index = null;
    if (hub.none(index)) {
      if (canCreate && !this.isFrozen) {
        this.propertyWillChange('sources');
        if (!sets) sets = this._hub_sets = [];
        ret = sets[len] = hub.IndexSet.create();
        ret.source = source ;
        this[guid] = len;
        this.propertyDidChange('sources');
      }
      
    } else ret = sets ? sets[index] : null;
    return ret ;
  },
  
  /**
    Add the passed index, range of indexSet belonging to the passed source
    object to the selection set.
    
    The first parameter you pass must be the source array you are selecting
    from.  The following parameters may be one of a start/length pair, a 
    single index, a range object or an IndexSet.  If some or all of the range
    you are selecting is already in the set, it will not be selected again.
    
    You can also pass an hub.SelectionSet to this method and all the selected
    sets will be added from their instead.
    
    @param {hub.Array} source source object or object to add.
    @param {Number} start index, start of range, range or IndexSet
    @param {Number} length length if passing start/length pair.
    @returns {hub.SelectionSet} receiver
  */
  add: function(source, start, length) {
    
    if (this.isFrozen) throw hub.FROZEN_ERROR ;

    var sets, len, idx, set, oldlen, newlen, setlen, objects;
    
    // normalize
    if (start === undefined && length === undefined) {
      if (!source) throw "missing params in call to hub.SelectionSet.add()";
      if (source.isIndexSet) return this.add(source.source, source);
      if (source.isSelectionSet) {
        sets = source._hub_sets;
        objects = source._hub_objects;
        len  = sets ? sets.length : 0;

        this.beginPropertyChanges();
        for(idx=0;idx<len;idx++) {
          set = sets[idx];
          if (set && set.get('length')>0) this.add(set.source, set);
        }
        if (objects) this.addObjects(objects);
        this.endPropertyChanges();
        return this ;
        
      }
    }

    set    = this._hub_indexSetForSource(source, true);
    oldlen = this.get('length');
    setlen = set.get('length');
    newlen = oldlen - setlen;
        
    set.add(start, length);

    this._hub_indexSetCache = null;

    newlen += set.get('length');
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
      if (setlen === 0) this.notifyPropertyChange('sources');
    }

    return this ;
  },

  /**
    Removes the passed index, range of indexSet belonging to the passed source
    object from the selection set.
    
    The first parameter you pass must be the source array you are selecting
    from.  The following parameters may be one of a start/length pair, a 
    single index, a range object or an IndexSet.  If some or all of the range
    you are selecting is already in the set, it will not be selected again.
    
    @param {hub.Array} source source object. must not be null
    @param {Number} start index, start of range, range or IndexSet
    @param {Number} length length if passing start/length pair.
    @returns {hub.SelectionSet} receiver
  */
  remove: function(source, start, length) {
    
    if (this.isFrozen) throw hub.FROZEN_ERROR ;
    
    var sets, len, idx, set, oldlen, newlen, setlen, objects;
    
    // normalize
    if (start === undefined && length === undefined) {
      if (!source) throw "missing params to hub.SelectionSet.remove()";
      if (source.isIndexSet) return this.remove(source.source, source);
      if (source.isSelectionSet) {
        sets = source._hub_sets;
        objects = source._hub_objects;
        len  = sets ? sets.length : 0;
            
        this.beginPropertyChanges();
        for(idx=0;idx<len;idx++) {
          set = sets[idx];
          if (set && set.get('length')>0) this.remove(set.source, set);
        }
        if (objects) this.removeObjects(objects);
        this.endPropertyChanges();
        return this ;
      }
    }
    
    // save starter info
    set    = this._hub_indexSetForSource(source, true);
    oldlen = this.get('length');
    newlen = oldlen - set.get('length');

    // if we have objects selected, determine if they are in the index 
    // set and remove them as well.
    if (set && (objects = this._hub_objects)) {
      
      // convert start/length to index set so the iterator below will work...
      if (length !== undefined) {
        start = hub.IndexSet.create(start, length);
        length = undefined;
      }
      
      objects.forEach(function(object) {
        idx = source.indexOf(object);
        if (start.contains(idx)) {
          objects.remove(object);
          newlen--;
        }
      }, this);
    }
    
    // remove indexes from source index set
    set.remove(start, length);
    setlen = set.get('length');
    newlen += setlen;

    // update caches; change enumerable...
    this._hub_indexSetCache = null;
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
      if (setlen === 0) this.notifyPropertyChange('sources');
    }

    return this ;
  },

  
  /**
    Returns true if the selection contains the named index, range of indexes.
    
    @param {Object} source source object for range
    @param {Number} start index, start of range, range object, or indexSet
    @param {Number} length optional range length
    @returns {Boolean}
  */
  contains: function(source, start, length) {
    if (start === undefined && length === undefined) {
      return this.containsObject(source);
    }
    
    var set = this.indexSetForSource(source);
    if (!set) return false ;
    return set.contains(start, length);
  },

  /**
    Returns true if the index set contains any of the passed indexes.  You
    can pass a single index, a range or an index set.
    
    @param {Object} source source object for range
    @param {Number} start index, range, or IndexSet
    @param {Number} length optional range length
    @returns {Boolean}
  */
  intersects: function(source, start, length) {
    var set = this.indexSetForSource(source, false);
    if (!set) return false ;
    return set.intersects(start, length);
  },
  
  
  // ..........................................................
  // OBJECT-BASED API
  // 

  _hub_TMP_ARY: [],
  
  /**
    Adds the object to the selection set.  Unlike adding an index set, the 
    selection will actually track the object independent of its location in 
    the array.
    
    @param {Object} object 
    @returns {hub.SelectionSet} receiver
  */
  addObject: function(object) {  
    var ary = this._hub_TMP_ARY, ret;
    ary[0] = object;
    
    ret = this.addObjects(ary);
    ary.length = 0;
    
    return ret;
  },
  
  /**
    Adds objects in the passed enumerable to the selection set.  Unlike adding
    an index set, the seleciton will actually track the object independent of
    its location the array.
    
    @param {hub.Enumerable} objects
    @returns {hub.SelectionSet} receiver
  */
  addObjects: function(objects) {
    var cur = this._hub_objects,
        oldlen, newlen;
    if (!cur) cur = this._hub_objects = hub.CoreSet.create();
    oldlen = cur.get('length');

    cur.addEach(objects);
    newlen = cur.get('length');
    
    this._hub_indexSetCache = null;
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
    }
    return this;
  },

  /**
    Removes the object from the selection set.  Note that if the selection
    set also selects a range of indexes that includes this object, it may 
    still be in the selection set.
    
    @param {Object} object 
    @returns {hub.SelectionSet} receiver
  */
  removeObject: function(object) {  
    var ary = this._hub_TMP_ARY, ret;
    ary[0] = object;
    
    ret = this.removeObjects(ary);
    ary.length = 0;
    
    return ret;
  },
  
  /**
    Removes the objects from the selection set.  Note that if the selection
    set also selects a range of indexes that includes this object, it may 
    still be in the selection set.
    
    @param {Object} object 
    @returns {hub.SelectionSet} receiver
  */
  removeObjects: function(objects) {
    var cur = this._hub_objects,
        oldlen, newlen, sets;
        
    if (!cur) return this;

    oldlen = cur.get('length');

    cur.removeEach(objects);
    newlen = cur.get('length');
    
    // also remove from index sets, if present
    if (sets = this._hub_sets) {
      sets.forEach(function(set) {
        oldlen += set.get('length');
        set.removeObjects(objects);
        newlen += set.get('length');
      }, this);
    }
    
    this._hub_indexSetCache = null;
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
    }
    return this;
  },

  /**
    Returns true if the selection contains the passed object.  This will search
    selected ranges in all source objects.
    
    @param {Object} object the object to search for
    @returns {Boolean}
  */
  containsObject: function(object) {
    // fast path
    var objects = this._hub_objects ;
    if (objects && objects.contains(object)) return true ;
    
    var sets = this._hub_sets,
        len  = sets ? sets.length : 0,
        idx, set;
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set && set.indexOf(object)>=0) return true;
    }
    
    return false ;
  },
  
  
  // ..........................................................
  // GENERIC HELPER METHODS
  // 
  
  /**
    Constrains the selection set to only objects found in the passed source
    object.  This will remove any indexes selected in other sources, any 
    indexes beyond the length of the content, and any objects not found in the
    set.
    
    @param {Object} source the source to limit
    @returns {hub.SelectionSet} receiver
  */
  constrain: function(source) {
    var set, len, max, objects;
    
    this.beginPropertyChanges();
    
    // remove sources other than this one
    this.get('sources').forEach(function(cur) {
      if (cur === source) return; //skip
      var set = this._hub_indexSetForSource(source, false);
      if (set) this.remove(source, set);
    },this); 
    
    // remove indexes beyond end of source length
    set = this._hub_indexSetForSource(source, false);
    if (set && ((max=set.get('max'))>(len=source.get('length')))) {
      this.remove(source, len, max-len);
    }
    
    // remove objects not in source
    if (objects = this._hub_objects) {
      objects.forEach(function(cur) {
        if (source.indexOf(cur)<0) this.removeObject(cur);
      },this);
    }
    
    this.endPropertyChanges();
    return this ;
  },
  
  /**
    Returns true if the passed index set or selection set contains the exact 
    same source objects and indexes as  the receiver.  If you pass any object 
    other than an IndexSet or SelectionSet, returns false.
    
    @param {Object} obj another object.
    @returns {Boolean}
  */
  isEqual: function(obj) {
    var left, right, idx, len, sources, source;
    
    // fast paths
    if (!obj || !obj.isSelectionSet) return false ;
    if (obj === this) return true;
    if ((this._hub_sets === obj._hub_sets) && (this._hub_objects === obj._hub_objects)) return true;
    if (this.get('length') !== obj.get('length')) return false;
    
    // check objects
    left = this._hub_objects;
    right = obj._hub_objects;
    if (left || right) {
      if ((left ? left.get('length'):0) !== (right ? right.get('length'):0)) {
        return false;
      }
      if (left && !left.isEqual(right)) return false ;
    }

    // now go through the sets
    sources = this.get('sources');
    len     = sources.get('length');
    for(idx=0;idx<len;idx++) {
      source = sources.objectAt(idx);
      left = this._hub_indexSetForSource(source, false);
      right = this._hub_indexSetForSource(source, false);
      if (!!right !== !!left) return false ;
      if (left && !left.isEqual(right)) return false ;
    }
    
    return true ;
  },

  /**
    Clears the set.  Removes all IndexSets from the object
    
    @returns {hub.SelectionSet}
  */
  clear: function() {
    if (this.isFrozen) throw hub.FROZEN_ERROR;
    if (this._hub_sets) this._hub_sets.length = 0 ; // truncate
    if (this._hub_objects) this._hub_objects = null;
    
    this._hub_indexSetCache = null;
    this.propertyDidChange('length');
    this.enumerableContentDidChange();
    this.notifyPropertyChange('sources');
    
    return this ;
  },
  
  /**
   Clones the set into a new set.  
   
   @returns {hub.SelectionSet}
  */
  copy: function() {
    var ret  = this.constructor.create(),
        sets = this._hub_sets,
        len  = sets ? sets.length : 0 ,
        idx, set;
    
    if (sets && len>0) {
      sets = ret._hub_sets = sets.slice();
      for(idx=0;idx<len;idx++) {
        if (!(set = sets[idx])) continue ;
        set = sets[idx] = set.copy();
        ret[hub.guidFor(set.source)] = idx;
      }
    }
    
    if (this._hub_objects) ret._hub_objects = this._hub_objects.copy();
    return ret ;
  },
  
  /**
    @private 
    
    Freezing a SelectionSet also freezes its internal sets.
  */
  freeze: function() {
    if (this.isFrozen) return this ;
    var sets = this._hub_sets,
        loc  = sets ? sets.length : 0,
        set ;
        
    while(--loc >= 0) {
      if (set = sets[loc]) set.freeze();
    }
    
    if (this._hub_objects) this._hub_objects.freeze() ;
    return arguments.callee.base.apply(this, arguments) ;
  },
  
  // ..........................................................
  // ITERATORS
  // 
  
  /** @private */
  toString: function() {
    var sets = this._hub_sets || [];
    sets = sets.map(function(set) { 
      return set.toString().replace("hub.IndexSet", hub.guidFor(set.source)); 
    }, this);
    if (this._hub_objects) sets.push(this._hub_objects.toString());
    return "hub.SelectionSet:%@<%@>".fmt(hub.guidFor(this), sets.join(','));  
  },
  
  /** @private */
  firstObject: function() {
    var sets    = this._hub_sets,
        objects = this._hub_objects;
        
    // if we have sets, get the first one
    if (sets && sets.get('length')>0) {
      var set  = sets ? sets[0] : null,
          src  = set ? set.source : null,
          idx  = set ? set.firstObject() : -1;
      if (src && idx>=0) return src.objectAt(idx);
    }
    
    // otherwise if we have objects, get the first one
    return objects ? objects.firstObject() : undefined;
    
  }.property(),
  
  /** @private
    Implement primitive enumerable support.  Returns each object in the 
    selection.
  */
  nextObject: function(count, lastObject, context) { 
    var objects, ret;
    
    // TODO: Make this more efficient.  Right now it collects all objects
    // first.  
    
    if (count === 0) {
      objects = context.objects = [];
      this.forEach(function(o) { objects.push(o); }, this);
      context.max = objects.length;
    }

    objects = context.objects ;
    ret = objects[count];
    
    if (count+1 >= context.max) {
      context.objects = context.max = null;
    }
    
    return ret ;
  },
  
  /** 
    Iterates over the selection, invoking your callback with each __object__.
    This will actually find the object referenced by each index in the 
    selection, not just the index.

    The callback must have the following signature:
    
    {{{
      function callback(object, index, source, indexSet) { ... }
    }}}
    
    If you pass a target, it will be used when the callback is called.
    
    @param {Function} callback function to invoke.  
    @param {Object} target optional content. otherwise uses window
    @returns {hub.SelectionSet} receiver
  */
  forEach: function(callback, target) {
    var sets = this._hub_sets,
        objects = this._hub_objects,
        len = sets ? sets.length : 0,
        set, idx;
        
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set) set.forEachObject(callback, target);
    }
    
    if (objects) objects.forEach(callback, target);
    return this ;
  }  
  
});

/** @private */
hub.SelectionSet.prototype.clone = hub.SelectionSet.prototype.copy;

/** 
  Default frozen empty selection set
  
  @property {hub.SelectionSet}
*/
hub.SelectionSet.EMPTY = hub.SelectionSet.create().freeze();
