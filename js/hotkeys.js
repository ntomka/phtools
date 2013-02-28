/**
 * Billentyűparancsok
 *
 * alap: http://userscripts.org/scripts/show/71518
 */
function event_handler() {
    var editor = document.evaluate("//textarea[@name=\"content\"]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (editor == null)
        return;
    var buttons = document.evaluate("//input", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    var is_comment = buttons.snapshotItem(0).type == "radio";
    var n = is_comment ? 2 : 0;

	var mapping = {
		"send"				:  0 + n,
		"bold"				:  1 + n,
		"italic"			:  2 + n,
		"underlined"		:  3 + n,
		"strike-through"	:  4 + n,
		"off-topic"			:  5 + n,
		"link"				:  6 + n,
		"image"				:  7 + n,
		"code"				:  8 + n,
		"monospace"			:  9 + n,
		"raw"				: 10 + n,
		"left-aligned"		: 11 + n,
		"right-aligned"		: 12 + n,
		"center-aligned"	: 13 + n,
		"justify-aligned"	: 14 + n
	};

	editor.hotkeys = {};

	RequestSender.sendRequest({
		requestSource: "hotkeys",
		action: "get"
	}, function(response) {
		if (response.data) {
			Object.keys(response.data).each(function(key) {
				if (response.data[key] && mapping[key])
					editor.hotkeys[response.data[key]] = buttons.snapshotItem(mapping[key]);
			});

			if (is_comment) {
				if (response.data["normal-comment"])
					editor.hotkeys[response.data["normal-comment"]] = buttons.snapshotItem(0);
				if (response.data["off-topic-comment"])
					editor.hotkeys["off-topic-comment"] = buttons.snapshotItem(1);
			}
		}
	});

    var onhotkeycancel = function (e) {
        e.returnValue = false;
        if (e.stopPropagation)
            e.stopPropagation();
        if (e.preventDefault)
            e.preventDefault();
        return false;
    };

    var onhotkeypress = function (e) {
        if (editor.hotkey == null)
            return true;

        var hotkey = editor.hotkey;
        if (typeof(hotkey) == "function")
            hotkey(e);
        else if (typeof(hotkey) == "string")
            editor.value = editor.value.substr(0, editor.selectionStart) + hotkey + editor.value.substr(editor.selectionEnd);
        else if (typeof(hotkey) == "object" && hotkey.tagName == "INPUT" && window.opera == null)
            hotkey.click();

        return onhotkeycancel(e);
    }

    var onhotkeydown = function (e) {
        var code = e.keyCode ? e.keyCode : e.which;
        if (code == null)
            return true;

        var named_keys = {
			  //8 : "backspace",
			  //9 : "tab",
			 13 : "enter",
			 32 : "space",
			 //27 : "esc",
			 33 : "pageup",
			 34 : "pagedown",
			 35 : "end",
			 36 : "home",
			 37 : "left",
			 38 : "up",
			 39 : "right",
			 40 : "down",
			 45 : "insert",
			 //46 : "delete",
			112 : "f1",
			113 : "f2",
			114 : "f3",
			115 : "f4",
			116 : "f5",
			117 : "f6",
			118 : "f7",
			119 : "f8",
			120 : "f9",
			121 : "f10",
			122 : "f11",
			123 : "f12"
		};

        var key = (e.ctrlKey ? "ctrl+" : "") + (e.altKey ? "alt+" : "") + (e.shiftKey ? "shift+" : "");
        if ((code >= 65 && code <= 90) || (code >= 48 && code <= 57))
            key += String.fromCharCode(code).toLowerCase();
        else if (named_keys[code] == null)
            return true;
        else
            key += named_keys[code];

        editor.hotkey = editor.hotkeys[key];
        if (editor.hotkey == null)
            return true;

        return onhotkeypress(e);
    };

    var onhotkeyup = function (e) {
        if (editor.hotkey == null)
            return true;

        editor.hotkey = null;
        return onhotkeycancel(e);
    }

    editor.addEventListener("keydown", onhotkeydown, false);
    editor.addEventListener("keyup", onhotkeyup, false);
}

window.addEvent('domready', function() {
	RequestSender.sendRequest({
		requestSource: "hotkeys",
		action: "enabled"
	}, function(response) {
		if (response.enabled)
			event_handler();
	});
});