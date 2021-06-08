const rollup = require('rollup')
const babel = require("rollup-plugin-babel")
const typescript = require("@rollup/plugin-typescript")
/**
 * rollup Client
 */
const inputClient = {
  input: '', // 唯一必填参数
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
  input: '', // 唯一必填参数
  external: '',
  plugins: [babel(), typescript()],
}
const outputServer = {
  file: '',   // 若有bundle.write，必填
  format: '', // 必填
}
async function buildServer() {
  const bundle = await rollup.rollup(inputOptions)
  const { code, map } = await bundle.generate(outputOptions);
  await bundle.write(outputOptions);
}