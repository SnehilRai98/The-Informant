// Fetch the API key securely from Netlify serverless function
async function getApiKey() {
  try {
    const response = await fetch('/api/env');
    const data = await response.json();
    return data.API_KEY;
  } catch (error) {
    console.error("Error fetching API key:", error);
    return null;
  }
}

const availableCategories = [
  "business", "entertainment", "general", "health", "science", "sports", "technology"
];

// Fetch latest news for the bulletin
async function fetchBulletinNews(limit = 5) {
  try {
    const API_KEY = await getApiKey();
    if (!API_KEY) throw new Error("API Key is missing!");

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?language=en&country=us&pageSize=${limit}&apiKey=${API_KEY}`
    );
    const data = await response.json();
    
    if (data.status !== "ok" || !data.articles) {
      throw new Error("No articles found in API response.");
    }
    return data.articles;
  } catch (error) {
    console.error("Error fetching bulletin news:", error);
    return [];
  }
}

// Fetch news based on category or search keyword
async function fetchNews(category = "general", searchKeywords = "", country = "us") {
  try {
    const API_KEY = await getApiKey();
    if (!API_KEY) throw new Error("API Key is missing!");

    const url = searchKeywords
      ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchKeywords)}&language=en&sortBy=relevancy&apiKey=${API_KEY}`
      : `https://newsapi.org/v2/top-headlines?category=${category}&language=en&country=${country}&apiKey=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== "ok" || !data.articles) {
      throw new Error("No articles found in API response.");
    }
    return data.articles;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

// Update news bulletin section
async function updateBulletin() {
  const bulletinContainer = document.getElementById("news-bulletin");
  bulletinContainer.textContent = "Loading latest news...";

  const articles = await fetchBulletinNews();
  if (!articles.length) {
    bulletinContainer.textContent = "No latest news available.";
    return;
  }

  bulletinContainer.innerHTML = articles.map(article => `<span>${article.title}</span> | `).join(" ");
}

// Update news articles section
async function updateNews() {
  const category = document.getElementById("category").value;
  const searchKeywords = document.getElementById("search").value.trim();
  const newsContainer = document.getElementById("news-cards");
  newsContainer.innerHTML = "<p>Loading news...</p>";

  const articles = await fetchNews(category, searchKeywords);
  if (!articles.length) {
    newsContainer.innerHTML = "<p class='no-articles'>No articles found. Try a different category or keyword.</p>";
    return;
  }

  newsContainer.innerHTML = articles.map(article => `
    <div class="card" onclick="window.open('${article.url}', '_blank')">
      <h2>${article.title}</h2>
      <p>${truncateDescription(article.description)}</p>
      <div class="read-more">Read More</div>
    </div>
  `).join(" ");
}

// Truncate description to 100 words
function truncateDescription(description) {
  if (!description) return "No description available.";
  const words = description.split(" ");
  return words.length > 100 ? words.slice(0, 100).join(" ") + "..." : description;
}

// Toggle Dark Mode
const toggleButton = document.getElementById("toggle-button");
toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
  toggleButton.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
});

// Typewriter Animation Function
function startTypewriterEffect() {
  const subtitle = document.getElementById("typewriter-subtitle");
  const text = "Your daily source of news";
  let index = 0;

  function type() {
    if (index < text.length) {
      subtitle.textContent += text.charAt(index);
      index++;
      setTimeout(type, 100);
    } else {
      setTimeout(erase, 2000);
    }
  }

  function erase() {
    if (index > 0) {
      subtitle.textContent = text.substring(0, index - 1);
      index--;
      setTimeout(erase, 50);
    } else {
      setTimeout(type, 1000);
    }
  }

  subtitle.textContent = "";
  type();
}

// Event Listeners
document.getElementById("news-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  updateNews();
});

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
  updateBulletin();
  updateNews();
  startTypewriterEffect();
});
