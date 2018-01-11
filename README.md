# Broadlink RM Server for IFTTT control

This is a simple server that allows you to connect your Broadlink (tested with the RM mini 3) to your IFTTT account.

# Setup
- Get a IFTTT account and enable the Maker Webhooks: https://ifttt.com/maker_webhooks
- Download and install ngrok: https://ngrok.com/
- Install this repository by running ```npm install broadlink-rm-server```
- Install the Broadlink app and setup your home Wifi (I asume your Broadlink is connected to the same network as your server from now on)
- Download the RM Bridge app (Android only). This is needed to learn the IR codes for your appliances.

# Running with NPM
Create a file named ```index.js``` and add the following code:

```js
"use stict";
const PORT = process.env.PORT || 1880;

const BroadlinkServer = require('broadlink-rm-server');
const commands = require('./commands');

let app = BroadlinkServer(commands);
    app.listen(PORT);

console.log('Server running, go to http://localhost:' + PORT);
```

Create a file named ```commands.js``` and add:

```js
module.exports = [{
        "command": "TV_On",
        "secret": "AkDio83",
        "ip": "192.168.0.16",
        "data": "2600ca01000124901311131012361212121112121211121212361235131112361434133412361434140f141013101236150f131210121211123612361235121212351236123615331400051800011f4b10000cb6121512151214121710151216111512151215121512151215121415121217101512151513111513141413141411161116111412151215121611151215121512151314121512151214121710151413121512151215141314141115121611161015121512151215121611151215141312151315111412151215121512161115121512151215121512141314141315121215121611151215121512151215141411141512121710151215121611151414111513151115121412151215121514141115121512151215121512151214121512151215121512161115121512151215121513151114121512151215141411161116111513141215121413141215121710151215121512151215121512161115121412151512121611151215151214141314111512151214151212171015151212151215121512151215121611161015121512151215121512161115121512151214141312151215121512151215121512151414111513131514101512151215121514141115121512000d051211121212361235131112361434"
    },
    {
        "command": "Sound_On",
        "secret": "kIADLldepp398ufkk",
        "ip": "192.168.0.16",
        "data": "260032014e1327121412271214122613141214121411151115111412271214122712140002b94d1426131411271314112614141116101610151115111511251415102614150002b74d152513161026131610261316101511151115101610161026131610261316000ca04c1525141510261415102614151016101610161015111510261415102614150002b64e1426131610261316102613161016101511151016101610261316102613160002b74c152514151125141512241415111510161016101610151125141511251415000ca04d1425141610251515102514151115111510161016101610251416102514160002b44f1624141511251415112514151115101610161016101511251415112514150002b84c152514151125141511251415111510161016101610151125141511251415000d05000000000000"
    }
];
```

Configure this commands.js file with your commands and IP/Mac address of the BroadlinkRM.

Now run ```node index``` and the server should start. You will see in the console your Broadlink IP address, we will use it later.

# Learn some IR codes
Open the RM Bridge app and start the service, then, navigate to: http://rm-bridge.fun2code.de/rm_manage/code_learning.html

Configure the website with your RM Bridge IP and PORT and click Load devices. If you can't find your device you will need to manually add it using the *Add manually* option. Google how to get the MAC Address from the IP you got when running the server.

Once added, click on Learn Code and point your remote to the Broadlink, press the button you want to learn. You will get a JSON with the details to run this code, copy the *data* value (this is a HEX of the IR code you just sent to the Broadlink).

Modify the *commands.js* file with this code (follow the instructions there).

## Ngrok
In order to connect IFTTT to the PC/server running this code (like a Raspberry Pi), you will need a URL that tunnels to your device, this is done with ngrok. 

After installing ngrok, run: ```ngrok http 1880```

## IFTTT
For this instructions I'm going to setup my Google Home with the Broadlink, on IFTTT search for Google Assistant and enable it (https://ifttt.com/google_assistant). Then, create a new applet: https://ifttt.com/create.

### Trigger setup
- Click on *+this* and search for the Google Assistant.
- Select *Say a simple phrase*
- Set *What do you want to say?* with a command like "TV on".
- Set *What do you want the Assistant to say in response?* with a custom response like "Turning the TV on"
- Click on *Create trigger*

### Action setup
- Click on *+that* and search for Maker Webhooks
- Select *Make a web request*
- In the URL field, set your Ngrok URL and add at the end ```/command/YOUR_COMMAND_NAME```
- Method should be POST
- Content Type select *application/json*
- For the body set: ```{"secret":"YOUR_COMMAND_SECRET_HERE"}```
- Click *Create Action*

You should now be able to say *Ok Google, TV ON* and IFTTT will send a request to your local server that will relay the action to the Broadlink and turn on your TV!.

# Credits:
Some parts of the code are from @lprhodes Homebridge Broadlink:
https://github.com/lprhodes/homebridge-broadlink-rm

Also his module for the communication is used.