// Discord Authentication Module

class DiscordAuth {
    constructor() {
        this.accessToken = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        this.userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA)) || null;
    }

    /**
     * Generate Discord OAuth login URL
     */
    getLoginUrl() {
        const params = new URLSearchParams({
            client_id: CONFIG.CLIENT_ID,
            redirect_uri: CONFIG.REDIRECT_URI,
            response_type: 'code',
            scope: CONFIG.SCOPES.join(' ')
        });
        return `${CONFIG.DISCORD_OAUTH_URL}?${params.toString()}`;
    }

    /**
     * Check if user is already authenticated
     */
    isAuthenticated() {
        return !!this.accessToken && !!this.userData;
    }

    /**
     * Get current user data
     */
    getUserData() {
        return this.userData;
    }

    /**
     * Login with Discord (redirect to Discord OAuth)
     */
    login() {
        window.location.href = this.getLoginUrl();
    }

    /**
     * Handle OAuth callback
     */
    async handleCallback() {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (!code) {
            console.log('No authorization code found');
            return false;
        }

        try {
            // Exchange code for access token
            const tokenResponse = await fetch(`${CONFIG.DISCORD_API_BASE}/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: CONFIG.CLIENT_ID,
                    client_secret: CONFIG.CLIENT_SECRET,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: CONFIG.REDIRECT_URI
                })
            });

            if (!tokenResponse.ok) {
                throw new Error('Failed to get access token');
            }

            const tokenData = await tokenResponse.json();
            this.accessToken = tokenData.access_token;

            // Get user data
            const userResponse = await fetch(`${CONFIG.DISCORD_API_BASE}/users/@me`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!userResponse.ok) {
                throw new Error('Failed to get user data');
            }

            this.userData = await userResponse.json();

            // Save to localStorage
            localStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, this.accessToken);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(this.userData));

            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);

            return true;
        } catch (error) {
            console.error('Authentication error:', error);
            return false;
        }
    }

    /**
     * Logout user
     */
    logout() {
        this.accessToken = null;
        this.userData = null;
        localStorage.removeItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
    }

    /**
     * Get user's avatar URL
     */
    getAvatarUrl() {
        if (!this.userData) return null;
        if (!this.userData.avatar) return 'https://cdn.discordapp.com/embed/avatars/0.png';
        const size = 256;
        const format = this.userData.avatar.startsWith('a_') ? 'gif' : 'png';
        return `https://cdn.discordapp.com/avatars/${this.userData.id}/${this.userData.avatar}.${format}?size=${size}`;
    }

    /**
     * Get user's tag (username#discriminator or username)
     */
    getUserTag() {
        if (!this.userData) return null;
        if (this.userData.discriminator && this.userData.discriminator !== '0') {
            return `${this.userData.username}#${this.userData.discriminator}`;
        }
        return this.userData.username;
    }

    /**
     * Refresh user data from Discord API
     */
    async refreshUserData() {
        if (!this.accessToken) return null;
        try {
            const response = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            if (response.ok) {
                this.userData = await response.json();
                localStorage.setItem('discord_user_data', JSON.stringify(this.userData));
                return this.userData;
            }
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
        return null;
    }
}

// Create global instance
const discordAuth = new DiscordAuth();
