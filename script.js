/**
 * Student Study Space - Main JavaScript
 * Enhanced with dark mode, notifications, and robust storage management
 */

// ============================================
// STORAGE MANAGEMENT SYSTEM
// ============================================

const Storage = {
    /**
     * Safely retrieve data from localStorage
     */
    get: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error parsing ${key} from storage:`, error);
            return [];
        }
    },

    /**
     * Safely store data to localStorage
     */
    set: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Storage quota exceeded or error for ${key}:`, error);
            return false;
        }
    },

    /**
     * Add new item to collection
     */
    add: (key, item) => {
        const data = Storage.get(key);
        const newItem = {
            ...item,
            id: Date.now() + Math.random(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        data.push(newItem);
        Storage.set(key, data);
        return newItem;
    },

    /**
     * Remove item by ID
     */
    remove: (key, id) => {
        const data = Storage.get(key).filter(item => item.id !== id);
        Storage.set(key, data);
        return data;
    },

    /**
     * Update item by ID
     */
    update: (key, id, updates) => {
        const data = Storage.get(key).map(item =>
            item.id === id ? {
                ...item,
                ...updates,
                updatedAt: new Date().toISOString()
            } : item
        );
        Storage.set(key, data);
        return data;
    },

    /**
     * Clear entire collection
     */
    clear: (key) => {
        Storage.set(key, []);
    },

    /**
     * Get total items count
     */
    count: (key) => {
        return Storage.get(key).length;
    },

    /**
     * Find item by property
     */
    find: (key, predicate) => {
        return Storage.get(key).find(predicate);
    },

    /**
     * Filter items by property
     */
    filter: (key, predicate) => {
        return Storage.get(key).filter(predicate);
    }
};

// ============================================
// DARK MODE MANAGEMENT
// ============================================

class DarkMode {
    static init() {
        const preference = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Apply dark mode if user preference exists or system prefers dark
        if (preference === 'true' || (preference === null && prefersDark)) {
            this.enable();
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem('darkMode') === null) {
                e.matches ? this.enable() : this.disable();
            }
        });

        // Add dark mode toggle button listener if it exists
        const darkModeBtn = document.getElementById('darkModeToggle');
        if (darkModeBtn) {
            darkModeBtn.addEventListener('click', () => this.toggle());
        }
    }

    static toggle() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        Notification.show(isDark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
    }

    static enable() {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    }

    static disable() {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
    }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

class Notification {
    static show(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');

        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close" aria-label="Close notification">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);

        const closeBtn = notification.querySelector('.notification-close');
        const remove = () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        };

        closeBtn.addEventListener('click', remove);
        setTimeout(remove, duration);
    }

    static success(msg, duration) {
        this.show(msg, 'success', duration);
    }

    static error(msg, duration) {
        this.show(msg, 'error', duration);
    }

    static info(msg, duration) {
        this.show(msg, 'info', duration);
    }

    static warning(msg, duration) {
        this.show(msg, 'warning', duration);
    }
}

// ============================================
// NAVIGATION MANAGEMENT
// ============================================

class Navigation {
    static init() {
        const currentPath = window.location.pathname;
        const links = document.querySelectorAll('.nav-menu a');

        links.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');

            if (this.isCurrentPage(currentPath, href)) {
                link.classList.add('active');
            }
        });
    }

    static isCurrentPage(path, href) {
        if ((path.includes('index.html') || path.endsWith('/')) && href === 'index.html') {
            return true;
        }
        return path.includes(href.replace('.html', ''));
    }
}

// ============================================
// DATA MANAGEMENT
// ============================================

class DataManager {
    /**
     * Export all data as JSON file
     */
    static export() {
        const data = {
            notes: Storage.get('notes'),
            tasks: Storage.get('tasks'),
            events: Storage.get('events'),
            schedules: Storage.get('schedules'),
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `study-space-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
        Notification.success('📥 Data exported successfully!');
    }

    /**
     * Import data from JSON file
     */
    static import(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Validate data structure
                if (!data.version) {
                    throw new Error('Invalid backup file format');
                }

                // Import data collections
                if (data.notes) Storage.set('notes', data.notes);
                if (data.tasks) Storage.set('tasks', data.tasks);
                if (data.events) Storage.set('events', data.events);
                if (data.schedules) Storage.set('schedules', data.schedules);

                Notification.success('✅ Data imported successfully!');
                setTimeout(() => location.reload(), 500);
            } catch (error) {
                Notification.error('❌ Error importing data: ' + error.message);
            }
        };

        reader.onerror = () => {
            Notification.error('❌ Error reading file');
        };

        reader.readAsText(file);
    }

    /**
     * Get statistics for dashboard
     */
    static getStats() {
        return {
            notes: Storage.count('notes'),
            tasks: Storage.count('tasks'),
            completedTasks: Storage.filter('tasks', t => t.completed).length,
            events: Storage.count('events'),
            schedules: Storage.count('schedules'),
            studyStreak: this.calculateStudyStreak()
        };
    }

    /**
     * Calculate study streak from notes creation dates
     */
    static calculateStudyStreak() {
        const notes = Storage.get('notes');
        if (notes.length === 0) return 0;

        const dates = new Set(notes.map(n =>
            new Date(n.createdAt).toISOString().split('T')[0]
        ));

        return dates.size;
    }

    /**
     * Clear all data (with confirmation)
     */
    static clearAll() {
        if (confirm('⚠️ Are you sure? This will delete all your data permanently.')) {
            Storage.clear('notes');
            Storage.clear('tasks');
            Storage.clear('events');
            Storage.clear('schedules');
            Notification.success('All data cleared');
            location.reload();
        }
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

class KeyboardShortcuts {
    static init() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K: Search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.handleSearch();
            }

            // Cmd/Ctrl + D: Dark Mode Toggle
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                DarkMode.toggle();
            }

            // Cmd/Ctrl + E: Export Data
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                DataManager.export();
            }

            // Escape: Close modals
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }

    static handleSearch() {
        Notification.info('🔍 Search functionality coming soon!');
    }

    static closeModals() {
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => modal.classList.remove('active'));
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Sanitize user input
 */
function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
}

/**
 * Format date for display
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format time for display
 */
function formatTime(time) {
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// OFFLINE SUPPORT
// ============================================

class OfflineSupport {
    static init() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(reg => {
                console.log('✅ Service Worker registered');
            }).catch(err => {
                console.log('ℹ️ Service Worker registration skipped:', err);
            });
        }

        // Listen for online/offline events
        window.addEventListener('online', () => {
            Notification.success('📡 Back online!');
        });

        window.addEventListener('offline', () => {
            Notification.warning('📡 You are offline - changes will sync when online');
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all systems
    Navigation.init();
    DarkMode.init();
    KeyboardShortcuts.init();
    OfflineSupport.init();

    console.log('✅ Study Space loaded successfully!');
});

// Fallback for older browsers
if (!window.matchMedia) {
    window.matchMedia = () => ({ matches: false });
}
