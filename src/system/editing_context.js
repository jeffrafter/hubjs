// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*global hub */

/**
  An subclass of hub.Store implementing the hub.ChildStore functionality.
  
  @class
  @extends hub.Store
  @extends hub.ChildStore
*/
hub.EditingContext = hub.Store.extend(hub.ChildStore,
  /** @scope hub.EditingContext.prototype */ {
  
  // all of the common code is in the hub.ChildStore mixin
  
});
