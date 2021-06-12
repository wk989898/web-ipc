import { IPC } from "./common/ipc";
const WSocket = require('ws')

export default function createIPC(server: any): IPC {
  const wss = new WSocket.Server({ noServer: true });
  const ipc = new IPC()
  wss.on('connection', async function connection(ws) {
    await ipc.connect(ws)
    ipc.serverSend()
    ws.on('message', function incoming(msg) {
      const { channel,type, args } = JSON.parse(msg)
      ipc.excute(channel, type,args)
    })
  })
  server.on('upgrade', function upgrade(request, socket, head) {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    })
  })
  return ipc
}