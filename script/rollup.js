const rollup = require('rollup')
const babel = require("rollup-plugin-babel")
const typescript = require("@rollup/plugin-typescript")
/**
 * rollup Client
 */
const inputClient = {
  input: '', 
  external: '',
  plugins: [babel(), typescript()],
}
const outputClient = {}
async function buildClient() {
  const bundle = await rollup.rollup(inputOptions)
  const { code, map } = await bundle.generate(outputOptions)
  await bundle.write(outputOptions)
}
/**
 * rollup Server
 */
const inputServer = {
  input: '', // 
  external: '',
  plugins: [babel(), typescript()],
}
const outputServer = {
  file: '',   // 
  format: '', // 
}
async function buildServer() {
  const bundle = await rollup.rollup(inputOptions)
  const { code, map } = await bundle.generate(outputOptions);
  await bundle.write(outputOptions);
}