window.finalizePreloader = () => {
    const preloader = document.getElementById('preloader');
    const texts = document.querySelectorAll('.loading-text-filling, .loading-subtext-filling');
    texts.forEach(t => t.classList.add('glitch-stop'));
    document.body.classList.add('loaded');
    
    // Immediately show anything already in viewport
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add('visible');
    });

    // Re-check on scroll as well
    if (!window.hasScrollReveal) {
        window.addEventListener('scroll', () => {
             document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add('visible');
            });
        });
        window.hasScrollReveal = true;
    }

    setTimeout(() => {
        if (preloader) {
            preloader.classList.add('hide');
            setTimeout(() => preloader.remove(), 1000);
        }
    }, 1200);
};
const finalizePreloader = window.finalizePreloader;


let sbClient = null;
try {
    const supabaseUrl = 'https://maestlpaeoyamtvaxvur.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZXN0bHBhZW95YW10dmF4dnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjkyMTQsImV4cCI6MjA5MDM0NTIxNH0.c8ZtyewSXEMehQqANwXHS1XzAVtyx9TuyDKwq8qsBaU';
    if (window.supabase) {
        sbClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    } else {
        console.warn("Supabase library failed to load (possibly due to adblocker or no internet). Falling back to offline mode.");
    }
} catch (err) {
    console.error("Failed to initialize Supabase:", err);
}

window.globalArticles = [];
const CACHE_KEY = 'crimson_db_cache_v2';
const STORAGE_KEY = CACHE_KEY; // Support legacy references if any remain

// 0. Smart Environment Routing Logic (Fixes file:// and Server paths)
const isLocalEnv = window.location.protocol === 'file:' || 
    ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(window.location.hostname) ||
    window.location.hostname.startsWith('192.168.') || 
    window.location.hostname.endsWith('.local');
const pageExt = isLocalEnv ? '.html' : '';

const isArticlePage = window.location.pathname.includes('/article') || !!document.getElementById('article-title');
const isDashboard = window.location.pathname.includes('/admin') || !!document.getElementById('admin-sidebar') || !!document.getElementById('admin-login-screen');
const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html' || (!isArticlePage && !isDashboard);

// Helper to sanitize links for the current environment
const getSafeLink = (path) => {
    if (!path) return '#';
    if (path === '/' || path === './' || path === '') return isLocalEnv ? 'index.html' : '/';
    if (path.startsWith('http')) return path; // External Link
    
    // Remove leading slash for local file consistency
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // For local, append .html if it's a page link
    if (isLocalEnv) {
        if (cleanPath === 'article') return './article.html';
        if (cleanPath === 'admin') return './admin.html';
        return `./${cleanPath}${cleanPath.includes('.') ? '' : '.html'}`;
    }
    
    return `/${cleanPath}`;
};

const getArticleLink = (identifier) => {
    if (isLocalEnv) {
        return `article.html?slug=${identifier}`;
    }
    return `/article/${identifier}`;
};

// Dynamic Theme Engine
const themeMap = {
    crimson: { primary: '#D90429', dark: '#8D0801' },
    orange: { primary: '#f97316', dark: '#c2410c' },
    purple: { primary: '#8b5cf6', dark: '#5b21b6' },
    green: { primary: '#10b981', dark: '#047857' },
    // Event Themes
    christmas: { primary: '#c41e3a', dark: '#165b33' },
    newyear: { primary: '#d4af37', dark: '#1a1a1a' },
    holi: { primary: '#ec4899', dark: '#facc15' },
    onam: { primary: '#fbbf24', dark: '#1e3a8a' },
    neon3d: { primary: '#00f2ff', dark: '#00878f' }
};

// --- GLOBAL UTILITIES ---
window.switchToSection = (sectionId) => {
    const sections = document.querySelectorAll('.admin-section');
    const items = document.querySelectorAll('.sidebar-item');
    if (sections.length === 0) return; // Not on admin page
    
    sections.forEach(s => s.classList.remove('active'));
    items.forEach(i => i.classList.remove('active'));
    
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.add('active');
        items.forEach(item => {
            if (item.getAttribute('data-section') === sectionId) item.classList.add('active');
        });
        if (sectionId === 'section-manage' && typeof window.renderAdminList === 'function') {
            window.renderAdminList(window.globalArticles);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

const applyTheme = () => {
    const savedTheme = localStorage.getItem('crimson_theme') || 'crimson';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const colors = themeMap[savedTheme];
    if (colors) {
        document.documentElement.style.setProperty('--primary-red', colors.primary);
        document.documentElement.style.setProperty('--dark-red', colors.dark);
    }
};
applyTheme();

// Content protection disabled per user request


// Utility to strip HTML for pure text excerpts
const stripHtml = (html) => {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

window.formatDoc = (cmd, value = null) => {
    if (cmd === 'createLink' && value === null) return;
    document.execCommand(cmd, false, value);
};

window.insertTable = () => {
    const rows = prompt("Enter number of rows:", "3");
    const cols = prompt("Enter number of columns:", "3");
    if (!rows || !cols || isNaN(rows) || isNaN(cols)) return;

    let tableHTML = '<table class="editor-table" style="width:100%; border-collapse:collapse; margin: 1rem 0; border: 1px solid #e2e8f0;">';
    for (let i = 0; i < rows; i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < cols; j++) {
            tableHTML += `<td style="border: 1px solid #e2e8f0; padding: 12px; min-width: 50px;">${i === 0 ? "<b>Header</b>" : "Data"}</td>`;
        }
        tableHTML += '</tr>';
    }
    tableHTML += '</table><p><br></p>';

    document.execCommand('insertHTML', false, tableHTML);
};

let lastInteractedImage = null;
window.resizeActiveImage = (size) => {
    if (lastInteractedImage) {
        lastInteractedImage.style.width = size;
        lastInteractedImage.style.height = 'auto';
        // Remove selection after action for clean UI
        setTimeout(() => {
            lastInteractedImage.classList.remove('selected-editor-img');
            lastInteractedImage = null;
        }, 1000);
    } else {
        alert("Please click an image inside the editor first to select it for resizing.");
    }
};

// Global listener for image selection in rich-editors
document.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'IMG' && e.target.closest('.rich-editor')) {
        lastInteractedImage = e.target;
        document.querySelectorAll('.rich-editor img').forEach(img => img.classList.remove('selected-editor-img'));
        e.target.classList.add('selected-editor-img');
    }
});

window.addCaptionToImage = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const img = (container.nodeType === 1 && container.tagName === 'IMG') ? container : container.querySelector ? container.querySelector('img') : null;

    if (img) {
        const captionText = prompt("Enter Image Caption:", "");
        if (captionText !== null) {
            let figure = img.closest('figure');
            if (!figure) {
                figure = document.createElement('figure');
                figure.style.margin = '1rem auto';
                figure.style.textAlign = 'center';
                img.parentNode.insertBefore(figure, img);
                figure.appendChild(img);
            }
            let figcaption = figure.querySelector('figcaption');
            if (!figcaption) {
                figcaption = document.createElement('figcaption');
                figcaption.style.fontSize = '0.85rem';
                figcaption.style.color = '#64748b';
                figcaption.style.marginTop = '0.5rem';
                figcaption.style.fontStyle = 'italic';
                figure.appendChild(figcaption);
            }
            figcaption.innerText = captionText;
        }
    } else {
        alert("Please click on an image first to add a caption.");
    }
};

