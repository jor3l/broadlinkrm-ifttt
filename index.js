"use strict";

/* Modules */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const uuid = require('uuid/v4');
const request = require('request');

/* Setup */
const Broadlink = require('./device');

function sendData(device = false, hexData = false) {
    if(device === false || hexData === false) {
        console.log('Missing params, sendData failed', typeof device, typeof hexData);
        return;
    }

    const hexDataBuffer = new Buffer(hexData, 'hex');
    device.sendData(hexDataBuffer);
}

module.exports = (commands) => {
    /* Server */
    let app = express();

    app.use(helmet());
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.post('/command/:name', function(req, res) {
        const command = commands.find((e) => { return e.command == req.params.name; });

        if (command && req.body.secret && req.body.secret == command.secret) {
            let host = command.mac || command.ip;
            let device = Broadlink({ host });

            if (!device) {
                console.log(`${req.params.name} sendData(no device found at ${host})`);
            } else if (!device.sendData) {
                console.log(`[ERROR] The device at ${device.host.address} (${device.host.macAddress}) doesn't support the sending of IR or RF codes.`);
            } else if (command.data && command.data.includes('5aa5aa555')) {
                console.log('[ERROR] This type of hex code (5aa5aa555...) is no longer valid. Use the included "Learn Code" accessory to find new (decrypted) codes.');
            } else {
                if('sequence' in command) {
                    console.log('Sending sequence..');
                    for(var i in command.sequence) {
                        let find = command.sequence[i];
                        let send = commands.find((e) => { return e.command == find; });
                        if(send) {
                            setTimeout(() => {
                                console.log(`Sending command ${send.command}`)
                                sendData(device, send.data);
                            }, 1000 * i);
                        } else {
                            console.log(`Sequence command ${find} not found`);
                        }
                    }
                } else {
                    sendData(device, command.data);
                }

                return res.sendStatus(200);
            }

            res.sendStatus(501);
        } else {
            console.log(`Command not found: ${req.params.name}`);
            res.sendStatus(400);
        }
    });

    return app;

}