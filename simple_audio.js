/**
 * SimpleAudio uses native audio mixer functionality of
 * the browser. It is based on data-URLs generated from the
 * sound samples assigned as sources of audio tags.
 */
function SimpleAudio(samples_per_sec, freq, samples)
{
	var audio = new Audio();

	audio.src = "data:audio/x-wav;base64,"
		+ (
			new WavFile(
				samples_per_sec,
				samples,
				Math.ceil(freq * 4)
			)
		).toBase64String();
	audio.loop = true;

	this.audio = audio;
}

SimpleAudio.prototype.isAvailable = function ()
{
	return typeof(Audio) == 'function'
		&& (new Audio()).hasOwnProperty('loop');
}

SimpleAudio.prototype.play = function ()
{
	this.audio.play();
}

SimpleAudio.prototype.stop = function ()
{
	this.audio.pause();
}

SimpleAudio.prototype.die = function ()
{
	this.stop();
}
