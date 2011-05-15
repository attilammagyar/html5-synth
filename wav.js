function WavFile(samples_per_sec, samples, repeat_times)
{
	var samples3 = samples.concat(samples).concat(samples),
		sample_count = samples.length * repeat_times + 2,
		headers = {
			RIFF: {
				chunk_id: [4, 0x46464952], // "RIFF"
				chunk_size: [4, 4 + 0x18 + 8 + sample_count * 2],
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
		tmp, i, j, l, t;

	tmp = new OctetStream();
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
				tmp.append32(headers[i][j][1]);
			}
			else
			{
				tmp.append16(headers[i][j][1]);
			}
		}
	}
	this._headers = base64_encode(tmp.octets);

	for (i = 0, l = samples3.length, tmp.clear(); i != l; ++i)
	{
		tmp.append16(samples3[i]);
	}
	this._body = base64_encode(tmp.octets);

	this._repeat_body = Math.max(0, (repeat_times - (repeat_times % 3)) / 3);

	for (i = 0, t = repeat_times % 3, tmp.clear(); i != t; ++i)
	{
		for (j = 0, l = samples.length; j != l; ++j)
		{
			tmp.append16(samples[j]);
		}
	}
	this._tail = base64_encode(tmp.octets);
}

WavFile.prototype.toBase64String = function ()
{
	var i, l, ret = this._headers, body = this._body;
	for (i = this._repeat_body; i != 0;)
	{
		if (i & 1)
			ret += body;
		i >>= 1;
		body += body;
	}
	return ret + this._tail;
}

