const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '.')));

// News API Proxy
app.get('/api/news', async (req, res) => {
    try {
        const { category, page, search } = req.query;
        const API_KEY = "a7542233f91042b9abf1284667287828";
        
        let url = `https://newsapi.org/v2/`;
        
        if (search) {
            url += `everything?q=${encodeURIComponent(search)}&language=en&sortBy=publishedAt`;
        } else {
            url += `top-headlines?category=${category || 'general'}&language=en&country=us`;
        }
        
        url += `&pageSize=12&page=${page || 1}&apiKey=${API_KEY}`;
        
        console.log('Making request to:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data.status === 'error') {
            console.error('NewsAPI Error:', data);
            return res.status(500).json({ error: data.message || 'NewsAPI error' });
        }
        
        res.json(data);
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
