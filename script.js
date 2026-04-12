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

// 0. Smart Environment Routing Logic (Fixes file:// and Server paths)
const isLocalEnv = window.location.protocol === 'file:';
const pageExt = isLocalEnv ? '.html' : '';

// Helper to sanitize links for the current environment
const getSafeLink = (path) => {
    if (path === '/' || path === './' || path === '') return isLocalEnv ? 'index.html' : '/';
    // Remove leading slash for local file consistency if needed
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return isLocalEnv ? `./${cleanPath}${pageExt}` : `/${cleanPath}`;
};

const getArticleLink = (identifier) => {
    return isLocalEnv ? `${getSafeLink('article')}?id=${identifier}` : `/article/${identifier}`;
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

// Consolidate preloader logic to avoid conflicts
window.finalizePreloader = () => {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    
    const texts = document.querySelectorAll('.loading-text-filling, .loading-subtext-filling');
    texts.forEach(t => t.classList.add('glitch-stop'));

    document.body.classList.add('loaded');

    setTimeout(() => {
        if (preloader) preloader.style.display = 'none';

        // Trigger initial reveal animations immediately when shutters open
        document.querySelectorAll('.reveal').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 1200);
}

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

window.resizeActiveImage = (size) => {
    const activeEl = window.getSelection().anchorNode;
    const img = (activeEl && activeEl.nodeType === 1 && activeEl.tagName === 'IMG') ? activeEl : 
                (activeEl && activeEl.parentElement && activeEl.parentElement.tagName === 'IMG') ? activeEl.parentElement : 
                document.querySelector('.rich-editor img:focus, .rich-editor img:hover'); // Fallback
    
    if (img) {
        img.style.width = size;
        img.style.height = 'auto';
    } else {
        // Try finding the last clicked image if any
        const allImgs = document.querySelectorAll('.rich-editor img');
        if (allImgs.length > 0) {
            // Find one that was likely being edited
            allImgs[allImgs.length - 1].style.width = size;
        }
    }
};

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
    // 0. Fix links for local file vs server environment
    document.querySelectorAll('a[href^="/"]').forEach(link => {
        const originalPath = link.getAttribute('href');
        link.setAttribute('href', getSafeLink(originalPath));
    });

    // 1. Unified Preloader & Startup Logic
    applyTheme();
    const preloader = document.getElementById('preloader');
    if (preloader) {
        if (sessionStorage.getItem('asif_preloader_seen')) {
            preloader.remove(); 
        } else {
            const textElements = document.querySelectorAll('.loading-text-filling, .loading-subtext-filling');
            let count = 0;
            const interval = setInterval(() => {
                count += Math.floor(Math.random() * 5) + 2; // Speeder reveal
                if (count >= 100) {
                    count = 100;
                    clearInterval(interval);
                    textElements.forEach(el => {
                        el.style.setProperty('--loading-progress', '100%');
                        el.classList.add('glitch-stop');
                    });
                    sessionStorage.setItem('asif_preloader_seen', 'true');
                    setTimeout(window.finalizePreloader, 800);
                } else {
                    textElements.forEach(el => el.style.setProperty('--loading-progress', count + '%'));
                }
            }, 30);
        }
    } else {
        window.finalizePreloader(); // Fallback if no preloader element
    }

    // Safety fallback: Always kill preloader after 8 seconds no matter what
    setTimeout(window.finalizePreloader, 8000);

    // Track site visits (unique per browser session)
    const visitCount = parseInt(localStorage.getItem('asif_visits') || '0') + 1;
    if (!sessionStorage.getItem('asif_visited')) {
        localStorage.setItem('asif_visits', visitCount);
        sessionStorage.setItem('asif_visited', '1');
    }

    let DB_ERROR = false;
    const CACHE_KEY = 'crimson_db_cache_v2';
    const isDashboard = window.location.pathname.includes('admin') || window.location.pathname.includes('upload');
    let cached = localStorage.getItem(CACHE_KEY);
    let usedCache = false;

    if (cached && !isDashboard) {
        try {
            window.globalArticles = JSON.parse(cached);
            usedCache = true;
            // Background Revalidate (Silently update cache for next visit)
            if (sbClient) {
                sbClient.from('articles').select('*').then(({data}) => {
                    if (data && JSON.stringify(data) !== cached) {
                        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                    }
                }).catch(e => console.warn('Background fetch failed'));
            }
        } catch(e) { console.error('Cache parse error'); }
    }

    if (!usedCache) {
        try {
            const { data, error } = sbClient
                ? await sbClient.from('articles').select('*')
                : { data: null, error: { message: "Client initialized fail" } };

            if (error) { DB_ERROR = true; console.error("Supabase Error:", error); }
            window.globalArticles = data || [];
            
            // Legacy Migration: Recover old local posts into Supabase
            try {
                const legacyStr = localStorage.getItem('crimson_articles');
                if (legacyStr) {
                    const legacyArts = JSON.parse(legacyStr);
                    if (Array.isArray(legacyArts) && legacyArts.length > 0) {
                        const toAdd = legacyArts.filter(la => !window.globalArticles.find(ga => ga.id === la.id));
                        if (toAdd.length > 0) {
                            window.globalArticles = [...window.globalArticles, ...toAdd];
                            if (sbClient) {
                                sbClient.from('articles').insert(toAdd).then(() => {
                                    console.log('Legacy articles seamlessly migrated to Supabase database.');
                                });
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Legacy migration parsing error', e);
            }
            if (data && !isDashboard) {
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            }
            
            if (window.location.pathname.includes('admin') || document.getElementById('stat-total-views')) {
                window.renderAnalytics(window.globalArticles);
            }
        } catch (e) {
            console.error('Error fetching from Supabase:', e);
            window.globalArticles = [];
        }
    } else {
        if (window.location.pathname.includes('admin') || document.getElementById('stat-total-views')) {
            window.renderAnalytics(window.globalArticles);
        }
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
                            <a href="${getArticleLink(article.id)}" class="btn btn-primary" style="margin-top: 1rem;">Start Reading</a>
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

            slides.forEach((s, i) => {
                if (i !== 0) {
                    s.style.transition = 'none';
                    s.classList.add('enter-from-right');
                }
            });

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
                }, 800);
            };

            const startInterval = () => {
                slideInterval = setInterval(() => {
                    const nextSlide = (currentSlide + 1) % slides.length;
                    goToSlide(nextSlide);
                }, 5000);
            };

            dots.forEach((dot, idx) => {
                dot.addEventListener('click', () => {
                    clearInterval(slideInterval);
                    goToSlide(idx);
                    startInterval();
                });
            });

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

    const buildCard = (article, idx) => {
        const rawText = stripHtml(article.content || "");
        const slug = generateSlug(article.title) || article.id;
        const loadStrategy = idx < 2 ? 'eager' : 'lazy';
        return `
            <a href="${getArticleLink(slug)}" class="article-card reveal visible" style="transition-delay:${idx * 0.08}s">
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
            <a href="${getArticleLink(slug)}" class="blog-list-item reveal visible" style="transition-delay: ${idx * 0.08}s;">
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

    const activeArticles = (window.globalArticles || []).filter(a => !a.archived && !a.unlisted).sort((a, b) => {
        const dA = new Date(a.date);
        const dB = new Date(b.date);
        if (!isNaN(dA) && !isNaN(dB)) return dB - dA;
        return 0;
    });

    if (gridContainer) gridContainer.innerHTML = '';
    if (listContainer) listContainer.innerHTML = '';
    if (vlogsContainer) vlogsContainer.innerHTML = '';
    if (allArticlesContainer) allArticlesContainer.innerHTML = '';

    if (gridContainer && !gridContainer.classList.contains('vlogs-list') && !gridContainer.classList.contains('all-articles-list')) {
        let trending = activeArticles.slice(0, 3);
        if (trending.length > 0) trending.forEach((a, idx) => gridContainer.insertAdjacentHTML('beforeend', buildCard(a, idx)));
        else gridContainer.parentElement.style.display = 'none';
    }

    if (listContainer) {
        let blogPosts = activeArticles.slice(3, 9);
        if (blogPosts.length > 0) blogPosts.forEach((a, idx) => listContainer.insertAdjacentHTML('beforeend', buildListItem(a, idx)));
        else listContainer.parentElement.style.display = 'none';
    }

    if (vlogsContainer) {
        let vlogs = activeArticles.filter(a => a.category.toLowerCase().includes('vlog'));
        if (vlogs.length === 0) vlogs = activeArticles.slice(0, 6); 
        if (vlogs.length > 0) vlogs.forEach((a, idx) => vlogsContainer.insertAdjacentHTML('beforeend', buildCard(a, idx)));
        else vlogsContainer.parentElement.style.display = 'none';
    }

    if (allArticlesContainer) {
        if (activeArticles.length > 0) activeArticles.forEach((a, idx) => allArticlesContainer.insertAdjacentHTML('beforeend', buildCard(a, idx)));
        else allArticlesContainer.parentElement.style.display = 'none';
    }

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

    window.renderAdminList = (articles) => {
        const adminList = document.getElementById('content-list');
        if (!adminList) return;
        adminList.innerHTML = '';
        const allPosts = (articles || []).slice().sort((a, b) => {
            const dA = new Date(a.date);
            const dB = new Date(b.date);
            if (!isNaN(dA) && !isNaN(dB)) return dB - dA;
            return 0;
        });
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
        const countEl = document.querySelector('.admin-section .hero-label');
        if (countEl) {
            const activeCount = articles.filter(a => !a.archived).length;
            countEl.innerText = activeCount + " Active";
        }
        // Update analytics whenever list is modified
        window.renderAnalytics(articles);
    };

    window.renderAnalytics = (articles) => {
        const totalViewsEl = document.getElementById('stat-total-views');
        if (!totalViewsEl) return;

        const allArticles = articles || [];
        const totalViews = allArticles.reduce((sum, a) => sum + (parseInt(a.views) || 0), 0);
        const publishedCount = allArticles.filter(a => !a.archived).length;
        const archivedCount = allArticles.filter(a => a.archived).length;
        const visitCount = localStorage.getItem('asif_visits') || '0';

        // Update basic stats
        totalViewsEl.innerText = totalViews.toLocaleString();
        document.getElementById('stat-visits').innerText = parseInt(visitCount).toLocaleString();
        document.getElementById('stat-published').innerText = publishedCount;
        document.getElementById('stat-archived-count').innerText = `${archivedCount} archived`;
        
        // Find top post
        if (allArticles.length > 0) {
            const topPost = [...allArticles].sort((a, b) => (parseInt(b.views) || 0) - (parseInt(a.views) || 0))[0];
            document.getElementById('stat-top-post').innerText = topPost.title;
            document.getElementById('stat-top-views').innerText = `${(topPost.views || 0).toLocaleString()} views`;
        } else {
            document.getElementById('stat-top-post').innerText = "None yet";
            document.getElementById('stat-top-views').innerText = "0 views";
        }

        // Just a fancy random trend for visual flair (static trend otherwise)
        const viewsTrend = document.getElementById('stat-views-trend');
        if (viewsTrend) {
            const trend = (totalViews / 10).toFixed(1);
            viewsTrend.innerText = `↑ ${trend}% from last month`;
        }
    };

    if (document.getElementById('content-list')) {
        window.renderAdminList(window.globalArticles);
    }

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
            let category = "Article";
            if (selectCategory && selectCategory.options[selectCategory.selectedIndex]) {
                const text = selectCategory.options[selectCategory.selectedIndex].text;
                if (text !== "Select a domain") { category = text; }
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
            let category = selectCategory.options[selectCategory.selectedIndex].text;
            
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
                if (catSelect) {
                    const options = Array.from(catSelect.options);
                    const matchingOpt = options.find(o => o.text.toLowerCase() === (found.category || '').toLowerCase());
                    if (matchingOpt) catSelect.value = matchingOpt.value;
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

    // 10. Article Viewing Page Display logic
    if (window.location.pathname.includes('article') || window.location.search.includes('id=')) {
        const urlParams = new URLSearchParams(window.location.search);
        let articleId = urlParams.get('id') || (window.location.pathname.includes('/article/') ? decodeURIComponent(window.location.pathname.split('/article/')[1].replace(/\/$/, '')) : null);
        const articles = window.globalArticles;
        const activeArticles = articles.filter(a => !a.archived && !a.unlisted);

        // Auto-load latest article if no ID provided in URL
        if (!articleId && activeArticles.length > 0) {
            // Articles are pushed to globalArticles, latest is at the end or we can sort by date
            // Usually they are in order of insertion if using Supabase without order by, 
            // but the reverse() used in other places suggests latest is last.
            const latest = activeArticles[activeArticles.length - 1];
            articleId = latest.id;
        }

        if (articleId) {
            const foundArticle = articles.find(a => a.id === articleId || generateSlug(a.title) === articleId);

            if (foundArticle) {
                document.title = foundArticle.title + " - Asif Ansari";
                
                // --- UPDATE BROWSER URL TO SEO URL ---
                if (!isLocalEnv) {
                    const seoPath = '/article/' + (generateSlug(foundArticle.title) || foundArticle.id);
                    if (window.location.pathname !== seoPath) {
                        window.history.replaceState(null, '', seoPath);
                    }
                }
                
                // --- DYNAMIC SEO META FIX ---
                const rawText = stripHtml(foundArticle.content ||"");
                const snippet = rawText.length > 150 ? rawText.substring(0, 150) + '...' : rawText;
                const dynamicUrl = window.location.origin + window.location.pathname + '?id=' + foundArticle.id;
                
                // Update Canonical Tag
                let canonical = document.querySelector('link[rel="canonical"]');
                if (canonical) canonical.setAttribute('href', dynamicUrl);
                
                // Update Standard Meta
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) metaDesc.setAttribute('content', snippet);
                
                // Update Open Graph (OG)
                const ogTitle = document.querySelector('meta[property="og:title"]');
                if (ogTitle) ogTitle.setAttribute('content', foundArticle.title);
                const ogDesc = document.querySelector('meta[property="og:description"]');
                if (ogDesc) ogDesc.setAttribute('content', snippet);
                const ogImg = document.querySelector('meta[property="og:image"]');
                if (ogImg && foundArticle.image) ogImg.setAttribute('content', foundArticle.image);
                const ogUrl = document.querySelector('meta[property="og:url"]');
                if (ogUrl) ogUrl.setAttribute('content', dynamicUrl);
                // --- END SEO FIX ---

                const titleEl = document.querySelector('.article-header h1');
                if (titleEl) titleEl.innerText = foundArticle.title;
                const bodyEl = document.querySelector('.article-body');
                if (bodyEl) bodyEl.innerHTML = foundArticle.content;
                const imgEl = document.querySelector('.article-hero-img');
                if (imgEl && foundArticle.image) imgEl.src = foundArticle.image;

                // Update category and meta if elements exist
                const catEl = document.querySelector('.article-header .hero-label');
                if (catEl) catEl.innerText = foundArticle.category;
                
                const metaEl = document.querySelector('.article-meta-large');
                if (metaEl) {
                    metaEl.innerHTML = `
                        <span>By Authorized Admin</span>
                        <span>${foundArticle.date}</span>
                        <span>5 min read</span>
                    `;
                }

                // Increment View Count (Dynamic Analytics)
                if (sbClient) {
                    const newViews = (parseInt(foundArticle.views) || 0) + 1;
                    sbClient.from('articles').update({ views: newViews }).eq('id', foundArticle.id).then(() => {
                        foundArticle.views = newViews;
                    }).catch(e => console.warn("View tracker failed"));
                }

                const moreContainer = document.getElementById('more-articles-container');
                if (moreContainer) {
                    const others = activeArticles.filter(a => a.id !== foundArticle.id).reverse().slice(0, 3);
                    let nextHTML = "";
                    others.forEach(a => {
                        const slug = generateSlug(a.title) || a.id;
                        nextHTML += `
                            <a href="${getArticleLink(slug)}" class="article-card">
                                <div class="article-card-image"><img src="${a.image}" alt=""></div>
                                <div class="article-card-content"><h3>${a.title}</h3></div>
                            </a>
                        `;
                    });
                    moreContainer.innerHTML = nextHTML;
                }
            } else {
                window.location.replace(getSafeLink('404'));
            }
        }
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
});

const style = document.createElement('style');
style.textContent = "@keyframes spin { 100% { transform: rotate(360deg); } }";
document.head.appendChild(style);
