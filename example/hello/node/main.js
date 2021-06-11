const http = require('http')
const fs = require('fs')
const createIPC = require('../../../dist/server')

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
ipc.send('server broadcast') 
ipc.on('hello server', (e, arg) => {
  console.log(`receive ${arg}`);
  e.sender('hello client', {
    name: 'node',
    word: 'hello!'
  })
}).on('one more', (e, arg) => {
  console.log(`receive ${arg}`)
  e.sender('please', [1,2,3])
})
ipc.once('once',(e)=>{
  e.reply('once')
})

server.listen(8080, () => {
  console.log(`run at http://localhost:8080`);
})