// server.js - Autodesk Viewer Proxy Server
// Run with: bun run server.js

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    // Define the base URL for Autodesk's API
    const autodeskApiBaseUrl = 'https://developer.api.autodesk.com';

    // Handle CORS preflight OPTIONS requests - this is crucial for browser compatibility
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204, // No Content
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with',
          'Access-Control-Max-Age': '86400', // 24 hours
        },
      });
    }
    if (url.pathname.endsWith('.js')) {
      try {
        const jsFile = Bun.file(`.${url.pathname}`);
        return new Response(jsFile, {
          status: 200,
          headers: {
            'Content-Type': 'application/javascript',
          },
        });
      } catch (error) {
        console.error(`Error serving ${url.pathname}:`, error);
        return new Response('JavaScript file not found', { status: 404 });
      }
    }


    // Handle token proxy endpoint to forward to the aps-codepen service
    if (url.pathname === '/api/autodesk/proxy-token') {
      // Forward request to the aps-codepen token service
      return fetch('https://aps-codepen.autodesk.io/api/token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => {
        if (!response.ok) {
          throw new Error('Token service responded with: ' + response.status);
        }
        return response.json();
      }).then(data => {
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }).catch(error => {
        console.error('Token proxy error:', error);
        return new Response(JSON.stringify({
          error: 'Failed to obtain token',
          message: error.message
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      });
    }

    // Check if the request path matches the Autodesk API proxy path
    if (url.pathname.startsWith('/api/autodesk/')) {
      // Construct the target URL for Autodesk's API
      const targetUrl = `${autodeskApiBaseUrl}${url.pathname.replace('/api/autodesk', '')}${url.search}`;
      
      console.log(`Proxying request to: ${targetUrl}`);

      // Extract headers from the incoming request
      const headers = new Headers();
      req.headers.forEach((value, key) => {
        // Skip host header as it will be set by fetch
        if (key.toLowerCase() !== 'host') {
          headers.set(key, value);
        }
      });

      // Forward the request to Autodesk's API
      return fetch(targetUrl, {
        method: req.method,
        headers: headers,
        body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined,
      }).then(response => {
        // Create a new response with CORS headers
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders
        });
      }).catch(error => {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ error: 'Proxy Error', message: error.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      });
    }

    // Serve the HTML content for the root path
    if (url.pathname === '/' || url.pathname === '/index.html') {
      // Read the HTML file
      try {
        const html = Bun.file('./index.html');
        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
          },
        });
      } catch (error) {
        console.error('Error serving index.html:', error);
        return new Response('Error loading HTML file', { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // Default 404 response
    return new Response('Not Found', { 
      status: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  },
});

// Log the server URL
console.log(`Autodesk Viewer Proxy Server is running at http://localhost:${server.port}`);