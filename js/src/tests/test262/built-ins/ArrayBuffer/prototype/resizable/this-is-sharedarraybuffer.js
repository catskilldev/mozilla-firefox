// |reftest| shell-option(--enable-arraybuffer-resizable) skip-if(!this.hasOwnProperty('SharedArrayBuffer')||!ArrayBuffer.prototype.resize||!xulRuntime.shell) -- SharedArrayBuffer,resizable-arraybuffer is not enabled unconditionally, requires shell-options
// Copyright (C) 2021 the V8 project authors. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
esid: sec-get-arraybuffer.prototype.resizable
description: Throws a TypeError exception when `this` is a SharedArrayBuffer
info: |
  get ArrayBuffer.prototype.resizable

  1. Let O be the this value.
  2. Perform ? RequireInternalSlot(O, [[ArrayBufferData]]).
  3. If IsSharedArrayBuffer(O) is true, throw a TypeError exception.
  [...]
features: [SharedArrayBuffer, resizable-arraybuffer]
---*/

var resizable = Object.getOwnPropertyDescriptor(
  ArrayBuffer.prototype, "resizable"
);

var getter = resizable.get;
var sab = new SharedArrayBuffer(4);

assert.sameValue(typeof getter, "function");

assert.throws(TypeError, function() {
  getter.call(sab);
}, "`this` cannot be a SharedArrayBuffer");

Object.defineProperties(sab, { resizable: resizable });

assert.throws(TypeError, function() {
  sab.resizable;
}, "`this` cannot be a SharedArrayBuffer");

reportCompare(0, 0);
