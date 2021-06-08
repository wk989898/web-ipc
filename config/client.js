import babel from "rollup-plugin-babel";
import typescript  from "@rollup/plugin-typescript";
import resolve from 'rollup-plugin-node-resolve';

export default {
  input:'src/client.ts',
  output:{
    file:'dist/client.js',
    format:'iife',
    name:'createIPC'
  },
  plugins:[
    typescript(),
    babel(),
    resolve()
  ],
}