/**
 * WavFile constructor. To make playback loop easier to the
 * browser, samples can be repeated.
 *
 * @param Number samples_per_sec  Number of samples
 *                                in a second.
 * @param Array samples           Repeatable samples.
 * @param Number repeat_times     How many times to repeat
 *                                the samples.
 */
function WavFile(samples_per_sec, samples, repeat_times)
{
	var samples3,
		sample_count = samples.length * repeat_times + 2,
		headers = {
			RIFF: {
				chunk_id: [4, 0x46464952], // "RIFF"
				chunk_size: [4, 36 + sample_count * 2],
				type: [4, 0x45564157] // "WAVE"
			},
			fmt: {
				chunk_id: [4, 0x20746d66], // "fmt ",
				chunk_size: [4, 0x10],
				compression: [2, 1],
				channels: [2, 1],
				sample_rate: [4, samples_per_sec],
				bytes_per_sec: [4, samples_per_sec * 2],
				block_align: [2, 2],
				bits_per_sample: [2, 16]
			},
			data: {
				chunk_id: [4, 0x61746164], // "data"
				chunk_size: [4, sample_count * 2],
				dummy_sample: [4, 0]
			}
		},
		buffer = new OctetStream(),
		i, j, l, t; // loop variables

	for (i = 0, l = samples.length; i != l; ++i)
		samples[i] = Math.round(samples[i]);
	samples3 = samples.concat(samples).concat(samples);

	// encoding headers
	for (i in headers)
	{
		if (!headers.hasOwnProperty(i))
			continue;
		for (j in headers[i])
		{
			if (!headers[i].hasOwnProperty(j))
				continue;
			if (headers[i][j][0] == 4)
			{
				buffer.append32(headers[i][j][1]);
			}
			else
			{
				buffer.append16(headers[i][j][1]);
			}
		}
	}
	this._headers = base64_encode(buffer.octets);

	// encoding repeatable body
	buffer.clear();
	for (i = 0, l = samples3.length; i != l; ++i)
	{
		buffer.append16(samples3[i]);
	}
	this._body = base64_encode(buffer.octets);

	// how many times to repeat body
	this._repeat_body = Math.max(
		0, (repeat_times - (repeat_times % 3)) / 3);

	// encoding tail
	buffer.clear();
	for (i = 0, t = repeat_times % 3; i != t; ++i)
	{
		for (j = 0, l = samples.length; j != l; ++j)
		{
			buffer.append16(samples[j]);
		}
	}
	this._tail = base64_encode(buffer.octets);
}

/**
 * Generate a base64 representation of the binary RIFF file.
 *
 * @return String
 */
WavFile.prototype.toBase64String = function ()
{
	var i, l, ret = this._headers, body = this._body;
	// To be efficient, doubling the length of the string
	// in each iteration.
	// http://google.com/search?q=shift-and-add
	for (i = this._repeat_body; i != 0;)
	{
		if (i & 1)
			ret += body;
		i >>= 1;
		body += body;
	}
	return ret + this._tail;
}

