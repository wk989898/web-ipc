const { execFile } = require('child_process')
const express = require('express')
const path = require('path')
const { stdout } = require('process')
const createIPC = require('../../../dist/server')

const app = express()
app.use(express.static('./public'))
app.get('/', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'))
})
/** ipc client */
app.get('/client.js', (req, res) => {
  res.sendFile(path.resolve('../../dist/client.js'))
})
const server = app.listen(3000, () => {
  console.log('run at http://127.0.0.1:3000')
})

const ipc = createIPC(server)
/**
 * If not otherwise specified, Clash by default reads the configuration file at $HOME/.config/clash/config.yaml.
 * If it doesn't exist, Clash will generate the default settings.
 */
var clash = null
var clash_path = './clash/clash-win64.exe'
ipc.on('start', () => {
  //start clash
  startClash()
}).on('restart', () => {
  killClash()
  startClash()
}).on('stop', () => {
  //stop clash
  killClash()
})
function startClash() {
  clash = execFile(clash_path)
  return clash
}
function killClash() {
  if (clash) {
    clash.kill('SIGHUP')
  }
}