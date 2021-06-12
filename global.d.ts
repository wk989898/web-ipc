import { ipcEvent } from "./src/common/ipc";

interface handleFunc {
  (event: ipcEvent, arg: any): any
}
interface Queue {
  [propName: string]: Map<string, handleFunc>
}
interface handleQueue {
  [propName: string]: handleFunc
}
type ipcType = 'web' | 'server'
type excuteType='send'|'invoke'
// declare const ws:WebSocket