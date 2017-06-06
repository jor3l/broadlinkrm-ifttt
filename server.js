"use strict";
const PORT = process.env.PORT || 1880;

/* Modules */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const uuid = require('uuid/v4');
const request = require('request');

/* Setup */
const commands = require('./commands');
const Broadlink = require('./device');

/* Server */
let app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/command/:name', function(req, res) {
    const command = commands.find((e) => { return e.command == req.params.name; });

    if (command && req.body.secret && req.body.secret == command.secret) {
        const host = command.mac || command.ip;
        const device = Broadlink({ host });
        const hexData = command.data;

        if (!device) {
            console.log(`${name} sendData(no device found at ${host})`);
        } else if (!device.sendData) {
            console.log(`[ERROR] The device at ${device.host.address} (${device.host.macAddress}) doesn't support the sending of IR or RF codes.`);
        } else if (hexData.includes('5aa5aa555')) {
            console.log('[ERROR] This type of hex code (5aa5aa555...) is no longer valid. Use the included "Learn Code" accessory to find new (decrypted) codes.');
        } else {
            const hexDataBuffer = new Buffer(hexData, 'hex');
            device.sendData(hexDataBuffer);

            return res.sendStatus(200);
        }

        res.sendStatus(501);
    } else {
        console.log('Command not found', req.params.name);
        res.sendStatus(400);
    }
});

app.listen(PORT);
console.log('Server running, go to http://localhost:' + PORT);