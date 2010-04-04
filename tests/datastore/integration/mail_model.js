// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var Mail;
module("Sample Model from a webmail app", { 
  setup: function() {

    // namespace
    Mail = hub.Object.create({
      store: hub.Store.create()
    });

    // Messages are stored in mailboxes.
    Mail.Mailbox = hub.Record.extend({

      name:    hub.Record.attr(String, {
        isRequired: true
      }),

      // here is the mailbox type.  must be one of INBOX, TRASH, OTHER
      mailbox: hub.Record.attr(String, {
        isRequired: true,
        only: 'INBOX TRASH OTHER'.w()
      }),
      
      // this is the sortKey that should be used to order the mailbox.
      sortKey: hub.Record.attr(String, {
        isRequired: true,
        only: 'subject date from to'.w()
      }),
      
      // load the list of messages.  We use the mailbox guid to load the 
      // messages.  Messages use a foreign key to move the message around.
      // an edit should cause this fetched property to reload.
      //
      // when you get messages, it will fetch "mailboxMessages" from the 
      // owner store, passing the receiver as the param unless you implement
      // the mailboxMessageParams property.
      messages: hub.Record.fetch('Mail.Message')
    });
    
    // A message has a subject, date, sender, mailboxes, and messageDetail
    // which is a to-one relationship.  mailboxes is kept as an array of 
    // guids.
    Mail.Message = hub.Record.extend({

      date:        hub.Record.attr(Date, { isRequired: true }),
      
      mailboxes:   hub.Record.toMany('Mail.Mailbox', {
        inverse: 'messages',
        isMaster: true,
        minimum: 1 // you cannot have less than one mailbox.
      }),
      
      // describe the message detail.
      messageDetail: hub.Record.toOne('Mail.MessageDetail', {
        inverse: "message", // MessageDetail.message should == this.primaryKey
        isDependent: true 
      }),

      // access the named property through another property.
      body:    hub.Record.through('messageDetail'),
      cc:      hub.Record.through('messageDetail'),
      bcc:     hub.Record.through('messageDetail'),
      subject: hub.Record.through('messageDetail')
    });
    
    Mail.Contact = hub.Record.extend({
      firstName: hub.Record.attr(String),
      lastName:  hub.Record.attr(String),
      email:     hub.Record.attr(String)
    });
    
    // define server.  RestServer knows how to automatically save records to 
    // the server.  You need to define your fetch requests here though.
    Mail.server = hub.RestServer.create({
      
      // fetch request for mailboxes.
      fetchMailboxes: function(params) {
        return this.fetchRequest('/ma/mailboxes?alt=json') ;
      }
    });

  }
});
