<!-- Quick Setup Guide -->

# 🚀 Quick Start Guide

## Step 1: Get Discord Credentials (2 minutes)

1. Go to https://discord.com/developers/applications
2. Click "New Application" → Give it a name
3. Go to "OAuth2" → Click "General"
4. Copy your **Client ID**
5. Scroll down, click "Reset Secret" → Copy the **Client Secret**
6. Under "Redirects", add: `http://localhost:3000/callback`
7. Save!

## Step 2: Update Your Code (1 minute)

Open `config.js` and update:
```javascript
const CONFIG = {
    CLIENT_ID: 'PASTE_YOUR_CLIENT_ID',
    CLIENT_SECRET: 'PASTE_YOUR_CLIENT_SECRET',
    REDIRECT_URI: 'http://localhost:3000/callback',
    // ... rest stays the same
};
```

## Step 3: Add Media Files (Optional)

1. Find your video file (MP4 format recommended)
2. Rename it to `bg-video.mp4` and place in `assets/` folder
3. Find your music file (MP3 format recommended)  
4. Rename it to `bg-music.mp3` and place in `assets/` folder

## Step 4: Run the Server (1 minute)

Open PowerShell/CMD in your project folder and run:

**Using Python (easiest):**
```bash
python -m http.server 3000
```

**Using Node.js:**
```bash
npx http-server -p 3000
```

Then visit: **http://localhost:3000**

## Features Ready to Use

✅ Click "Login with Discord" → Authenticate with your Discord account
✅ See your Discord profile & avatar
✅ Select decorations (snow ❄️, stars ⭐, hearts ❤️, etc.)
✅ Control background video & music volume
✅ Everything saves automatically!

## Customization Ideas

- **More Decorations**: Edit `config.js` → `DECORATIONS` array
- **Change Colors**: Edit `style.css` → Replace `#7289da` with your color
- **Different Background**: Replace `assets/bg-video.mp4` and `assets/bg-music.mp3`
- **Add Animations**: Modify `style.css` → Animation sections

## Video Formats

- **Video**: MP4, WebM
- **Audio**: MP3, WAV, OGG

You can convert files using ffmpeg:
```bash
ffmpeg -i input-video.avi -codec:v libx264 -codec:a aac output.mp4
ffmpeg -i input-music.wav -codec:a libmp3lame -q:a 4 output.mp3
```

## What's Included

📁 **index.html** - Main page with all UI elements
📁 **style.css** - Beautiful Discord-themed styling
📁 **config.js** - Discord OAuth configuration
📁 **discord-auth.js** - Authentication logic (don't modify)
📁 **app.js** - Main application logic (don't modify)
📁 **README.md** - Full documentation
📁 **assets/** - Your media files go here

## Troubleshooting

**"Invalid OAuth redirect"?**
- Check port matches (3000)
- Verify Discord app redirect URI matches exactly

**Video not showing?**
- Check file exists in `assets/bg-video.mp4`
- Try a different video format

**Music not playing?**
- Check file exists in `assets/bg-music.mp3`
- Unmute browser for autoplay

**Can't login?**
- Check Client ID is correct (not Client Secret)
- Verify redirect URI in Discord app

Need help? Check the full README.md file for detailed info!
