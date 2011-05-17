/**
 * Sound represents an audio file. The wave used is a sum
 * of a sinusoid and a square wave.
 *
 * @param Number samples_per_sec  Frequency of sampling.
 * @param Number freq             Frequency of the wave.
 * @param Number sin_multiplier   Amount of sinusoid wave.
 * @param Number sqr_multiplier   Amount of square wave.
 * @return void
 */
function Sound(
	samples_per_sec,
	freq,
	sin_multiplier,
	sqr_multiplier
)
{
	function generateRepeatableSamples(
		samples_per_sec,
		freq,
		sin_multiplier,
		sqr_multiplier
	)
	{
		var samples = [],
			sample_delta_time = 1 / samples_per_sec,
			period_duration = 1 / freq,
			amplitude = 32766 / 4,
			freqpi = freq * Math.PI,
			freqpi2 = freqpi * 2,
			freqpi4 = freqpi * 4,
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

	var audio = new Audio();

	audio.src = "data:audio/x-wav;base64,"
		+ (
			new WavFile(
				samples_per_sec,
				generateRepeatableSamples(
					samples_per_sec,
					freq,
					0.85, 0.15
				),
				Math.ceil(freq * 1)
			)
		).toBase64String();
	audio.loop = true;

	this.audio = audio;
}

Sound.prototype.play = function ()
{
	this.audio.play();
}

Sound.prototype.stop = function ()
{
	this.audio.pause();
}

