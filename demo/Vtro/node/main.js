const http = require('http')
const fs = require('fs')
const path = require('path')
const cp = require('child_process')
const process = require('process')
const dns = require('dns')
const ping = require('ping')
const util = require('util')
const tcping = util.promisify(require('tcp-ping').ping)
const createIPC = require('../../../dist/server')
const urlTest = require('./url-test')
const express = require('express')
const app = express()


const port = 3000
app.get('/', (req, res) => {
  res.sendFile(path.resolve('./client/index.html'))
}).get('/bundle.js', (req, res) => {
  res.sendFile(path.resolve('./client/dist/bundle.js'))
}).get('/client.js', (req, res) => {
  res.sendFile(path.resolve('../../dist/client.js'))
})
const appServer = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


const ipcMain = createIPC(appServer) // required
/**
 *  repository: https://github.com/wk989898/Vtro
 */
var win, tray, trojan, privo, privoxypid, trojanpid, server = null
var other = {
  isIP: true,
  fast_open: false,
  reuse_port: false,
  reuse_session: true
}

function getCommandLine() {
  switch (process.platform) {
    case 'darwin': return 'open';
    case 'win32': return 'start';
    case 'win64': return 'start';
    default: return 'xdg-open';
  }
}
function openItem(file) {
  return cp.exec(getCommandLine() + ' ' + file)
}

function send(channel, args) {
  return ipcMain.send(channel, args) // modify
}
function trigger(event) {
  const cb = ipcMain.listeners(event)[0]
  if (type(cb) === 'function') cb({ reply: send })
  else
    console.log(`not found Event ${event}\n,trigger failed`);
}

