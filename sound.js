/**
 * Sound represents an audio file. The wave used is a sum
 * of a sinusoid, a square and a saw wave.
 *
 * @param Number samples_per_sec  Frequency of sampling.
 * @param Number freq             Frequency of the wave.
 * @param Number sin_multiplier   Amount of sinusoid wave.
 * @param Number sqr_multiplier   Amount of square wave.
 * @param Number saw_multiplier   Amount of sawtooth wave.
 */
function Sound(
	samples_per_sec,
	freq,
	sin_multiplier,
	sqr_multiplier,
	saw_multiplier
)
{
	function generateRepeatableSamples(
		samples_per_sec,
		freq,
		amplitude,
		sin_multiplier,
		sqr_multiplier,
		saw_multiplier
	)
	{
		var samples = [],
			sample_delta_time = 1 / samples_per_sec,
			period_duration = 1 / freq,
			freqpi = freq * Math.PI,
			freqpi2 = freqpi * 2,
			freqpi4 = freqpi * 4,
			freqpi8 = freqpi * 8,
			time,
			sin, sin2, sin4,
			sqr, sqr2, sqr4,
			saw, saw2, saw4;

		for (
			time = 0;
			time < period_duration;
			time += sample_delta_time
		)
		{
			sin = Math.sin(time * freqpi2),
			sin2 = Math.sin(time * freqpi4),
			sin4 = Math.sin(time * freqpi8);

			sqr = (sin > 0) ? 1 : -1,
			sqr2 = (sin2 > 0) ? 1 : -1,
			sqr4 = (sin4 > 0) ? 1 : -1;

			saw = 2 * time / period_duration,
			saw2 = (2 * saw) - Math.floor(2 * saw) - 1,
			saw4 = (4 * saw) - Math.floor(4 * saw) - 1;
			saw -= 1;

			sin = 0.8 * sin + 0.15 * sin2 + 0.05 * sin4;
			sqr = 0.8 * sqr + 0.15 * sqr2 + 0.05 * sqr4;
			saw = 0.8 * saw + 0.15 * saw2 + 0.05 * saw4;

			samples.push(
				amplitude * (
					sin_multiplier * sin
					+ sqr_multiplier * sqr
					+ saw_multiplier * saw
				)
			);
		}
		return samples;
	}

	// Depending on browser capabilities, true real time
	// audio manipulation can be used.
	if (RealtimeAudio.prototype.isAvailable())
	{
		this.audio = new RealtimeAudio(
			samples_per_sec,
			freq,
			generateRepeatableSamples(
				samples_per_sec,
				freq,
				1 / 3,
				sin_multiplier,
				sqr_multiplier,
				saw_multiplier
			)
		);
	}
	else if (SimpleAudio.prototype.isAvailable())
	{
		this.audio = new SimpleAudio(
			samples_per_sec,
			freq,
			generateRepeatableSamples(
				samples_per_sec,
				freq,
				32767 / 3,
				sin_multiplier,
				sqr_multiplier,
				saw_multiplier
			)
		);
	}
	else
	{
		throw "No audio backend is available.";
	}
}

Sound.prototype.play = function ()
{
	this.audio.play();
}

Sound.prototype.stop = function ()
{
	this.audio.stop();
}

Sound.prototype.die = function ()
{
	this.audio.die();
}

