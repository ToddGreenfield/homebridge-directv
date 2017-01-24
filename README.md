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

Note: Version 0.0.5 changes the plugin from an Accessory to a Platform. It will also auto detect all Geni STB's (Set Top Box) as part of whole-house systems attached to the primary server STB whose IP is provided. 
It does NOT however have the ability to power on/off the remote boxes. From everything I have read this is a limitation/problem with the Directv Geni boxes. 
All other functions which are part of the directv-remote package work (which channel, menu, etc), however those are not yet implemented as part of the plugin (looking for assistance with Characteristics).

	
##Configuration
Example config.json:

```js
    "platforms": [
		{
			"platform": "Directv",
			"name": "DTV",
			"ip_address": "192.168.1.101"
		}
	],
```

###Explanation:

Field           | Description
----------------|------------
**platform**    | Must always be "Directv". (required)
**name**        | The name you want to use for control the DTV accessories. (Optional) This parameter defaults to DTV and is appended to the LocationName defined on your STB to produce the full accessory Name. 
**ip_address**  | The internal ip address of your Primary DTV STB (Set Top Box).

##Limitations:

Power is the only function at this time, and only for the primary STB (the one with the IP). Additional functions such as current channel, changing channel, will be worked on.
