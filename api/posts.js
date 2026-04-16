export default async function handler(req, res) {
    const supabaseUrl = 'https://maestlpaeoyamtvaxvur.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZXN0bHBhZW95YW10dmF4dnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjkyMTQsImV4cCI6MjA5MDM0NTIxNH0.c8ZtyewSXEMehQqANwXHS1XzAVtyx9TuyDKwq8qsBaU';

    try {
        // Fetch all articles from Supabase (Management requires visibility of all states)
        const response = await fetch(`${supabaseUrl}/rest/v1/articles?select=*`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Supabase fetch failed');
        }

        const articles = await response.json();

        // Sort by date (latest first)
        const sorted = articles.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Send the response as JSON
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); // Cache for 60 seconds
        res.status(200).json(sorted);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
}
