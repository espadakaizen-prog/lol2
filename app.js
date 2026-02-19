// Main Application Logic

class App {
    constructor() {
        // In-memory video/audio data (localStorage can't hold large files)
        this.currentVideoData = localStorage.getItem('custom_bg_video') || null;
        this.currentAudioData = localStorage.getItem('custom_bg_audio') || null;

        this.loginSection = document.getElementById('loginSection');
        this.dashboardSection = document.getElementById('dashboardSection');
        this.discordLoginBtn = document.getElementById('discordLoginBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.viewProfileBtn = document.getElementById('viewProfileBtn');
        this.copyLinkBtn = document.getElementById('copyLinkBtn');
        this.decorationsList = document.getElementById('decorationsList');
        this.selectedDecoDisplay = document.getElementById('selectedDecoDisplay');
        this.userName = document.getElementById('userName');
        this.userAvatar = document.getElementById('userAvatar');
        this.userTag = document.getElementById('userTag');
        
        // Media controls
        this.bgVideo = document.getElementById('bgVideo');
        this.bgAudio = document.getElementById('bgAudio');
        this.videoToggle = document.getElementById('videoToggle');
        this.audioToggle = document.getElementById('audioToggle');
        this.videoVolume = document.getElementById('videoVolume');
        this.audioVolume = document.getElementById('audioVolume');
        this.videoUpload = document.getElementById('videoUpload');
        this.audioUpload = document.getElementById('audioUpload');
        this.videoUploadStatus = document.getElementById('videoUploadStatus');
        this.audioUploadStatus = document.getElementById('audioUploadStatus');

        // Customization controls
        this.effectRain = document.getElementById('effectRain');
        this.effectNight = document.getElementById('effectNight');
        this.effectBlur = document.getElementById('effectBlur');
        this.effectRetro = document.getElementById('effectRetro');
        this.cardColor = document.getElementById('cardColor');
        this.cardOpacity = document.getElementById('cardOpacity');
        this.cardBorderColor = document.getElementById('cardBorderColor');
        this.boxColor = document.getElementById('boxColor');
        this.boxBlur = document.getElementById('boxBlur');
        this.nameColor = document.getElementById('nameColor');
        this.widgetInvisible = document.getElementById('widgetInvisible');
        this.showDiscordDecoration = document.getElementById('showDiscordDecoration');
        
        // Remove media buttons
        this.removeVideoBtn = document.getElementById('removeVideoBtn');
        this.removeAudioBtn = document.getElementById('removeAudioBtn');
        
        // Action Buttons
        this.saveBtn = document.getElementById('saveBtn');
        this.cancelBtn = document.getElementById('cancelBtn');

        // Selected decorations (must be before activeDecorations)
        try {
            this.selectedDecorations = JSON.parse(
                localStorage.getItem(CONFIG.STORAGE_KEYS.SELECTED_DECORATIONS)
            ) || [];
        } catch (e) {
            console.error('Failed to parse decorations:', e);
            this.selectedDecorations = [];
        }
        
        // Active Decorations (Visibility)
        // Default to all selected if no specific active settings exist (backward compatibility)
        const savedActive = localStorage.getItem('active_decorations');
        this.activeDecorations = savedActive ? JSON.parse(savedActive) : [...this.selectedDecorations];

        // Initialize customization inputs
        this.effectRain.checked = localStorage.getItem('effect_rain') === 'true';
        this.effectNight.checked = localStorage.getItem('effect_night') === 'true';
        this.effectBlur.checked = localStorage.getItem('effect_blur') === 'true';
        this.effectRetro.checked = localStorage.getItem('effect_retro') === 'true';
        this.cardColor.value = localStorage.getItem('card_color') || '#ffffff';
        this.cardOpacity.value = localStorage.getItem('card_opacity') || '85';
        this.cardBorderColor.value = localStorage.getItem('card_border_color') || '#ffffff';
        this.nameColor.value = localStorage.getItem('name_color') || '#ffffff';
        this.boxColor.value = localStorage.getItem('box_color') || '#1a1a2e';
        this.boxBlur.value = localStorage.getItem('box_blur') || '10';
        this.widgetInvisible.checked = localStorage.getItem('widget_invisible') === 'true';
        this.showDiscordDecoration.checked = localStorage.getItem('show_discord_decoration') !== 'false'; // Default true

        // Show remove buttons if media already uploaded
        if (localStorage.getItem('custom_bg_video')) {
            this.removeVideoBtn.classList.remove('hidden');
        }
        if (localStorage.getItem('custom_bg_audio')) {
            this.removeAudioBtn.classList.remove('hidden');
        }
        
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.handleAuthentication();
    }

    attachEventListeners() {
        // Login
        this.discordLoginBtn.addEventListener('click', () => {
            console.log('Initiating Discord login (client-side)...');
            try {
                // Use the generate login URL method from discord-auth.js
                const loginUrl = discordAuth.getLoginUrl();
                console.log('Redirecting to:', loginUrl);
                window.location.href = loginUrl;
            } catch (error) {
                console.error('Login failed:', error);
                alert('Failed to start login. Check console for details.');
            }
        });

        // View Profile
        this.viewProfileBtn.addEventListener('click', () => {
            this.openProfileInNewTab();
        });

        this.copyLinkBtn.addEventListener('click', () => {
            this.copyProfileLink();
        });

        // Logout
        this.logoutBtn.addEventListener('click', () => {
            discordAuth.logout();
            this.showLoginSection();
        });

        // Media controls
        this.videoToggle.addEventListener('change', (e) => {
            this.bgVideo.style.opacity = e.target.checked ? '0.5' : '0';
        });

        this.audioToggle.addEventListener('change', (e) => {
            this.bgAudio.muted = !e.target.checked;
            if (e.target.checked) {
                this.bgAudio.play().catch(() => {
                    console.log('Audio autoplay prevented');
                });
            }
        });

        this.videoVolume.addEventListener('input', (e) => {
            this.bgVideo.style.opacity = (e.target.value / 200);
        });

        this.audioVolume.addEventListener('input', (e) => {
            this.bgAudio.volume = e.target.value / 100;
        });

        // File uploads
        this.videoUpload.addEventListener('change', (e) => {
            this.handleVideoUpload(e);
        });

        this.audioUpload.addEventListener('change', (e) => {
            this.handleAudioUpload(e);
        });

        // Remove media buttons
        this.removeVideoBtn.addEventListener('click', () => {
            this.removeVideo();
        });

        this.removeAudioBtn.addEventListener('click', () => {
            this.removeAudio();
        });

        // Action Buttons
        this.saveBtn.addEventListener('click', () => this.saveChanges());
        this.cancelBtn.addEventListener('click', () => this.cancelChanges());

        // Refresh profile data before opening (async wrapper)
        this.viewProfileBtn.addEventListener('click', async () => {
            this.viewProfileBtn.textContent = '⏳ Updating...';
            await discordAuth.refreshUserData();
            this.viewProfileBtn.textContent = '📋 View Profile';
            this.openProfileInNewTab();
        });
    }

    async handleAuthentication() {
        if (discordAuth.isAuthenticated()) {
            this.showDashboardSection();
        } else {
            this.showLoginSection();
        }
    }

    showLoginSection() {
        this.loginSection.classList.remove('hidden');
        this.dashboardSection.classList.add('hidden');
    }

    showDashboardSection() {
        this.loginSection.classList.add('hidden');
        this.dashboardSection.classList.remove('hidden');
        this.loadUserProfile();
        this.loadDecorations();
        this.displaySelectedDecorations();
    }

    loadUserProfile() {
        const userData = discordAuth.getUserData();
        if (userData) {
            this.userName.textContent = userData.username;
            this.userTag.textContent = discordAuth.getUserTag();
            const avatarUrl = discordAuth.getAvatarUrl();
            if (avatarUrl) {
                this.userAvatar.src = avatarUrl;
            }
        }
    }

    loadDecorations() {
        this.decorationsList.innerHTML = '';
        
        DECORATIONS.forEach(decoration => {
            const item = document.createElement('div');
            item.className = 'decoration-item';
            if (this.selectedDecorations.includes(decoration.id)) {
                item.classList.add('selected');
            }
            
            item.innerHTML = `
                <div class="decoration-icon">${decoration.icon}</div>
                <div class="decoration-name">${decoration.name}</div>
            `;
            
            item.addEventListener('click', () => {
                this.toggleDecoration(decoration.id, item);
            });
            
            this.decorationsList.appendChild(item);
        });
    }

    toggleDecoration(decorationId, element) {
        const index = this.selectedDecorations.indexOf(decorationId);
        
        if (index > -1) {
            // Remove decoration
            this.selectedDecorations.splice(index, 1);
            element.classList.remove('selected');
        } else {
            // Add decoration
            this.selectedDecorations.push(decorationId);
            element.classList.add('selected');
        }
        
        // Save to localStorage
        localStorage.setItem(
            CONFIG.STORAGE_KEYS.SELECTED_DECORATIONS,
            JSON.stringify(this.selectedDecorations)
        );
        
        this.displaySelectedDecorations();
    }

    displaySelectedDecorations() {
        this.selectedDecoDisplay.innerHTML = '';
        
        if (this.selectedDecorations.length === 0) {
            this.selectedDecoDisplay.innerHTML = '<p class="placeholder">No decorations selected</p>';
            return;
        }
        
        this.selectedDecorations.forEach(decorationId => {
            const decoration = DECORATIONS.find(d => d.id === decorationId);
            if (!decoration) return;
            
            const badge = document.createElement('div');
            badge.className = 'decoration-badge';
            
            const isActive = this.activeDecorations.includes(decorationId) || this.activeDecorations.length === 0; // Default to active if list empty? Or explicit check? 
            // Better: if active_decorations key exists, use it. If not, default to true. 
            // But we initialized activeDecorations in constructor. Let's assume ownership implies active by default if not set.
            // Actually, let's just check inclusion.
            
            const isChecked = this.activeDecorations.includes(decorationId);

            badge.innerHTML = `
                <div class="decoration-header">
                    <span>${decoration.icon} ${decoration.name}</span>
                    <button class="remove-btn">×</button>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" class="toggle-input" data-id="${decorationId}" ${isChecked ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            `;
            
            badge.querySelector('.remove-btn').addEventListener('click', () => {
                this.toggleDecoration(decorationId, {classList: {remove: () => {}}}); // Hacky but works with existing logic
                // Also remove from active? Yes
                this.activeDecorations = this.activeDecorations.filter(id => id !== decorationId);
                // We should probably save ownership immediately as that's a "store" action, 
                // but visibility is a "customization" action. 
                // For now, let's keep ownership immediate for simplicity of the "Select" panel,
                // but visibility requires "Save".
            });

            // Toggle visibility listener (updates UI state only, real save on Save button)
            // But wait, if I toggle here, I need to update this.activeDecorations state?
            // Yes, so that if I hit Save, I know what to save.
            const toggleInput = badge.querySelector('.toggle-input');
            toggleInput.addEventListener('change', (e) => {
                if (e.target.checked) {
                    if (!this.activeDecorations.includes(decorationId)) {
                        this.activeDecorations.push(decorationId);
                    }
                } else {
                    this.activeDecorations = this.activeDecorations.filter(id => id !== decorationId);
                }
            });
            
            this.selectedDecoDisplay.appendChild(badge);
        });
    }

    saveChanges() {
        // Effects
        localStorage.setItem('effect_rain', this.effectRain.checked);
        localStorage.setItem('effect_night', this.effectNight.checked);
        localStorage.setItem('effect_blur', this.effectBlur.checked);
        localStorage.setItem('effect_retro', this.effectRetro.checked);

        // Card Style
        localStorage.setItem('card_color', this.cardColor.value);
        localStorage.setItem('card_opacity', this.cardOpacity.value);
        localStorage.setItem('card_border_color', this.cardBorderColor.value);
        localStorage.setItem('name_color', this.nameColor.value);
        localStorage.setItem('box_color', this.boxColor.value);
        localStorage.setItem('box_blur', this.boxBlur.value);
        localStorage.setItem('widget_invisible', this.widgetInvisible.checked);
        localStorage.setItem('show_discord_decoration', this.showDiscordDecoration.checked);

        // Active Decorations
        localStorage.setItem('active_decorations', JSON.stringify(this.activeDecorations));

        alert('Changes saved successfully!');
    }

    cancelChanges() {
        if (confirm('Discard unsaved changes?')) {
            // Reload inputs from localStorage
            this.effectRain.checked = localStorage.getItem('effect_rain') === 'true';
            this.effectNight.checked = localStorage.getItem('effect_night') === 'true';
            this.effectBlur.checked = localStorage.getItem('effect_blur') === 'true';
            this.effectRetro.checked = localStorage.getItem('effect_retro') === 'true';

            this.cardColor.value = localStorage.getItem('card_color') || '#ffffff';
            this.cardOpacity.value = localStorage.getItem('card_opacity') || '85';
            this.cardBorderColor.value = localStorage.getItem('card_border_color') || '#ffffff';
            this.nameColor.value = localStorage.getItem('name_color') || '#ffffff';
            this.boxColor.value = localStorage.getItem('box_color') || '#1a1a2e';
            this.boxBlur.value = localStorage.getItem('box_blur') || '10';
            this.widgetInvisible.checked = localStorage.getItem('widget_invisible') === 'true';
            this.showDiscordDecoration.checked = localStorage.getItem('show_discord_decoration') !== 'false';

            // Reload active decorations
            try {
                this.activeDecorations = JSON.parse(localStorage.getItem('active_decorations')) || [];
            } catch (e) {
                this.activeDecorations = [];
            }
            this.displaySelectedDecorations();
        }
    }

    handleVideoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.bgVideo.src = e.target.result;
            // Store in memory (always works, no size limit)
            this.currentVideoData = e.target.result;
            // Also try localStorage (may fail for large files)
            try {
                localStorage.setItem('custom_bg_video', e.target.result);
            } catch (err) {
                console.warn('Video too large for localStorage, stored in memory only');
            }
            this.videoUploadStatus.textContent = '✅ Video uploaded!';
            this.removeVideoBtn.classList.remove('hidden');
            setTimeout(() => {
                this.videoUploadStatus.textContent = '';
            }, 3000);
        };
        reader.readAsDataURL(file);
    }

    handleAudioUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.bgAudio.src = e.target.result;
            this.currentAudioData = e.target.result;
            try {
                localStorage.setItem('custom_bg_audio', e.target.result);
            } catch (err) {
                console.warn('Audio too large for localStorage, stored in memory only');
            }
            this.audioUploadStatus.textContent = '✅ Music uploaded!';
            this.removeAudioBtn.classList.remove('hidden');
            setTimeout(() => {
                this.audioUploadStatus.textContent = '';
            }, 3000);
        };
        reader.readAsDataURL(file);
    }

    removeVideo() {
        if (confirm('Remove uploaded video?')) {
            this.currentVideoData = null;
            localStorage.removeItem('custom_bg_video');
            this.videoUpload.value = '';
            this.removeVideoBtn.classList.add('hidden');
            this.videoUploadStatus.textContent = '🗑️ Video removed';
            setTimeout(() => { this.videoUploadStatus.textContent = ''; }, 3000);
        }
    }

    removeAudio() {
        if (confirm('Remove uploaded music?')) {
            this.currentAudioData = null;
            localStorage.removeItem('custom_bg_audio');
            this.audioUpload.value = '';
            this.removeAudioBtn.classList.add('hidden');
            this.audioUploadStatus.textContent = '🗑️ Music removed';
            setTimeout(() => { this.audioUploadStatus.textContent = ''; }, 3000);
        }
    }

    openProfileInNewTab() {
        const userData = discordAuth.getUserData();
        if (!userData) {
            alert('Please login with Discord first to view your profile.');
            return;
        }

        try {

        // Use in-memory video first (always up-to-date), fallback to localStorage
        const customBgVideo = this.currentVideoData || localStorage.getItem('custom_bg_video');
        const customBgAudio = this.currentAudioData || localStorage.getItem('custom_bg_audio');
        
        // Effects
        const effects = {
            rain: localStorage.getItem('effect_rain') === 'true',
            night: localStorage.getItem('effect_night') === 'true',
            blur: localStorage.getItem('effect_blur') === 'true',
            retro: localStorage.getItem('effect_retro') === 'true',
            retro: localStorage.getItem('effect_retro') === 'true',
            widgetInvisible: localStorage.getItem('widget_invisible') === 'true',
            showDiscordDecoration: localStorage.getItem('show_discord_decoration') !== 'false'
        };

        // Card Style
        const cardStyle = {
            color: localStorage.getItem('card_color') || '#ffffff',
            opacity: localStorage.getItem('card_opacity') || '85',
            borderColor: localStorage.getItem('card_border_color') || '#ffffff',
            nameColor: localStorage.getItem('name_color') || '#ffffff',
            boxColor: localStorage.getItem('box_color') || '#1a1a2e',
            boxBlur: localStorage.getItem('box_blur') || '10',
            nameColor: localStorage.getItem('name_color') || '#ffffff',
            boxColor: localStorage.getItem('box_color') || '#1a1a2e',
            boxBlur: localStorage.getItem('box_blur') || '10',
            widgetInvisible: localStorage.getItem('widget_invisible') === 'true',
            showDiscordDecoration: localStorage.getItem('show_discord_decoration') !== 'false'
        };

        const videoElement = customBgVideo ? `
            <video class="profile-bg-video ${effects.blur ? 'blur-effect' : ''}" autoplay muted loop>
                <source src="${customBgVideo}" type="video/mp4">
            </video>
        ` : '';

        const audioElement = customBgAudio ? `
            <audio id="profileAudio" autoplay loop>
                <source src="${customBgAudio}" type="audio/mpeg">
            </audio>
        ` : '';

        // Generate effects HTML
        let effectsHTML = '';
        if (effects.rain) {
            effectsHTML += '<div class="rain-container"></div>';
        }
        if (effects.night) {
            effectsHTML += '<div class="night-overlay"></div>';
        }
        if (effects.retro) {
            effectsHTML += '<div class="retro-overlay"><div class="scanlines"></div></div>';
        }

        const profileHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
                <title>${userData.username} - Discord Profile</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Cambria Math', 'Noto Sans Symbols', 'Segoe UI Symbol', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                        overflow: hidden;
                        position: relative;
                    }
                    .profile-bg-video {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        z-index: 0;
                        opacity: 0.6;
                    }
                    .blur-effect {
                        filter: blur(5px);
                    }
                    
                    /* Night Mode */
                    .night-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.6);
                        z-index: 1;
                        pointer-events: none;
                    }

                    /* Rain Effect */
                    .rain-container {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 2;
                        pointer-events: none;
                        overflow: hidden;
                    }
                    .rain-container::before {
                        content: '';
                        position: absolute;
                        top: -50%;
                        left: 0;
                        width: 100%;
                        height: 200%;
                        background: repeating-linear-gradient(
                            transparent,
                            transparent 4px,
                            rgba(150, 180, 255, 0.15) 4px,
                            rgba(150, 180, 255, 0.15) 5px
                        );
                        animation: rain 0.4s linear infinite;
                    }
                    @keyframes rain {
                        0% { transform: translateY(0); }
                        100% { transform: translateY(25%); }
                    }

                    /* Retro TV Effect */
                    .retro-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 3;
                        pointer-events: none;
                        background: rgba(18, 16, 16, 0.1);
                    }
                    .scanlines {
                        width: 100%;
                        height: 100%;
                        z-index: 3;
                        background: linear-gradient(0deg, rgba(0,0,0,0) 50%, rgba(255, 255, 255, 0.15) 50%);
                        opacity: 0.15;
                        background-size: 100% 4px;
                        animation: scanlines 5s linear infinite;
                        pointer-events: none;
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: 0;
                        right: 0;
                    }
                    @keyframes scanlines {
                        0% { background-position: 0 0; }
                        100% { background-position: 0 100%; }
                    }

                    .profile-card {
                        background: ${cardStyle.color}${Math.round(cardStyle.opacity * 2.55).toString(16).padStart(2, '0')};
                        backdrop-filter: blur(10px);
                        border-radius: 20px;
                        padding: 40px;
                        max-width: 500px;
                        width: 100%;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                        border: 2px solid ${cardStyle.borderColor};
                        text-align: center;
                        position: relative;
                        animation: float 6s ease-in-out infinite;
                        z-index: 10;
                    }
                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                        100% { transform: translateY(0px); }
                    }
                    .avatar-container {
                        position: relative;
                        display: inline-block;
                        margin-bottom: 20px;
                    }
                    .avatar {
                        width: 150px;
                        height: 150px;
                        border-radius: 50%;
                        border: 4px solid #7289da;
                        box-shadow: 0 10px 30px rgba(114, 137, 218, 0.5);
                        transition: transform 0.3s ease;
                    }
                    .avatar-decoration {
                        position: absolute;
                        top: -15px;
                        left: -15px;
                        width: 180px;
                        height: 180px;
                        pointer-events: none;
                        z-index: 2;
                    }
                    .avatar:hover {
                        transform: scale(1.1) rotate(5deg);
                    }
                    h1 {
                        color: ${cardStyle.nameColor};
                        margin-bottom: 10px;
                        font-size: 2.5em;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                        font-family: 'Cambria Math', 'Noto Sans Symbols', 'Segoe UI Symbol', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Sans', 'Segoe UI', sans-serif;
                        word-break: break-word;
                    }
                    .user-tag {
                        color: #5865f2;
                        font-size: 1.2em;
                        margin-bottom: 20px;
                        font-weight: 600;
                    }
                    .user-widget {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        background: rgba(${parseInt(cardStyle.boxColor.slice(1,3),16)}, ${parseInt(cardStyle.boxColor.slice(3,5),16)}, ${parseInt(cardStyle.boxColor.slice(5,7),16)}, 0.25);
                        backdrop-filter: blur(${cardStyle.boxBlur}px);
                        -webkit-backdrop-filter: blur(${cardStyle.boxBlur}px);
                        padding: 12px 16px;
                        border-radius: 14px;
                        border: 1px solid rgba(255,255,255,0.1);
                        margin: 15px auto;
                        max-width: 320px;
                    }
                    .widget-avatar {
                        width: 45px;
                        height: 45px;
                        border-radius: 50%;
                        border: 2px solid #5865f2;
                    }
                    .widget-info {
                        display: flex;
                        flex-direction: column;
                        gap: 2px;
                        text-align: left;
                    }
                    .widget-name {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-weight: 600;
                        font-size: 0.95em;
                        color: #fff;
                    }
                    .widget-detail {
                        font-size: 0.75em;
                        color: #999;
                        font-family: monospace;
                    }
                    .badge {
                        background: rgba(88, 101, 242, 0.3);
                        padding: 2px 5px;
                        border-radius: 4px;
                        font-size: 0.8em;
                    }
                    .status-dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        display: inline-block;
                    }
                    .status-online { background: #43b581; box-shadow: 0 0 6px #43b581; }
                    .status-idle { background: #faa61a; box-shadow: 0 0 6px #faa61a; }
                    .status-dnd { background: #f04747; box-shadow: 0 0 6px #f04747; }
                    .status-offline { background: #747f8d; box-shadow: 0 0 6px #747f8d; }
                    .mini-info {
                        display: flex;
                        justify-content: center;
                        gap: 8px;
                        font-size: 0.8em;
                        margin: 6px 0;
                        color: #aaa;
                    }
                    .mini-label {
                        color: #888;
                    }
                    .mini-value {
                        color: #ccc;
                        font-weight: 500;
                    }
                    .footer {
                        margin-top: 20px;
                        color: #666;
                        font-size: 0.85em;
                    }
                    .footer a {
                        color: #5865f2;
                        text-decoration: none;
                        font-weight: 600;
                    }
                    .footer a:hover {
                        text-decoration: underline;
                    }
                    /* Music Control Bar */
                    .music-control {
                        position: fixed;
                        bottom: 20px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(30, 30, 50, 0.85);
                        backdrop-filter: blur(15px);
                        -webkit-backdrop-filter: blur(15px);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 50px;
                        padding: 10px 20px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        z-index: 100;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                        transition: all 0.3s ease;
                    }
                    .music-control:hover {
                        background: rgba(40, 40, 65, 0.95);
                        box-shadow: 0 8px 40px rgba(88, 101, 242, 0.3);
                    }
                    .music-icon {
                        font-size: 1.3em;
                        cursor: pointer;
                        transition: transform 0.2s;
                        user-select: none;
                    }
                    .music-icon:hover {
                        transform: scale(1.2);
                    }
                    .music-icon.playing {
                        animation: pulse 1.5s ease-in-out infinite;
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.15); }
                    }
                    .volume-bar-container {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        min-width: 160px;
                    }
                    .volume-label {
                        font-size: 0.7em;
                        color: #888;
                        min-width: 30px;
                        text-align: center;
                    }
                    .volume-bar {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 120px;
                        height: 5px;
                        border-radius: 5px;
                        background: linear-gradient(to right, #5865f2 0%, #5865f2 50%, #444 50%, #444 100%);
                        outline: none;
                        cursor: pointer;
                        transition: height 0.2s;
                    }
                    .volume-bar:hover {
                        height: 7px;
                    }
                    .volume-bar::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 14px;
                        height: 14px;
                        border-radius: 50%;
                        background: #5865f2;
                        cursor: pointer;
                        box-shadow: 0 0 8px rgba(88, 101, 242, 0.5);
                        transition: all 0.2s;
                    }
                    .volume-bar::-webkit-slider-thumb:hover {
                        transform: scale(1.2);
                        box-shadow: 0 0 12px rgba(88, 101, 242, 0.8);
                    }
                    .volume-bar::-moz-range-thumb {
                        width: 14px;
                        height: 14px;
                        border-radius: 50%;
                        background: #5865f2;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 0 8px rgba(88, 101, 242, 0.5);
                    }
                    .no-music {
                        display: none;
                    }
                    /* Activity Display */
                    #activityContainer {
                        margin-top: 4px;
                        font-size: 0.85em;
                        color: #bbb;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        max-width: 100%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    #activityText {
                        font-weight: 500;
                    }
                </style>
            </head>
            <body>
                ${videoElement}
                ${audioElement}
                ${effectsHTML}
                <div class="profile-card">
                    <div class="avatar-container">
                        <img src="${discordAuth.getAvatarUrl()}?v=${Date.now()}" alt="Avatar" class="avatar">
                        ${userData.avatar_decoration_data && cardStyle.showDiscordDecoration ? `<img src="https://cdn.discordapp.com/avatar-decoration-presets/${userData.avatar_decoration_data.asset}.png?v=${Date.now()}" class="avatar-decoration" alt="decoration">` : ''}
                    </div>
                    <h1>${userData.global_name || userData.username}</h1>
                    <div class="user-tag">@${discordAuth.getUserTag()}</div>
                    
                    <div class="user-widget" style="${cardStyle.widgetInvisible ? 'background: transparent; border: none; backdrop-filter: none; -webkit-backdrop-filter: none; box-shadow: none; padding: 0;' : ''}">
                        <img src="${discordAuth.getAvatarUrl()}?v=${Date.now()}" class="widget-avatar" alt="" id="widgetAvatar">
                        <div class="widget-info">
                            <div class="widget-name">
                                <span id="widgetUsername">${userData.username}</span>
                                ${(function() {
                                    const activeDecos = JSON.parse(localStorage.getItem('active_decorations')) || [];
                                    const allDecos = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SELECTED_DECORATIONS)) || [];
                                    const toShow = activeDecos.filter(id => allDecos.includes(id));
                                    return toShow.map(id => {
                                        const deco = DECORATIONS.find(d => d.id === id);
                                        return deco ? '<span class="badge">' + deco.icon + '</span>' : '';
                                    }).join('');
                                })()}
                                <span class="status-dot status-offline" id="statusDot"></span>
                            </div>
                            <!-- Activity / Custom Status -->
                            <div id="activityContainer" class="widget-detail">
                                <span id="activityText">Loading activity...</span>
                            </div>
                        </div>
                    </div>

                    ${userData.global_name && userData.global_name !== userData.username ? `
                    <div class="mini-info" id="displayInfo">
                        <span class="mini-label">Display</span>
                        <span class="mini-value">${userData.global_name}</span>
                    </div>` : ''}

                    <div class="mini-info">
                        <span class="mini-label">📅 Created</span>
                        <span class="mini-value">${new Date(Number(BigInt(userData.id) >> 22n) + 1420070400000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    
                    <div class="footer">
                        ✨ <a href="#">Discord Decoration</a> | 👁 ${Math.floor(Math.random() * 100) + 1}
                    </div>
                </div>

                <!-- Music Control Bar -->
                <div class="music-control ${customBgAudio ? '' : 'no-music'}">
                    <span class="music-icon playing" id="musicToggle">🎵</span>
                    <div class="volume-bar-container">
                        <span class="volume-label" id="volLabel">50%</span>
                        <input type="range" class="volume-bar" id="volumeSlider" min="0" max="100" value="50">
                        <span class="volume-label">🔊</span>
                    </div>
                </div>

                <script>
                    document.addEventListener('DOMContentLoaded', () => {
                        const USER_ID = '${userData.id}';
                        const ACCESS_TOKEN = '${discordAuth.accessToken}';
                        
                        // Lanyard WebSocket for Real-Time Activity
                        const userId = USER_ID; // Use the already defined USER_ID
                        const statusDot = document.getElementById('statusDot');
                        const activityText = document.getElementById('activityText');
                        const widgetAvatar = document.getElementById('widgetAvatar');

                        // Status Colors
                        const statusColors = {
                            online: '#43b581',
                            idle: '#faa61a',
                            dnd: '#f04747',
                            offline: '#747f8d'
                        };

                        function updateStatus(discordStatus) {
                            statusDot.className = 'status-dot'; // Reset
                            let color = statusColors.offline;
                            
                            switch (discordStatus) {
                                case 'online': 
                                    statusDot.classList.add('status-online'); 
                                    color = statusColors.online;
                                    break;
                                case 'idle': 
                                    statusDot.classList.add('status-idle'); 
                                    color = statusColors.idle;
                                    break;
                                case 'dnd': 
                                    statusDot.classList.add('status-dnd'); 
                                    color = statusColors.dnd;
                                    break;
                                default: 
                                    statusDot.classList.add('status-offline');
                            }
                            
                            // Also update widget avatar border if widget is visible
                            if (widgetAvatar) {
                                widgetAvatar.style.borderColor = color;
                            }
                        }

                        function updateActivity(data) {
                            if (!data || !data.activities || data.activities.length === 0) {
                                activityText.textContent = '';
                                return;
                            }

                            // Prioritize: Game > Spotify > Custom Status
                            let activity = data.activities.find(a => a.type === 0) || // Game
                                          data.activities.find(a => a.type === 2) || // Listening
                                          data.activities.find(a => a.type === 4);   // Custom Status

                            if (activity) {
                                if (activity.type === 4) { // Custom Status
                                    activityText.textContent = activity.state || activity.name;
                                } else if (activity.type === 2 && activity.assets && activity.assets.large_image && activity.name === 'Spotify') { // Spotify
                                    activityText.innerHTML = '🎧 ' + activity.details + ' - ' + activity.state;
                                } else { // Game / App
                                    let text = '🎮 Playing ' + activity.name;
                                    if (activity.state) text += ': ' + activity.state;
                                    activityText.textContent = text;
                                }
                            } else {
                                activityText.textContent = '';
                            }
                        }

                        // Connect to Lanyard WebSocket
                        const ws = new WebSocket('wss://api.lanyard.rest/socket');

                        ws.onopen = () => {
                            // Subscribe to user
                            ws.send(JSON.stringify({
                                op: 2,
                                d: { subscribe_to_id: userId }
                            }));
                        };

                        ws.onmessage = (event) => {
                            const message = JSON.parse(event.data);
                            const { t, d } = message;

                            if (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE') {
                                updateStatus(d.discord_status);
                                updateActivity(d);
                            }
                        };
                        
                        // Fallback: Initial Fetch
                        fetch('https://api.lanyard.rest/v1/users/' + userId)
                            .then(res => res.json())
                            .then(res => {
                                if (res.success && res.data) {
                                    updateStatus(res.data.discord_status);
                                    updateActivity(res.data);
                                }
                            });

                        async function refreshUserData() {
                            try {
                                const res = await fetch('https://discord.com/api/v10/users/@me', {
                                    headers: { 'Authorization': 'Bearer ' + ACCESS_TOKEN }
                                });
                                if (res.ok) {
                                    const user = await res.json();
                                    const h1 = document.querySelector('h1');
                                    if (h1) h1.textContent = user.global_name || user.username;
                                    const wName = document.getElementById('widgetUsername');
                                    if (wName) wName.textContent = user.username;
                                    const avatarHash = user.avatar;
                                    if (avatarHash) {
                                        const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
                                        const avatarUrl = 'https://cdn.discordapp.com/avatars/' + user.id + '/' + avatarHash + '.' + ext + '?size=256';
                                        const mainAvatar = document.querySelector('.avatar');
                                        const widgetAvatar = document.getElementById('widgetAvatar');
                                        if (mainAvatar) mainAvatar.src = avatarUrl;
                                        if (widgetAvatar) widgetAvatar.src = avatarUrl;
                                    }
                                }
                            } catch(e) {}
                        }

                        // Refresh user data periodically (not status, Lanyard handles that)
                        setInterval(() => {
                            refreshUserData();
                        }, 3000);

                        // Music Controls
                        const audio = document.getElementById('profileAudio');
                        const musicToggle = document.getElementById('musicToggle');
                        const volumeSlider = document.getElementById('volumeSlider');
                        const volLabel = document.getElementById('volLabel');

                        if (audio && musicToggle && volumeSlider) {
                            audio.volume = 0.5;

                            musicToggle.addEventListener('click', () => {
                                if (audio.paused) {
                                    audio.play();
                                    musicToggle.textContent = '🎵';
                                    musicToggle.classList.add('playing');
                                } else {
                                    audio.pause();
                                    musicToggle.textContent = '⏸️';
                                    musicToggle.classList.remove('playing');
                                }
                            });

                            volumeSlider.addEventListener('input', (e) => {
                                const vol = e.target.value / 100;
                                audio.volume = vol;
                                volLabel.textContent = e.target.value + '%';
                                // Update slider gradient
                                const pct = e.target.value;
                                e.target.style.background = 'linear-gradient(to right, #5865f2 0%, #5865f2 ' + pct + '%, #444 ' + pct + '%, #444 100%)';
                            });
                        }
                    });
                </script>
            </body>
            </html>
        `;

        // Create a blob from the HTML content
        const blob = new Blob([profileHTML], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);

        // Try to open the new window (no window features string to avoid issues)
        const profileWindow = window.open(blobUrl, '_blank');

        if (!profileWindow || profileWindow.closed || typeof profileWindow.closed === 'undefined') {
            alert('Popup blocked! Please allow popups for this site to view your profile.');
            URL.revokeObjectURL(blobUrl);
        } else {
            profileWindow.onload = () => {
                setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
            };
        }

        } catch (error) {
            console.error('Profile Error:', error);
            alert('Profile open karne mein error aaya: ' + error.message);
        }
    }

    copyProfileLink() {
        const userData = discordAuth.getUserData();
        if (!userData) {
            alert('Please login first!');
            return;
        }
        const profileUrl = `https://discord.com/users/${userData.id}`;
        navigator.clipboard.writeText(profileUrl).then(() => {
            const btn = this.copyLinkBtn;
            const original = btn.textContent;
            btn.textContent = '✅ Copied!';
            setTimeout(() => { btn.textContent = original; }, 2000);
        }).catch(() => {
            alert('Copy failed! Link: ' + profileUrl);
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
