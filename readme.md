# web-ipc

Electron ipc APIs  simply implement on the web,based websocket.  
Communicate between the server and web client.

## idea

What we run on electron can also be run on node.  
See demo for inspiration.

## notice

* in web client,`createIPC` returned a promise,so use `async await`.
* use '$' and '#' in `invoke/handle`,so don't start with them.
