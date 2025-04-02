const fs = require('fs');
const path = require('path');

// Add at the beginning after the existing imports
const FALLBACK_HTML = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Injury Analysis</title>
  </head>
  <body>
    <div id="root"></div>
    <script>
      // Handle client-side routing
      window.addEventListener('DOMContentLoaded', () => {
        const root = document.getElementById('root');
        if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/index.html')) {
          // We're on a route that might need client-side routing
          root.innerHTML = '<div style="text-align: center; padding: 50px;">Loading application...</div>';
          // Load the main application script
          const script = document.createElement('script');
          script.type = 'module';
          script.src = '/assets/index.js';
          document.body.appendChild(script);
        }
      });
    </script>
  </body>
</html>
`;

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

// Create a render.json file for Render's static site hosting
const renderJson = {
  "routes": [
    { "src": "/*", "dest": "/index.html" }
  ],
  "headers": [
    {
      "source": "**/*",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" }
      ]
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

// Check if index.html exists, if not create a fallback
if (!fs.existsSync(path.join(distPath, 'index.html'))) {
  console.log('No index.html found, creating fallback');
  fs.writeFileSync(path.join(distPath, 'index.html'), FALLBACK_HTML);
}

// Write routes.json
fs.writeFileSync(routesJsonPath, JSON.stringify(routesJson, null, 2));
console.log('Created routes.json in dist directory for Render static hosting');

// Write render.json
fs.writeFileSync(path.join(distPath, 'render.json'), JSON.stringify(renderJson, null, 2));
console.log('Created render.json in dist directory for Render static hosting');

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

// Create a spa-fallback.html to be used for 404 handling
fs.copyFileSync(indexHtmlPath, path.join(distPath, 'spa-fallback.html'));
console.log('Created spa-fallback.html for 404 handling');

// Create a 404.html that redirects to index.html
const notFoundRedirectContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Single Page App Redirect</title>
    <script type="text/javascript">
      // Single Page Apps for GitHub Pages/Render
      // Modified version of https://github.com/rafrex/spa-github-pages
      // This script checks to see if a redirect is present in the query string,
      // converts it back into the correct url and adds it to the
      // browser's history using window.history.replaceState(...),
      // which won't cause the browser to attempt to load the new url.
      var segmentCount = 0;
      var location = window.location;
      var l = location.pathname.replace(/^\\//, '').split('/');
      l.length > segmentCount && (l = l.slice(0, segmentCount).join('/') + '/?p=/' + l.slice(segmentCount).join('/').replace(/&/g, '~and~') + (location.search ? '&q=' + location.search.slice(1).replace(/&/g, '~and~') : '') + location.hash);
      if (l !== location.pathname) {
        history.replaceState(null, null, l || '/');
        location.replace(
          location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/'
        );
      }
    </script>
  </head>
  <body>
    Redirecting...
  </body>
</html>
`;

fs.writeFileSync(path.join(distPath, '404.html'), notFoundRedirectContent);
console.log('Created 404.html with redirect script');

console.log('Post-build processing completed successfully!'); 