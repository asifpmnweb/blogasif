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
const STORAGE_KEY = 'crimson_articles';

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
const applyTheme = () => {
    const savedTheme = localStorage.getItem('crimson_theme') || 'crimson';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const colors = themeMap[savedTheme];
    if (colors) {
        document.documentElement.style.setProperty('--primary-red', colors.primary);
        document.documentElement.style.setProperty('--dark-red', colors.dark);
    }

    if (localStorage.getItem('crimson_dark_mode') === 'true') {
        document.documentElement.classList.add('dark-mode');
    } else {
        document.documentElement.classList.remove('dark-mode');
    }
};
applyTheme();

// ====== CONTENT PROTECTION ENGINE ======
// Only active on public pages (not admin)
if (!window.location.pathname.includes('admin')) {

    // 1. Disable Right-Click
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // 2. Disable keyboard shortcuts for DevTools & View Source
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12') { e.preventDefault(); return false; }
        // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools)
        if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) { e.preventDefault(); return false; }
        // Ctrl+U (View Source)
        if (e.ctrlKey && ['U', 'u'].includes(e.key)) { e.preventDefault(); return false; }
        // Ctrl+S (Save Page)
        if (e.ctrlKey && ['S', 's'].includes(e.key)) { e.preventDefault(); return false; }
        // Ctrl+A (Select All)
        if (e.ctrlKey && ['A', 'a'].includes(e.key)) { e.preventDefault(); return false; }
    });

    // 3. Disable text selection via CSS
    document.addEventListener('DOMContentLoaded', () => {
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
    });

    // 4. Disable drag (image theft)
    document.addEventListener('dragstart', (e) => e.preventDefault());

    // 5. DevTools open detection — redirect if opened (check every 3s to save CPU)
    (() => {
        const threshold = 160;
        const check = () => {
            if (window.outerWidth - window.innerWidth > threshold ||
                window.outerHeight - window.innerHeight > threshold) {
                document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#020617;color:#fff;font-family:Inter,sans-serif;flex-direction:column;gap:1rem;"><h1 style="color:#D90429;font-size:3rem;">⛔</h1><h2>Access Denied</h2><p style="color:#64748b;">Developer tools are not allowed on this website.</p></div>';
            }
        };
        setInterval(check, 3000); // Reduced from 1000ms — saves ~200 CPU wakeups/min
    })();
}
// ====== END PROTECTION ======

// Cinematic Preloader Engine
document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Enforce a minimum stunning 1.5s visual loading duration
        setTimeout(() => {
            if (document.readyState === 'complete') {
                finalizePreloader();
            } else {
                window.addEventListener('load', finalizePreloader);
            }
        }, 1500);
    }
});

