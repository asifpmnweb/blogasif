const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'script.js');
let content = fs.readFileSync(filePath, 'utf8');

const s1 = `const STORAGE_KEY = 'crimson_articles';`;
const initScript = `const supabaseUrl = 'https://maestlpaeoyamtvaxvur.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZXN0bHBhZW95YW10dmF4dnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjkyMTQsImV4cCI6MjA5MDM0NTIxNH0.c8ZtyewSXEMehQqANwXHS1XzAVtyx9TuyDKwq8qsBaU';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
window.globalArticles = [];
const STORAGE_KEY = 'crimson_articles';`;
content = content.replace(s1, initScript);

content = content.replace(`if (!localStorage.getItem(STORAGE_KEY)) {`, `if (false) {`);

content = content.replace(`document.addEventListener('DOMContentLoaded', () => {`, `document.addEventListener('DOMContentLoaded', async () => {\n    try {\n        const { data, error } = await supabase.from('articles').select('*');\n        if (!error) window.globalArticles = data || [];\n    } catch(e) {}`);

const uploadOld = `                    let articles = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                    const newArticle = {
                        id: Date.now().toString(),
                        title: title,
                        category: category,
                        content: contentBody,
                        date: targetDate,
                        image: imgSrc
                    };
                    articles.push(newArticle);

                    try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
                    } catch (err) {
                        alert("The image is too large for your browser's local storage.");
                        btn.innerHTML = originalText;
                        btn.style.opacity = '1';
                        btn.style.pointerEvents = 'auto';
                        return;
                    }`;
const uploadNew = `                    const newArticle = {
                        id: Date.now().toString(),
                        title: title,
                        category: category,
                        content: contentBody,
                        date: targetDate,
                        image: imgSrc,
                        archived: false
                    };
                    const { error } = await supabase.from('articles').insert([newArticle]);
                    if (error) {
                        alert("Database error: " + error.message);
                        btn.innerHTML = originalText;
                        btn.style.opacity = '1';
                        btn.style.pointerEvents = 'auto';
                        return;
                    }`;
content = content.replace(uploadOld, uploadNew);
content = content.replace(`const proceedWithSave = (imgSrc) => {`, `const proceedWithSave = async (imgSrc) => {`);

const editOld = `                    let articles = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                    const idx = articles.findIndex(a => a.id === editId);
                    if (idx !== -1) {
                        articles[idx].title = title;
                        articles[idx].category = category;
                        articles[idx].date = customModalDate;
                        articles[idx].content = contentBody;
                        if (imgSrc) {
                            articles[idx].image = imgSrc;
                        }
                    }

                    try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
                    } catch (err) {
                        alert("Image too large!");
                        btn.innerHTML = originalText;
                        btn.style.pointerEvents = 'auto';
                        return;
                    }`;
const editNew = `                    let updateData = { title, category, date: customModalDate, content: contentBody };
                    if (imgSrc) updateData.image = imgSrc;

                    const { error } = await supabase.from('articles').update(updateData).eq('id', editId);
                    if (error) {
                        alert("Database error: " + error.message);
                        btn.innerHTML = originalText;
                        btn.style.pointerEvents = 'auto';
                        return;
                    }`;
content = content.replace(editOld, editNew);
content = content.replace(`const proceedWithUpdate = (imgSrc) => {`, `const proceedWithUpdate = async (imgSrc) => {`);

const archiveOld = `                let articles = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                const idx = articles.findIndex(a => a.id === id);
                if (idx !== -1) {
                    articles[idx].archived = !articles[idx].archived;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
                    e.target.innerText = "⏳...";
                    e.target.style.pointerEvents = 'none';
                    setTimeout(() => window.location.reload(), 400);
                }`;
const archiveNew = `                const article = window.globalArticles.find(a => a.id === id);
                if (article) {
                    e.target.innerText = "⏳...";
                    e.target.style.pointerEvents = 'none';
                    supabase.from('articles').update({ archived: !article.archived }).eq('id', id).then(() => {
                        window.location.reload();
                    });
                }`;
content = content.replace(archiveOld, archiveNew);

const deleteOld = `                if (id) {
                    let articles = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                    articles = articles.filter(a => a.id !== id);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
                }`;
const deleteNew = `                if (id) {
                    window.globalArticles = window.globalArticles.filter(a => a.id !== id);
                    supabase.from('articles').delete().eq('id', id).then(() => {});
                }`;
content = content.replace(deleteOld, deleteNew);

content = content.replace(/let articles \= JSON\.parse\(localStorage\.getItem\(STORAGE_KEY\) \|\| '\[\]'\);/g, "let articles = window.globalArticles;");
content = content.replace(/const articles \= JSON\.parse\(localStorage\.getItem\(STORAGE_KEY\) \|\| '\[\]'\);/g, "const articles = window.globalArticles;");
content = content.replace(/const localArts \= JSON\.parse\(localStorage\.getItem\(STORAGE_KEY\) \|\| '\[\]'\);/g, "const localArts = window.globalArticles;");
content = content.replace(/JSON\.parse\(localStorage\.getItem\(STORAGE_KEY\) \|\| '\[\]'\)/g, "window.globalArticles");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully refactored script.js');
