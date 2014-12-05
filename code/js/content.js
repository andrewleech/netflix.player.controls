;(function() {
  console.log('CONTENT SCRIPT WORKS!');

  var $ = require('./libs/jquery');
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

  console.log('jQuery version:', $().jquery);



keyCodeToChar = {8:"Backspace",9:"Tab",13:"Enter",16:"Shift",17:"Ctrl",18:"Alt",19:"Pause/Break",20:"Caps Lock",27:"Esc",32:"Space",33:"Page Up",34:"Page Down",35:"End",36:"Home",37:"Left",38:"Up",39:"Right",40:"Down",45:"Insert",46:"Delete",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",65:"A",66:"B",67:"C",68:"D",69:"E",70:"F",71:"G",72:"H",73:"I",74:"J",75:"K",76:"L",77:"M",78:"N",79:"O",80:"P",81:"Q",82:"R",83:"S",84:"T",85:"U",86:"V",87:"W",88:"X",89:"Y",90:"Z",91:"Windows",93:"Right Click",96:"Numpad 0",97:"Numpad 1",98:"Numpad 2",99:"Numpad 3",100:"Numpad 4",101:"Numpad 5",102:"Numpad 6",103:"Numpad 7",104:"Numpad 8",105:"Numpad 9",106:"Numpad *",107:"Numpad +",109:"Numpad -",110:"Numpad .",111:"Numpad /",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"Num Lock",145:"Scroll Lock",182:"My Computer",183:"My Calculator",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"};
keyCharToCode = {"Backspace":8,"Tab":9,"Enter":13,"Shift":16,"Ctrl":17,"Alt":18,"Pause/Break":19,"Caps Lock":20,"Esc":27,"Space":32,"Page Up":33,"Page Down":34,"End":35,"Home":36,"Left":37,"Up":38,"Right":39,"Down":40,"Insert":45,"Delete":46,"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"A":65,"B":66,"C":67,"D":68,"E":69,"F":70,"G":71,"H":72,"I":73,"J":74,"K":75,"L":76,"M":77,"N":78,"O":79,"P":80,"Q":81,"R":82,"S":83,"T":84,"U":85,"V":86,"W":87,"X":88,"Y":89,"Z":90,"Windows":91,"Right Click":93,"Numpad 0":96,"Numpad 1":97,"Numpad 2":98,"Numpad 3":99,"Numpad 4":100,"Numpad 5":101,"Numpad 6":102,"Numpad 7":103,"Numpad 8":104,"Numpad 9":105,"Numpad *":106,"Numpad +":107,"Numpad -":109,"Numpad .":110,"Numpad /":111,"F1":112,"F2":113,"F3":114,"F4":115,"F5":116,"F6":117,"F7":118,"F8":119,"F9":120,"F10":121,"F11":122,"F12":123,"Num Lock":144,"Scroll Lock":145,"My Computer":182,"My Calculator":183,";":186,"=":187,",":188,"-":189,".":190,"/":191,"`":192,"[":219,"\\":220,"]":221,"'":222};

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
    // Requires https://chrome.google.com/webstore/detail/close-kiosk/dfbjahmenldfpkokepmfmkjkhdjelmkb
    //window.location.href = 'http://closekiosk';

    // Will not close last tab...
    //window.open('', '_self', '');
    //window.close();

    msg.bcast('echo', 'hello world!', function(msg) {
        console.log('echo:' + msg)
        console.log('<<<<< broadcasting done');
      });

    msg.bg('close', function(msg) {
        console.log('echo:' + msg)
        console.log('<<<<< close broadcasting done');
      });
}

function handleKeyPress(e)
{
    if (e.target.nodeName.match(/^(textarea|input)$/i)) {
        return;
    }
    var override = true;
    var keyCombo = keyCodeToChar[(e.charCode||e.which)];
    if (e.altKey) { 
        keyCombo = "Alt+" + keyCombo;
    }
    if (e.ctrlKey) { 
        keyCombo = "Ctrl+" + keyCombo;
    }
    if (e.shiftKey) { 
        keyCombo = "Shift+" + keyCombo;
    }
    
    //console.log(keyCombo);

    switch(keyCombo) {
    case "Space":
        if (!handleContinue()){
            override = false;
        }
        break;
    case "?":
        window.location = "https://www2.netflix.com/Help";
        break;
    case "P":
        SimulateKeypress(document.body, keyCharToCode["Space"])
        break;
    case "Shift+P":
        SimulateKeypress(document.body, keyCharToCode["Space"])
        break;
    case "Ctrl+P":
        SimulateKeypress(document.body, keyCharToCode["Space"])
        break;
    case "Pause/Break":
        SimulateKeypress(document.body, keyCharToCode["Space"])
        break;
    case "Esc":
        CloseWindow();
        break;
    case "Escape":
        CloseWindow();
        break;
    case "]":
        SimulateKeypress(document.body, keyCharToCode["Up"], 'keyup')
        break;
    case "[":
        SimulateKeypress(document.body, keyCharToCode["Down"], 'keyup')
        break;
    case "Enter":
        window.location.reload();
        break;
    case "R":
        window.location.reload();
        break;
    default:
        //console.log(keyCombo);
        override = false;
    }
    if (override) {
        e.preventDefault();
    }
}

//document.addEventListener('keypress', handleKeyPress, false);
document.addEventListener('keydown', handleKeyPress, false);




})();