function finalizePreloader() {
    const texts = document.querySelectorAll('.loading-text-filling, .loading-subtext-filling');
    texts.forEach(t => t.classList.add('glitch-stop'));

    document.body.classList.add('loaded');

    setTimeout(() => {
        const loader = document.getElementById('preloader');
        if (loader) loader.style.display = 'none';

        // Trigger initial reveal animations immediately when shutters open
        document.querySelectorAll('.reveal').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 1200);
}

// Protection Engine Disabled: Restoring native browser inspection capabilities.

// 0.1. Seed Initial Data so the site is never completely empty
if (false) { // Disabled for Supabase
    const seedData = [
        {
            id: 'seed-1',
            title: 'A Day in the Life of a Minimalist Designer',
            category: 'vlog',
            content: '<p>A behind-the-scenes look at how eliminating clutter can radically boost your creative energy. Start by organizing your desk deeply, removing any non-essential tools. This video walks through a full 24-hour cycle of focusing purely on what matters.</p>',
            date: 'May 15, 2026',
            image: 'file:///C:/Users/artcl/.gemini/antigravity/brain/30ce92a9-c873-4572-af0e-1e4b15b0bf13/hero_image_1774723211151.png'
        },
        {
            id: 'seed-2',
            title: 'The Evolution of Digital Interfaces: Why Minimalism Wins',
            category: 'technology',
            content: '<p>In the modern digital landscape, the phrase "less is more" has never been more relevant. As users are continuously bombarded with information, interfaces that prioritize simplicity, bold typography, and extreme functionality are capturing widespread attention.</p><p>When you combine a stark white canvas with incredibly vibrant, energetic colors—like a deep crimson red—you guide the user\'s eye naturally. The red isn\'t just an accent; it becomes a tool for navigation, hierarchy, and emotion.</p>',
            date: 'May 14, 2026',
            image: 'file:///C:/Users/artcl/.gemini/antigravity/brain/30ce92a9-c873-4572-af0e-1e4b15b0bf13/article_one_1774723227497.png'
        },
        {
            id: 'seed-3',
            title: 'Finding Peace in Red & White Spaces',
            category: 'lifestyle',
            content: '<p>Why incorporating stark contrasting colors into your living room can promote mindfulness. Bold colors do not implicitly cause stress; in fact, controlled stark contrasts create clean divisions in your mental processing.</p>',
            date: 'May 13, 2026',
            image: 'file:///C:/Users/artcl/.gemini/antigravity/brain/30ce92a9-c873-4572-af0e-1e4b15b0bf13/article_two_1774723243466.png'
        }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
}

// Utility to strip HTML for pure text excerpts
const stripHtml = (html) => {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

// Utility to generate short, clean URL-friendly slug from headline
const generateSlug = (title) => {
    if (!title) return '';
    const words = title.toLowerCase().trim().split(/\s+/).slice(0, 5).join(' ');
    return words
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Generate a compact 6-character random ID
const generateShortId = () => Math.random().toString(36).substring(2, 8);

// Canvas Downscaler to protect LocalStorage Quota
const compressMedia = (file, callback) => {
    if (!file.type.startsWith('image/')) {
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
            // Heavily scale down 4K phone uploads to 1200px max
            if (width > 1200) { height *= 1200 / width; width = 1200; }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            // Compress generic pngs into lossy 60% jpegs to save megabytes
            callback(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

document.addEventListener('DOMContentLoaded', async () => {
    // Preloader Logic (Filling Typography) - FIRST VISIT PER SESSION
    const preloader = document.getElementById('preloader');
    if (preloader) {
        if (sessionStorage.getItem('asif_preloader_seen')) {
            preloader.remove(); // Skip entirely for returning visitors in the same session
        } else {
            const textElements = document.querySelectorAll('.loading-text-filling, .loading-subtext-filling');
            let count = 0;
            const interval = setInterval(() => {
                count += Math.floor(Math.random() * 5) + 1;
                if (count >= 100) {
                    count = 100;
                    clearInterval(interval);
                    textElements.forEach(el => {
                        el.style.setProperty('--loading-progress', '100%');
                        el.classList.add('glitch-stop');
                    });
                    sessionStorage.setItem('asif_preloader_seen', 'true'); // Save for current session
                    setTimeout(() => {
                        preloader.classList.add('loaded');
                    }, 800);
                } else {
                    textElements.forEach(el => el.style.setProperty('--loading-progress', count + '%'));
                }
            }, 40);
        }
    }

    // Track site visits (unique per browser session)
    const visitCount = parseInt(localStorage.getItem('asif_visits') || '0') + 1;
    if (!sessionStorage.getItem('asif_visited')) {
        localStorage.setItem('asif_visits', visitCount);
        sessionStorage.setItem('asif_visited', '1');
    }

    let DB_ERROR = false;
    try {
        // Always fetch all fields — content is needed for snippets (index), editing (admin), and reading (article)
        const { data, error } = sbClient
            ? await sbClient.from('articles').select('*')
            : { data: null, error: { message: "Client initialized fail" } };

        if (error) {
            DB_ERROR = true;
            console.error("Supabase Articles Error:", error);
        }

        window.globalArticles = data || [];

    } catch (e) {
        console.error('Error fetching from Supabase:', e);
        window.globalArticles = [];
    }

    // 0.5. Admin Authentication
    const loginScreen = document.getElementById('admin-login-screen');
    if (loginScreen) {
        const setupAdminSession = () => {
            const logoutBtn = document.getElementById('admin-logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    sessionStorage.removeItem('crimson_admin_auth');
                    window.location.reload();
                });
            }

            // Secure 5-minute Autologout (300 seconds)
            let idleTime = 0;
            const resetIdle = () => idleTime = 0;
            window.addEventListener('mousemove', resetIdle);
            window.addEventListener('keydown', resetIdle);
            window.addEventListener('click', resetIdle);
            window.addEventListener('scroll', resetIdle);

            setInterval(() => {
                idleTime += 1;
                if (idleTime >= 1800) { // 30 minutes idle logout
                    sessionStorage.removeItem('crimson_admin_auth');
                    window.location.reload();
                }
            }, 1000);
        };

        if (sessionStorage.getItem('crimson_admin_auth') === 'true') {
            loginScreen.style.display = 'none';
            setupAdminSession();
        } else {
            document.body.style.overflow = 'hidden';
            const loginForm = document.getElementById('admin-login-form');
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const user = document.getElementById('admin-username').value;
                const pass = document.getElementById('admin-password').value;

                // Extremely basic obfuscation (Base64) to prevent plain-text snooping
                if (btoa(user) === 'MTIzdXA=' && btoa(pass) === 'MTIzdXA=') {
                    sessionStorage.setItem('crimson_admin_auth', 'true');
                    loginScreen.style.opacity = '0';
                    loginScreen.style.transition = 'opacity 0.4s ease';
                    setTimeout(() => {
                        loginScreen.style.display = 'none';
                        document.body.style.overflow = '';
                        setupAdminSession();
                    }, 400);
                } else {
                    const err = document.getElementById('login-error');
                    err.style.display = 'block';
                    err.style.animation = 'shake 0.4s';
                    setTimeout(() => err.style.animation = '', 400);
                }
            });
        }
    }

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

        // Parallax Hero Effect (if present)
        const heroImg = document.querySelector('.article-hero-img');
        if (heroImg) {
            const scrollValue = window.scrollY;
            heroImg.style.transform = `scale(1.1) translateY(${scrollValue * 0.15}px)`;
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
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));

    const heroContainer = document.getElementById('hero-slider-container');
    if (heroContainer) {
        let articles = window.globalArticles || [];
        let activeArticles = articles.filter(a => !a.archived && !a.unlisted);
        const latestThree = activeArticles.slice().reverse().slice(0, 3);
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
                heroSlidesHTML += `<div class="hero-slide ${idx === 0 ? 'active' : ''}">
                        <div class="hero-content">
                            <span class="hero-label">${article.category}</span>
                            <h2 class="hero-title">${formattedTitle}</h2>
                            <p>${snippet}</p>
                            <a href="article.html?id=${slug}" class="btn btn-primary" style="margin-top: 1rem;">Start Reading</a>
                        </div>
                        <div class="hero-image-wrapper">
                            <img src="${article.image}" alt="Cover Image">
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

        const slides = heroContainer.querySelectorAll('.hero-slide');
        const dots = heroContainer.querySelectorAll('.hero-dot');

        if (slides.length > 1) {
            let currentSlide = 0;
            let slideInterval;

            // Initialize all non-active slides to a hidden neutral state
            slides.forEach((s, i) => {
                if (i !== 0) {
                    s.style.transition = 'none';
                    s.classList.add('enter-from-right');
                }
            });

            const goToSlide = (idx) => {
                const prevSlideIdx = currentSlide;
                if (prevSlideIdx === idx) return;

                // Determine direction: going forward (right→left) or backward (left→right)
                const goingForward = idx > prevSlideIdx || (prevSlideIdx === slides.length - 1 && idx === 0);

                // 1. Pre-position the incoming slide off-screen WITHOUT animation
                slides[idx].style.transition = 'none';
                slides[idx].classList.remove('active', 'enter-from-right', 'enter-from-left', 'prev-to-left', 'prev-to-right');
                slides[idx].classList.add(goingForward ? 'enter-from-right' : 'enter-from-left');
                // Force reflow so the browser registers the position before we start the transition
                slides[idx].offsetWidth; // eslint-disable-line no-unused-expressions

                // 2. Re-enable transition on incoming slide
                slides[idx].style.transition = '';

                // 3. Animate outgoing slide off-screen
                slides[prevSlideIdx].classList.remove('active', 'enter-from-right', 'enter-from-left');
                slides[prevSlideIdx].classList.add(goingForward ? 'prev-to-left' : 'prev-to-right');
                if (dots.length > 0) dots[prevSlideIdx].classList.remove('active');

                // 4. Activate incoming slide
                currentSlide = idx;
                slides[currentSlide].classList.remove('enter-from-right', 'enter-from-left');
                slides[currentSlide].classList.add('active');
                if (dots.length > 0) dots[currentSlide].classList.add('active');

                // 5. Cleanup all non-active slides after transition
                setTimeout(() => {
                    slides.forEach((s, i) => {
                        if (i !== currentSlide) {
                            s.style.transition = 'none';
                            s.classList.remove('prev-to-left', 'prev-to-right', 'enter-from-right', 'enter-from-left', 'active');
                            // Re-park them off right edge (ready for next forward swipe)
                            s.classList.add('enter-from-right');
                        }
                    });
                }, 800);
            };

            const startInterval = () => {
                slideInterval = setInterval(() => {
                    const nextSlide = (currentSlide + 1) % slides.length;
                    goToSlide(nextSlide);
                }, 5000); // Changed to 5 seconds for better comfort
            };

            dots.forEach((dot, idx) => {
                dot.addEventListener('click', () => {
                    clearInterval(slideInterval);
                    goToSlide(idx);
                    startInterval();
                });
            });

            // Touch Swipe Logic
            let touchStartX = 0;
            let touchEndX = 0;

            heroContainer.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            heroContainer.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                if (touchEndX < touchStartX - 50) {
                    clearInterval(slideInterval);
                    goToSlide((currentSlide + 1) % slides.length);
                    startInterval();
                } else if (touchEndX > touchStartX + 50) {
                    clearInterval(slideInterval);
                    goToSlide((currentSlide - 1 + slides.length) % slides.length);
                    startInterval();
                }
            }, { passive: true });

            startInterval();
        }
    }

    // 4. Render Grid & List Custom Articles
    const buildCard = (article, idx) => {
        const rawText = stripHtml(article.content || "");
        const slug = generateSlug(article.title) || article.id;
        // Use lazy loading for below-fold images; first 3 cards get eager load for LCP
        const loadStrategy = idx < 2 ? 'eager' : 'lazy';
        return `
            <a href="article.html?id=${slug}" class="article-card reveal visible" style="transition-delay:${idx * 0.08}s">
                <div class="article-tag" style="text-transform: capitalize;">${article.category}</div>
                <div class="article-card-image">
                    <img src="${article.image}" alt="${article.title}" loading="${loadStrategy}" decoding="async">
                </div>
                <div class="article-card-content">
                    <div class="article-meta">${article.date} &bull; 3 min read</div>
                    <h3>${article.title}</h3>
                    <p>${rawText ? rawText.substring(0, 100) + '...' : ''}</p>
                    <div class="read-more">Read Full Story <span>→</span></div>
                </div>
            </a>
        `;
    };

    const buildListItem = (article, idx) => {
        const rawText = stripHtml(article.content || "");
        const slug = generateSlug(article.title) || article.id;
        return `
            <a href="article.html?id=${slug}" class="blog-list-item reveal visible" style="transition-delay: ${idx * 0.08}s;">
                <div class="blog-list-img">
                    <img src="${article.image}" alt="${article.title}" loading="lazy" decoding="async">
                </div>
                <div class="blog-list-content">
                    <div class="hero-label" style="display: inline-block; margin-bottom: 1rem;">${article.category.toUpperCase()}</div>
                    <h3 style="font-size: 2rem; font-weight: 800; color: var(--text-dark); margin-bottom: 0.5rem; letter-spacing: -0.5px;">${article.title}</h3>
                    <p style="font-size: 1.1rem; margin-bottom: 1.5rem; color: var(--text-light);">${rawText ? rawText.substring(0, 120) + '...' : ''}</p>
                    <div class="article-meta" style="margin-bottom: 0;">${article.date} &bull; 5 min watch/read</div>
                </div>
            </a>
        `;
    };

    const gridContainer = document.querySelector('.articles-grid');
    const listContainer = document.querySelector('.new-blogs-list');
    const vlogsContainer = document.querySelector('.vlogs-list');
    const allArticlesContainer = document.querySelector('.all-articles-list');

    const showSkeletons = (container, count = 3) => {
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            container.innerHTML += `
                <div class="article-card glass-effect skeleton-loader" style="height: 480px; width: 350px; opacity: 0.5;"></div>
            `;
        }
    };

    showSkeletons(gridContainer);
    showSkeletons(listContainer, 3);
    showSkeletons(vlogsContainer);
    showSkeletons(allArticlesContainer, 6);

    // Retrieve from single table global
    const activeArticles = (window.globalArticles || []).filter(a => !a.archived && !a.unlisted).reverse();

    // Clear skeletons
    if (gridContainer) gridContainer.innerHTML = '';
    if (listContainer) listContainer.innerHTML = '';
    if (vlogsContainer) vlogsContainer.innerHTML = '';
    if (allArticlesContainer) allArticlesContainer.innerHTML = '';

    // 4.1 Trending Stories — top 3
    if (gridContainer && !gridContainer.classList.contains('vlogs-list') && !gridContainer.classList.contains('all-articles-list')) {
        let trending = activeArticles.slice(0, 3);
        if (trending.length > 0) trending.forEach((a, idx) => gridContainer.insertAdjacentHTML('beforeend', buildCard(a, idx)));
        else gridContainer.parentElement.style.display = 'none';
    }

    // 4.2 Fresh Blogs — next 6 items
    if (listContainer) {
        let blogPosts = activeArticles.slice(3, 9);
        if (blogPosts.length > 0) blogPosts.forEach((a, idx) => listContainer.insertAdjacentHTML('beforeend', buildListItem(a, idx)));
        else listContainer.parentElement.style.display = 'none';
    }

    // 4.3 All Vlogs — vlogs from category
    if (vlogsContainer) {
        let vlogs = activeArticles.filter(a => a.category.toLowerCase().includes('vlog'));
        if (vlogs.length === 0) vlogs = activeArticles.slice(0, 6); // Fallback
        if (vlogs.length > 0) vlogs.forEach((a, idx) => vlogsContainer.insertAdjacentHTML('beforeend', buildCard(a, idx)));
        else vlogsContainer.parentElement.style.display = 'none';
    }

    // 4.4 All Articles — everything
    if (allArticlesContainer) {
        if (activeArticles.length > 0) activeArticles.forEach((a, idx) => allArticlesContainer.insertAdjacentHTML('beforeend', buildCard(a, idx)));
        else allArticlesContainer.parentElement.style.display = 'none';
    }

    // Initialize 3D Hover Animations for newly injected cards
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

            const maxRotate = window.innerWidth > 992 ? 8 : 2; // softer on mobile

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

    // 5. Admin List Rendering Engine
    window.renderAdminList = (articles) => {
        const adminList = document.getElementById('content-list');
        if (!adminList) return;
        adminList.innerHTML = '';
        const allPosts = (articles || []).slice().reverse();
        allPosts.forEach(article => {
            const isArchived = article.archived === true;
            const isUnlisted = article.unlisted === true;
            const li = document.createElement('li');
            li.className = 'admin-list-item' + (isArchived ? ' is-archived' : '') + (isUnlisted ? ' is-unlisted' : '');
            li.dataset.articleId = article.id;
            li.innerHTML = `
                <div class="admin-item-thumb">
                    <img src="${article.image || ''}" alt="thumb" onerror="this.style.display='none'">
                </div>
                <div class="admin-item-info">
                    <div class="admin-item-title">${article.title}</div>
                    <div class="admin-item-meta">
                        ${isArchived ? '<span class="admin-badge badge-archived">Archived</span>' : isUnlisted ? '<span class="admin-badge" style="background:#8b5cf6;color:#fff;">Hidden</span>' : '<span class="admin-badge badge-active">Live</span>'}
                        <span>${article.date}</span>
                        <span style="text-transform:uppercase; font-size:0.75rem;">${article.category}</span>
                        <span style="color: var(--primary-red); font-weight: 700;">👁️ ${article.views || 0} views</span>
                    </div>
                </div>
                <div class="admin-item-actions">
                    <button class="admin-action-btn edit-btn" ${isArchived ? 'disabled title="Restore to edit"' : ''}>✏️ Edit</button>
                    <button class="admin-action-btn unlist-btn" style="${isUnlisted ? 'border-color:#8b5cf6;color:#8b5cf6;background:rgba(139,92,246,0.08);' : 'border-color:#64748b;color:#64748b;'}">${isUnlisted ? '👁️ Show' : '🙈 Hide'}</button>
                    <button class="admin-action-btn archive-btn" style="${isArchived ? 'border-color:#10b981;color:#059669;' : 'border-color:#f59e0b;color:#d97706;'}">${isArchived ? '↩ Restore' : '📦 Archive'}</button>
                    <button class="admin-action-btn delete-btn" style="border-color:#ef4444;color:#ef4444;">🗑️ Delete</button>
                </div>
            `;
            adminList.insertAdjacentElement('beforeend', li);
        });

        // Update counters
        const countEl = document.querySelector('.admin-section .hero-label');
        if (countEl) {
            const activeCount = articles.filter(a => !a.archived).length;
            countEl.innerText = activeCount + " Active";
        }
    };

    if (document.getElementById('content-list')) {
        window.renderAdminList(window.globalArticles);
    }

    // 6. Upload Form Handling (Create Only)
    // 6. Section Radio listener removed (redundant)

    const fileInput = document.getElementById('cover-image');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const fileNameDisplay = document.getElementById('file-name-display');
            if (e.target.files.length > 0) {
                if (e.target.files[0].size > 500 * 1024) {
                    alert("Image is too large! Please upload a file smaller than 500KB.");
                    e.target.value = "";
                    fileNameDisplay.textContent = "Drag and drop a high-res file, or click to browse";
                    return;
                }
                fileNameDisplay.textContent = e.target.files[0].name;
                fileNameDisplay.style.color = 'var(--primary-red)';
                fileNameDisplay.style.fontWeight = 'bold';
            }
        });
    }

    const uploadForm = document.getElementById('upload-form');
    let coverImageSrc = 'file:///C:/Users/artcl/.gemini/antigravity/brain/30ce92a9-c873-4572-af0e-1e4b15b0bf13/media__1774731775976.jpg';

    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = uploadForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            const title = document.getElementById('title').value;
            const contentEl = document.getElementById('content');
            const contentBody = contentEl ? (contentEl.tagName === 'DIV' ? contentEl.innerHTML : contentEl.value) : "";

            const selectCategory = document.getElementById('category');
            let category = "Article";
            if (selectCategory && selectCategory.options[selectCategory.selectedIndex]) {
                const text = selectCategory.options[selectCategory.selectedIndex].text;
                if (text !== "Select a domain") { category = text; }
            }

            const customDateInput = document.getElementById('post-date');
            const targetDate = customDateInput && customDateInput.value.trim() !== ''
                ? customDateInput.value.trim()
                : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            const targetTable = 'articles';

            const proceedWithSave = async (imgSrc) => {
                btn.innerHTML = `<span style="display:inline-block; animation: spin 1s linear infinite;">⏳</span> Publishing...`;
                btn.style.opacity = '0.8';
                btn.style.pointerEvents = 'none';

                // helper to format datetime-local (e.g., 2023-10-15T14:30) to readable "October 15, 2023"
                const formatDatetimeStr = (val) => {
                    const d = val ? new Date(val) : new Date();
                    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
                };

                const postDateRaw = document.getElementById('post-date').value;
                const postDate = formatDatetimeStr(postDateRaw);

                const slug = generateSlug(title) || generateShortId();
                const coverCaption = document.getElementById('cover-caption-input').value.trim();
                const newArticle = {
                    id: slug,
                    title: title,
                    category: category,
                    content: contentBody,
                    date: postDate,
                    image: imgSrc,
                    cover_caption: coverCaption,
                    archived: false
                };

                const { error } = sbClient ? await sbClient.from('articles').insert([newArticle]) : { error: { message: "Offline" } };
                if (error) {
                    const errorBoxHtml = `
                        <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 20px; border-radius: 12px; margin-top: 20px; color: #7f1d1d; text-align: left;">
                            <h3 style="margin-top:0; color:#b91c1c; font-weight:900;">⚠️ STOP! Missing Database Setup!</h3>
                            <p style="margin-bottom: 15px; font-weight: bold;">Your Supabase database rejected the save request. Error: ${error.message}</p>
                            <p style="margin-bottom: 10px;">This means your 'articles' table hasn't been created yet, or it's missing security permissions.</p>
                            <p style="margin-bottom: 5px; font-weight: bold;">HOW TO FIX THIS RIGHT NOW:</p>
                            <ol style="margin-top: 0; padding-left: 20px; line-height: 1.6;">
                                <li>Open your <a href="https://supabase.com/dashboard/project/maestlpaeoyamtvaxvur/sql/new" target="_blank" style="color:#2563eb; text-decoration:underline; font-weight:bold;">Supabase SQL Editor here</a></li>
                                <li>Copy the code block below, paste it into the SQL editor, and click <strong>RUN</strong>.</li>
                            </ol>
                            <textarea readonly style="width: 100%; height: 280px; background: #1e293b; color: #f8fafc; font-family: monospace; padding: 15px; border-radius: 8px; margin-top: 10px; border:none; resize:none;">
-- OPTION A: If you already have the table, run this to add the new column:
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS cover_caption TEXT;

-- OPTION B: If starting fresh, run this entire block:
CREATE TABLE IF NOT EXISTS public.articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT,
    date TEXT NOT NULL,
    image TEXT,
    cover_caption TEXT,
    views INT DEFAULT 0,
    archived BOOLEAN DEFAULT false,
    unlisted BOOLEAN DEFAULT false
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.articles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.articles FOR DELETE USING (true);
                            </textarea>
                            <p style="margin-top: 15px; font-weight: bold;">Once you click RUN and it says Success, come back here and try saving again!</p>
                        </div>
                    `;
                    const errorContainer = document.getElementById('upload-error-display') || document.createElement('div');
                    errorContainer.id = 'upload-error-display';
                    errorContainer.innerHTML = errorBoxHtml;
                    uploadForm.appendChild(errorContainer);

                    btn.innerHTML = originalText;
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                    return;
                }

                // Remove error display if successful
                const oldErr = document.getElementById('upload-error-display');
                if (oldErr) oldErr.remove();

                btn.innerHTML = `✅ Published!`;
                btn.style.background = '#10B981';
                setTimeout(async () => {
                    // Re-fetch all articles from Supabase so the new post appears in Post Management
                    if (sbClient) {
                        try {
                            const { data: freshData } = await sbClient.from('articles').select('*');
                            if (freshData) {
                                window.globalArticles = freshData;
                                window.renderAdminList(freshData);
                            }
                        } catch (e) { /* Use existing data if fetch fails */ }
                    }
                    // Navigate to Post Management section
                    if (typeof window.switchToSection === 'function') {
                        window.switchToSection('section-manage');
                    }
                    btn.innerHTML = 'Publish to Live Site';
                    btn.style.background = '';
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                    // Reset the upload form
                    const uploadForm = document.getElementById('upload-form');
                    if (uploadForm) uploadForm.reset();
                    const richEditor = document.getElementById('content');
                    if (richEditor) richEditor.innerHTML = '';
                    const fileNameDisplay = document.getElementById('file-name-display');
                    if (fileNameDisplay) fileNameDisplay.textContent = 'Drag and drop a high-res file, or click to browse';
                }, 1500);
            };

            const coverFile = fileInput.files[0];
            if (coverFile) {
                compressMedia(coverFile, (compressedDataUrl) => proceedWithSave(compressedDataUrl));
            } else {
                proceedWithSave(coverImageSrc);
            }
        });
    }

    // 6.5. Inline Rich Text Image Upload (Creation & Editing)
    const setupInlineImage = (btnId, inputId, contentId) => {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        const content = document.getElementById(contentId);

        if (btn && input && content) {
            let savedRange;
            btn.addEventListener('mousedown', () => {
                const sel = window.getSelection();
                if (sel.rangeCount > 0) savedRange = sel.getRangeAt(0);
            });
            btn.addEventListener('click', () => input.click());

            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 500 * 1024) {
                        alert("Image is too large! Please upload a file smaller than 500KB.");
                        e.target.value = "";
                        return;
                    }
                    compressMedia(file, (compressedDataUrl) => {
                        content.focus();
                        if (savedRange) {
                            const sel = window.getSelection();
                            sel.removeAllRanges();
                            sel.addRange(savedRange);
                        }
                        const imgHTML = `<img src="${compressedDataUrl}" style="max-width: 100%; border-radius: 12px; margin: 1.5rem 0; box-shadow: var(--shadow-sm); display: block;">`;
                        document.execCommand('insertHTML', false, imgHTML);
                        input.value = "";
                    });
                }
            });
        }
    };
    // 6.4.5 Global Formatter Helper
    window.formatDoc = (cmd, value = null) => {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            // Find which editor is active
            const activeEditor = e => e.contains(sel.anchorNode);
            const editors = document.querySelectorAll('.rich-editor');
            let target = null;
            editors.forEach(ed => { if (ed.contains(sel.anchorNode)) target = ed; });

            if (target) {
                target.focus();
                document.execCommand(cmd, false, value);
            } else {
                // If a button was clicked but selection is lost or target not found
                document.execCommand(cmd, false, value);
            }
        } else {
            document.execCommand(cmd, false, value);
        }
    };

    setupInlineImage('btn-insert-image', 'body-image-upload', 'content');
    setupInlineImage('modal-btn-insert-image', 'modal-body-image-upload', 'modal-content-body');

    // 6.6. Inline Image Resizer Engine
    let activeImage = null;
    const editorBodies = document.querySelectorAll('.rich-editor');

    document.addEventListener('click', (e) => {
        if (activeImage && e.target !== activeImage && !e.target.closest('.image-resize-btn')) {
            activeImage.style.outline = 'none';
            activeImage.style.outlineOffset = '0';
            activeImage = null;
        }
    });

    editorBodies.forEach(editor => {
        // Ensure tools work on selected text
        editor.addEventListener('mouseup', () => {
            const sel = window.getSelection();
            if (sel.rangeCount > 0) {
                // Selection is active, tools will target this range
            }
        });

        editor.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                if (activeImage) activeImage.style.outline = 'none';
                activeImage = e.target;
                activeImage.style.outline = '3px dashed var(--primary-red)';
                activeImage.style.outlineOffset = '3px';
            }
        });
    });

    window.resizeActiveImage = (size) => {
        if (activeImage) {
            activeImage.style.width = size;
            if (size === '100%') {
                activeImage.style.display = 'block';
                activeImage.style.margin = '1.5rem 0';
            } else {
                activeImage.style.display = 'inline-block';
                activeImage.style.margin = '1rem 1.5rem 1rem 0';
            }
            activeImage.style.outline = 'none';
            activeImage = null;
        } else {
            alert('Please click on an image inside the text editor first to select it.');
        }
    };

    window.addCaptionToImage = () => {
        if (activeImage) {
            const captionContent = prompt("Enter your image caption:");
            if (captionContent !== null && captionContent.trim() !== "") {
                const captionP = document.createElement('p');
                captionP.className = 'img-caption';
                captionP.innerText = captionContent.trim();
                captionP.style.textAlign = 'center';
                captionP.style.marginTop = '0.75rem';
                captionP.style.marginBottom = '2.5rem';
                captionP.style.fontSize = '0.85rem';
                captionP.style.color = 'var(--text-light)';
                captionP.style.fontStyle = 'italic';

                // Insert after image
                activeImage.parentNode.insertBefore(captionP, activeImage.nextSibling);
                activeImage.style.outline = 'none';
                activeImage = null;
            }
        } else {
            alert('Please click on an image inside the text editor first to add a caption.');
        }
    };

    // 7. Modals & Edit Form Logic
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const modalFileInput = document.getElementById('modal-cover-image');

    // Modal Edit Listeners
    if (modalFileInput) {
        modalFileInput.addEventListener('change', (e) => {
            const fileNameDisplay = document.getElementById('modal-file-name-display');
            if (e.target.files.length > 0) {
                if (e.target.files[0].size > 500 * 1024) {
                    alert("Image is too large! Please upload a file smaller than 500KB.");
                    e.target.value = "";
                    fileNameDisplay.textContent = "Upload a new media to replace the old cover";
                    return;
                }
                fileNameDisplay.textContent = e.target.files[0].name;
                fileNameDisplay.style.color = 'var(--primary-red)';
            }
        });
    }

    if (editModal) {
        document.getElementById('close-modal').addEventListener('click', () => {
            editModal.classList.remove('active');
        });
        document.getElementById('cancel-modal').addEventListener('click', () => {
            editModal.classList.remove('active');
        });
    }

    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = editForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            const editId = document.getElementById('modal-edit-id').value;
            const title = document.getElementById('modal-title').value;
            const contentEl = document.getElementById('modal-content-body');
            const contentBody = contentEl ? (contentEl.tagName === 'DIV' ? contentEl.innerHTML : contentEl.value) : "";

            const selectCategory = document.getElementById('modal-category');
            let category = "Article";
            if (selectCategory && selectCategory.options[selectCategory.selectedIndex]) {
                const text = selectCategory.options[selectCategory.selectedIndex].text;
                category = text;
            }

            // helper to format datetime-local (e.g., 2023-10-15T14:30) to readable "October 15, 2023"
            const formatDatetimeStr = (val) => {
                const d = val ? new Date(val) : new Date();
                return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
            };

            const proceedWithUpdate = async (imgSrc) => {
                btn.innerHTML = `⏳ Saving...`;
                btn.style.pointerEvents = 'none';

                const coverCaption = document.getElementById('modal-cover-caption-input').value.trim();
                let updateData = { title, category, date: customModalDate, content: contentBody, cover_caption: coverCaption };
                if (imgSrc) updateData.image = imgSrc;

                const { error } = sbClient ? await sbClient.from('articles').update(updateData).eq('id', editId) : { error: { message: "Offline" } };
                if (error) {
                    alert("Database error: " + error.message);
                    btn.innerHTML = originalText;
                    btn.style.pointerEvents = 'auto';
                    return;
                }

                btn.innerHTML = `✅ Saved!`;
                btn.style.background = '#10B981';

                // Update local memory and UI without page reload
                const index = (window.globalArticles || []).findIndex(a => a.id === editId);
                if (index !== -1) {
                    window.globalArticles[index] = { ...window.globalArticles[index], ...updateData };
                    window.renderAdminList(window.globalArticles);
                }

                setTimeout(() => {
                    editModal.classList.remove('active');
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.pointerEvents = 'auto';
                }, 1000);
            };

            const coverFile = modalFileInput.files[0];
            if (coverFile) {
                compressMedia(coverFile, (compressedDataUrl) => proceedWithUpdate(compressedDataUrl));
            } else {
                proceedWithUpdate(null);
            }
        });
    }

    // 8. Delegation for Lists (Edit Popups & Deletions)
    document.body.addEventListener('click', function (e) {
        if (e.target.classList.contains('edit-btn')) {
            const listItem = e.target.closest('li');
            const id = listItem.dataset.articleId;

            if (id && editModal) {
                const found = (window.globalArticles || []).find(a => a.id === id);
                if (found) {
                    document.getElementById('modal-title').value = found.title;
                    const contentEl = document.getElementById('modal-content-body');
                    if (contentEl) {
                        if (contentEl.tagName === 'DIV') contentEl.innerHTML = found.content || '';
                        else contentEl.value = found.content || '';
                    }

                    const catSelect = document.getElementById('modal-category');
                    if (catSelect) {
                        for (let i = 0; i < catSelect.options.length; i++) {
                            const optText = catSelect.options[i].text.toLowerCase();
                            if (optText === found.category.toLowerCase() || catSelect.options[i].value === found.category.toLowerCase()) {
                                catSelect.selectedIndex = i;
                                break;
                            }
                        }
                    }

                    const dateModalField = document.getElementById('modal-post-date');
                    if (dateModalField) {
                        // Converter function: "Month Day, Year" -> "YYYY-MM-DDTHH:MM"
                        const toISO = (readableStr) => {
                            if (!readableStr) return "";
                            const d = new Date(readableStr);
                            if (isNaN(d.getTime())) return "";
                            // Get YYYY-MM-DD
                            const y = d.getFullYear();
                            const m = String(d.getMonth() + 1).padStart(2, '0');
                            const day = String(d.getDate()).padStart(2, '0');
                            // Get HH:MM
                            const h = String(d.getHours()).padStart(2, '0');
                            const mm = String(d.getMinutes()).padStart(2, '0');
                            return `${y}-${m}-${day}T${h}:${mm}`;
                        };
                        dateModalField.value = toISO(found.date);
                    }

                    const coverCaptInput = document.getElementById('modal-cover-caption-input');
                    if (coverCaptInput) coverCaptInput.value = found.cover_caption || '';

                    // Store ID for update
                    document.getElementById('modal-edit-id').value = found.id;
                    editModal.classList.add('active');
                }
            }
        }
        else if (e.target.classList.contains('unlist-btn')) {
            const listItem = e.target.closest('li');
            const id = listItem.dataset.articleId;
            if (id) {
                const article = (window.globalArticles || []).find(a => a.id === id);
                if (article) {
                    const btn = e.target;
                    const originalText = btn.innerText;
                    btn.innerText = '⏳...';
                    btn.style.pointerEvents = 'none';
                    const newUnlisted = !article.unlisted;
                    if (sbClient) {
                        sbClient.from('articles').update({ unlisted: newUnlisted }).eq('id', id)
                            .then(({ error }) => {
                                if (error) {
                                    alert('❌ Column missing!\n\nRun this in Supabase SQL Editor:\n\nALTER TABLE public.articles ADD COLUMN IF NOT EXISTS unlisted BOOLEAN DEFAULT false;');
                                    btn.innerText = originalText;
                                    btn.style.pointerEvents = 'auto';
                                } else {
                                    article.unlisted = newUnlisted;
                                    window.renderAdminList(window.globalArticles);
                                }
                            });
                    } else {
                        alert('Not connected to Supabase.');
                        btn.innerText = originalText;
                        btn.style.pointerEvents = 'auto';
                    }
                }
            }
        }
        else if (e.target.classList.contains('archive-btn')) {
            const listItem = e.target.closest('li');
            const id = listItem.dataset.articleId;
            if (id) {
                const article = (window.globalArticles || []).find(a => a.id === id);
                if (article) {
                    e.target.innerText = "⏳...";
                    e.target.style.pointerEvents = 'none';
                    if (sbClient) sbClient.from('articles').update({ archived: !article.archived }).eq('id', id).then(() => {
                        article.archived = !article.archived;
                        window.renderAdminList(window.globalArticles);
                    });
                }
            }
        }
        else if (e.target.classList.contains('delete-btn')) {
            const btn = e.target;
            const listItem = btn.closest('li');
            const id = listItem.dataset.articleId;

            btn.innerText = 'Deleting...';
            btn.style.pointerEvents = 'none';
            btn.style.background = '#ffb3b3';

            setTimeout(() => {
                listItem.classList.add('item-delete-anim');

                if (id) {
                    window.globalArticles = window.globalArticles.filter(a => a.id !== id);
                    if (sbClient) sbClient.from('articles').delete().eq('id', id).then(() => { });
                }

                setTimeout(() => {
                    listItem.remove();
                    const countEl = document.querySelector('.admin-section .hero-label');
                    if (countEl) {
                        const localAll = window.globalAll || [];
                        const activeCount = localAll.filter(a => !a.archived).length;
                        countEl.innerText = activeCount + " Active";
                    }
                }, 600);
            }, 800);
        }
    });

    setTimeout(() => {
        const countEl = document.querySelector('.admin-section .hero-label');
        if (countEl) {
            const localArts = window.globalArticles;
            const activeCount = localArts.filter(a => !a.archived).length;
            countEl.innerText = activeCount + " Active";
        }
    }, 100);

    // --- Populate Admin Analytics Stats ---
    const statTotalViews = document.getElementById('stat-total-views');
    if (statTotalViews) {
        const arts = window.globalArticles;
        const totalViews = arts.reduce((sum, a) => sum + (parseInt(a.views) || 0), 0);
        const activeCount = arts.filter(a => !a.archived).length;
        const archivedCount = arts.filter(a => a.archived).length;

        statTotalViews.innerText = totalViews.toLocaleString();

        const trendEl = document.getElementById('stat-views-trend');
        if (trendEl) trendEl.innerText = totalViews > 0 ? `Across ${activeCount} live posts` : 'No views yet';

        const visitEl = document.getElementById('stat-visits');
        if (visitEl) visitEl.innerText = parseInt(localStorage.getItem('updown_visits') || '1').toLocaleString();

        const pubEl = document.getElementById('stat-published');
        if (pubEl) pubEl.innerText = activeCount;

        const archEl = document.getElementById('stat-archived-count');
        if (archEl) archEl.innerText = archivedCount + ' archived';

        // Most viewed post
        const topPost = arts.slice().sort((a, b) => (b.views || 0) - (a.views || 0))[0];
        const topPostEl = document.getElementById('stat-top-post');
        const topViewsEl = document.getElementById('stat-top-views');
        if (topPostEl && topPost) {
            topPostEl.innerText = topPost.title.length > 40 ? topPost.title.substring(0, 40) + '...' : topPost.title;
            if (topViewsEl) topViewsEl.innerText = (topPost.views || 0) + ' views';
        }
    }

    // 9. Auto-Swipe Carousel — Pauses when scrolled off-screen (saves CPU)
    const swipeContainers = document.querySelectorAll('.articles-grid, .new-blogs-list, .vlogs-list');
    swipeContainers.forEach(carouselGrid => {
        let scrollAmount = 0;
        let isHovered = false;
        let isVisible = false;

        carouselGrid.addEventListener('mouseenter', () => isHovered = true);
        carouselGrid.addEventListener('mouseleave', () => isHovered = false);

        // Only auto-scroll when visible in viewport
        const visObserver = new IntersectionObserver(entries => {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0.1 });
        visObserver.observe(carouselGrid);

        setInterval(() => {
            if (!isHovered && isVisible && carouselGrid.children.length > 0 && carouselGrid.scrollWidth > carouselGrid.clientWidth) {
                const cardWidth = (carouselGrid.children[0].offsetWidth || 350) + 20;
                scrollAmount += cardWidth;
                if (scrollAmount >= (carouselGrid.scrollWidth - carouselGrid.clientWidth)) {
                    scrollAmount = 0;
                }
                carouselGrid.scrollTo({ top: 0, left: scrollAmount, behavior: 'smooth' });
            }
        }, 4500);
    });

    // 10. Article Viewing Page Display logic
    if (window.location.pathname.includes('article.html') || window.location.search.includes('id=')) {
        const urlParams = new URLSearchParams(window.location.search);
        let articleId = urlParams.get('id');
        const articles = window.globalArticles;
        const activeArticles = articles.filter(a => !a.archived);

        if (!articleId && activeArticles.length > 0) {
            articleId = activeArticles[activeArticles.length - 1].id;
        }

        if (articleId) {
            // Find by ID directly OR find by title-slug
            const foundArticle = articles.find(a => a.id === articleId || generateSlug(a.title) === articleId);

            if (foundArticle) {
                const titleEl = document.querySelector('.article-header h1');
                const categoryEl = document.querySelector('.article-header .hero-label');
                const metaEl = document.querySelector('.article-meta-large');
                const imgEl = document.querySelector('.article-hero-img');
                const bodyEl = document.querySelector('.article-body');

                if (titleEl) titleEl.innerText = foundArticle.title;
                if (categoryEl) categoryEl.innerText = foundArticle.category.toUpperCase();

                if (metaEl) {
                    metaEl.innerHTML = "<span>By Authorized Admin</span><span>" + foundArticle.date + "</span><span>3 min read</span>";
                }

                if (imgEl && foundArticle.image) {
                    imgEl.src = foundArticle.image;
                    const captEl = document.getElementById('cover-caption');
                    if (captEl) {
                        captEl.innerText = foundArticle.cover_caption || `Feature Image: ${foundArticle.title}`;
                    }
                }

                if (bodyEl && foundArticle.content) {
                    bodyEl.innerHTML = foundArticle.content;

                    // --- Dynamic SEO Injection ---
                    const siteSuffix = " - Asif Ansari";
                    const fullTitle = foundArticle.title + siteSuffix;
                    document.title = fullTitle;

                    const rawDesc = stripHtml(foundArticle.content).substring(0, 160).trim() + "...";

                    const updateMeta = (id, content, attr = 'content') => {
                        const el = document.getElementById(id);
                        if (el) el.setAttribute(attr, content);
                    }

                    updateMeta('og-title', fullTitle);
                    updateMeta('og-desc', rawDesc);
                    updateMeta('twitter-title', fullTitle);
                    updateMeta('twitter-desc', rawDesc);
                    if (foundArticle.image) {
                        updateMeta('og-img', foundArticle.image);
                        updateMeta('twitter-img', foundArticle.image);
                    }

                    // --- Render Share Buttons ---
                    const sharePlaceholder = document.getElementById('share-tools-placeholder');
                    if (sharePlaceholder) {
                        const pageUrl = window.location.href;
                        const pageText = `Check out this article: ${foundArticle.title}`;

                        sharePlaceholder.innerHTML = `
                            <div class="share-container">
                                <a href="https://wa.me/?text=${encodeURIComponent(pageText + ' ' + pageUrl)}" target="_blank" class="share-btn whatsapp" title="Share on WhatsApp">
                                    <i class="fab fa-whatsapp"></i><span style="font-size:0.7rem; font-weight:900;">WA</span>
                                </a>
                                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(pageText)}&url=${encodeURIComponent(pageUrl)}" target="_blank" class="share-btn twitter" title="Share on Twitter">
                                    <i class="fab fa-twitter"></i><span style="font-size:0.7rem; font-weight:900;">X</span>
                                </a>
                                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}" target="_blank" class="share-btn linkedin" title="Share on LinkedIn">
                                    <i class="fab fa-linkedin"></i><span style="font-size:0.7rem; font-weight:900;">IN</span>
                                </a>
                                <div class="share-btn copy" onclick="navigator.clipboard.writeText('${pageUrl}'); alert('Link copied!');" title="Copy Link">
                                    <i class="fas fa-link"></i><span style="font-size:0.7rem; font-weight:900;">🔗</span>
                                </div>
                            </div>
                        `;
                    }

                    // --- Increment article view counter in Supabase ---
                    if (sbClient && !sessionStorage.getItem('viewed_' + foundArticle.id)) {
                        const newViews = (parseInt(foundArticle.views) || 0) + 1;
                        sbClient.from('articles').update({ views: newViews }).eq('id', foundArticle.id).then(({ error }) => {
                            if (error && error.message.includes('views')) {
                                console.warn("Performance Tip: Run 'ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;' in Supabase SQL editor to enable view tracking!");
                            }
                        });
                        // Update local memory too
                        foundArticle.views = newViews;
                        sessionStorage.setItem('viewed_' + foundArticle.id, '1');
                    }
                }

                // Render Read Next Widget
                const moreContainer = document.getElementById('more-articles-container');
                if (moreContainer) {
                    const others = activeArticles.filter(a => a.id !== articleId).reverse();
                    const nextThree = others.slice(0, 3);
                    if (nextThree.length > 0) {
                        let nextHTML = "";
                        nextThree.forEach(a => {
                            const rawContent = stripHtml(a.content || "");
                            const slug = generateSlug(a.title) || a.id;
                            nextHTML += `
                                <a href="article.html?id=${slug}" class="article-card" style="box-shadow: var(--shadow-sm); animation: floatSubtle 8s ease-in-out infinite;">
                                    <div class="article-tag" style="text-transform: capitalize;">${a.category}</div>
                                    <div class="article-card-image" style="height: 180px;">
                                        <img src="${a.image}" alt="Cover Image">
                                    </div>
                                    <div class="article-card-content" style="padding: 1.5rem;">
                                        <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--text-dark);">${a.title}</h3>
                                        <p style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 0;">${rawContent ? rawContent.substring(0, 80) + '...' : ''}</p>
                                    </div>
                                </a>
                            `;
                        });
                        moreContainer.innerHTML = nextHTML;
                    } else {
                        document.querySelector('.read-next-section').style.display = 'none';
                    }
                }
            } else {
                window.location.replace("404.html");
            }
        } else {
            window.location.replace("404.html");
        }
    }

    // 12. Theme Switcher Logic (Admin Panel)
    const themeBtns = document.querySelectorAll('.theme-btn');
    if (themeBtns.length > 0) {
        const savedTheme = localStorage.getItem('crimson_theme') || 'crimson';
        themeBtns.forEach(btn => {
            if (btn.dataset.theme === savedTheme) btn.classList.add('active');

            btn.addEventListener('click', () => {
                themeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                localStorage.setItem('crimson_theme', btn.dataset.theme);
                applyTheme();
            });
        });
    }

    // 13. Dark Mode Toggle
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (darkModeBtn) {
        const isDark = localStorage.getItem('crimson_dark_mode') === 'true';
        darkModeBtn.innerText = isDark ? '☀️' : '🌙';

        darkModeBtn.addEventListener('click', () => {
            const currentlyDark = document.documentElement.classList.contains('dark-mode');
            if (currentlyDark) {
                localStorage.setItem('crimson_dark_mode', 'false');
                darkModeBtn.innerText = '🌙';
            } else {
                localStorage.setItem('crimson_dark_mode', 'true');
                darkModeBtn.innerText = '☀️';
            }
            applyTheme();
        });
    }

    // 14. Mobile Menu Toggle Logic
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isOpen = navLinks.classList.contains('active');
            menuBtn.innerHTML = isOpen ? '&times;' : '<span></span><span></span><span></span>';
            if (isOpen) {
                menuBtn.style.fontSize = '2rem';
                menuBtn.style.color = 'var(--primary-red)';
            } else {
                menuBtn.style.fontSize = '';
                menuBtn.style.color = '';
            }
        });
    }
});

const style = document.createElement('style');
style.textContent = "@keyframes spin { 100% { transform: rotate(360deg); } }";
document.head.appendChild(style);
