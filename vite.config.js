// import {
//   defineConfig
// } from 'vite';
// import solidPlugin from 'vite-plugin-solid';
// import {
//   NodeGlobalsPolyfillPlugin
// } from '@esbuild-plugins/node-globals-polyfill';
// import {
//   NodeModulesPolyfillPlugin
// } from '@esbuild-plugins/node-modules-polyfill';

// export default defineConfig({
//   plugins: [
//     solidPlugin(),
//     NodeGlobalsPolyfillPlugin({
//       buffer: true
//     }),
//     NodeModulesPolyfillPlugin()
//   ],
//   resolve: {
//     alias: {
//       'rpc-websockets/dist/lib/client': 'rpc-websockets/dist/lib/client/websocket.browser'
//     }
//   },
//   build: {
//     target: 'esnext',
//     polyfillDynamicImport: false,
//   },
//   server: {
//     port: 3000,
//   },
// });

// import {
//   defineConfig
// } from "vite";
// import solidPlugin from "vite-plugin-solid";

// export default defineConfig({
//   plugins: [solidPlugin()],
//   optimizeDeps: {
//     exclude: [
//       "rpc-websockets/dist/lib/client",
//       "rpc-websockets/dist/lib/client/websocket.browser",
//     ],
//   },
// });

// import {
//   defineConfig
// } from "vite";
// import solidPlugin from "vite-plugin-solid";
// import {
//   ViteAliases
// } from "vite-aliases";
// import path from "path";

// const rpcWebsocketsPath = path.resolve(
//   "node_modules/rpc-websockets/dist/lib/client/websocket.browser"
// );

// export default defineConfig({
//   plugins: [
//     solidPlugin(),
//     ViteAliases({
//       entries: [{
//           find: "rpc-websockets/dist/lib/client",
//           replacement: rpcWebsocketsPath,
//         },
//         {
//           find: "rpc-websockets/dist/lib/client/websocket.browser",
//           replacement: rpcWebsocketsPath,
//         },
//       ],
//     }),
//   ],
//   optimizeDeps: {
//     exclude: ["rpc-websockets"],
//   },
// });

// import {
//   defineConfig
// } from "vite";
// import solid from "vite-plugin-solid";

// export default defineConfig({
//   plugins: [solid()],
//   optimizeDeps: {
//     exclude: ["rpc-websockets"],
//   },
// });

import {
  defineConfig
} from 'vite'
import solid from 'vite-plugin-solid'
import {
  nodePolyfills
} from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [solid(), nodePolyfills({
    // Whether to polyfill `node:` protocol imports.
    protocolImports: true,
  })],
  'process.env.ANCHOR_BROWSER': true
})


// import {
//   defineConfig
// } from 'vite';
// import solidPlugin from 'vite-plugin-solid';
// import nodePolyfills from 'rollup-plugin-polyfill-node';

// export default defineConfig({
//   plugins: [solidPlugin()],
//   resolve: {
//     alias: {
//       buffer: 'buffer',
//     },
//   },
//   build: {
//     rollupOptions: {
//       plugins: [
//         nodePolyfills(), // Include polyfills
//       ],
//     },
//   },
// });