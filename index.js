var DirecTV = require('directv-remote');
var Service;
var Characteristic;
var validIp = false;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-directv", "Directv", DirectvAccessory);
};

function DirectvAccessory(log, config) {
	var that = this;
	this.log = log;
	this.config = config;
	this.name = config["name"];
	this.ip_address	= config["ip_address"];
	 
	if (!this.ip_address) throw new Error("You must provide a config value for 'ip_address'.");
	 
	DirecTV.validateIP(this.ip_address, function(err) {
		if (err) {
			that.log( "No response from a DTV at: %s", that.ip_address);
		} else
			that.log( "Valid DTV found at: %s", that.ip_address);
			validIp = true;
	})

	this.remote = new DirecTV.Remote(this.ip_address);
	this.service = new Service.Switch(this.name);

    this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this._getOn.bind(this))
        .on('set', this._setOn.bind(this));
}

DirectvAccessory.prototype.getInformationService = function() {
    var informationService = new Service.AccessoryInformation();
    informationService
        .setCharacteristic(Characteristic.Name, this.name)
        .setCharacteristic(Characteristic.Manufacturer, 'DirectTV')
        .setCharacteristic(Characteristic.Model, '0.0.1')
        .setCharacteristic(Characteristic.SerialNumber, this.ip_address);
    return informationService;
};

DirectvAccessory.prototype.getServices = function() {
    return [this.service, this.getInformationService()];
};

DirectvAccessory.prototype._getOn = function(callback) {
    var accessory = this;
    if (validIp) {
      this.remote.getMode('0', function(err,response) {
          if (response.mode =='0') {
            accessory.log('DTV is ON.');
            callback(null, true);
          } else {
            accessory.log('DTV is OFF.');
            callback(null, false);
		  }
      });
	 } else {
	     accessory.log('No response from DTV at: %s', this.ip_address);
		 callback(null, false);
	 }
};

DirectvAccessory.prototype._setOn = function(on, callback) {
     var accessory = this;
	 if (validIp) {
	   this.remote.processKey('power', '0', function(err, reponse) {
            if (err) {
				accessory.log(err);
                callback(err);
            } else {
				accessory.log('DTV power state is now: %s', (on) ? 'ON' : 'OFF');
                callback(null);
            }
        });
	 } else {
	     accessory.log('No response from DTV at: %s', this.ip_address);
		 callback(null);
	 }		
};
