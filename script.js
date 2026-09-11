// Global storage helper
const Storage = {
    get: (key) => JSON.parse(localStorage.getItem(key)) || [],
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    add: (key, item) => {
        const data = Storage.get(key);
        data.push({...item, id: Date.now()});
        Storage.set(key, data);
        return data;
    },
    remove: (key, id) => {
        const data = Storage.get(key).filter(item => item.id !== id);
        Storage.set(key, data);
        return data;
    },
    update: (key, id, updates) => {
        const data = Storage.get(key).map(item => 
            item.id === id ? {...item, ...updates} : item
        );
        Storage.set(key, data);
        return data;
    }
};

// Navigation active state
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
        if (currentPath.includes(link.getAttribute('href').replace('.html', ''))) {
            link.classList.add('active');
        }
    });

    // Set home as active if on index.html
    if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
        document.querySelector('a[href="index.html"]')?.classList.add('active');
    }
});

// Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Load dark mode preference
window.addEventListener('load', () => {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});

// Notification helper
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// Export data
function exportData() {
    const data = {
        notes: Storage.get('notes'),
        tasks: Storage.get('tasks'),
        events: Storage.get('events'),
        schedules: Storage.get('schedules')
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-space-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Import data
function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.notes) Storage.set('notes', data.notes);
            if (data.tasks) Storage.set('tasks', data.tasks);
            if (data.events) Storage.set('events', data.events);
            if (data.schedules) Storage.set('schedules', data.schedules);
            showNotification('Data imported successfully!');
            location.reload();
        } catch (error) {
            showNotification('Error importing data', 'error');
        }
    };
    reader.readAsText(file);
}

console.log('Study Space loaded successfully!');
