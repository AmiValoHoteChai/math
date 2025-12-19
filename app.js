/* ============================================
   MATH HUB - Enhanced Application JavaScript
   Progress tracking, viewer, and utilities
   ============================================ */

// Storage key with version for cache busting
const KEY = 'math_hub_v7';
let data = JSON.parse(localStorage.getItem(KEY)) || {};

// Video source preference (local or drive)
const VIDEO_MODE_KEY = 'math_hub_video_mode';
let videoMode = localStorage.getItem(VIDEO_MODE_KEY) || 'local'; // 'local' or 'drive'

// Video URL mappings - local path to Google Drive URL
const VIDEO_URLS = {
    '2.1/Complex Variables (Concet & Math).mkv': 'https://drive.google.com/file/d/1fBMK8NLNTg58huMihkZzhiH1hSWBkTee/view',
    '2.2/Harmonic Function Concepts.mp4': 'https://drive.google.com/file/d/1j2JUunSzYiy1H1Uk1cJ26FEf8TTxlN3g/view',
    '2.2/Harmonic Function (Concept and Math).mp4': 'https://drive.google.com/file/d/1-mKI6eZgVTC5mHdOxOVmdkAIOJIfWaTQ/view',
    '3.1/Fourier Series 01.mkv': null, // Local only (under 100MB)
    '3.1/Fourier Series 02.mkv': 'https://drive.google.com/file/d/1zoVwsl-GUm6ZGXopUE8wSSbOmnQjKOO2/view',
    '3.1/Fourier Series 03.mkv': 'https://drive.google.com/file/d/1UTCNujvNz-xkbPax9mvHg9oHlsyXP-ZG/view',
    '3.1/Fourier Transform.mp4': 'https://drive.google.com/file/d/18Sl13FwnO-jfKSYzUXUrSETmMC5AwlAd/view'
};

// Toggle video source mode
function toggleVideoMode() {
    videoMode = videoMode === 'local' ? 'drive' : 'local';
    localStorage.setItem(VIDEO_MODE_KEY, videoMode);
    updateVideoModeUI();
    showToast(videoMode === 'local' ? '📁 Using local videos' : '☁️ Using Google Drive');
}

// Update toggle button UI
function updateVideoModeUI() {
    const toggleBtn = document.getElementById('videoModeToggle');
    const toggleText = document.getElementById('videoModeText');
    if (toggleBtn) {
        toggleBtn.classList.toggle('active', videoMode === 'drive');
    }
    if (toggleText) {
        toggleText.textContent = videoMode === 'local' ? 'Local' : 'Drive';
    }
}

// ========== Core Functions ==========

function save() {
    localStorage.setItem(KEY, JSON.stringify(data));
    refresh();
}

function refresh() {
    const items = document.querySelectorAll('.res-item');
    let done = 0;

    items.forEach(el => {
        const id = el.dataset.id;
        if (data[id]) {
            el.classList.add('done');
            done++;
        } else {
            el.classList.remove('done');
        }
    });

    // Update page stats
    const doneEl = document.getElementById('s-done');
    const totalEl = document.getElementById('s-total');
    const pctEl = document.getElementById('s-pct');

    if (doneEl) doneEl.textContent = done;
    if (pctEl && totalEl) {
        const total = parseInt(totalEl.textContent) || items.length;
        pctEl.textContent = Math.round((done / total) * 100) + '%';
    }
}

function toggle(id) {
    data[id] = !data[id];
    save();

    // Show toast notification
    showToast(data[id] ? '✅ Marked as complete!' : '↩️ Marked as incomplete');
}

// ========== Viewer Functions ==========

function openPDF(url) {
    const viewer = document.getElementById('viewer');
    const content = document.getElementById('viewer-content');

    content.innerHTML = `
        <div class="viewer-loading" id="viewerLoading">
            <div class="viewer-spinner"></div>
            <div class="viewer-loading-text">Loading PDF...</div>
        </div>
        <iframe src="${url}" onload="hideLoading()"></iframe>
    `;

    viewer.classList.add('open');
    document.body.style.overflow = 'hidden';
    history.pushState({ viewer: true }, '');
}

