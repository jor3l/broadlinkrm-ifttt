"use strict";

const BroadlinkServer = require('./index');
const commands = require('./commands');

const port = process.env.PORT || 1880;
const key = "YOUR_SECRET";

const rooms = [];
rooms["ROOM_NAME"] = {host:"MAC_OR_IP",groups:["GROUP_A", "GROUP_B"]};

let app = BroadlinkServer(commands, key, rooms);
app.listen(port);

console.log('Server running, go to http://localhost:' + port);
