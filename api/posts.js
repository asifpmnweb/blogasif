export default async function handler(req, res) {
  const supabaseUrl = 'https://maestlpaeoyamtvaxvur.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZXN0bHBhZW95YW10dmF4dnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjkyMTQsImV4cCI6MjA5MDM0NTIxNH0.c8ZtyewSXEMehQqANwXHS1XzAVtyx9TuyDKwq8qsBaU';

  try {
    const data = await fetch(`${supabaseUrl}/rest/v1/articles?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    }).then(r => {
        if (!r.ok) throw new Error(`Supabase Error: ${r.statusText}`);
        return r.json();
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
