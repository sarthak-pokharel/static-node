const http = require('http');
const webConf = require('./web-confs/web-config');
const HandleServer = require("./HandleServer");

const sPort = process.env.PORT || 5700;
let {log} = console;
log('Starting Server')
server = http.createServer(async function(request, response) {
    let handler = new HandleServer(request, response, webConf);
    handler.handleRequest();
});

server.listen(sPort, (err)=>{
    if(!err) log('Server at ', sPort);
})