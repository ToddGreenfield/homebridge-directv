var DirecTV = require('directv-remote');
var ip_address = '192.168.1.111';
var remote = new DirecTV.Remote(ip_address);
remote.getLocations('1');
