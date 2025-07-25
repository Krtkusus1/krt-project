// Theme switching functionality
class ThemeManager {
    constructor() {
        this.body = document.body;
        this.themeCheckbox = document.getElementById('theme-checkbox');
        this.init();
    }

    init() {
        // Add event listener for manual theme switching
        this.themeCheckbox.addEventListener('change', () => {
            this.handleManualToggle();
        });

        // Initialize theme on page load
        this.initializeTheme();
    }

    handleManualToggle() {
        const isDarkMode = this.themeCheckbox.checked;
        
        if (isDarkMode) {
            this.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            this.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }

    initializeTheme() {
        // Priority 1: Check user's saved preference
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
            this.applyTheme(savedTheme);
            return;
        }

        // Priority 2: Try to get automatic theme based on location
        this.getAutomaticTheme();
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            this.body.classList.add('dark-mode');
            this.themeCheckbox.checked = true;
        } else {
            this.body.classList.remove('dark-mode');
            this.themeCheckbox.checked = false;
        }
    }

    getAutomaticTheme() {
        // Check if geolocation is available
        if (!navigator.geolocation) {
            console.log('Geolocation is not supported by this browser');
            this.applyTheme('light'); // Default to light theme
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.fetchSunriseSunset(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.log('Error getting location:', error.message);
                this.applyTheme('light'); // Default to light theme if location access denied
            }
        );
    }

    async fetchSunriseSunset(latitude, longitude) {
        try {
            const response = await fetch(
                `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch sunrise/sunset data');
            }

            const data = await response.json();
            
            if (data.status === 'OK') {
                this.determineThemeFromSunData(data.results);
            } else {
                throw new Error('Invalid response from sunrise-sunset API');
            }
        } catch (error) {
            console.error('Error fetching sunrise/sunset data:', error);
            this.applyTheme('light'); // Default to light theme on error
        }
    }

    determineThemeFromSunData(sunData) {
        const now = new Date();
        const sunrise = new Date(sunData.sunrise);
        const sunset = new Date(sunData.sunset);

        // Check if current time is after sunset or before sunrise (night time)
        const isNightTime = now > sunset || now < sunrise;

        if (isNightTime) {
            this.applyTheme('dark');
        } else {
            this.applyTheme('light');
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});