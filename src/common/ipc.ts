import { Queue, handleFunc, ipcType } from "../../global"

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
  listeners(channel: string): Array<handleFunc> {
    const queue = Array.from(this.queue[channel].values())
    const once = Array.from(this.onceQueue[channel].values())
    return queue.concat(once)
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
  public hasTarget: boolean = false
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
    this.hasTarget = true
  }
  protected checkTarget() {
    if (!this.hasTarget) {
      throw new Error("please add a Server!");
    }
  }
  excute(channel: string, args?: any) {
    if (this.queue[channel] === void 0) this.queue[channel] = new Map()
    this.queue[channel].forEach(async (func: handleFunc, sym: string) => {
      const ev = new ipcEvent()
      await ev.connect(this.server)
      func(ev, args)
    })
    if (this.onceQueue[channel] === void 0) this.onceQueue[channel] = new Map()
    this.onceQueue[channel].forEach(async (func: handleFunc, sym: string) => {
      const ev = new ipcEvent()
      await ev.connect(this.server)
      func(ev, args)
    })
    this.onceQueue[channel].clear()
  }
}

export class IPC extends Server {
  protected ipcType: ipcType
  private serverQueue: string[] = []
  constructor() {
    super()
    this.ipcType = typeof window == 'undefined' ? 'server' : 'web'
  }
  send(channel: string, args?: any): IPC {
    // send message
    const data = {
      channel,
      args
    }
    console.log(this.ipcType)
    const res = JSON.stringify(data)
    if (this.ipcType === 'server')
      this.serverQueue.push(res)
    else {
      this.checkTarget()
      this.server.send(res)
    }
    return this
  }
  serverSend(): void {
    this.serverQueue.forEach(res => this.server.send(res))
    this.serverQueue.length = 0
  }
}

export class ipcEvent extends Server {
  constructor() {
    super()
  }
  sender(channel: string, args?: any) {
    this.checkTarget()
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
