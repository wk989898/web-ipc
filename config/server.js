import babel from "rollup-plugin-babel";
import typescript  from "@rollup/plugin-typescript";
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input:'src/server.ts',
  output:{
    file:'dist/server.js',
    format:'cjs',
  },

  plugins:[
    typescript (),
    babel(),
    resolve(),
    commonjs()
  ],
}