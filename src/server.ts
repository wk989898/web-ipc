import { ipcMain } from "./common/ipc";
const WSocket = require('ws')

export default function createIPC(server: any): ipcMain {
  const wss = new WSocket.Server({ noServer: true })
  const ipc = new ipcMain()
  wss.on('connection', async function connection(ws) {
    await ipc.connect(ws)
    ipc.broadcast()
    ws.on('message', function incoming(msg) {
      const { channel, args } = JSON.parse(msg)
      if (channel.startsWith('$'))
        ipc.excuteSync(channel.slice(1), args)
      else
        ipc.excute(channel, args)
    })
  })
  server.on('upgrade', function upgrade(request, socket, head) {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    })
  })
  return ipc
}