import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import postcssImport from 'postcss-import';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Create process.env object with REACT_APP_ prefixed variables
  const processEnv = {};
  Object.keys(env).forEach((key) => {
    if (key.startsWith('REACT_APP_')) {
      processEnv[`process.env.${key}`] = JSON.stringify(env[key]);
    }
  });
  
  // Add NODE_ENV
  processEnv['process.env.NODE_ENV'] = JSON.stringify(mode);
  
  return {
    plugins: [
      react({
        // Enable Fast Refresh and include .js files for JSX
        include: '**/*.{jsx,js,tsx,ts}',
        jsxRuntime: 'automatic',
      }),
    ],
    
    // Base public path
    base: '/',
    
    // Define aliases
    resolve: {
      alias: {
        '@assets': path.resolve(__dirname, './public/assets'),
        '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        '~slick-carousel': path.resolve(__dirname, 'node_modules/slick-carousel'),
      },
      extensions: ['.js', '.jsx', '.json'],
    },
    
    // CSS configuration
    css: {
      postcss: {
        plugins: [
          postcssImport({
            skipDuplicates: true,
            filter: (id) => {
              // Process all imports
              return true;
            },
            load: (filename) => {
              return import('fs').then(fs => 
                fs.promises.readFile(filename, 'utf8')
              ).then(content => {
                // Remove @charset declarations before processing
                return content.replace(/@charset\s+(['"])[\w-]+\1;?\s*/gi, '');
              });
            }
          }),
        ]
      }
    },
    
    // Dev server configuration
    server: {
      port: 3000,
      open: true,
      host: true,
    },
    
    // Configure esbuild to handle JSX in ALL .js and .jsx files
    esbuild: {
      loader: 'jsx',
      include: /\.jsx?$/,
      exclude: [],
    },
    
    // Build configuration
    build: {
      outDir: 'build',
      assetsDir: 'static',
      sourcemap: false,
      // Optimize chunks
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
            'ui-vendor': ['bootstrap', 'react-bootstrap', 'primereact'],
          },
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },
    
    // Define global constants to replace process.env.REACT_APP_* at build time
    define: {
      ...processEnv,
      // Ensure process.env exists as an object
      'process.env': '{}',
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@reduxjs/toolkit',
        'react-redux',
        'crypto-js',
        'axios',
      ],
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
          '.jsx': 'jsx',
        },
      },
    },
  };
});

