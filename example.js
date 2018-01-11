"use stict";
const PORT = process.env.PORT || 1880;

const BroadlinkServer = require('./index'); // use require('broadlink-rm-server')
const commands = require('./commands');

let app = BroadlinkServer(commands);
    app.listen(PORT);

console.log('Server running, go to http://localhost:' + PORT);