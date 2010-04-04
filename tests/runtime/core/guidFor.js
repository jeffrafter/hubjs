// ==========================================================================
// Project:   hub.js - cloud-friendly object graph sync
// Copyright: ©2010 Erich Ocean.
//            Portions ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under an MIT license (see license.js).
// ==========================================================================
/*globals hub module test ok equals same */

var objectA, objectB ; // global variables

module("hub.guidFor – Object", {
  
  setup: function() {
    objectA = {} ;
    objectB = {} ;
  }
  
});

test("should return same guid for same instance every time", function() {
  equals(hub.guidFor(objectA), hub.guidFor(objectA)) ;
});

test("should return different guid for different instances", function() {
  ok(hub.guidFor(objectA) !==  hub.guidFor(objectB)) ;
});

test("guid should not parse to a number", function() {
  equals(true, isNaN(parseInt(hub.guidFor(objectA), 0))) ;
});

var stringA, stringACopy, stringB ; // global variables

module("hub.guidFor – String", {
  
  setup: function() {
    stringA = "string A" ;
    stringACopy = "string A" ;
    stringB = "string B" ;
  }
  
});

test("same string instance should have same guide every time", function() {
  equals(hub.guidFor(stringA), hub.guidFor(stringA)) ;  
});

test("two string instances with same value should have same guid", function() {
  equals(hub.guidFor(stringA), hub.guidFor(stringACopy)) ;  
});

test("two instances with different value should have different guid", function() {
  ok(hub.guidFor(stringA) !==  hub.guidFor(stringB)) ;
});

test("guid should not parse to a number", function() {
  equals(true, isNaN(parseInt(hub.guidFor(stringA), 0))) ;
});

var numberA, numberACopy, numberB ; // global variables

module("hub.guidFor – Number", {
  
  setup: function() {
    numberA = 23 ;
    numberACopy = 23 ;
    numberB = 34 ;
  }
  
});

test("same number instance should have same guide every time", function() {
  equals(hub.guidFor(numberA), hub.guidFor(numberA)) ;  
});

test("two number instances with same value should have same guid", function() {
  equals(hub.guidFor(numberA), hub.guidFor(numberACopy)) ;  
});

test("two instances with different value should have different guid", function() {
  ok(hub.guidFor(numberA) !==  hub.guidFor(numberB)) ;
});

test("guid should not parse to a number", function() {
  equals(true, isNaN(parseInt(hub.guidFor(numberA), 0))) ;
});

module("hub.guidFor – Boolean") ;

test("should always have same guid", function() {
  equals(hub.guidFor(true), hub.guidFor(true)) ;
  equals(hub.guidFor(false), hub.guidFor(false)) ;
});

test("true should have different guid than false", function() {
  ok(hub.guidFor(true) !==  hub.guidFor(false)) ;
});

test("guid should not parse to a number", function() {
  equals(true, isNaN(parseInt(hub.guidFor(true), 0)), 'guid for boolean-true') ;
  equals(true, isNaN(parseInt(hub.guidFor(false), 0)), 'guid for boolean-false') ;
});

module("hub.guidFor – Null and Undefined") ;

test("should always have same guid", function() {
  equals(hub.guidFor(null), hub.guidFor(null)) ;
  equals(hub.guidFor(undefined), hub.guidFor(undefined)) ;
});

test("null should have different guid than undefined", function() {
  ok(hub.guidFor(null) !==  hub.guidFor(undefined)) ;
});

test("guid should not parse to a number", function() {
  equals(true, isNaN(parseInt(hub.guidFor(null), 0))) ;
  equals(true, isNaN(parseInt(hub.guidFor(undefined), 0))) ;
});

var array1, array1copy, array2, array2copy;

module("hub.guidFor – Arrays", {
  
  setup: function() {
      array1 = ['a','b','c'] ;
      array1copy = array1 ;
    array2 = ['1','2','3'];
      array2copy = ['1','2','3'] ;
  }
}) ;

test("same array instance should have same guide every time", function(){
  equals(hub.guidFor(array1), hub.guidFor(array1));
  equals(hub.guidFor(array2), hub.guidFor(array2));
});

test("two array instances with same value, by assigning one to the other.", function() {
  equals(hub.guidFor(array1), hub.guidFor(array1copy)) ;
});

test("two array instances with same value, by assigning the same value", function() {
  ok(hub.guidFor(array2) !== hub.guidFor(array2copy)) ;
});

test("two instances with different value should have different guid", function() {
  ok(hub.guidFor(array1) !==  hub.guidFor(array2)) ;
  ok(hub.guidFor(array1copy) !==  hub.guidFor(array2copy)) ;
});

test("guid should not parse to a number", function() {
  equals(true, isNaN(parseInt(hub.guidFor(array1), 0))) ;
});
