const http = require('http')
const fs = require('fs')
const createIPC = require('../../../dist/server')
const { execSync } = require('child_process')

const server = http.createServer((req, res) => {
  var file
  if (req.url == '/client.js') {
    file = fs.readFileSync('../../dist/client.js')
  }
  else {
    file = fs.readFileSync('./client/index.html')
  }
  res.end(file)
})

const ipc = createIPC(server)
ipc.on('ShutDown', (e, arg) => {
  e.reply('confirm')
})
ipc.on('confirm', (e, arg) => {
  console.log('ShutDown');
  execSync('shutdown -s -t 00')
})

server.listen(8080, () => {
  console.log(`run at http://localhost:8080`);
})