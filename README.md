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
module.exports = [];
```

Configure this commands.js file with your commands and IP/Mac address of the BroadlinkRM (see below).

Now run ```node index``` and the server should start. You will see in the console your Broadlink IP address, we will use it later.

# Learn IR codes
Learning codes is now built in with the server, in order to enable it, edit your index file and modify the line:

```js
let app = BroadlinkServer(commands);
```

After commands, set TRUE to enable the learning mode.

```js
let app = BroadlinkServer(commands, true);
```

Now run the server with ```node index``` and open your browser, go to your server url and add */learn/command/MAC_OR_IP*, point your remote to the Broadlink and press the key you want to attach to the command. You will get a response like this:

```js
{
    command: "Projector",
    secret: "dnja9kdtn",
    mac: "34:ea:34:bb:16:1a",
    ip: false,
    data:"260058000001289413121213111413121213111413121114113911391238113911391238111412381114123811141213111411141212121410391214103912391237113912391237110005490001264b12000c5e0001264b11000d05"
}
```

Add this command to your command.js array and save. Remember to disable the learning mode by removing the true or setting it to false.

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