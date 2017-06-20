# Homebridge-directv

DirecTV plugin for [Homebridge](https://github.com/nfarina/homebridge)
Leverages [directv-remote](https://www.npmjs.com/package/directv-remote)

This plugin allows you to control your DirecTV with HomeKit and Siri.

## Installation
1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-directv`
3. Update your configuration file like the example below.
4. Make sure to enable external device access on your cable box:
	Menu > Settings > Whole-Home > External Device > Allow

This plugin is a Platform and it will show the Primary STB (Set Top Box) (the one with the ip address)as a Switch.  
It will also auto detect all Geni STB's and show them as Motion Sensors (since they cannot be powered on/off due to a limitation with the Geni STBs).  
In both cases, you can change the channel in the room using an app like Eve (Elagato) via the slider (a bit challenging) or you can tune the device to a favorite channel and then create a scene like "Channel 4" or "NBC".  
Scenes created in Eve will show up in the Apple Home app and give the ability to tell Siri to "Set Channel 4" or "Set NBC"!
	
# Configuration
Example config.json:

```js
    "platforms": [
		{
			"platform": "Directv",
			"name": "DTV",
			"ip_address": "192.168.1.101",
			"exclude_geni": true,
			"min_channel": 1,
			"max_channel": 575
		}
	],
```

## Explanation:

Field           | Description
----------------|------------
**platform**    | Must always be "Directv". (required)
**name**        | The name you want to use for control the DTV accessories. (Optional) This parameter defaults to DTV and is appended to the LocationName defined on your STB to produce the full accessory Name. 
**ip_address**  | The internal ip address of your Primary DTV STB (Set Top Box).
**exclude_geni**| (Optional) boolean for excluding non-primary STBs (Geni's) so accessories are not created for them. If true, will only create accessory for primary bound tuner STB. Defaults to false.
**min_channel**| (Optional) Starting number for channel slider. Defaults to 1.
**max_channel**| (Optional) Ending number for channel slider. Defaults to 575. Can be used to select higher channel numbers and ease selection for scenes.

# Limitations:

Power only works for the primary STB (the one with the IP).
Apple Home app cannot change channels without first creating a scene in an app like Eve (Elagato). To allow for ease of setting up channel scenes: 1) Temporarily set reasonable values for min/max channel config settings; 2) Restart homebridge, setup channel scenes in that range; 3) Repeast steps 1-2 as needed; 4) Finally update config with min value of 1 and max of 9999, then restart homebridge. All scenes should work fine.