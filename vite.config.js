// import restart from 'vite-plugin-restart'

// export default {
//     root: 'src/', // Sources files (typically where index.html is)
//     publicDir: '../static/', // Path from "root" to static assets (files that are served as they are)
//     server:
//     {
//         host: true, // Open to local network and display URL
//         open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env) // Open if it's not a CodeSandbox
//     },
//     build:
//     {
//         outDir: '../dist', // Output in the dist/ folder
//         emptyOutDir: true, // Empty the folder first
//         sourcemap: true // Add sourcemap
//     },
//     plugins:
//     [
//         restart({ restart: [ '../static/**', ] }) // Restart server on static file change
//     ],
// }

import restart from "vite-plugin-restart";
import { resolve } from "path";

export default {
  root: "src/",
  publicDir: "../static/",
  server: {
    host: true,
    open: !("SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env),
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        chapters: resolve(__dirname, "src/chapters.html"),
        firstChapter: resolve(__dirname, "src/first-chapter.html"),
      },
    },
  },
  plugins: [restart({ restart: ["../static/**"] })],
};
