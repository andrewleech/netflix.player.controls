;(function() {

// Copyright (c) 2014 alelec. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

common = require('./modules/common');

function Action(data) {
  var actions = document.getElementById('actions');
  this.node = document.getElementById('action-template').cloneNode(true);
  this.node.id = 'action' + (Action.next_id++);
  this.node.action = this;
  actions.appendChild(this.node);
  this.node.hidden = false;

  var next_keyId = 0;
  if (data) {
    this.getElement('action-label').innerHTML = data.name;

    keySelect = this.getElement('keySelect');
    for (var keycode in common.keyCodeToChar) {
      var opt = document.createElement('option');
      opt.value = common.keyCodeToChar[keycode];
      opt.innerHTML = common.keyCodeToChar[keycode];
      keySelect.appendChild(opt);
    }

    key = this.getElement('key');
    if (data.keys.length > 0) {
      for (idx = 0; idx < data.keys.length; ++idx) {
        keypress = data.keys[idx];
        if ((keypress !== null) && (keypress !== undefined)) {
          key_block = key.cloneNode(true);
          key_block.hidden = false;
          key_block.id = "key"+idx;
          keySelect = key_block.getElementsByClassName('keySelect')[0];

          keyParts = keypress.split('+');
          for (var kp_idx in keyParts) {
            kn = keyParts[kp_idx];
            if ((kn == "Shift") || (kn == "Alt") || (kn == "Ctrl")) {
              key_block.getElementsByClassName(kn)[0].checked = true;
            } else {
              keySelect.value = kn;
            }
          }
          keySelect.onchange = storeActions;
          ["Shift","Alt","Ctrl"].map(function(kn){key_block.getElementsByClassName(kn)[0].onchange = storeActions;})
          this.getElement('keys-col').appendChild(key_block);
        }
      }
    }
    next_keyId = data.keys.length;
  }

  this.render();

  this.getElement('enabled').onchange = storeActions;

  var action = this;
  this.getElement('move-up').onclick = function() {
    var sib = action.node.previousSibling;
    action.node.parentNode.removeChild(action.node);
    sib.parentNode.insertBefore(action.node, sib);
    storeActions();
  };
  this.getElement('move-down').onclick = function() {
    var parentNode = action.node.parentNode;
    var sib = action.node.nextSibling.nextSibling;
    parentNode.removeChild(action.node);
    if (sib) {
      parentNode.insertBefore(action.node, sib);
    } else {
      parentNode.appendChild(action.node);
    }
    storeActions();
  };
  this.getElement('AddKey').onclick = function() {
    // TODO
    key_block = key.cloneNode(true);
    key_block.hidden = false;
    key_block.id = "key"+next_keyId;
    next_keyId += 1;
    key_block.getElementsByClassName('keySelect')[0].onchange = storeActions;
    ["Shift","Alt","Ctrl"].map(function(kn){key_block.getElementsByClassName(kn)[0].onchange = storeActions;})
    keysCol = this.parentElement.parentElement.getElementsByClassName('keys-col')[0];
    keysCol.appendChild(key_block);
  };
  //storeActions();
}

Action.prototype.getElement = function(name) {
  return document.querySelector('#' + this.node.id + ' .' + name);
}

Action.prototype.render = function() {
  this.getElement('move-up').disabled = !this.node.previousSibling;
  this.getElement('move-down').disabled = !this.node.nextSibling;
}

Action.next_id = 0;

// function findParentClass(cls) {
//     var p = this.parentNode;
//     var found;

//     while (p !== null) {
//         var o = p;
//         if (o.className == cls) {
//           found = 0;
//           break;
//         }
//         p = o.parentNode;
//     }
//     return found; // returns an Array []
// }

function storeActions() {
  localStorage.actions = JSON.stringify(Array.prototype.slice.apply(
      document.getElementById('actions').childNodes).map(function(node) {
    node.action.render();
    var keysArr = [];
    selects = node.getElementsByClassName('keySelect');
    for (idx = 0; idx < selects.length; ++idx) {
      select = selects[idx]
      keyname = select.value;
      if (keyname != "RemoveKey") {
        ["Shift","Alt","Ctrl"].map(function(mod){
          if (select.parentNode.getElementsByClassName(mod)[0].checked) {
            keyname = mod + "+" + keyname;
          }
        });
        keysArr.push(keyname);
      }
    }
    options = {};
    options.name = node.action.getElement('action-label').innerHTML;
    options.keys = keysArr;
    return options
  }));
}

window.onload = function() {
  actions = common.loadActions();
  var initialActions = []
  actions.forEach(function(action) {initialActions.push(new Action(action));})
  initialActions.map(function(action) {action.render();});
  // document.getElementById('new').onclick = function() {
  //   new Action();
  // };
}


})();

