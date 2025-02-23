const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const API_KEY = process.env.NEWS_API_KEY; // Make sure this is set in Netlify environment variables
    const { category = "general", search = "", country = "us", limit = 5 } = event.queryStringParameters;

    const url = search
      ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(search)}&language=en&sortBy=relevancy&apiKey=${API_KEY}`
      : `https://newsapi.org/v2/top-headlines?category=${category}&language=en&country=${country}&pageSize=${limit}&apiKey=${API_KEY}`;

    const response = await fetch(url, { method: "GET" });
    
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `News API error: ${response.status}` }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
