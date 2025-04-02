// Theme handling
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Function to toggle theme
function toggleTheme(e) {
    if (e.target.checked) {
        // User selected dark mode
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        // User selected light mode
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Event listener for theme toggle
themeToggle.addEventListener('change', toggleTheme);

// Check for saved theme preference or system preference
const currentTheme = localStorage.getItem('theme') || 
    (prefersDarkScheme.matches ? 'light' : 'dark');

// Apply the correct theme and set the checkbox state
if (currentTheme === 'dark') {
    themeToggle.checked = true;  // Ensure checkbox reflects dark mode
    document.documentElement.setAttribute('data-theme', 'light');  // Apply dark theme
} else {
    themeToggle.checked = false;  // Ensure checkbox reflects light mode
    document.documentElement.setAttribute('data-theme', 'dark');  // Apply light theme
}

// Listen for system theme changes (when the user changes their system theme)
prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {  // Only update if no theme is saved in localStorage
        themeToggle.checked = e.matches;
        document.documentElement.setAttribute('data-theme', e.matches ? 'light' : 'dark');
    }
});




function showUpdateNotification() {
    const notification = document.getElementById('update-notification');
    const closeBtn = document.getElementById('close-notification');

   
    if (localStorage.getItem('updateNotificationShown')) {
        return;
    }


    notification.classList.add('show');

   
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        localStorage.setItem('updateNotificationShown', 'true'); 
    });
}


document.addEventListener('DOMContentLoaded', () => {
    showUpdateNotification();
});