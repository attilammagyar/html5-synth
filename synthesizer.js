/**
 * SynthKey object represents one key of the synthesizer.
 *
 * @param String key_code  Character on the computer
 *                         keyboard mapped to this key.
 * @param Boolean is_black Color of the key.
 */
function SynthKey(key_code, is_black)
{
	var div = document.createElement("div"),
		p = document.createElement("p"),
		key = this;

	p.innerHTML = String.fromCharCode(key_code);

	this.released_css = "key "
		+ (is_black ? "black" : "white");
	this.pressed_css = this.released_css + " pressed";

	div.className = this.released_css;
	div.appendChild(p);

	div.addEventListener(
		"click",
		function () { key.pressAndRelease(); },
		true
	);

	this.sound = null;
	this.ui = div;
	this.is_pressed = false;
}

/**
 * Change the sound of the key.
 *
 * @param Sound new_sound The new Sound object.
 * @return void
 */
SynthKey.prototype.replaceSound = function (new_sound)
{
	if (this.sound)
		this.sound.die();
	this.sound = new_sound;
}

/**
 * Play the sound associated with the key.
 *
 * @return void
 */
SynthKey.prototype.press = function ()
{
	if (this.is_pressed)
		return;
	this.is_pressed = true;
	this.sound.play();
	this.ui.className = this.pressed_css;
}

/**
 * Stop playing any sound.
 *
 * @return void
 */
SynthKey.prototype.release = function ()
{
	if (!this.is_pressed)
		return;
	this.sound.stop();
	this.ui.className = this.released_css;
	this.is_pressed = false;
}

/**
 * Keep a key pressed for a limited amount of time.
 *
 * @return void
 */
SynthKey.prototype.pressAndRelease = function ()
{
	var key = this;
	this.press();
	setTimeout(function () { key.release(); }, 700);
}

/**
 * Synthesizer object can generate sounds and associate
 * them with musical keyboard keys.
 *
 * @param Number samples_per_sec      Sampling rate.
 * @param DOMElement keyboard_parent  DOM object containing
 *                                    the keyboard.
 */
function Synthesizer(samples_per_sec, keyboard_parent)
{
	function createKeyboard(keyboard_parent)
	{
		var keyboard = document.createElement("div");
		keyboard.className = "keyboard";
		keyboard_parent.appendChild(keyboard);
		return keyboard;
	}

	function createSettingsForm(keyboard, synthesizer)
	{
		var settings = document.createElement("form"),
			inputs = [],
			labels = ["Sin", "Sqr", "Saw"],
			values = [75, 5, 20],
			i, l, input, label, name;

		settings.setAttribute("action", "#");

		for (i = 0, l = labels.length; i != l; ++i)
		{
			name = labels[i].toLowerCase();

			input = document.createElement("input");
			input.setAttribute("type", "range");
			input.setAttribute("name", name);
			input.setAttribute("min", 0);
			input.setAttribute("max", 200);
			input.value = values[i];
			input.addEventListener(
				"change",
				function () {
					synthesizer.handleSettingsFormChange();
				},
				true
			);

			label = document.createElement("label");
			label.setAttribute("for", "name");
			label.innerHTML = labels[i] + ":";

			settings.appendChild(label);
			settings.appendChild(input);

			inputs.push(input);
		}

		keyboard.appendChild(settings);

		return inputs;
	}

	function createKeys(keyboard, key_codes, key_colors)
	{
		var keys = {},
			i, l, key, key_code, is_black;

		for (i = 0, l = key_codes.length; i != l; ++i)
		{
			key_code = key_codes.charCodeAt(i);
			is_black = key_colors.charAt(i) == "0";
			key = new SynthKey(key_code, is_black);
			keys[key_code] = key;
			keyboard.appendChild(key.ui);
		}
		return keys;
	}

	function registerEventHandlers(synthesizer)
	{
		document.addEventListener(
			"keydown",
			function (e) { synthesizer.press(e.keyCode); },
			true
		);
		document.addEventListener(
			"keyup",
			function (e) { synthesizer.release(e.keyCode); },
			true
		);
	}

				//     A# C#D# F#G#A# C#D# F#G#
				//    a bc d ef g a bc d ef g a
	this.key_codes = "ZSXCFVGBNJMKQ2WE4R5TY7U8I",
//	this.key_codes = "YSXCFVGBNJMKQ2WE4R5TZ7U8I",
	this.key_colors = "1011010110101011010110101",
	this.samples_per_sec = samples_per_sec;

	this.settings = { sin: 75, sqr: 5, saw: 20 };
	this.update_settings_timeout = null;

	this.keyboard = createKeyboard(keyboard_parent);
	this.settings_inputs = createSettingsForm(this.keyboard, this);
	this.keys = createKeys(
		this.keyboard,
		this.key_codes,
		this.key_colors
	);
	this.generateSounds();

	registerEventHandlers(this);
}

Synthesizer.prototype.generateSounds = function ()
{
	var first_note_freq = 110,  // 2 octaves below normal A

		// 12th root of 2
		freq_multiplier = Math.exp(Math.log(2) * 1/12),

		sin = this.settings.sin / 100,
		sqr = this.settings.sqr / 100,
		saw = this.settings.saw / 100,
		count = this.key_codes.length,

		i, note_freq, sound, key_code;

	for (
		i = 0, note_freq = first_note_freq;
		i != count && !this.update_settings_timeout;
		++i, note_freq *= freq_multiplier
	)
	{
		sound = new Sound(
			this.samples_per_sec,
			note_freq,
			sin, sqr, saw
		);
		key_code = this.key_codes.charCodeAt(i);
		this.keys[key_code].replaceSound(sound);
	}
}

Synthesizer.prototype.toggleSettingsForm = function (enabled)
{
	var i;
	for (i = 0; i != this.settings_inputs.length; ++i)
	{
		this.settings_inputs[i].disabled = !enabled;
		this.settings_inputs[i].readonly = !enabled;
	}
}

/**
 * Notify the Synthesizer about changes of the settings form.
 *
 * @return void
 */
Synthesizer.prototype.updateSettings = function ()
{
	var sin, sqr, saw;
	sin = Number(this.settings_inputs[0].value);
	sqr = Number(this.settings_inputs[1].value);
	saw = Number(this.settings_inputs[2].value);
	if (
		sin != this.settings.sin
		|| sqr != this.settings.sqr
		|| saw != this.settings.saw
	)
	{
		this.toggleSettingsForm(false);
		this.update_settings_timeout = null;
		this.settings.sin = sin;
		this.settings.sqr = sqr;
		this.settings.saw = saw;
		this.generateSounds();
		this.toggleSettingsForm(true);
	}
}

/**
 * Onchage event handler.
 *
 * @return void
 */
Synthesizer.prototype.handleSettingsFormChange = function ()
{
	var synthesizer = this;
	if (this.update_settings_timeout)
	{
		clearTimeout(this.update_settings_timeout);
	}
	this.update_settings_timeout = setTimeout(
		function () { synthesizer.updateSettings(); },
		1500
	);
}

/**
 * Notify the Synthesizer about a key press.
 *
 * @param Number key_code  PC keyboard key code.
 * @return void
 */
Synthesizer.prototype.press = function (key_code)
{
	var key = this.keys[key_code];
	if (key)
		key.press();
}

/**
 * Notify the Synthesizer about releasing a PC key.
 *
 * @param Number key_code  PC keyboard key code.
 * @return void
 */
Synthesizer.prototype.release = function (key_code)
{
	var key = this.keys[key_code];
	if (key)
		key.release();
}

