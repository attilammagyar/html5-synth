function OctetStream()
{
	this._octets = [];
}

OctetStream.prototype.__defineGetter__("octets", function () { return this._octets; });

OctetStream.prototype.__defineGetter__("length", function () { return this._octets.length; });

OctetStream.prototype.clear = function ()
{
	this._octets = [];
}

OctetStream.prototype.append8 = function (char)
{
	this._octets.push(char & 0xff);
}

OctetStream.prototype.append16 = function (word)
{
	this.append8(word);
	this.append8(word >> 8);
}

OctetStream.prototype.append32 = function (dword)
{
	this.append16(dword & 0xffff);
	this.append16((dword >> 16) & 0xffff);
}