// Utility to generate short, clean URL-friendly slug from headline
const generateSlug = (title) => {
    if (!title) return '';
    return title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
};

// Generate a compact 6-character random ID
const generateShortId = () => Math.random().toString(36).substring(2, 8);

// Canvas Downscaler and WebP Converter to optimize performance and LocalStorage Quota
const compressMedia = (file, callback) => {
    if (!file.type.startsWith('image/')) {
        // For non-images (like small videos), just read as dataURL
        const reader = new FileReader();
        reader.onload = e => callback(e.target.result);
        reader.readAsDataURL(file);
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            // Scale down large uploads to 1200px max width for web efficiency
            if (width > 1200) { 
                height *= 1200 / width; 
                width = 1200; 
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Draw with white background to handle transparency if converting from PNG
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // Export to WebP with 0.75 quality for optimal weight/fidelity ratio
            callback(canvas.toDataURL('image/webp', 0.75));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

// --- GLOBAL RENDERING FUNCTIONS (Pinned to top to avoid hoisting issues) ---

window.renderAnalytics = (articles) => {
    const totalViewsEl = document.getElementById('stat-total-views');
    if (!totalViewsEl) return;
    const allArticles = articles || [];
    const totalViews = allArticles.reduce((sum, a) => sum + (parseInt(a.views) || 0), 0);
    const publishedCount = allArticles.filter(a => !a.archived).length;
    const archivedCount = allArticles.filter(a => a.archived).length;
    const visitCount = parseInt(localStorage.getItem('asif_visits') || '0');

    totalViewsEl.innerText = totalViews.toLocaleString();
    const visitsEl = document.getElementById('stat-visits');
    if (visitsEl) visitsEl.innerText = visitCount.toLocaleString();
    const pubEl = document.getElementById('stat-published');
    if (pubEl) pubEl.innerText = publishedCount;
    const archEl = document.getElementById('stat-archived-count');
    if (archEl) archEl.innerText = `${archivedCount} archived`;

    if (allArticles.length > 0) {
        const sortedByViews = [...allArticles].sort((a, b) => (parseInt(b.views) || 0) - (parseInt(a.views) || 0));
        const topPost = sortedByViews[0];
        const tpEl = document.getElementById('stat-top-post');
        if (tpEl) tpEl.innerText = topPost.title;
        const tvEl = document.getElementById('stat-top-views');
        if (tvEl) tvEl.innerText = `${(topPost.views || 0).toLocaleString()} views`;

        const totalWords = allArticles.reduce((sum, a) => sum + (stripHtml(a.content || "").split(/\s+/).length), 0);
        const avgReadingTime = Math.ceil(totalWords / (allArticles.length * 200)); 
        const rtEl = document.getElementById('stat-avg-read');
        if (rtEl) rtEl.innerText = `${avgReadingTime} min`;

        const cats = {};
        allArticles.forEach(a => {
            const c = (a.category || "General").toLowerCase();
            cats[c] = (cats[c] || 0) + (parseInt(a.views) || 0);
        });
        const topCat = Object.keys(cats).reduce((a, b) => cats[a] > cats[b] ? a : b);
        const tcEl = document.getElementById('stat-top-category');
        if (tcEl) tcEl.innerText = topCat.charAt(0).toUpperCase() + topCat.slice(1);
        const cpEl = document.getElementById('stat-cat-popularity');
        if (cpEl) cpEl.innerText = `${cats[topCat].toLocaleString()} total views`;

        const engagement = visitCount > 0 ? Math.min(100, (totalViews / (visitCount * 1.5)) * 10).toFixed(1) : "0";
        const isEl = document.getElementById('stat-impact-score');
        if (isEl) isEl.innerText = `${engagement}/100`;
    }
};

window.renderAdminList = (articles) => {
    const adminList = document.getElementById('content-list');
    if (!adminList) return;
    adminList.innerHTML = '';
    const allPosts = (articles || []).slice().sort((a, b) => (new Date(b.date) - new Date(a.date)) || 0);
    allPosts.forEach(article => {
        const isArchived = article.archived === true;
        const isUnlisted = article.unlisted === true;
        const li = document.createElement('li');
        li.className = 'admin-list-item' + (isArchived ? ' is-archived' : '') + (isUnlisted ? ' is-unlisted' : '');
        li.dataset.articleId = article.id;
        li.innerHTML = `
            <div class="admin-item-thumb"><img src="${article.image || ''}" onerror="this.style.display='none'"></div>
            <div class="admin-item-info">
                <div class="admin-item-title">${article.title}</div>
                <div class="admin-item-meta">
                    ${isArchived ? '<span class="admin-badge badge-archived">Archived</span>' : isUnlisted ? '<span class="admin-badge" style="background:#8b5cf6;color:#fff;">Hidden</span>' : '<span class="admin-badge badge-active">Live</span>'}
                    <span>${article.date}</span>
                    <span style="color: var(--primary-red); font-weight: 700;">👁️ ${article.views || 0}</span>
                </div>
            </div>
            <div class="admin-item-actions">
                <button class="admin-action-btn edit-btn" ${isArchived ? 'disabled' : ''}>✏️ Edit</button>
                <button class="admin-action-btn unlist-btn">${isUnlisted ? '👁️ Show' : '🙈 Hide'}</button>
                <button class="admin-action-btn archive-btn">${isArchived ? '↩ Restore' : '📦 Archive'}</button>
                <button class="admin-action-btn delete-btn">🗑️</button>
            </div>`;
        adminList.appendChild(li);
    });
    window.renderAnalytics(articles);
};

window.showSkeletons = (container, count = 3) => {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        container.innerHTML += `<div class="article-card skeleton-loader" style="height: 480px; min-width: 350px; opacity: 0.5;"></div>`;
    }
};

let heroSlideInterval = null;
window.renderHero = () => {
    const heroContainer = document.getElementById('hero-slider-container');
    if (!heroContainer) return;
    let articles = window.globalArticles || [];
    let activeArticles = articles.filter(a => !a.archived && !a.unlisted);
    const latestThree = activeArticles.slice().sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    let heroSlidesHTML = '';
    let dotsHTML = '';

    if (latestThree.length === 0) {
        heroSlidesHTML = `<div class="hero-slide active"><div class="hero-content"><h1>No Articles Found</h1></div></div>`;
    } else {
        latestThree.forEach((article, idx) => {
            const titleWords = article.title.split(' ');
            let formattedTitle = article.title;
            if (titleWords.length > 1) {
                formattedTitle = `<span>${titleWords[0]}</span> ${titleWords.slice(1).join(' ')}`;
            }
            const rawText = stripHtml(article.content || "");
            const snippet = rawText.length > 180 ? rawText.substring(0, 180) + '...' : rawText;
            const slug = generateSlug(article.title) || article.id;
            heroSlidesHTML += `<div class="hero-slide ${idx === 0 ? 'active' : ''}" data-id="${article.id}">
                    <div class="hero-content">
                        <span class="hero-label">${article.category}</span>
                        <h2 class="hero-title">${formattedTitle}</h2>
                        <p>${snippet}</p>
                        <a href="${getArticleLink(slug)}" class="btn btn-primary" style="margin-top: 1rem;">Start Reading</a>
                    </div>
                    <div class="hero-image-wrapper">
                        <img src="${article.image}" alt="${article.title}" loading="eager">
                    </div>
                </div>`;
            dotsHTML += `<div class="hero-dot ${idx === 0 ? 'active' : ''}" data-slide="${idx}"></div>`;
        });
    }

    if (latestThree.length > 1) {
        heroContainer.innerHTML = heroSlidesHTML + `<div class="hero-pagination">${dotsHTML}</div>`;
    } else {
        heroContainer.innerHTML = heroSlidesHTML;
    }

    if (heroSlideInterval) { clearInterval(heroSlideInterval); heroSlideInterval = null; }

    const slides = heroContainer.querySelectorAll('.hero-slide');
    const dots = heroContainer.querySelectorAll('.hero-dot');

    if (slides.length > 1) {
        let currentSlide = 0;
        slides.forEach((s, i) => { if (i !== 0) { s.style.transition = 'none'; s.classList.add('enter-from-right'); } });

        const goToSlide = (idx) => {
            const prevSlideIdx = currentSlide;
            if (prevSlideIdx === idx) return;
            const goingForward = idx > prevSlideIdx || (prevSlideIdx === slides.length - 1 && idx === 0);
            slides[idx].style.transition = 'none';
            slides[idx].classList.remove('active', 'enter-from-right', 'enter-from-left', 'prev-to-left', 'prev-to-right');
            slides[idx].classList.add(goingForward ? 'enter-from-right' : 'enter-from-left');
            slides[idx].offsetWidth;
            slides[idx].style.transition = '';
            slides[prevSlideIdx].classList.remove('active', 'enter-from-right', 'enter-from-left');
            slides[prevSlideIdx].classList.add(goingForward ? 'prev-to-left' : 'prev-to-right');
            if (dots.length > 0) dots[prevSlideIdx].classList.remove('active');
            currentSlide = idx;
            slides[currentSlide].classList.remove('enter-from-right', 'enter-from-left');
            slides[currentSlide].classList.add('active');
            if (dots.length > 0) dots[currentSlide].classList.add('active');
            setTimeout(() => {
                slides.forEach((s, i) => {
                    if (i !== currentSlide) {
                        s.style.transition = 'none';
                        s.classList.remove('prev-to-left', 'prev-to-right', 'enter-from-right', 'enter-from-left', 'active');
                        s.classList.add('enter-from-right');
                    }
                });
            }, 900);
        };

        const startInterval = () => { heroSlideInterval = setInterval(() => { goToSlide((currentSlide + 1) % slides.length); }, 5000); };

        dots.forEach((dot, idx) => { dot.addEventListener('click', () => { clearInterval(heroSlideInterval); goToSlide(idx); startInterval(); }); });

        if (!heroContainer.dataset.touchBound) {
            heroContainer.dataset.touchBound = '1';
            let tX = 0;
            heroContainer.addEventListener('touchstart', e => { tX = e.changedTouches[0].screenX; }, { passive: true });
            heroContainer.addEventListener('touchend', e => {
                const endX = e.changedTouches[0].screenX;
                if (endX < tX - 50) { clearInterval(heroSlideInterval); goToSlide((currentSlide + 1) % slides.length); startInterval(); }
                else if (endX > tX + 50) { clearInterval(heroSlideInterval); goToSlide((currentSlide - 1 + slides.length) % slides.length); startInterval(); }
            }, { passive: true });
        }
        startInterval();
    }
};

window.renderArticles = () => {
    const gridContainer = document.querySelector('.articles-grid');
    const listContainer = document.querySelector('.new-blogs-list');
    const vlogsContainer = document.querySelector('.vlogs-list');
    const allArticlesContainer = document.querySelector('.all-articles-list');

    const activeArticles = (window.globalArticles || []).filter(a => !a.archived && !a.unlisted).sort((a, b) => new Date(b.date) - new Date(a.date));
    if (activeArticles.length === 0) return;

    if (gridContainer) gridContainer.innerHTML = '';
    if (listContainer) listContainer.innerHTML = '';
    if (vlogsContainer) vlogsContainer.innerHTML = '';
    if (allArticlesContainer) allArticlesContainer.innerHTML = '';

    const buildCard = (article, idx) => {
        const rawText = stripHtml(article.content || "");
        const snippet = rawText.length > 100 ? rawText.substring(0, 100) + '...' : rawText;
        const slug = generateSlug(article.title) || article.id;
        return `
            <a href="${getArticleLink(slug)}" class="article-card glass-effect reveal" style="transition-delay: ${idx * 0.1}s">
                <div class="article-card-image">
                    <img src="${article.image}" alt="${article.title}" loading="lazy">
                    <span class="hero-label" style="position: absolute; top: 1rem; left: 1rem; font-size: 0.7rem;">${article.category}</span>
                </div>
                <div class="article-card-content">
                    <div class="article-meta">${article.date} &bull; 3 min read</div>
                    <h3 class="article-card-title">${article.title}</h3>
                    <p class="article-card-excerpt">${snippet}</p>
                    <div class="read-more-link">Read Full Story &rarr;</div>
                </div>
            </a>`;
    };

    const buildListItem = (article, idx) => {
        const rawText = stripHtml(article.content || "");
        const slug = generateSlug(article.title) || article.id;
        return `
            <a href="${getArticleLink(slug)}" class="blog-list-item glass-effect reveal" style="transition-delay: ${idx * 0.05}s">
                <div class="blog-list-img">
                    <img src="${article.image}" alt="${article.title}" loading="lazy">
                </div>
                <div class="blog-list-content">
                    <div class="hero-label" style="display: inline-block; margin-bottom: 1rem;">${article.category.toUpperCase()}</div>
                    <h3 style="font-size: 2rem; font-weight: 800; color: var(--text-dark); margin-bottom: 0.5rem;">${article.title}</h3>
                    <p style="font-size: 1.1rem; margin-bottom: 1.5rem; color: var(--text-light);">${rawText ? rawText.substring(0, 120) + '...' : ''}</p>
                    <div class="article-meta">${article.date} &bull; 5 min read</div>
                </div>
            </a>`;
    };

    if (gridContainer && !gridContainer.classList.contains('vlogs-list') && !gridContainer.classList.contains('all-articles-list')) {
        let trending = activeArticles.slice(0, 3);
        trending.forEach((a, idx) => gridContainer.insertAdjacentHTML('beforeend', buildCard(a, idx)));
    }
    if (listContainer) {
        let blogPosts = activeArticles.slice(3, 9);
        blogPosts.forEach((a, idx) => listContainer.insertAdjacentHTML('beforeend', buildListItem(a, idx)));
    }
    if (vlogsContainer) {
        let vlogs = activeArticles.filter(a => a.category.toLowerCase().includes('vlog'));
        if (vlogs.length === 0) vlogs = activeArticles.slice(0, 6);
        vlogs.forEach((a, idx) => vlogsContainer.insertAdjacentHTML('beforeend', buildCard(a, idx)));
    }
    if (allArticlesContainer) {
        activeArticles.forEach((a, idx) => allArticlesContainer.insertAdjacentHTML('beforeend', buildCard(a, idx)));
    }

    // NEW: Observe revealed elements and trigger immediate visibility check
    if (window.revealObserver) {
        document.querySelectorAll('.reveal:not(.visible)').forEach(el => window.revealObserver.observe(el));
    }
    
    // Force a small delay to ensure DOM is ready then check viewport
    setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add('visible');
        });
    }, 100);

    if (window.location.protocol !== 'file:') {
        setTimeout(() => {
            const heroImgs = document.querySelectorAll('.hero-image-wrapper img');
            heroImgs.forEach(img => { if (typeof window.addVisualWatermarkToImg === 'function') window.addVisualWatermarkToImg(img); });
        }, 1000);
    }
    window.renderHero();
};