function type(a) {
  return Object.prototype.toString.call(a).slice(8).replace(']', '').toLowerCase()
}
function _path(p) {
  return path.resolve(p)
}
function formatTime(...args) {
  const [a = '-', b = ' ', c = ':'] = args
  const now = new Date()
  return now.getFullYear().toString() + a +
    now.getMonth().toString().padStart(2, '0') + a +
    now.getDay().toString().padStart(2, '0')
    + b +
    now.getHours().toString().padStart(2, '0') + c +
    now.getMinutes().toString().padStart(2, '0') + c +
    now.getSeconds().toString().padStart(2, '0')
}
function appendLog(err, path) {
  if (!err) return;
  if (path === null || path === void 0) path = _path('./trojan/log.txt')
  fs.appendFile(path, formatTime() + err + '\n', 'utf-8', () => { })
}
function createServer() {
  const server = http.createServer()
  server.on('request', (req, res) => {
    if (req.url === '/pac') {
      res.setHeader('Content-Type', 'application/x-ns-proxy-autoconfig')
      fs.readFile(_path('./proxy/proxy.pac'), (e, data) => {
        if (e) res.end('error')
        res.end(data)
      })
    }
  })
  return server
}
function makeproxy(type, arg, list) {
  cp.execFile('./sysproxy.exe', [type, arg, list], {
    cwd: _path('./proxy'),
    windowsHide: true
  }, (err, stdout, stderr) => {
    if (err) appendLog(err) && server && server.close()
    if (stderr) appendLog(stderr)
  })
}
function privoxy() {
  privo = cp.execFile('./privoxy.exe', {
    cwd: _path('./proxy'),
    windowsHide: true
    // shell: true,
  }, (err) => {
    let log = 'privoxy error!has you close privoxy?\nplease check http://localhost:1081\n'
    if (err) appendLog(log) && server && server.close()
  })
  privoxypid = privo.pid
}
function allquit() {
  trojan && trojan.kill()
  privo && privo.kill()
  if (server != null) {
    server.close()
    server = null
  }
}
async function addfile(name, chunk, cb) {
  if (!chunk) {
    appendLog(`there is no data to be added`)
    return Promise.resolve(false)
  }
  await openConf('a', null, res => {
    cb && cb(res)
    if (type(chunk) === 'array') {
      res[name].unshift(...chunk)
    } else { res[name].unshift(chunk) }
  })
  return Promise.resolve(true)
}
function deleteData(name, condition) {
  openConf('a', null, res => {
    if (type(res[name]) === 'array') {
      res[name] = res[name].filter(v => {
        return condition(v)
      })
    }
  })
}
async function openConf(type, data = '', cb, any) {
  let file = _path('./trojan/conf.json')
  if (type === 'r') {
    return await fs.readFile(file, 'utf-8', (err, res) => {
      if (err) appendLog(err)
      res = JSON.parse(res.toString())
      cb(res)
    })
  } else if (type === 'w') {
    return await fs.writeFile(file, JSON.stringify(data), err => {
      if (err) appendLog(err)
    })
  } else if (type === 'a') {
    return await fs.readFile(file, 'utf-8', (err, res) => {
      if (err) appendLog(err)
      res = JSON.parse(res.toString())
      cb(res)
      fs.writeFileSync(file, JSON.stringify(res))
    })
  }
}
function changeConfig() {
  fs.readFile(_path('./trojan/config.json'), 'utf-8', (err, res) => {
    if (err) appendLog(err)
    let data = JSON.parse(res.toString())
    openConf('r', null, async res => {
      let now
      const { isIP = true, fast_open = false, reuse_port = false, reuse_session = true } = other
      if (!res.config.night.ip) now = res.config.day
      else now = res.config.mode === 'night' ? res.config.night : res.config.day
      //first as default
      if (!now.ip && res.nodes[0]) {
        now = res.nodes[0]
        res.config.day = now
        send('config', res.config)
      }
      // password,addr,port
      data.remote_addr = isIP ? now.ip : now.addr
      data.remote_port = now.port
      data.password[0] = now.password
      // socks5 port
      data.local_port = res.config.listen[0] || 1080
      // other
      data.tcp.reuse_port = reuse_port
      data.tcp.fast_open = fast_open
      data.ssl.reuse_session = reuse_session
      await fs.writeFile(_path('./trojan/config.json'), JSON.stringify(data), 'utf-8', err => {
        if (err) appendLog(err)
      })
    })
  })
}
let received = 0, sent = 0
function flow(trojan = trojan) {
  trojan.stderr.on('data', data => {
    data.replace(/(\d*) bytes received, (\d*) bytes sent/, (e, $1, $2) => {
      if ($1 && $2) {
        received += Number($1)
        sent += Number($2)
        send('flow', [received, sent])
      }
    })
  }).on('close', () => {
    received = 0;
    sent = 0
  })
}
ipcMain.on('link', (e, type) => {
  allquit()
  changeConfig()
  trojan = cp.execFile('trojan.exe', {
    cwd: _path('./trojan'),
    windowsHide: true
  }, (err, stdout, stderr) => {
    if (stderr) appendLog(stderr, _path('./trojan/trojan-log.txt'))
  })

  flow(trojan)
  trojanpid = trojan.pid

  let arg
  openConf('r', null, res => {
    const type = res.config.proxy || 'pac'
    const [p1, p2 = 1081, p3 = 1082] = res.config.listen
    fs.readFile(_path('./proxy/config.txt'), (err, res) => {
      if (err) appendLog(err)
      let c = res.toString()
      let l = c.replace(/(listen-address.+\:)\d+\n/, `$1${p2}\n`)
        .replace(/(forward-socks5.+\:)\d+.+\n/, `$1${p1} .\n`)
      fs.writeFileSync(_path('./proxy/config.txt'), l, () => { })
    })
    if (type === 'global') {
      arg = `http://127.0.0.1:${p2}`
      let list = `localhost;127.*`
      makeproxy(type, arg, list)
      privoxy()
    } else if (type === 'pac') {
      // default
      if (server == null)
        server = createServer()
      arg = `http://127.0.0.1:${p3}/pac`
      !server.listening && server.listen(p3, '127.0.0.1', () => {
        makeproxy(type, arg)
        privoxy()
      })
    } else makeproxy('set', 1)
  })
  e.reply('linked')
  console.log('trojan open')
}).on('close', (e, r) => {
  allquit()
  e.reply('closed')
  console.log('trojan closed')
})