function openVideo(localUrl) {
    // Check if we should use Google Drive instead
    const driveUrl = VIDEO_URLS[localUrl];

    if (videoMode === 'drive' && driveUrl) {
        // Open Google Drive link in new tab
        window.open(driveUrl, '_blank');
        return;
    }

    // Play local video
    const viewer = document.getElementById('viewer');
    const content = document.getElementById('viewer-content');

    content.innerHTML = `
        <video src="${localUrl}" controls autoplay>
            Your browser does not support video playback.
        </video>
        <div class="keyboard-hint">
            <kbd>Esc</kbd><span>Close</span>
            <kbd>Space</kbd><span>Play/Pause</span>
            <kbd>F</kbd><span>Fullscreen</span>
        </div>
    `;

    viewer.classList.add('open');
    document.body.style.overflow = 'hidden';
    history.pushState({ viewer: true }, '');

    // Focus video for keyboard controls
    const video = content.querySelector('video');
    if (video) {
        video.focus();

        // Enhanced keyboard controls
        video.addEventListener('keydown', (e) => {
            if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    video.requestFullscreen();
                }
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                video.currentTime -= 10;
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                video.currentTime += 10;
            }
        });
    }
}

function hideLoading() {
    const loading = document.getElementById('viewerLoading');
    if (loading) loading.style.display = 'none';
}

function closeViewer() {
    const viewer = document.getElementById('viewer');
    const content = document.getElementById('viewer-content');

    // Stop video playback
    const video = content.querySelector('video');
    if (video) video.pause();

    viewer.classList.remove('open');
    content.innerHTML = '';
    document.body.style.overflow = '';
}

// ========== Toast Notifications ==========

function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
        <span class="toast-message">${message}</span>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ========== Tab System (for future use) ==========

function showTab(chapter, type) {
    const tabs = ['pdf', 'video', 'notes'];

    tabs.forEach(tab => {
        const panel = document.getElementById(`${chapter}-${tab}`);
        if (panel) panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`${chapter}-${type}`);
    if (activePanel) activePanel.classList.add('active');

    const tabBtns = document.querySelector(`[data-chapter="${chapter}"]`)?.querySelectorAll('.tab-btn');
    if (tabBtns) {
        tabBtns.forEach(t => t.classList.remove('active'));
        const typeIndex = tabs.indexOf(type);
        if (tabBtns[typeIndex]) tabBtns[typeIndex].classList.add('active');
    }
}

// ========== Progress Reset ==========

function resetProgress() {
    if (confirm('🗑️ Reset all progress? This cannot be undone.')) {
        data = {};
        save();
        showToast('Progress reset successfully', 'info');

        // Refresh progress displays
        if (typeof updateProgressRing === 'function') updateProgressRing();
        if (typeof updateChapterProgress === 'function') updateChapterProgress();
    }
}

// ========== Event Listeners ==========

// Keyboard shortcuts
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeViewer();
    }
});

// History navigation (back button closes viewer)
window.addEventListener('popstate', function (e) {
    const viewer = document.getElementById('viewer');
    if (viewer && viewer.classList.contains('open')) {
        closeViewer();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    refresh();
    updateVideoModeUI(); // Initialize video source toggle

    // Add entrance animations with stagger
    const animatedElements = document.querySelectorAll('.animate-fade-in');
    animatedElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });
});

// ========== Utility Functions ==========

// Debounce for search/filter
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Calculate total progress across all chapters
function calculateTotalProgress() {
    const allIds = [
        '21v1', '21p1', '21p2', '21p3',      // Chapter 2.1
        '22v1', '22v2', '22p1',               // Chapter 2.2
        '31v1', '31v2', '31v3', '31v4', '31p1', '31p2'  // Chapter 3.1
    ];

    const done = allIds.filter(id => data[id]).length;
    return {
        done,
        total: allIds.length,
        percentage: Math.round((done / allIds.length) * 100)
    };
}

// Export progress (for backup)
function exportProgress() {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'math-hub-progress.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Progress exported!');
}

// Import progress (from backup)
function importProgress(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            data = { ...data, ...imported };
            save();
            showToast('📤 Progress imported!');
            location.reload();
        } catch (err) {
            showToast('❌ Invalid file format', 'error');
        }
    };
    reader.readAsText(file);
}