window.renderSingleArticle = (foundArticle) => {
    if (!foundArticle) return;
    if (foundArticle.renderDone) return;
    foundArticle.renderDone = true;

    document.title = foundArticle.title + " - Asif Ansari";
    const cleanSlug = (generateSlug(foundArticle.title) || foundArticle.id);
    const seoPath = '/article/' + cleanSlug;
    const fullSeoUrl = 'https://blog.asifpmn.in' + seoPath;

    if (!isLocalEnv && window.location.pathname !== seoPath) {
        // Prevent redirect loop - only push if we're not already on a path that would rewrite to this
        if (!window.location.search.includes('slug=')) {
            window.history.replaceState(null, '', seoPath);
        }
    }

    const rawText = stripHtml(foundArticle.content || "");
    const snippet = rawText.length > 150 ? rawText.substring(0, 150) + '...' : rawText;

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', fullSeoUrl);
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', snippet);

    const titleEl = document.getElementById('article-title');
    if (titleEl) titleEl.innerText = foundArticle.title;
    const bodyEl = document.getElementById('article-content');
    if (bodyEl) {
        bodyEl.innerHTML = foundArticle.content;
        
        // --- CUSTOM ARTICLE CSS INJECTION ---
        let existingStyle = document.getElementById('article-custom-styles');
        if (existingStyle) existingStyle.remove();
    }

    const imgEl = document.getElementById('main-article-img');
    const imgSkeleton = document.getElementById('image-skeleton');
    if (imgEl && foundArticle.image) {
        imgEl.crossOrigin = "anonymous";
        imgEl.onload = () => { imgEl.style.opacity = '1'; if (imgSkeleton) imgSkeleton.style.display = 'none'; };
        imgEl.src = foundArticle.image;
    }

    const catEl = document.getElementById('article-category-label');
    if (catEl) { catEl.innerText = foundArticle.category; catEl.classList.remove('skeleton-text'); catEl.style.background = ''; }

    const metaEl = document.getElementById('article-meta');
    if (metaEl) { metaEl.innerHTML = `<span>By Authorized Admin</span><span>${foundArticle.date}</span><span>5 min read</span>`; }

    const moreContainer = document.getElementById('more-articles-container');
    if (moreContainer) {
        const activeArticles = (window.globalArticles || []).filter(a => !a.archived && !a.unlisted);
        const others = activeArticles.filter(a => a.id !== foundArticle.id).reverse().slice(0, 3);
        let nextHTML = "";
        others.forEach(a => {
            const slug = generateSlug(a.title) || a.id;
            nextHTML += `<a href="${getArticleLink(slug)}" class="article-card"><div class="article-card-image"><img src="${a.image}" alt=""></div><div class="article-card-content"><h3>${a.title}</h3></div></a>`;
        });
        moreContainer.innerHTML = nextHTML;
    }

    if (window.articleRenderPromiseResolve) window.articleRenderPromiseResolve();
    
    // Ensure visibility
    setTimeout(() => {
        const art = document.querySelector('article.reveal');
        if (art) art.classList.add('visible');
        if (window.revealObserver) {
            document.querySelectorAll('.reveal').forEach(el => window.revealObserver.observe(el));
        }
    }, 100);
};

