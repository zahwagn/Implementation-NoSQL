// This file is a simple bridge to the Vite-based application
// Since this is a Vite project, you should use `npm run dev` to start it,
// but this file exists as a fallback for direct node invocation

console.log('This is a Vite project. Please use "npm run dev" to start the development server.');
console.log('Attempting to run the Vite development server for you...');

// Import and run the Vite dev server
import('./node_modules/vite/bin/vite.js').catch(err => {
  console.error('Failed to start Vite dev server:', err);
  console.log('Please run "npm run dev" manually.');
});
