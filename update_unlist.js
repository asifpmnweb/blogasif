const fs = require('fs');
let s = fs.readFileSync('script.js', 'utf8');

// 1. Hide from Hero Slider
s = s.replace(/let activeArticles = articles\.filter\(a \=\> \!a\.archived\);/g, "let activeArticles = articles.filter(a => !a.archived && !a.unlisted);");

// 2. Hide from Main Grid Feed (index.html)
s = s.replace(/const activeArticles = \(window\.globalArticles \|\| \[\]\)\.filter\(a \=\> \!a\.archived\)\.reverse\(\);/g, "const activeArticles = (window.globalArticles || []).filter(a => !a.archived && !a.unlisted).reverse();");

// 3. Admin Panel - Render Button
const archiveBtnFind = `<button class="admin-action-btn archive-btn" style="\${isArchived ? 'border-color:#10b981;color:#059669;' : 'border-color:#f59e0b;color:#d97706;'}">\${isArchived ? '↩ Restore' : '📦 Archive'}</button>`;
const archiveBtnReplace = `<button class="admin-action-btn unlist-btn" style="\${article.unlisted ? 'border-color:#8b5cf6;color:#8b5cf6;' : 'border-color:#64748b;color:#64748b;'}">\${article.unlisted ? '👁️ Show' : '🙈 Hide'}</button>
                    <button class="admin-action-btn archive-btn" style="\${isArchived ? 'border-color:#10b981;color:#059669;' : 'border-color:#f59e0b;color:#d97706;'}">\${isArchived ? '↩ Restore' : '📦 Archive'}</button>`;
s = s.replace(archiveBtnFind, archiveBtnReplace);

// 4. Admin Panel - Render Badge
const dateFind = `<span>\${article.date}</span>`;
const dateReplace = `\${article.unlisted ? '<span style="background: #8b5cf6; color: white; padding: 2px 6px; border-radius: 4px; font-weight:700;">Unlisted</span>' : ''}
                        <span>\${article.date}</span>`;
s = s.replace(dateFind, dateReplace);

// 5. Click listener for unlist button
const archiveListen = `else if (e.target.classList.contains('archive-btn')) {`;
const unlistListen = `else if (e.target.classList.contains('unlist-btn')) {
            const listItem = e.target.closest('li');
            const id = listItem.dataset.articleId;
            if (id) {
                const article = (window.globalArticles || []).find(a => a.id === id);
                if (article) {
                    e.target.innerText = "⏳...";
                    e.target.style.pointerEvents = 'none';
                    if (sbClient) sbClient.from('articles').update({ unlisted: !article.unlisted }).eq('id', id).then(() => {
                        window.location.reload();
                    });
                }
            }
        }
        else if (e.target.classList.contains('archive-btn')) {`;
s = s.replace(archiveListen, unlistListen);

fs.writeFileSync('script.js', s);
console.log('Unlisted feature fully installed');
