const fs = require('fs');
const path = require('path');

// Create a routes.json file for Render's static site hosting
const routesJson = {
  "version": 1,
  "routes": [
    {
      "src": "/*",
      "dest": "/index.html"
    }
  ]
};

// Create a _redirects file for Netlify
const redirectsContent = "/* /index.html 200";

// Paths
const distPath = path.join(__dirname, 'dist');
const routesJsonPath = path.join(distPath, 'routes.json');
const redirectsPath = path.join(distPath, '_redirects');

// Ensure dist directory exists
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

// Write routes.json
fs.writeFileSync(routesJsonPath, JSON.stringify(routesJson, null, 2));
console.log('Created routes.json in dist directory for Render static hosting');

// Write _redirects 
fs.writeFileSync(redirectsPath, redirectsContent);
console.log('Created _redirects in dist directory for Netlify compatibility');

// Copy index.html to 200.html for surge compatibility
const indexHtmlPath = path.join(distPath, 'index.html');
const notFoundHtmlPath = path.join(distPath, '200.html');

if (fs.existsSync(indexHtmlPath)) {
  fs.copyFileSync(indexHtmlPath, notFoundHtmlPath);
  console.log('Copied index.html to 200.html for surge compatibility');
}

console.log('Post-build processing completed successfully!'); 