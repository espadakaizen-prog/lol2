// Discord OAuth Backend Server
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

// Load .env file
require('dotenv').config();

// Load environment variables
const CLIENT_ID = process.env.CLIENT_ID || '1473422909610655927';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'A0CkzIa_BhLdZfWuWaIC0agr2WMEezQo';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/callback';
const DISCORD_API_BASE = 'https://discord.com/api/v10';

// Serve static files
function serveStaticFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - File not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// Get MIME type
function getMimeType(filePath) {
    const ext = path.extname(filePath);
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

// Create server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // OAuth Callback
    if (pathname === '/callback') {
        const code = query.code;
        const error = query.error;

        if (error) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<h1>Authorization cancelled</h1><p>${error}</p>`);
            return;
        }

        if (!code) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Missing authorization code');
            return;
        }

        try {
            // Exchange code for token
            const tokenResponse = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: REDIRECT_URI
                })
            });

            if (!tokenResponse.ok) {
                const errorText = await tokenResponse.text();
                console.error('Token Exchange Error:', tokenResponse.status, errorText);
                throw new Error(`Token error: ${tokenResponse.status} - ${errorText}`);
            }

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            // Get user data
            const userResponse = await fetch(`${DISCORD_API_BASE}/users/@me`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!userResponse.ok) {
                throw new Error(`User error: ${userResponse.status}`);
            }

            const userData = await userResponse.json();

            // Return success page with data
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Login Successful</title>
                    <style>
                        body { font-family: Arial; text-align: center; padding: 50px; background: #0f0f0f; color: #fff; }
                        .success { background: rgba(114, 137, 218, 0.1); border: 2px solid #7289da; padding: 30px; border-radius: 10px; max-width: 500px; margin: auto; }
                        h1 { color: #7289da; }
                        .avatar { width: 100px; height: 100px; border-radius: 50%; border: 3px solid #7289da; margin: 20px 0; }
                        .close-hint { color: #999; margin-top: 30px; }
                    </style>
                </head>
                <body>
                    <div class="success">
                        <h1>✅ Login Successful!</h1>
                        <img src="https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=256" class="avatar">
                        <p><strong>Username:</strong> ${userData.username}</p>
                        <p><strong>ID:</strong> ${userData.id}</p>
                        <p><strong>Email:</strong> ${userData.email || 'Not provided'}</p>
                        <p class="close-hint">You can close this window and return to the dashboard</p>
                        <script>
                            // Store data and redirect
                            localStorage.setItem('discord_access_token', ${JSON.stringify(accessToken)});
                            localStorage.setItem('discord_user_data', ${JSON.stringify(JSON.stringify(userData))});
                            window.location.href = '/';
                        </script>
                    </div>
                </body>
                </html>
            `);
        } catch (error) {
            console.error('OAuth error:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(`Authentication failed: ${error.message}`);
        }
        return;
    }

    // API: Get login URL
    if (pathname === '/api/discord-login-url') {
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: 'code',
            scope: 'identify email'
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            url: `https://discord.com/api/oauth2/authorize?${params.toString()}`
        }));
        return;
    }

    // API: Get Discord config
    if (pathname === '/api/config') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            CLIENT_ID: CLIENT_ID,
            REDIRECT_URI: REDIRECT_URI
        }));
        return;
    }

    // Serve static files
    let filePath = '.' + pathname;
    if (pathname === '/') {
        filePath = './index.html';
    }

    // Security: prevent directory traversal
    const realPath = path.resolve(filePath);
    const baseDir = path.resolve('.');
    if (!realPath.startsWith(baseDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const mimeType = getMimeType(filePath);
        serveStaticFile(res, filePath, mimeType);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - Not found');
    }
});

// Start server
// Discord Rich Presence (RPC) - ONLY RUNS LOCALLY
// Render/Heroku servers cannot run RPC because they don't have the Discord desktop app.
if (process.env.NODE_ENV !== 'production') {
    try {
        const DiscordRPC = require('discord-rpc');
        const rpc = new DiscordRPC.Client({ transport: 'ipc' });

        const updateStatus = async () => {
            const activity = {
                details: 'guns.lol',
                state: 'Viewing Bio',
                startTimestamp: Date.now(),
                instance: false
            };
            try {
                await rpc.setActivity(activity);
                console.log('✅ RPC Status Refreshed');
            } catch (err) {
                console.error('❌ RPC Refresh Error:', err.message);
            }
        };

        rpc.on('ready', () => {
            console.log(`Discord RPC active for: ${rpc.user.username}`);
            updateStatus();
            // Refresh every 15 seconds to keep it active
            setInterval(updateStatus, 15000);
        });

        rpc.login({ clientId: CLIENT_ID }).catch(err => {
            console.log('RPC Login failed:', err.message);
        });
    } catch (err) {
        console.log('Discord RPC module error:', err.message);
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`\n⚠️  IMPORTANT: Set your environment variables:`);
    console.log(`   set CLIENT_ID=your_client_id`);
    console.log(`   set CLIENT_SECRET=your_client_secret`);
    console.log(`\n📝 Or create a .env file with:`);
    console.log(`   CLIENT_ID=your_client_id`);
    console.log(`   CLIENT_SECRET=your_client_secret`);
    console.log(`  \n✨ Then open http://localhost:${PORT} and click Login!`);
});
