import { IPC } from "./common/ipc";

export default async function createIPC(): Promise<undefined|IPC> {
  if (location.protocol == 'file:') {
    console.error('must run at server!')
    return 
  }
  const protocol = location.protocol == 'http:' ? 'ws' : 'wss'
  const hostname = location.hostname
  const port = location.port == '' ? location.protocol == 'http:' ? '80' : '443' : location.port;
  const url = `${protocol}://${hostname}:${port}`;
  const ws = new WebSocket(url)
  const ipc = new IPC()
  await ipc.connect(ws)
  ws.addEventListener('message', (event) => {
    const res = event.data
    const data = JSON.parse(res)
    const { channel, args } = data
    ipc.excute(channel, args)
  })
  return ipc
}


