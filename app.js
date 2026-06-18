// CONFIGURATION: Replace these credentials with your actual project parameters
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";

// Initialize Supabase Client Connection Module
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Runtime States Map
let currentRoute = '#/home';
let routeParams = {};

// Application Layer Router Core Logic
function handleRouting() {
    const hash = window.location.hash || '#/home';
    const parts = hash.split('/');
    currentRoute = parts[0] + '/' + (parts[1] || '');
    
    if (parts[2]) {
        routeParams.id = parts[2];
    } else {
        routeParams = {};
    }

    renderView();
}

// Client DOM Renderer Core Switchboard
async function renderView() {
    const viewport = document.getElementById('app-viewport');
    viewport.innerHTML = ''; // Fresh DOM Wipe

    if (currentRoute === '#/home') {
        const homeView = document.getElementById('view-home').cloneNode(true);
        viewport.appendChild(homeView);
        await loadHomeCatalog();
    } 
    else if (currentRoute === '#/watch' && routeParams.id) {
        const watchView = document.getElementById('view-watch').cloneNode(true);
        viewport.appendChild(watchView);
        await initWatchPlayer(routeParams.id);
    } 
    else if (currentRoute === '#/admin') {
        const adminView = document.getElementById('view-admin').cloneNode(true);
        viewport.appendChild(adminView);
        initAdminDashboard();
    } else {
        window.location.hash = '#/home';
    }
}

// FEATURE ACTIONS: Home Platform Catalog Matrix
async function loadHomeCatalog() {
    const grid = document.getElementById('video-grid');
    const loading = document.getElementById('home-loading');
    const empty = document.getElementById('home-empty');

    try {
        const { data: videos, error } = await supabase
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        loading.classList.add('hidden');

        if (!videos || videos.length === 0) {
            empty.classList.remove('hidden');
            return;
        }

        videos.forEach(video => {
            const card = document.createElement('div');
            card.className = "group cursor-pointer flex flex-col space-y-3";
            card.onclick = () => window.location.hash = `#/watch/${video.id}`;
            
            card.innerHTML = `
                <div class="relative w-full aspect-video bg-neutral-900 rounded-xl overflow-hidden border border-neutral-900 group-hover:border-neutral-800 transition-all shadow-md">
                    <img src="${escapeHtml(video.thumbnail_url)}" alt="${escapeHtml(video.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
                </div>
                <div class="px-1">
                    <h3 class="font-bold text-sm text-neutral-200 line-clamp-2 group-hover:text-neutral-100 transition-colors tracking-tight">${escapeHtml(video.title)}</h3>
                    <p class="text-xs text-neutral-500 mt-1 font-medium">${video.view_count.toLocaleString()} views</p>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (err) {
        console.error("Catalog connection failure sequence:", err);
        loading.textContent = "Error communicating with database node cloud streams.";
    }
}

// FEATURE ACTIONS: Video Player Processing Sandbox Handler
async function initWatchPlayer(id) {
    try {
        const { data: video, error } = await supabase
            .from('videos')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !video) {
            document.getElementById('player-title').textContent = "Asset Resource Registry Entry Not Found";
            return;
        }

        // Increment structural dynamic database counter metric values uniquely per local state sessions
        const sessionKey = `viewed_${id}`;
        if (!sessionStorage.getItem(sessionKey)) {
            sessionStorage.setItem(sessionKey, 'true');
            await supabase
                .from('videos')
                .update({ view_count: video.view_count + 1 })
                .eq('id', id);
            
            video.view_count += 1;
        }

        document.getElementById('player-frame').src = video.embed_url;
        document.getElementById('player-title').textContent = video.title;
        document.getElementById('player-views').textContent = `${video.view_count.toLocaleString()} views`;

        // Configure Clipboard Share Interactivity Metrics
        document.getElementById('player-share-btn').onclick = () => {
            const trackingLink = `${window.location.origin}${window.location.pathname}#/watch/${id}`;
            const messagingPayload = `Check out "${video.title}" on GRABA: ${trackingLink}`;
            
            navigator.clipboard.writeText(messagingPayload).then(() => {
                alert("Share link and video details copied to clipboard!");
            }).catch(() => {
                alert(`Copy link manually:\n${messagingPayload}`);
            });
        };

    } catch (err) {
        console.error("Player initialization logic breakdown:", err);
    }
}

// FEATURE ACTIONS: Controlled System Admin Operations Panel
async function initAdminDashboard() {
    const authBox = document.getElementById('admin-auth-box');
    const dashboard = document.getElementById('admin-dashboard');
    const userTag = document.getElementById('admin-user-tag');

    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        authBox.classList.add('hidden');
        dashboard.classList.remove('hidden');
        userTag.textContent = `Operator: ${session.user.email}`;

        document.getElementById('publish-form').onsubmit = handlePublish;
        document.getElementById('logout-btn').onclick = async () => {
            await supabase.auth.signOut();
            window.location.reload();
        };
    } else {
        authBox.classList.remove('hidden');
        dashboard.classList.add('hidden');
        document.getElementById('login-form').onsubmit = handleLogin;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert(`Authorization Blocked: ${error.message}`);
    } else {
        initAdminDashboard();
    }
}

async function handlePublish(e) {
    e.preventDefault();
    const title = document.getElementById('pub-title').value;
    const thumbnail_url = document.getElementById('pub-thumb').value;
    const embed_url = document.getElementById('pub-embed').value;

    try {
        const { error } = await supabase.from('videos').insert([{
            title,
            thumbnail_url,
            embed_url
        }]);

        if (error) throw error;

        alert("Content indexed and pushed onto active public grids successfully!");
        window.location.hash = '#/home';

    } catch (err) {
        alert(`Publish error process rejection exception: ${err.message}`);
    }
}

// XSS Mitigation Input String Encoder
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Event Triggers Hook Systems
window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);
