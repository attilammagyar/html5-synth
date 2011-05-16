/**
 * SynthKey object represents one key of the synthesizer.
 *
 * @param String sample_url  URL of the sound file.
 * @param String key_code    Character on the computer
 *                           keyboard mapped to this key.
 * @param Boolean is_black   Color of the key.
 */
function SynthKey(sample_url, key_code, is_black)
{
	var div = document.createElement("div"),
		p = document.createElement("p"),
		audio = document.createElement("audio"),
		source = document.createElement("source"),
		key = this;

	source.src = sample_url;

	audio.appendChild(source);
	audio.loop = true;

	p.innerHTML = String.fromCharCode(key_code);

	div.className = "key " + (is_black ? "black" : "white");
	div.appendChild(p);

	div.addEventListener(
		"click",
		function () { key.pressAndRelease(); },
		true
	);

	this.audio = audio;
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
	this.audio.play();
	if (this.ui.className.substr(-8) != "pressed")
		this.ui.className += " pressed";
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
	this.audio.pause();
	this.ui.className =
		this.ui.className.replace(/ pressed/g, "");
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
 * Synthesizer object can generate audio samples and
 * associate them with musical keyboard keys.
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
		note_freq, i, key, key_url, key_code;

	keyboard.className = "keyboard";
	keyboard_parent.appendChild(keyboard);

	for (
		i = 0, note_freq = first_note_freq;
		note_freq < last_note_freq;
		note_freq *= freq_multiplier, ++i
	)
	{
		key_url = "data:audio/x-wav;base64,"
			+ (
				new WavFile(
					samples_per_sec,
					this.generateSamples(
						samples_per_sec,
						note_freq,
						0.85, 0.15
					),
					Math.ceil(note_freq * 2)
				)
			).toBase64String();
		key_code = key_codes.charCodeAt(i);
		key = new SynthKey(
			key_url,
			key_code,
			key_colors.charAt(i) == "0"
		);
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
 * Generate one period of wave samples. The wave is a sum
 * of a sinusoid and a square wave.
 *
 * @param Number samples_per_sec  Frequency of sampling.
 * @param Number freq             Frequency of the wave.
 * @param Number sin_multiplier   Amount of sinusoid wave.
 * @param Number sqr_multiplier   Amount of square wave.
 * @return Array                  Repeatable samples.
 */
Synthesizer.prototype.generateSamples = function (
	samples_per_sec,
	freq,
	sin_multiplier,
	sqr_multiplier
)
{
	var sample_delta_time = 1 / samples_per_sec,
		amplitude = 32766 / 4,
		freqpi = freq * Math.PI,
		freqpi2 = freqpi * 2,
		freqpi4 = freqpi * 4,
		period_duration = 1 / freq,
		samples = [],
		time,
		sin, sin_below, sin_above,
		sqr, sqr_below, sqr_above;

	for (
		time = 0;
		time < period_duration;
		time += sample_delta_time
	)
	{
		sin = Math.sin(time * freqpi2),
		sin_above = Math.sin(time * freqpi4),
		sin_below = Math.sin(time * freqpi);

		sqr = (sin > 0) ? 1 : -1;
		sqr_above = (sin_above > 0) ? 1 : -1;
		sqr_below = (sin_below > 0) ? 1 : -1;

		sin = 0.7 * sin + 0.15 * sin_above + 0.15 * sin_below;
		sqr = 0.7 * sqr + 0.15 * sqr_above + 0.15 * sqr_below;

		samples.push(Math.round(
			amplitude * (
				sin_multiplier * sin
				+ sqr_multiplier * sqr
			)
		));
	}
	return samples;
}

/**
 * Notify the Synthesizer about a key press.
 *
 * @param Number key_code  PC keyboard key code.
 * @return void
 */
Synthesizer.prototype.press = function (key_code)
{
	if (this.keys[key_code])
		this.keys[key_code].press();
}

/**
 * Notify the Synthesizer about releasing a PC key.
 *
 * @param Number key_code  PC keyboard key code.
 * @return void
 */
Synthesizer.prototype.release = function (key_code)
{
	if (this.keys[key_code])
		this.keys[key_code].release();
}

