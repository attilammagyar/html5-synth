/**
 * SynthKey object represents one key of the synthesizer.
 *
 * @param Sound sound      URL of the sound file.
 * @param String key_code  Character on the computer
 *                         keyboard mapped to this key.
 * @param Boolean is_black Color of the key.
 */
function SynthKey(sound, key_code, is_black)
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

	this.sound = sound;
	this.ui = div;
	this.is_pressed = false;
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
	var first_note_freq = 220,  // 1 octave below normal A
		last_note_freq = 880.5, // 1 octave above normal A
								// with a threshold for
								// floating point ops

		// 12th root of 2
		freq_multiplier = Math.exp(Math.log(2) * 1 / 12),

				//    A# C#D# F#G#A# C#D# F#G#
				//   a bc d ef g a bc d ef g a
		key_codes = "ZSXCFVGBNJMKQ2WE4R5TY7U8I",
		key_colors = "1011010110101011010110101",
		//key_codes =  "YSXCFVGBNJMKQ2WE4R5TZ7U8I",
		//key_colors = "1011010110101011010110101",
		keyboard = document.createElement("div"),
		synthesizer = this,
		keys = { },
		note_freq, i, key, sound, key_code, key_is_black;

	keyboard.className = "keyboard";
	keyboard_parent.appendChild(keyboard);

	for (
		i = 0, note_freq = first_note_freq;
		note_freq < last_note_freq;
		note_freq *= freq_multiplier, ++i
	)
	{
		sound = new Sound(
			samples_per_sec,
			note_freq,
			0.85, 0.15
		);
		key_code = key_codes.charCodeAt(i);
		key_is_black = key_colors.charAt(i) == "0";
		key = new SynthKey(sound, key_code, key_is_black);
		keys[key_code] = key;
		keyboard.appendChild(key.ui);
	}

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

	this.keyboard = keyboard;
	this.keys = keys;
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

