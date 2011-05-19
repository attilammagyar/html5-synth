function base64_encode(octet_stream)
{
	var i,
		l = octet_stream.length - (octet_stream.length % 3),
		triplet = 0,
		result = '',
		table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	for (i = 0; i != l; i += 3)
	{
		triplet = (octet_stream[i] << 16) + (octet_stream[i + 1] << 8) + octet_stream[i + 2];
		result += table.charAt((triplet >> 18) & 0x3f)
			+ table.charAt((triplet >> 12) & 0x3f)
			+ table.charAt((triplet >> 6) & 0x3f)
			+ table.charAt(triplet & 0x3f);
	}
	if (i = octet_stream.length % 3)
	{
		result += table.charAt((octet_stream[l] >> 2) & 0x3f);
		if (i == 1)
		{
			result += table.charAt((octet_stream[l] & 0x3) << 4) + '==';
		}
		else
		{
			result += table.charAt(((octet_stream[l] & 0x3) << 4) + ((octet_stream[l + 1] & 0xf0) >> 4))
				+ table.charAt((octet_stream[l + 1] & 0xf) << 2)
				+ '=';
		}
	}

	return result;
}

