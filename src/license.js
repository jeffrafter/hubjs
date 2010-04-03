/*!
  hub.js -- cloud-friendly object graph sync
  ©2010 Erich Atlas Ocean. Licensed under an MIT license:
  
  Permission is hereby granted, free of charge, to any person obtaining a 
  copy of this software and associated documentation files (the "Software"), 
  to deal in the Software without restriction, including without limitation 
  the rights to use, copy, modify, merge, publish, distribute, sublicense, 
  and/or sell copies of the Software, and to permit persons to whom the 
  Software is furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in 
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
  DEALINGS IN THE SOFTWARE.
  
  This software includes substantial portions from SproutCore:
    
    SproutCore -- JavaScript Application Framework
    copyright 2006-2008, Sprout Systems, Inc. and contributors.
    
    Permission is hereby granted, free of charge, to any person obtaining a 
    copy of this software and associated documentation files (the "Software"), 
    to deal in the Software without restriction, including without limitation 
    the rights to use, copy, modify, merge, publish, distribute, sublicense, 
    and/or sell copies of the Software, and to permit persons to whom the 
    Software is furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in 
    all copies or substantial portions of the Software.
    
  hub.uuid() function Copyright (c) 2009 Robert Kieffer.
  Dual licensed under the MIT and GPL licenses.
  
  hub.SHA256() function based on original code by Angel Marin, Paul Johnston.
*/

// NOTE: The "/*!" syntax above allows the comment to pass through the YUI 
// compressor unchanged, so that it will remain in the final minified output.
