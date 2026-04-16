export default async function handler(req, res) {
    const supabaseUrl = 'https://maestlpaeoyamtvaxvur.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZXN0bHBhZW95YW10dmF4dnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjkyMTQsImV4cCI6MjA5MDM0NTIxNH0.c8ZtyewSXEMehQqANwXHS1XzAVtyx9TuyDKwq8qsBaU';

    try {
        // Fetch all non-archived, non-unlisted articles from Supabase
        const response = await fetch(`${supabaseUrl}/rest/v1/articles?select=*&archived=eq.false&unlisted=eq.false`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Supabase error: ${response.statusText}`);
        }

        const articles = await response.json();

        // Helper to generate slug (matches script.js exactly)
        const generateSlug = (title) => {
            if (!title) return '';
            const words = title.toLowerCase().trim().split(/\s+/).slice(0, 5).join(' ');
            return words
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        };

        const baseUrl = 'https://blog.asifpmn.in';
        const today = new Date().toISOString().split('T')[0];

        // Start XML string with header
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/article</loc>
    <lastmod>${today}</lastmod>
    <priority>0.8</priority>
  </url>`;

        // Add each article to the XML
        articles.forEach(article => {
            const slug = generateSlug(article.title) || article.id;
            let formattedDate = today;
            
            try {
                if (article.date) {
                    const d = new Date(article.date);
                    if (!isNaN(d.getTime())) {
                        formattedDate = d.toISOString().split('T')[0];
                    }
                }
            } catch(e) {}

            xml += `
  <url>
    <loc>${baseUrl}/article/${slug}</loc>
    <lastmod>${formattedDate}</lastmod>
    <priority>0.7</priority>
  </url>`;
        });

        xml += `\n</urlset>`;

        // Set Headers
        res.setHeader('Content-Type', 'application/xml');
        // Cache for 1 hour to balance fresh content and server performance
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        
        res.status(200).send(xml);
    } catch (error) {
        console.error('Sitemap Error:', error);
        res.status(500).send('Error generating sitemap');
    }
}
