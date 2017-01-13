#Homebridge-directv

DirecTV plugin for [Homebridge](https://github.com/nfarina/homebridge)
Leverages [directv-remote](https://www.npmjs.com/package/directv-remote)

This plugin allows you to control your DirecTV with HomeKit and Siri.

##Installation
1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-directv`
3. Update your configuration file like the example below.
4. Make sure to enable external device access on your cable box:
	Menu > Settings > Whole-Home > External Device > Allow

##Configuration
Example config.json:

```js
    "accessories": [
		{
			"accessory": "Directv",
			"name": "Main DTV",
			"ip_address": "192.168.1.101"
		}
	],
```

###Explanation:

Field           | Description
----------------|------------
**accessory**   | Must always be "Directv". (required)
**name**        | The name you want to use to control the DTV.
**ip_address**  | The internal ip address of your Primary DTV STB (Set Top Box).

##Limitations:

Power is the only function at this time. Additional functions such as channel will be worked on, also the ability to control secondary Geni STBs as part of whole-house systems.