ipcMain.on('get-nodes', e => {
  openConf('r', null, res => {
    if (!res.nodes) return appendLog(`please check your conf.json`)
    e.reply('update-nodes', res.nodes)
  })
}).on('change-linkNode', (e, node) => {
  if (!node) return;
  openConf('a', null, res => {
    res.config.day = node
    e.reply('config', res.config)
  })
}).on('change-nightNode', (e, node) => {
  if (!node) return;
  openConf('a', null, res => {
    res.config.night = node
    e.reply('config', res.config)
  })
}).on('change-mode', (e, mode) => {
  openConf('a', null, res => {
    res.config.mode = mode
    e.reply('update-mode')
  })
})
ipcMain.on('get-sub', e => {
  openConf('r', null, res => {
    e.reply('subs', res.sub || [])
  })
}).on('update', (e, r) => {
  addfile('nodes', r.nodes, res => {
    // clear nodes
    res.nodes.length = 0
  }).finally(e => {
    setTimeout(() => {
      addfile('sub', r.sub, res => {
        res.sub.length = 0
      })
    }, 1000)
  })
}).on('remove-sub', (e, sub) => {
  deleteData('sub', v => {
    return v !== sub
  })
  e.reply('removed')
}).on('sub-proxy', (e, proxy) => {
  if (proxy)
    fs.readFile(_path('./trojan/config.json'), async (err, res) => {
      if (err) appendLog(err)
      const { local_addr, local_port } = JSON.parse(res.toString())
      let socks5 = `socks://${local_addr}:${local_port},localhost`
      win.webContents.session.setProxy({ proxyRules: socks5 })
    })
  else win.webContents.session.setProxy({})
})

ipcMain.on('add-node', (e, node) => {
  if (!node.ip)
    dns.resolve4(node.addr, (err, addresses) => {
      if (err) node.ip = '0';
      type(addresses) === 'array' && (addresses = (addresses[0]))
      node.ip = addresses
      addfile('nodes', node)
    })
  else addfile('nodes', node)
}).on('delete-node', (e, ip) => {
  deleteData('nodes', v => {
    if (v.ip) return v.ip !== ip
    return v.addr !== v.addr
  })
  e.reply('deleted')
}).on('update-node', (e, nodes) => {
  openConf('a', null, res => {
    res.nodes = nodes
  })
})

ipcMain.on('getConf', e => {
  openConf('r', null, res => {
    e.reply('config', res.config)
  })
}).on('setConf', (e, conf) => {
  openConf('a', null, res => {
    Object.assign(res.config, conf)
    e.reply('config', res.config)
  })
  setTimeout(() => {
    trigger('link')
  }, 1e3);
})
ipcMain.on('set-login', (e, isLogin) => {
  // app.setLoginItemSettings({
  //   openAsHidden: true,
  //   openAtLogin: isLogin
  // })
}).on('get-login', e => {
  // e.reply('login', app.getLoginItemSettings().openAtLogin)
}).on('other', (e, [type, bool]) => {
  // other options
  if (type in other)
    other[type] = bool
})

ipcMain.on('pac', e => {
  cp.exec('node fetchPAC.js', {
    cwd: _path('./proxy'),
    windowsHide: true
    // shell: true,
  }, (err, stdout, stderr) => {
    let log = 'update PAC failed'
    if (err) appendLog(log)
    appendLog(stdout)
  })
}).on('trojan-log', e => {
  // shell.openItem(_path('trojan/trojan-log.txt'))
  openItem(_path('trojan/trojan-log.txt'))
}).on('link-log', e => {
  // shell.openItem(_path('trojan/log.txt'))
  openItem(_path('trojan/log.txt'))
}).on('change_log_level', (e, level) => {
  fs.readFile(_path('trojan/config.json'), (err, res) => {
    if (err) appendLog(err)
    let data = JSON.parse(res)
    data['log_level'] = level
    fs.writeFile(_path('trojan/config.json'), JSON.stringify(data), err => { })
  })
}).on('get_log_level', e => {
  fs.readFile(_path('trojan/config.json'), (err, res) => {
    if (err) appendLog(err)
    const level = JSON.parse(res)['log_level']
    e.reply('log_level', level)
  })
})

ipcMain.on('ping', (e, host) => {
  ping.promise.probe(host.addr, {
    timeout: 10
  }).then(r => e.reply('ping', r))
}).on('tcping', (e, host) => {
  tcping({
    address: host.ip || host.addr,
    port: host.port || 443,
    attempts: 5,
  }).then(r => e.reply('tcping', r))
}).on('url-test', e => {
  urlTest().then(res => e.reply('url-test', res))
})
