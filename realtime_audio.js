/**
 * RealtimeAudio uses audio API of Firefox 4.x to write
 * the playback buffer directly from JavaScript. It is
 * based on a simple implementation of a channel mixer,
 * TypedArray objects and setInterval(). The latency of
 * this implementation is far from good, but it's still a
 * lot better than SimpleAudio in case of Firefox. There
 * are possibilities to do some optimization as well.
 *
 * This true real time audio manipulation allows slight
 * fade-in and fade-out effects to be made, so no clicks
 * can be heard when a note starts or stops ringing.
 */
function RealtimeAudio(samples_per_sec, freq, samples)
{
	function repeatArray(arr, count)
	{
		var i, ret = [];
		for (i = count; i != 0;)
		{
			if (i & 1)
				ret = ret.concat(arr);
			i >>= 1;
			arr = arr.concat(arr);
		}
		return arr;
	}

	if (!RealtimeAudio.prototype.mixer)
	{
		RealtimeAudio.prototype.mixer = new RealtimeAudioMixer(samples_per_sec);
	}

	this.channel_id = this.mixer.registerChannel(
		repeatArray(samples, Math.ceil(freq))
	);
}

RealtimeAudio.prototype.isAvailable = function ()
{
	var test_audio;

	if (typeof(Audio) != 'function')
		return false;

	test_audio = new Audio();
	return typeof(test_audio.mozSetup) == 'function'
		&& typeof(test_audio.mozWriteAudio) ==  'function'
		&& typeof(Float32Array) == 'function';
}

RealtimeAudio.prototype.play = function ()
{
	this.mixer.play(this.channel_id);
}

RealtimeAudio.prototype.stop = function ()
{
	this.mixer.mute(this.channel_id);
}

RealtimeAudio.prototype.die = function ()
{
	if (this.channel_id == 0)
		this.mixer.clear();
}

function RealtimeAudioMixer(samples_per_sec)
{
	var audio = new Audio(),
		mixer = this;

	audio.mozSetup(1, samples_per_sec);

	this.samples_per_sec = samples_per_sec;
	this.audio = audio;
	this.channels = [];
	this.audio_writer = setInterval(
		function () { mixer.writeNextBuffer(); },
		40
	);
}

RealtimeAudioMixer.prototype.registerChannel = function (samples)
{
	return this.channels.push(
		{
			samples: samples,
			active: false,
			fade_out: false,
			fade_in: false,
			pointer: 0,
			volume: 0
		}
	);
}

RealtimeAudioMixer.prototype.clear = function ()
{
	this.channels = [];
}

RealtimeAudioMixer.prototype.play = function (channel_id)
{
	var channel = this.channels[channel_id - 1];
	channel.fade_in = true;
	channel.fade_out = false;
	channel.active = true;
}

RealtimeAudioMixer.prototype.mute = function (channel_id)
{
	this.channels[channel_id - 1].fade_out = true;
	this.channels[channel_id - 1].fade_in = false;
}

RealtimeAudioMixer.prototype.writeNextBuffer = function ()
{
	var buffer_length = Math.ceil(this.samples_per_sec / 25),
		buffer = new Float32Array(buffer_length),
		active_channels = [],
		written,
		sample, sum, channel,
		i, l, j;

	for (i = 0, l = this.channels.length; i != l; ++i)
		if (this.channels[i].active)
			active_channels.push(this.channels[i]);

	for (i = 0; i != buffer_length; ++i)
	{
		sum = 0;
		for (j = 0, l = active_channels.length; j != l; ++j)
		{
			channel = active_channels[j];
			sample = channel.volume * channel.samples[
				(channel.pointer + i) % channel.samples.length
			];
			if (channel.fade_in)
			{
				channel.volume += 0.01;
				if (channel.volume > 0.99)
				{
					channel.volume = 1;
					channel.fade_in = false;
				}
			}
			else if (channel.fade_out)
			{
				channel.volume -= 0.001;
				if (channel.volume < 0)
				{
					channel.volume = 0;
					channel.pointer = 0;
					channel.fade_out = false;
					channel.active = false;
				}
			}
			sum += sample;
		}
		buffer[i] = Math.max(Math.min(1, sum), -1);
	}

	written = this.audio.mozWriteAudio(buffer);
	for (j = 0, l = active_channels.length; j != l; ++j)
	{
		channel = active_channels[j];
		channel.pointer = (channel.pointer + written) % channel.samples.length;
	}
}

