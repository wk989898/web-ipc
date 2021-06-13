const express = require('express')
const app = express()
const path = require('path')
const createIPC = require('../../../dist/server')


const port = 3000
app.get('/', (req, res) => {
  res.sendFile(path.resolve('./client/index.html'))
}).get('/bundle.js', (req, res) => {
  res.sendFile(path.resolve('./client/dist/bundle.js'))
}).get('/client.js', (req, res) => {
  res.sendFile(path.resolve('../../dist/client.js'))
})
const server=app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const ipcMain=createIPC(server) // required