import { ipcEvent } from "./src/common/ipc";

interface handleFunc {
  (event: ipcEvent, arg: any): any
}
interface Queue {
  [propName: string]: Map<string, handleFunc>
}
type ipcType = 'web' | 'server'
// declare const ws:WebSocket