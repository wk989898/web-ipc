import { Queue, handleFunc } from "../../global"

class Observer {
  protected queue: Queue
  protected onceQueue: Queue
  constructor() {
    this.queue = {}
    this.onceQueue = {}
  }
  private checkChannel(channel: string) {
    if (this.queue[channel] === void 0) this.queue[channel] = new Map()
    if (this.onceQueue[channel] === void 0) this.onceQueue[channel] = new Map()
  }
  on(channel: string, listener: handleFunc): Observer {
    const sym = JSON.stringify(listener)
    this.checkChannel(channel)
    this.queue[channel].set(sym, listener)
    return this
  }
  once(channel: string, listener: handleFunc): Observer {
    const sym = JSON.stringify(listener)
    this.checkChannel(channel)
    this.onceQueue[channel].set(sym, listener)
    return this
  }
  removerListener(channel: string, listener: handleFunc): Observer {
    const sym = JSON.stringify(listener)
    this.checkChannel(channel)
    this.queue[channel].delete(sym)
    this.onceQueue[channel].delete(sym)
    return this
  }
  removerALLListener(channel: string): Observer {
    this.checkChannel(channel)
    this.queue[channel].clear()
    this.onceQueue[channel].clear()
    return this
  }
}

class Server extends Observer {
  protected server: WebSocket
  public hasServer: boolean = false
  constructor() {
    super()
  }
  async connect(server: WebSocket) {
    this.server = server
    if (this.server.readyState == 0) {
      await new Promise(resolve => {
        this.server.addEventListener('open', () => resolve(null))
      })
    }
    this.hasServer = true
  }
  protected checkServer() {
    if (!this.hasServer) {
      throw new Error("please add a Server!");
    }
  }
  excute(channel: string, args?: any) {
    if (this.queue[channel] === void 0) this.queue[channel] = new Map()
    this.queue[channel].forEach((func: handleFunc, sym: string) => {
      const ev = new ipcEvent()
      ev.connect(this.server)
      func(ev, args)
    })
    if (this.onceQueue[channel] === void 0) this.onceQueue[channel] = new Map()
    this.onceQueue[channel].forEach((func: handleFunc, sym: string) => {
      const ev = new ipcEvent()
      ev.connect(this.server)
      func(ev, args)
    })
    this.onceQueue[channel].clear()
  }
}

export class IPC extends Server {
  constructor() {
    super()
  }
  // private server:WebSocket
  // private hasServer:boolean=false
  // connect(server:WebSocket):void{
  //   this.server=server
  //   this.hasServer=true
  // }
  // private checkServer() {
  //   if (!this.hasServer){
  //     throw new Error("please add a Server!");
  //  }
  // }
  send(channel: string, args?: any): IPC {
    this.checkServer()
    // send message
    const data = {
      channel,
      args
    }
    const res = JSON.stringify(data)
    this.server.send(res)
    return this
  }
}

export class ipcEvent extends Server {
  constructor() {
    super()
  }
  // private server:WebSocket
  // private hasServer:boolean=false
  // connect(server:WebSocket):void{
  //   this.server=server
  //   this.hasServer=true
  // }
  // private checkServer() {
  //   if (!this.hasServer){
  //     throw new Error("please add a Server!");
  //  }
  // }
  sender(channel: string, args?: any) {
    this.checkServer()
    const data = {
      channel,
      args
    }
    const res = JSON.stringify(data)
    this.server.send(res)
  }
  /**
   * reply 
   */
  reply(channel: any, args?: any) {
    this.sender(channel, args)
  }
}
