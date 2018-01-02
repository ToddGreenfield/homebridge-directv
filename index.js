'use strict';

// Directv Platform for HomeBridge
//
// Remember to add platform to config.json. Example:
// "platforms": [
//     {
//         "platform": "Directv",				// required
//         "name": "DTV",						// Optional - defaults to DTV
//         "ip_address": "IP of Primary STB", 	// required
//		   "exclude_geni": true,				// Optional - defaults to false
//		   "min_channel": 1,					// Optional - defaults to 1
//		   "max_channel": 575					// Optional - defaults to 575
//     }
// ],
//
//

var inherits = require('util').inherits;
var DirecTV = require('directv-remote');
var titleCase = require('title-case');
var remote, min_ch, max_ch;

function DirectvPlatform(log, config){
	this.config = config;
	this.ip_address = config["ip_address"];
	this.name = config["name"] || 'DTV';
	this.excludeGeni = config["exclude_geni"] || false;
	min_ch = config["min_channel"] || 1;
	max_ch = config["max_channel"] || 575;
	this.log = log;

	if (!this.ip_address) throw new Error("DTV - You must provide a config value for 'ip_address'.");

	remote = new DirecTV.Remote(this.ip_address);

}

DirectvPlatform.prototype = {
    accessories: function(callback) {
        this.log("Fetching DTV locations.");
        var that = this;
        var foundAccessories = [];

		remote.getLocations('1', function(err, response) {
			if (!err && (response && response.locations)) {
				that.log( "Finding DTV Locations (accessories)...");
				for (var i=0; i <response.locations.length; ++i) {
					if ((!that.excludeGeni) || (response.locations[i].clientAddr == '0')) {
						that.log( "Found DTV Location %s", response.locations[i].locationName);
						var accessory = new DirectvSTBAccessory(that.log, response.locations[i], that.config);
						foundAccessories.push(accessory);
					} else {
						that.log( "Found DTV Location %s, but EXCLUDING per configuration setting.", response.locations[i].locationName);
					}
				}
				callback(foundAccessories);
			} else {
				that.log( "Failed to find any DTV Locations (accessories) - Check IP address in config.json!");
				callback(null);
			}
        });
    }
}

function DirectvSTBAccessory(log, location, config) {
    // STB basic device info
    this.log = log;
	this.config = config;
    this.location = titleCase(location.locationName);
	this.config_name = config["name"] || 'DTV';
	this.name = this.location + ' ' + this.config_name;
	this.ip_address = config["ip_address"];
    this.clientAddr = location.clientAddr.toUpperCase();

}

DirectvSTBAccessory.prototype = {
    getRemote: function(type, callback){
        var that = this;
		switch(type) {
			case "power":
				remote.getMode(that.clientAddr, function (err, response) {
					if (err || response.mode == "1") {
						that.log('DTV location %s power state is currently OFF or UNREACHABLE', that.location);
						callback(null, false);
						return;
					} else if (response.mode == "0") {
						that.log('DTV location %s power state is currently ON', that.location);
						callback(null, true);
					}
				});
			break;
			case "channel":
				remote.getMode(that.clientAddr, function (err, response) {
					if (err || response.mode == "1") {
						that.log('Unable to call for current channel at DTV location %s.', that.location);
						callback(null, parseInt("0"));
					} else if (response.mode == "0") {
						remote.getTuned(that.clientAddr, function (err, response) {
							if (!err) {
								that.log('DTV location %s current channel is %d', that.location, parseInt(response.major));
								callback(null, parseInt(response.major));
							} else {
								that.log('Unable to call for current channel at DTV location %s.', that.location);
								callback(null, parseInt("0"));
							}
						});
					}
				});
			break;
		}
	},
    setRemote: function(type, value, callback){
        var that = this;
		switch(type) {
			case "power":
				remote.getMode(that.clientAddr, function (err, response) {
					var responseMode = response.mode;
					if (err) { responseMode = "1"}
					if (parseInt(responseMode) === parseInt(value ? 1 : 0)) {
						remote.processKey('power', that.clientAddr, function(err, response) {
							if (err) {
								that.log('Unable to change DTV location %s power state!', that.location);
								callback(new Error("STB Process Power Error."), false);
								return;
							} else {
								that.log('DTV location %s power state is now: %s', that.location, (value) ? 'ON' : 'OFF');
								callback();
							}
						});
					} else {
						callback();
					}
				});
			break;
			case "channel":
				remote.getMode(that.clientAddr, function (err, response) {
					if (err || response.mode == "1") {
						that.log('Unable to set channel at DTV location %s.', that.location);
						callback();
					} else if (response.mode == "0") {
						remote.tune(value, that.clientAddr, function(err, response) {
							if (err) {
								that.log('Unable to set channel at DTV location %s', that.location);
								callback();
							} else {
								that.log('DTV location %s Channel is now: %s', that.location, value);
								callback();
							}
						});
					}
				});
			break;
		}
    },
    getServices: function() {
        var that = this;
        var services = []
		if (this.clientAddr == '0') {
			this.service = new Service.Switch(this.name);

			this.service.getCharacteristic(Characteristic.On)
				.on('get', function(callback) { that.getRemote("power", callback);})
				.on('set', function(value, callback) {that.setRemote("power", value, callback);});
		} else {
			this.service = new Service.MotionSensor(this.name);

			this.service.getCharacteristic(Characteristic.MotionDetected)
				.on('get', function(callback) { that.getRemote("power", callback);});
		}
		this.service.addCharacteristic(ChannelCharacteristic)
			.on('get', function(callback) { that.getRemote("channel", callback);})
			.on('set', function(value, callback) {that.setRemote("channel", value, callback);});

        services.push(this.service);

        var service = new Service.AccessoryInformation();

        service.setCharacteristic(Characteristic.Manufacturer, "Directv")
            .setCharacteristic(Characteristic.Name, this.name)
			.setCharacteristic(Characteristic.SerialNumber, this.clientAddr)
			.setCharacteristic(Characteristic.Model, this.ip_address);

        services.push(service);

        return services;
    }
}

module.exports.accessory = DirectvSTBAccessory;
module.exports.platform = DirectvPlatform;

var Service, Characteristic, ChannelCharacteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

// we can only do this after we receive the homebridge API object
  makeChannelCharacteristic();

  homebridge.registerAccessory("homebridge-directv-location", "DirectvSTB", DirectvSTBAccessory);
  homebridge.registerPlatform("homebridge-directv", "Directv", DirectvPlatform);
};

function makeChannelCharacteristic() {

  ChannelCharacteristic = function () {
    Characteristic.call(this, 'Channel', '212131F4-2E14-4FF4-AE13-C97C3232499D');
    this.setProps({
      format: Characteristic.Formats.INT,
      unit: Characteristic.Units.NONE,
      maxValue: max_ch,
      minValue: min_ch,
      minStep: 1,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
    });
    this.value = this.getDefaultValue();
  };

  inherits(ChannelCharacteristic, Characteristic);
}
