'use strict';

// Directv Platform for HomeBridge
//
// Remember to add platform to config.json. Example:
// "platforms": [
//     {
//         "platform": "Directv",				// required
//         "name": "DTV",						// Optional - defaults to DTV
//         "ip_address": "IP of Primary STB", 	// required
//     }
// ], 
//
//  TO DO - Add Characteristic to change channels
//
//

var DirecTV = require('directv-remote');
var titleCase = require('title-case');
var remote;

function DirectvPlatform(log, config){
	this.config = config;
    this.ip_address = config["ip_address"];
	this.name = config["name"] || 'DTV';
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
			if (!err) {
				that.log( "Finding DTV Locations (accessories)...");
				for(var i=0; i <response.locations.length; ++i){
					that.log( "Found DTV Location %s", response.locations[i].locationName);
					var accessory = new DirectvSTBAccessory(that.log, response.locations[i], that.config);
					foundAccessories.push(accessory);
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
		var status;
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
	},
    setRemotePower: function(state, callback){
        var that = this;
		remote.processKey('power', that.clientAddr, function(err, reponse) {
			if (err) {
				that.log('Unable to change DTV location %s power state!', that.location);
				callback(new Error("STB not responding."), false);
				return;
			} else {
				that.log('DTV location %s power state is now: %s', that.location, (state) ? 'ON' : 'OFF');
                callback();
            }
        });
    },
    getServices: function() {
        var that = this;
        var services = []
        this.service = new Service.Switch(this.name);

		this.service.getCharacteristic(Characteristic.On)
			.on('get', function(callback) { that.getRemote("power", callback);})
			.on('set', function(value, callback) {that.setRemotePower(value, callback);});

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

var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-directv-location", "DirectvSTB", DirectvSTBAccessory);
  homebridge.registerPlatform("homebridge-directv", "Directv", DirectvPlatform);
};