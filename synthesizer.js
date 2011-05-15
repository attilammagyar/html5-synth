function SynthKey(wav, key_code, is_black)
{
	var div = document.createElement("div"),
		p = document.createElement("p"),
		audio = document.createElement("audio"),
		source = document.createElement("source"),
		key = this;

	source.src = "data:audio/x-wav;base64," + wav.toBase64String();
	delete wav;

	audio.appendChild(source);
	audio.loop = true;

	p.innerHTML = String.fromCharCode(key_code);

	div.className = "key " + (is_black ? "black" : "white");
	div.appendChild(p);

	div.addEventListener("mousedown", function () { key.press(); }, true);
	div.addEventListener("mouseup", function () { key.release(); }, true);

	this.audio = audio;
	this.ui = div;
}

SynthKey.prototype.press = function ()
{
	this.audio.play();
	if (this.ui.className.substr(-8) != "pressed")
		this.ui.className += " pressed";
}

SynthKey.prototype.release = function ()
{
	this.audio.pause();
	this.ui.className = this.ui.className.replace(/ pressed/g, "");
}

function Synthesizer(samples_per_sec, keyboard_parent)
{
	var first_note_freq = 220, // one octave below normal A (440 Hz)
		last_note_freq = 880.5, // one octave abow normal A with a threshold
								// for floating point operations

		freq_multiplier = Math.exp(Math.log(2) * 1 / 12), // 12th root of 2

					//  A# C#D# F#G#A# C#D# F#G#
					// a bc d ef g a bc d ef g a
		key_codes =  "YSXCFVGBNJMKQ2WE4R5TZ7U8I",
		key_colors = "1011010110101011010110101",
		keyboard = document.createElement("div"),
		synthesizer = this,
		note_freq, i, key, key_code; // temporary variables

	keyboard.className = "keyboard";
	keyboard_parent.appendChild(keyboard);
	this.keyboard = keyboard;

	this.samples_per_sec = samples_per_sec;

	document.addEventListener("keydown", function (e) { synthesizer.press(e.keyCode); }, true);
	document.addEventListener("keyup", function (e) { synthesizer.release(e.keyCode); }, true);

	this.keys = { };
	for (i = 0, note_freq = first_note_freq; note_freq < last_note_freq; note_freq *= freq_multiplier, ++i)
	{
		key_code = key_codes.charCodeAt(i);
		key = new SynthKey(
			new WavFile(
				samples_per_sec,
				this.generateSamples(note_freq, 0.95, 0.05),
				Math.ceil(note_freq * 2)
			),
			key_code,
			key_colors.charAt(i) == "0"
		);
		this.keys[key_code] = key;
		keyboard.appendChild(key.ui);
	}
}

Synthesizer.prototype.generateSamples = function (freq, sin_multiplier, sqr_multiplier)
{
	var sample_freq = 1 / this.samples_per_sec,
		amplitude = 32766/4,
		freqpi2 = freq * 2 * Math.PI,
		period_duration = 1 / freq,
		samples = [],
		time, sin, sqr;

	for (time = 0; time < period_duration; time += sample_freq)
	{
		sin = Math.sin(time * freqpi2);
		sqr = (sin > 0) ? 1 : -1;
		samples.push(Math.round(
			amplitude * (sin_multiplier * sin + sqr_multiplier * sqr)
		));
	}
	return samples;
}

Synthesizer.prototype.press = function (key_code)
{
	if (this.keys[key_code])
		this.keys[key_code].press();
}

Synthesizer.prototype.release = function (key_code)
{
	if (this.keys[key_code])
		this.keys[key_code].release();
}