document.addEventListener('DOMContentLoaded', async () => {
    // --- High-Priority Admin Setup (MUST run before other logic) ---
    if (isDashboard) {
        const loginScreen = document.getElementById('admin-login-screen');
        const loginForm = document.getElementById('admin-login-form');
        
        const setupAdminInterface = () => {
            if (loginScreen) {
                loginScreen.style.display = 'none';
                loginScreen.style.opacity = '0';
            }
            document.body.style.overflow = '';
            
            const logoutBtn = document.getElementById('admin-logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    sessionStorage.removeItem('crimson_admin_auth');
                    window.location.reload();
                });
            }

            let idleTime = 0;
            const resetIdle = () => idleTime = 0;
            ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt => window.addEventListener(evt, resetIdle));
            setInterval(() => { if (++idleTime >= 1800) { sessionStorage.removeItem('crimson_admin_auth'); window.location.reload(); } }, 1000);

            const refreshAdminData = async () => {
                if (sbClient) {
                    const { data } = await sbClient.from('articles').select('*').order('date', { ascending: false });
                    if (data) {
                        window.globalArticles = data;
                        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                    }
                }
                if (typeof window.renderAdminList === 'function') window.renderAdminList(window.globalArticles);
                if (typeof window.renderAnalytics === 'function') window.renderAnalytics(window.globalArticles);
            };
            refreshAdminData();
        };

        if (sessionStorage.getItem('crimson_admin_auth') === 'true') {
            setupAdminInterface();
        } else {
            if (loginScreen) {
                loginScreen.style.display = 'flex';
                loginScreen.style.opacity = '1';
                document.body.style.overflow = 'hidden';
            }
            if (loginForm) {
                const loginBtn = document.getElementById('admin-login-btn');
                const userInput = document.getElementById('admin-username');
                const passInput = document.getElementById('admin-password');

                const performLogin = () => {
                    const user = userInput ? userInput.value.trim() : "";
                    const pass = passInput ? passInput.value.trim() : "";
                    
                    // Obscured verification logic
                    if (btoa(user) === 'MTIzdXA=' && btoa(pass) === 'MTIzdXA=') {
                        sessionStorage.setItem('crimson_admin_auth', 'true');
                        alert("Authentication Successful. Entering Dashboard...");
                        if (loginScreen) {
                            loginScreen.style.opacity = '0';
                            setTimeout(setupAdminInterface, 400);
                        } else {
                            setupAdminInterface();
                        }
                    } else {
                        const err = document.getElementById('login-error');
                        if (err) {
                            err.style.display = 'block';
                            err.textContent = "Incorrect Credentials. Please try again.";
                            err.style.animation = 'none';
                            void err.offsetWidth;
                            err.style.animation = 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both';
                        } else {
                            alert("Incorrect Credentials. Please try again.");
                        }
                    }
                };

                if (loginBtn) loginBtn.addEventListener('click', performLogin);
                [userInput, passInput].forEach(inp => {
                    if (inp) inp.addEventListener('keypress', (e) => { if (e.key === 'Enter') performLogin(); });
                });
            }
        }
    }

    // 0. Initial Supabase Check
    if (!sbClient && window.supabase) {
        try {
            const supabaseUrl = 'https://maestlpaeoyamtvaxvur.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZXN0bHBhZW95YW10dmF4dnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjkyMTQsImV4cCI6MjA5MDM0NTIxNH0.c8ZtyewSXEMehQqANwXHS1XzAVtyx9TuyDKwq8qsBaU';
            sbClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        } catch (err) { console.error("Supabase late init failed", err); }
    }

    // Shared Watermarking Utility
    window.addVisualWatermarkToImg = (img) => {
        if (!img || img.dataset.watermarked || img.parentElement.classList.contains('watermark-wrapper')) return;
        const processImg = () => {
            if (img.width < 150) return;
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width; canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Load Logo for Watermark
                const logo = new Image();
                logo.crossOrigin = "anonymous";
                logo.src = "/logo.png";
                logo.onload = () => {
                    const logoSize = Math.floor(canvas.width * 0.15); // 15% of image width
                    const padding = 20;
                    const x = canvas.width - logoSize - padding;
                    const y = padding;
                    ctx.globalAlpha = 0.15;
                    ctx.drawImage(logo, x, y, logoSize, (logoSize * logo.height) / logo.width);
                    ctx.globalAlpha = 1.0;

                    canvas.toBlob((blob) => {
                        const watermarkedUrl = URL.createObjectURL(blob);
                        const wrapper = document.createElement('div');
                        wrapper.className = 'watermark-wrapper';
                        wrapper.setAttribute('style', 'position:relative; display:inline-block; width:100%; overflow:hidden;');
                        img.parentNode.insertBefore(wrapper, img);
                        const watermarkedOverlay = new Image();
                        watermarkedOverlay.src = watermarkedUrl;
                        watermarkedOverlay.setAttribute('style', 'position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; opacity:0.1; z-index:10;');
                        img.style.position = 'relative';
                        img.style.zIndex = '1';
                        img.style.pointerEvents = 'none';
                        wrapper.appendChild(img);
                        wrapper.appendChild(watermarkedOverlay);
                        img.dataset.watermarked = 'true';
                    }, 'image/webp', 0.85);
                };
                logo.onerror = () => {
                    ctx.font = '24px Inter';
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.fillText('Asif Ansari', 20, 40);
                    img.dataset.watermarked = 'true';
                };
            } catch (e) {
                img.dataset.watermarked = 'true';
            }
        };
        if (!img.crossOrigin) { img.crossOrigin = "anonymous"; }
        if (img.complete) processImg();
        else img.addEventListener('load', processImg, { once: true });
    };

    // 12. Theme Switcher Logic Logic (logic already at top/bottom, keeping cleanup)


    // 0. Fix links and assets for local file vs server environment
    const fixAssetsForLocal = () => {
        if (!isLocalEnv) return;
        document.querySelectorAll('a[href^="/"]').forEach(link => {
            link.setAttribute('href', getSafeLink(link.getAttribute('href')));
        });
        document.querySelectorAll('link[href^="/"]').forEach(link => {
            const path = link.getAttribute('href').substring(1);
            link.setAttribute('href', `./${path}`);
        });
        document.querySelectorAll('script[src^="/"]').forEach(scr => {
            const path = scr.getAttribute('src').substring(1);
            scr.setAttribute('src', `./${path}`);
        });
    };
    fixAssetsForLocal();

    // 1. Unified Preloader & Startup Logic
    applyTheme();
    const preloader = document.getElementById('preloader');

    // Create a promise that resolves when the page is truly ready (e.g. article fetched)
    let pageReadyPromise = Promise.resolve();
    if (isArticlePage) {
        pageReadyPromise = new Promise(resolve => {
            window.articleRenderPromiseResolve = resolve;
            // Max wait 3 seconds for article fetch before opening preloader anyway
            setTimeout(resolve, 3000);
        });
    }

    if (preloader) {
        if (sessionStorage.getItem('asif_preloader_seen')) {
            preloader.remove();
            window.finalizePreloader();
        } else {
            const textElements = document.querySelectorAll('.loading-text-filling, .loading-subtext-filling');
            let count = 0;
            const interval = setInterval(async () => {
                count += Math.floor(Math.random() * 8) + 3; // Slighly faster
                if (count >= 100) {
                    count = 100;
                    clearInterval(interval);
                    textElements.forEach(el => {
                        el.style.setProperty('--loading-progress', '100%');
                        el.classList.add('glitch-stop');
                    });

                    sessionStorage.setItem('asif_preloader_seen', 'true');
                    window.finalizePreloader();
                } else {
                    textElements.forEach(el => el.style.setProperty('--loading-progress', count + '%'));
                }
            }, 30);
        }
    } else {
        window.finalizePreloader(); // Fallback if no preloader element
    }

    // Safety fallback: Always kill preloader after 2 seconds no matter what
    setTimeout(() => {
        if (typeof window.finalizePreloader === "function") {
            window.finalizePreloader();
        } else {
            document.getElementById("preloader")?.remove();
        }
    }, 2000);

    // Track site visits (unique per browser session)
    const visitCount = parseInt(localStorage.getItem('asif_visits') || '0') + 1;
    if (!sessionStorage.getItem('asif_visited')) {
        localStorage.setItem('asif_visits', visitCount);
        sessionStorage.setItem('asif_visited', '1');
    }

    // --- Optimized Data Flow ---
    window.renderAllSections = () => {
        // 1. Home Page renders
        if (typeof window.renderArticles === 'function') window.renderArticles();
        if (typeof window.renderHero === 'function') window.renderHero();
        
        // 2. Admin Dashboard renders
        if (isDashboard) {
            if (typeof window.renderAdminList === 'function') window.renderAdminList(window.globalArticles);
            if (typeof window.renderAnalytics === 'function') window.renderAnalytics(window.globalArticles);
        }

        // 3. Single Article Page logic
        if (isArticlePage) {
            const urlParams = new URLSearchParams(window.location.search);
            const slug = urlParams.get('slug') || urlParams.get('id');
            const pathParts = window.location.pathname.split('/');
            const pathSlug = window.location.pathname.includes('/article/') ? decodeURIComponent(pathParts[pathParts.indexOf('article') + 1].replace(/\/$/, '')) : null;
            const targetId = slug || pathSlug;

            if (targetId) {
                const found = (window.globalArticles || []).find(a => 
                    a.id === targetId || generateSlug(a.title) === targetId
                );
                if (found) {
                    // SECURE ARCHIVE: If article is archived, it must not be accessible via link
                    if (found.archived === true) {
                        console.warn("Archived content access denied.");
                        window.location.href = isLocalEnv ? 'index.html' : '/';
                        return;
                    }
                    window.renderSingleArticle(found);
                } else if (window.globalArticles.length > 0) {
                    // Data loaded but article not found
                    const titleEl = document.getElementById('article-title');
                    if (titleEl) titleEl.innerHTML = "Post Not Found <span style='font-size: 1rem; display:block; margin-top:1rem; opacity:0.6;'>The article you're looking for might have been moved or archived.</span>";
                    const bodyEl = document.getElementById('article-content');
                    if (bodyEl) bodyEl.innerHTML = "<div style='text-align:center; padding: 3rem 0;'><a href='/' class='btn btn-primary'>Return to Home</a></div>";
                    const sk = document.getElementById('image-skeleton');
                    if (sk) sk.style.display = 'none';
                    if (window.finalizePreloader) window.finalizePreloader();
                }
            } else {
                // Default to latest article if no slug provided on article page
                const active = (window.globalArticles || []).filter(a => !a.archived && !a.unlisted)
                    .sort((a,b) => new Date(b.date) - new Date(a.date));
                if (active.length > 0) window.renderSingleArticle(active[0]);
            }
        }
    };

    const initSiteData = async () => {
        // 1. Load from cache for instant UI
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                window.globalArticles = JSON.parse(cached);
                window.renderAllSections();
            } catch (e) { console.warn("Cache parse failed"); }
        }

        // 2. Priority Fetch: Fresh data from Supabase
        try {
            if (sbClient) {
                const { data, error } = await sbClient.from('articles').select('*').order('date', { ascending: false });
                if (!error && data) {
                    window.globalArticles = data;
                    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                    window.renderAllSections();
                }
            } else {
                // Fallback to Vercel API
                const res = await fetch('/api/posts');
                if (res.ok) {
                    const data = await res.json();
                    window.globalArticles = data;
                    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                    window.renderAllSections();
                }
            }
        } catch (err) {
            console.error("Fetch failed, continuing with cache:", err);
            // Even if network fails, trigger a final render just in case
            window.renderAllSections();
        }
    };

    // Execute Data Init
    initSiteData();

    // 0.5. Core Admin & Rendering Functions (Must be defined before first use)
    // Analytics and Admin List rendering (logic moved to top level)


    // Admin list logic moved up


    // --- Admin sections and sidebar items logic is handled at the start of DOMContentLoaded ---


    // 1. Navigation setup
    const navbar = document.querySelector('.navbar');
    const progressBar = document.getElementById('reading-progress');

    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        }

        // Reading Progress Logic
        if (progressBar) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + "%";
        }


    });

    // 1.5. Page Transition (Subtle Fade In)
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.6s ease';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });

    // --- Awwwards Style Interactivity ---

    // Custom Cursor Logic
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Add hover effects to all buttons and links
        const interactiveEls = document.querySelectorAll('a, button, .sidebar-item, .article-card, .blog-list-item');
        interactiveEls.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });
    }

    // Magnetic Buttons implementation
    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-outline, .logo');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
            btn.style.transition = 'transform 0.1s ease-out';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
        });
    });

    // 2. Intersection Observer
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    window.revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                window.revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => window.revealObserver.observe(el));

    // Skeleton Loader Utility (used global version)


    // Show skeletons immediately while data loads (only if no cached data yet)
    const gridContainer_sk = document.querySelector('.articles-grid');
    const listContainer_sk = document.querySelector('.new-blogs-list');
    const vlogsContainer_sk = document.querySelector('.vlogs-list');
    const allArticlesContainer_sk = document.querySelector('.all-articles-list');
    if (!window.globalArticles || window.globalArticles.length === 0) {
        if (typeof window.showSkeletons === 'function') {
            window.showSkeletons(gridContainer_sk);
            window.showSkeletons(listContainer_sk, 3);
            window.showSkeletons(vlogsContainer_sk);
            window.showSkeletons(allArticlesContainer_sk, 6);
        }
    }

    // Initial hero render (uses cached data if available, or stays empty until API responds)
    if (typeof window.renderHero === 'function') window.renderHero();


    // buildCard and buildListItem moved up


    // renderArticles logic moved up


    // (Skeleton display and showSkeletons definition are above, near line 709)

    const tiltElements = document.querySelectorAll('.article-card, .blog-list-item');
    tiltElements.forEach(el => {
        el.style.transformStyle = 'preserve-3d';
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const percentX = (x - centerX) / centerX;
            const percentY = -((y - centerY) / centerY);
            const maxRotate = window.innerWidth > 992 ? 8 : 2;

            el.style.transform = `perspective(1000px) rotateY(${percentX * maxRotate}deg) rotateX(${percentY * maxRotate}deg) scale3d(1.02, 1.02, 1.02)`;
            el.style.transition = 'transform 0.1s ease-out';

            let glare = el.querySelector('.glare');
            if (!glare) {
                glare = document.createElement('div');
                glare.className = 'glare';
                glare.style.position = 'absolute';
                glare.style.inset = '0';
                glare.style.pointerEvents = 'none';
                glare.style.zIndex = '10';
                glare.style.transition = 'opacity 0.3s ease';
                el.appendChild(glare);
            }
            glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.2), transparent 60%)`;
            glare.style.opacity = '1';

            const content = el.querySelector('.article-card-content, .blog-list-content');
            if (content) {
                content.style.transform = 'translateZ(40px)';
                content.style.transition = 'transform 0.1s ease-out';
            }
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)`;
            el.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
            const glare = el.querySelector('.glare');
            if (glare) glare.style.opacity = '0';
            const content = el.querySelector('.article-card-content, .blog-list-content');
            if (content) {
                content.style.transform = 'translateZ(0px)';
                content.style.transition = 'transform 0.6s ease';
            }
        });
    });

    if (document.getElementById('content-list')) {
        window.renderAdminList(window.globalArticles);
    }

    const fileInput = document.getElementById('cover-image');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const fileNameDisplay = document.getElementById('file-name-display');
            if (e.target.files.length > 0) {
                fileNameDisplay.textContent = e.target.files[0].name;
                fileNameDisplay.style.color = 'var(--primary-red)';
                fileNameDisplay.style.fontWeight = 'bold';
            }
        });
    }

    // Body Image Inserter Logic
    const setupImageInserter = (btnId, inputId, editorId) => {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        const editor = document.getElementById(editorId);

        if (btn && input && editor) {
            btn.addEventListener('click', () => input.click());
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    compressMedia(file, (imgSrc) => {
                        editor.focus();
                        const imgHtml = `<img src="${imgSrc}" style="width:100%; border-radius:12px; margin: 1.5rem 0;" class="editable-img">`;
                        document.execCommand('insertHTML', false, imgHtml);
                    });
                }
            });
        }
    };

    setupImageInserter('btn-insert-image', 'body-image-upload', 'content');
    setupImageInserter('modal-btn-insert-image', 'modal-body-image-upload', 'modal-content-body');

    // Handle Custom Category Visibility
    const setupCustomCategoryToggle = (selectId, inputId) => {
        const select = document.getElementById(selectId);
        const input = document.getElementById(inputId);
        if (select && input) {
            select.addEventListener('change', () => {
                input.style.display = select.value === 'custom' ? 'block' : 'none';
                if (select.value === 'custom') input.focus();
            });
        }
    };
    setupCustomCategoryToggle('category', 'custom-category');
    setupCustomCategoryToggle('modal-category', 'modal-custom-category');

    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = uploadForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            const title = document.getElementById('title').value;
            const contentEl = document.getElementById('content');
            const contentBody = contentEl ? (contentEl.tagName === 'DIV' ? contentEl.innerHTML : contentEl.value) : "";
            const selectCategory = document.getElementById('category');
            const customCategoryInput = document.getElementById('custom-category');
            let category = "Article";
            
            if (selectCategory) {
                if (selectCategory.value === 'custom' && customCategoryInput && customCategoryInput.value.trim()) {
                    category = customCategoryInput.value.trim();
                } else if (selectCategory.options[selectCategory.selectedIndex]) {
                    const text = selectCategory.options[selectCategory.selectedIndex].text;
                    if (text !== "Select a domain") { category = text; }
                }
            }
            const proceedWithSave = async (imgSrc) => {
                btn.innerHTML = `<span style="display:inline-block; animation: spin 1s linear infinite;">⏳</span> Publishing...`;
                btn.style.opacity = '0.8';
                btn.style.pointerEvents = 'none';
                const formatDatetimeStr = (val) => {
                    const d = val ? new Date(val) : new Date();
                    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
                };
                const postDateRaw = document.getElementById('post-date').value;
                const postDate = formatDatetimeStr(postDateRaw);
                const slug = generateSlug(title) || generateShortId();
                const coverCaption = document.getElementById('cover-caption-input').value.trim();
                const newArticle = { id: slug, title: title, category: category, content: contentBody, date: postDate, image: imgSrc, cover_caption: coverCaption, archived: false };

                const { data: insertedData, error } = sbClient ? await sbClient.from('articles').insert([newArticle]).select() : { error: { message: "Offline" } };

                if (error) {
                    alert("Supabase error: " + error.message);
                    btn.innerHTML = originalText;
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                    return;
                }

                btn.innerHTML = `✅ Published!`;
                btn.style.background = '#10B981';

                // Immediately push to local state to prevent replication delay from hiding it
                const finalArticle = (insertedData && insertedData.length > 0) ? insertedData[0] : newArticle;
                window.globalArticles.push(finalArticle);
                localStorage.setItem('crimson_db_cache_v2', JSON.stringify(window.globalArticles));
                window.renderAdminList(window.globalArticles);

                setTimeout(async () => {
                    if (typeof window.switchToSection === 'function') { window.switchToSection('section-manage'); }
                    btn.innerHTML = 'Publish to Live Site';
                    btn.style.background = '';
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                    uploadForm.reset();
                    if (customCategoryInput) customCategoryInput.style.display = 'none';
                    if (contentEl) contentEl.innerHTML = '';
                    document.getElementById('file-name-display').textContent = 'Drag and drop a high-res file, or click to browse';
                }, 1500);
            };
            const coverFile = fileInput.files[0];
            if (coverFile) compressMedia(coverFile, proceedWithSave);
            else proceedWithSave('https://updowninteractive.com/media/article-fallback.jpg');
        });
    }

    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const modalFileInput = document.getElementById('modal-cover-image');
    if (editModal) {
        document.getElementById('close-modal').addEventListener('click', () => editModal.classList.remove('active'));
        document.getElementById('cancel-modal').addEventListener('click', () => editModal.classList.remove('active'));
    }
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = editForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            const editId = document.getElementById('modal-edit-id').value;
            const title = document.getElementById('modal-title').value;
            const contentEl = document.getElementById('modal-content-body');
            const contentBody = contentEl ? (contentEl.tagName === 'DIV' ? contentEl.innerHTML : contentEl.value) : "";
            const selectCategory = document.getElementById('modal-category');
            const customInput = document.getElementById('modal-custom-category');
            let category = "Article";
            
            if (selectCategory) {
                if (selectCategory.value === 'custom' && customInput && customInput.value.trim()) {
                    category = customInput.value.trim();
                } else {
                    category = selectCategory.options[selectCategory.selectedIndex].text;
                }
            }
            

            const postDateRaw = document.getElementById('modal-post-date').value;
            const formatDate = (val) => {
                const d = val ? new Date(val) : new Date();
                return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
            };
            const postDate = formatDate(postDateRaw);

            const proceedWithUpdate = async (imgSrc) => {
                btn.innerHTML = `⏳ Saving...`;
                btn.style.pointerEvents = 'none';
                try {
                    const coverCaption = document.getElementById('modal-cover-caption-input').value.trim();
                    let updateData = { title, category, date: postDate, content: contentBody, cover_caption: coverCaption };
                    if (imgSrc) updateData.image = imgSrc;

                    const { error } = sbClient
                        ? await sbClient.from('articles').update(updateData).eq('id', editId)
                        : { error: { message: "Offline" } };

                    if (error) throw error;

                    btn.innerHTML = `✅ Saved!`;
                    btn.style.background = '#10B981';

                    // Update local state
                    const index = (window.globalArticles || []).findIndex(a => a.id === editId);
                    if (index !== -1) {
                        window.globalArticles[index] = { ...window.globalArticles[index], ...updateData };
                        localStorage.setItem('crimson_db_cache_v2', JSON.stringify(window.globalArticles));
                        window.renderAdminList(window.globalArticles);
                    }

                    setTimeout(() => {
                        editModal.classList.remove('active');
                        if (customInput) customInput.style.display = 'none';
                        btn.innerHTML = originalText;
                        btn.style.background = '';
                        btn.style.pointerEvents = 'auto';
                    }, 800);

                } catch (err) {
                    console.error("Save error:", err);
                    alert("Failed to save changes: " + (err.message || "Unknown error"));
                    btn.innerHTML = originalText;
                    btn.style.pointerEvents = 'auto';
                }
            };

            const coverFile = modalFileInput.files[0];
            if (coverFile) compressMedia(coverFile, proceedWithUpdate);
            else proceedWithUpdate(null);
        });
    }

    document.body.addEventListener('click', function (e) {
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.closest('li').dataset.articleId;
            const found = (window.globalArticles || []).find(a => a.id === id);
            if (found && editModal) {
                document.getElementById('modal-title').value = found.title;
                const contentEl = document.getElementById('modal-content-body');
                if (contentEl) contentEl.innerHTML = found.content || '';
                document.getElementById('modal-edit-id').value = found.id;
                document.getElementById('modal-cover-caption-input').value = found.cover_caption || '';

                // Populate Category
                const catSelect = document.getElementById('modal-category');
                const catCustomInput = document.getElementById('modal-custom-category');
                if (catSelect) {
                    const options = Array.from(catSelect.options);
                    const matchingOpt = options.find(o => o.text.toLowerCase() === (found.category || '').toLowerCase());
                    if (matchingOpt && matchingOpt.value !== 'custom') {
                        catSelect.value = matchingOpt.value;
                        if (catCustomInput) catCustomInput.style.display = 'none';
                    } else {
                        catSelect.value = 'custom';
                        if (catCustomInput) {
                            catCustomInput.style.display = 'block';
                            catCustomInput.value = found.category || '';
                        }
                    }
                }

                // Populate Date Picker (if valid format)
                const dateInput = document.getElementById('modal-post-date');
                if (dateInput && found.date) {
                    try {
                        const d = new Date(found.date);
                        if (!isNaN(d.getTime())) {
                            const formatted = d.toISOString().slice(0, 16);
                            dateInput.value = formatted;
                        }
                    } catch (err) { console.error("Date parse error", err); }
                }

                editModal.classList.add('active');
            }
        }
        else if (e.target.classList.contains('unlist-btn')) {
            const id = e.target.closest('li').dataset.articleId;
            const article = (window.globalArticles || []).find(a => a.id === id);
            if (article) {
                const btn = e.target;
                const newUnlisted = !article.unlisted;
                btn.innerText = '⏳...';
                if (sbClient) {
                    sbClient.from('articles').update({ unlisted: newUnlisted }).eq('id', id)
                        .then(({ error }) => {
                            if (error) throw error;
                            article.unlisted = newUnlisted;
                            localStorage.setItem('crimson_db_cache_v2', JSON.stringify(window.globalArticles));
                            window.renderAdminList(window.globalArticles);
                        })
                        .catch(err => {
                            console.error("Unlist error:", err);
                            alert("Failed to update visibility");
                            window.renderAdminList(window.globalArticles);
                        });
                }
            }
        }
        else if (e.target.classList.contains('archive-btn')) {
            const id = e.target.closest('li').dataset.articleId;
            const article = (window.globalArticles || []).find(a => a.id === id);
            if (article) {
                const btn = e.target;
                const newArchived = !article.archived;
                btn.innerText = "⏳...";
                if (sbClient) {
                    sbClient.from('articles').update({ archived: newArchived }).eq('id', id)
                        .then(({ error }) => {
                            if (error) throw error;
                            article.archived = newArchived;
                            localStorage.setItem('crimson_db_cache_v2', JSON.stringify(window.globalArticles));
                            window.renderAdminList(window.globalArticles);
                        })
                        .catch(err => {
                            console.error("Archive error:", err);
                            alert("Failed to archive article");
                            window.renderAdminList(window.globalArticles);
                        });
                }
            }
        }
        else if (e.target.classList.contains('delete-btn')) {
            const id = e.target.closest('li').dataset.articleId;
            if (confirm('Are you permanently deleting this article? This cannot be undone.')) {
                if (sbClient) {
                    sbClient.from('articles').delete().eq('id', id)
                        .then(({ error }) => {
                            if (error) throw error;
                            window.globalArticles = window.globalArticles.filter(a => a.id !== id);
                            localStorage.setItem('crimson_db_cache_v2', JSON.stringify(window.globalArticles));
                            window.renderAdminList(window.globalArticles);
                        })
                        .catch(err => {
                            console.error("Delete error:", err);
                            alert("Failed to delete article");
                        });
                }
            }
        }
    });

    // Final Page setup


    if (isArticlePage) {
        const urlParams = new URLSearchParams(window.location.search);
        // Robust Slug Extraction
        const pathParts = window.location.pathname.split('/');
        const pathSlug = window.location.pathname.includes('/article/') ? decodeURIComponent(pathParts[pathParts.indexOf('article') + 1].replace(/\/$/, '')) : null;
        let articleId = urlParams.get('slug') || urlParams.get('id') || pathSlug;
        if (articleId === "") articleId = null;

        const tryInitialRender = () => {
            const articles = window.globalArticles || [];
            if (articles.length === 0) return; // Wait for data

            let foundArticle = articles.find(a => a.id === articleId || generateSlug(a.title) === articleId);

            if (!foundArticle && !articleId) {
                const active = articles.filter(a => !a.archived && !a.unlisted).sort((a,b) => new Date(b.date) - new Date(a.date));
                foundArticle = active[0];
            }

            if (foundArticle) {
                if (foundArticle.archived === true) {
                    window.location.href = isLocalEnv ? 'index.html' : '/';
                    return;
                }
                window.renderSingleArticle(foundArticle);
            } else if (articleId && articles.length > 0) {
                console.warn("Article not found:", articleId);
                // Optional: redirect to 404 or show msg
            }
        };

        // Call immediately but also data fetch will trigger it via renderAllSections
        tryInitialRender();
    }

    // 12. Theme Switcher Logic
    const themeBtns = document.querySelectorAll('.theme-btn');
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.setItem('crimson_theme', btn.dataset.theme);
            applyTheme();
        });
    });
    // 14. Mobile Menu Toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // --- DEEP LINKING FOR EDITING ---
    if (isDashboard) {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        if (editId) {
            const checkDataAndEdit = () => {
                const articles = window.globalArticles || [];
                if (articles.length > 0) {
                    const found = articles.find(a => a.id === editId || generateSlug(a.title) === editId);
                    if (found) {
                        // We use a safe way to trigger the existing edit logic
                        const fakeEvent = { 
                            target: { 
                                classList: { contains: (c) => c === 'edit-btn' },
                                closest: () => ({ dataset: { id: found.id } })
                            }
                        };
                        // Note: To properly trigger the modal, we need to call the logic 
                        // that script.js already has for 'edit-btn'
                        const editHandler = document.body.onclick || (() => {}); 
                        // Actually, I'll just trigger a real click if possible or call modalOpen
                        setTimeout(() => {
                           const btn = Array.from(document.querySelectorAll('.edit-btn')).find(b => b.closest('.admin-list-item')?.dataset.id === found.id);
                           if (btn) btn.click();
                        }, 500);
                    }
                } else {
                    setTimeout(checkDataAndEdit, 500);
                }
            };
            checkDataAndEdit();
        }
    }
});

const style = document.createElement('style');
style.textContent = "@keyframes spin { 100% { transform: rotate(360deg); } }";
document.head.appendChild(style);
