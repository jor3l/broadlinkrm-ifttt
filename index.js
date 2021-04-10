"use strict";

/* Modules */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
//const uuid = require('uuid/v4');
const { v4: uuid } = require('uuid');
const request = require('request');
const macRegExp = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

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

module.exports = (commands, learnEnabled = false) => {
    /* Server */
    let app = express();

    app.use(helmet());
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    (learnEnabled && app.get('/learn/:command/:mac', (req, res) => {
        let host = req.params.mac;
        let device = Broadlink({ host, learnOnly: true });
        if(device) {
            if (!device.enterLearning) return es.json({error: `Learn Code (IR learning not supported for device at ${host})`});
            if (!device.enterLearning && !device.enterRFSweep) return res.json({error:`Scan RF (RF learning not supported for device at ${host})`});

            (device.cancelRFSweep && device.cancelRFSweep());

            let cancelLearning = () => {
                (device.cancelRFSweep && device.cancelRFSweep());
                device.removeListener('rawData', onRawData);

                clearTimeout(getTimeout);
                clearTimeout(getDataTimeout);
            };

            let getTimeout = setTimeout(() => {
                cancelLearning();
                res.json({error: 'Timeout.'});
            }, 20000);

            let getDataTimeout = setTimeout(() => {
                getData(device);
            }, 1000);

            const getData = (device) => {
                if (getDataTimeout) clearTimeout(getDataTimeout);
              
                device.checkData()
              
                getDataTimeout = setTimeout(() => {
                  getData(device);
                }, 1000);
            }

            let onRawData = (message) => {
                cancelLearning();

                return res.json({
                    command: req.params.command,
                    secret: Math.random().toString(36).substring(3),
                    mac: (macRegExp.test(host)) ? host : false,
                    ip: (macRegExp.test(host)) ? false : host,
                    data: message.toString('hex')
                });
            };

            device.on('rawData', onRawData);

            // Start learning:
            (device.enterLearning ? device.enterLearning() : device.enterRFSweep());
        } else {
            res.json({error: `Device ${host} not found`});
        }
    }));

    app.post('/command/:name', (req, res) => {
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
            res.sendStatus(404);
        }
    });

    return app;

}
