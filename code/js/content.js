;(function() {
  // console.log('CONTENT SCRIPT WORKS!');

  // var $ = require('./libs/jquery');
  // here we use SHARED message handlers, so all the contexts support the same
  // commands. but this is NOT typical messaging system usage, since you usually
  // want each context to handle different commands. for this you don't need
  // handlers factory as used below. simply create individual `handlers` object
  // for each context and pass it to msg.init() call. in case you don't need the
  // context to support any commands, but want the context to cooperate with the
  // rest of the extension via messaging system (you want to know when new
  // instance of given context is created / destroyed, or you want to be able to
  // issue command requests from this context), you may simply omit the
  // `hadnlers` parameter for good when invoking msg.init()
  var handlers = require('./modules/handlers').create('ct');
  var msg = require('./modules/msg').init('ct', handlers);

  // console.log('jQuery version:', $().jquery);

  common = require('./modules/common');

  actions = common.loadActions()

  function SimulateKeypress(element, charCode, evType) {
      // We cannot pass object references, so generate an unique selector
      var evType = evType || 'keypress';
      var attribute = 'robw_' + Date.now();
      element.setAttribute(attribute, '');
      var selector = element.tagName + '[' + attribute + ']';

      var s = document.createElement('script');
      s.textContent = '(' + function(charCode, attribute, selector, evType) {
          // Get reference to element...
          var element = document.querySelector(selector);
          element.removeAttribute(attribute);

          // Create KeyboardEvent instance
          var event = document.createEvent('KeyboardEvents');
          event.initKeyboardEvent(
              /* type         */ evType, //keydown, keyup, keypress
              /* bubbles      */ true,
              /* cancelable   */ false,
              /* view         */ window,
              /* keyIdentifier*/ '',
              /* keyLocation  */ 0,
              /* ctrlKey      */ false,
              /* altKey       */ false,
              /* shiftKey     */ false,
              /* metaKey      */ false,
              /* altGraphKey  */ false
          );
          // Define custom values
          // This part requires the script to be run in the page's context
          var getterCode = {get: function() {return charCode;}};
          var getterChar = {get: function() {return String.fromCharCode(charCode);}};
          Object.defineProperties(event, {
              charCode: getterCode,
              which: getterChar,
              keyCode: getterCode, // Not fully correct
              key: getterChar,     // Not fully correct
              char: getterChar
          });

          element.dispatchEvent(event);
      } + ')(' + charCode + ', "' + attribute + '", "' + selector + '", "' + evType + '")';
      (document.head||document.documentElement).appendChild(s);
      s.parentNode.removeChild(s);
  }

  function SimulateEvent(elem, event)
  {
      if(document.createEvent && elem) {
          var e = document.createEvent("MouseEvents");
          e.initEvent(event, true, true);
          elem.dispatchEvent(e);
      }
  }

  function SimulateClick(elem)
  {
      if (elem) {
          SimulateEvent(elem, "mouseover");
          SimulateEvent(elem, "click");
      }
  }

  function handleContinue() {
      // Netflix auto-play next episode feature times out after 3 episodes, after which you have to press a button onscreen to continue
      // Also at end of episode while waiting for next show to start you can similarly press the button to start it.
      // This function will press the button for you.
      handled = false;
      continueButtons = document.getElementsByClassName("continue-playing");
      for (var btn_idx in continueButtons) {
          elem = continueButtons[btn_idx];
          if (elem !== undefined) {
              if (elem.innerHTML !== undefined) {
                  if (elem.innerHTML.search("Continue Playing") != -1) {
                      handled = true;
                      SimulateClick(elem);
                  }
              }
          }
      }
      if (!handled) {
          nextButtons = document.getElementsByClassName("postplay-still-container");
          for (var btn_idx in nextButtons) {
              elem = nextButtons[btn_idx];
              if (elem !== undefined) {
                  if (elem.innerHTML !== undefined) {
                      handled = true;
                      SimulateClick(elem);
                  }
              }
          }
      }
      return handled;
  }

  function CloseWindow() {
    // Send close request to background task
    msg.bg('close', function(msg) {
        //console.log('<<<<< close broadcasting done');
      });
  }

  function runAction(name)
  {
    handled = true;
    switch(name) {
      case "Continue":
          if (!handleContinue()){
              handled = false;
          }
          break;
      case "Help":
          window.location = "https://www2.netflix.com/Help";
          break;
      case "Play/Pause":
          SimulateKeypress(document.body, common.keyCharToCode["Space"])
          break;
      case "Exit":
          CloseWindow();
          break;
      case "Volume Up":
          SimulateKeypress(document.body, common.keyCharToCode["Up"], 'keyup')
          break;
      case "Volume Down":
          SimulateKeypress(document.body, common.keyCharToCode["Down"], 'keyup')
          break;
      case "Reload":
          window.location.reload();
          break;
      default:
          handled = false;
      }
    return handled;
  }

  function handleKeyPress(e)
  {
      if (e.target.nodeName.match(/^(textarea|input)$/i)) {
          return;
      }
      var override = true;
      var keyCombo = common.keyCodeToChar[(e.charCode||e.which)];
      if (e.altKey) { 
          keyCombo = "Alt+" + keyCombo;
      }
      if (e.ctrlKey) { 
          keyCombo = "Ctrl+" + keyCombo;
      }
      if (e.shiftKey) { 
          keyCombo = "Shift+" + keyCombo;
      }
      
      var handled = false;
      for (aidx = 0; aidx < actions.length; ++aidx) {
        action = actions[aidx];
        for (kidx = 0; kidx < action.keys.length; ++kidx) {
          key = action.keys[kidx]
          if (key == keyCombo) {
            handled = runAction(action.name);
            break;
          }
        }
        if (handled) {
          break;
        }
      }
      if (handled) {
        e.preventDefault();
      }

      // switch(keyCombo) {
      // case "Space":
      //     if (!handleContinue()){
      //         override = false;
      //     }
      //     break;
      // case "?":
      //     window.location = "https://www2.netflix.com/Help";
      //     break;
      // case "P":
      //     SimulateKeypress(document.body, common.keyCharToCode["Space"])
      //     break;
      // case "Shift+P":
      //     SimulateKeypress(document.body, common.keyCharToCode["Space"])
      //     break;
      // case "Ctrl+P":
      //     SimulateKeypress(document.body, common.keyCharToCode["Space"])
      //     break;
      // case "Pause/Break":
      //     SimulateKeypress(document.body, common.keyCharToCode["Space"])
      //     break;
      // case "Esc":
      //     CloseWindow();
      //     break;
      // case "Escape":
      //     CloseWindow();
      //     break;
      // case "]":
      //     SimulateKeypress(document.body, common.keyCharToCode["Up"], 'keyup')
      //     break;
      // case "[":
      //     SimulateKeypress(document.body, common.keyCharToCode["Down"], 'keyup')
      //     break;
      // case "Enter":
      //     window.location.reload();
      //     break;
      // case "R":
      //     window.location.reload();
      //     break;
      // default:
      //     //console.log(keyCombo);
      //     override = false;
      // }
      // if (override) {
      //     e.preventDefault();
      // }
  }

  //document.addEventListener('keypress', handleKeyPress, false);
  document.addEventListener('keydown', handleKeyPress, false);




})();
