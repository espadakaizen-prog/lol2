# Discord Auth Website 🎵

A beautiful website with Discord OAuth authentication, custom decorations selection, and background video/music controls.

## Features

✨ **Discord Authentication**
- OAuth2 login with Discord
- User profile display with avatar
- Secure token management

🎨 **Custom Decorations**
- Select from 10+ beautiful decorations (snow, stars, hearts, flowers, etc.)
- Multiple selections supported
- Persistent storage in localStorage

🎬 **Background Media**
- Background video support
- Background audio/music
- Volume controls for both video and audio
- Toggle visibility independently

## Project Structure

```
├── index.html          # Main HTML file
├── style.css           # Styling
├── config.js           # Configuration (Discord credentials)
├── discord-auth.js     # Discord OAuth authentication
├── app.js              # Main application logic
└── assets/
    ├── bg-video.mp4    # Add your background video here
    ├── bg-music.mp3    # Add your background music here
    └── decorations/    # Decoration assets (optional)
```

## Setup Instructions

### 1. Discord Developer Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name and click "Create"
4. Go to "OAuth2" → "General"
5. Copy your **Client ID** and **Client Secret**
6. Add a Redirect URL: `http://localhost:3000/callback`
7. Save changes

### 2. Update Configuration

Open `config.js` and replace:
```javascript
CLIENT_ID: 'YOUR_CLIENT_ID_HERE',
CLIENT_SECRET: 'YOUR_CLIENT_SECRET_HERE',
REDIRECT_URI: 'http://localhost:3000/callback',
```

### 3. Add Media Files

1. Place your background video in `assets/bg-video.mp4`
2. Place your background music in `assets/bg-music.mp3`

### 4. Run the Website

**Option A: Using Python (simple)**
```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

**Option B: Using Node.js**
```bash
# Install http-server globally
npm install -g http-server

# Run on port 3000
http-server -p 3000
```

**Option C: Using VS Code Live Server**
- Install "Live Server" extension
- Right-click on `index.html` → "Open with Live Server"
- Update redirect URI in Discord app to match the port

### 5. Access the Website

Visit `http://localhost:3000` in your browser

## Customization

### Add More Decorations

Edit `config.js` in the `DECORATIONS` array:
```javascript
const DECORATIONS = [
    { id: 'snow', icon: '❄️', name: 'Snow' },
    { id: 'your-deco', icon: '🎭', name: 'Your Decoration' },
    // ... more
];
```

### Change Colors

Edit the accent color in `style.css` - look for `#7289da` (Discord blue)

### Modify Scopes

In `config.js`, change the `SCOPES` array to request different permissions:
```javascript
SCOPES: ['identify', 'email', 'guilds'] // Add more as needed
```

## How It Works

1. **Login Flow**
   - User clicks "Login with Discord"
   - Redirected to Discord OAuth
   - Returns with authorization code
   - Code exchanged for access token
   - User profile loaded

2. **Decorations**
   - User selects decorations from grid
   - Selection saved to localStorage
   - Displayed as badges below

3. **Media Control**
   - Video and audio control independently
   - Volume sliders for both
   - Settings persist per session

## Troubleshooting

**Redirect URI doesn't match**
- Make sure port in URL matches actual port
- Update both Discord app settings and `config.js`

**Video/Audio not playing**
- Check file paths in `index.html`
- Ensure files exist in `assets` folder
- Some browsers require HTTPS for autoplay

**CORS errors**
- Run from localhost or your domain
- Don't access via file:// protocol

**User data not loading**
- Check browser console for errors
- Verify Client ID and Client Secret are correct

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Partial (may need HTTPS for media)

## Security Notes

⚠️ **Never commit your Client Secret to git!**

For production:
- Move authentication to backend server
- Never expose Client Secret in frontend code
- Use HTTPS only
- Implement proper session management

## License

Free to use and modify!

## Support

For issues with Discord API, see [Discord Developer Docs](https://discord.com/developers/docs)
