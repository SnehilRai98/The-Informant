// script.js
// Initialize API Key
const API_KEY = "a7542233f91042b9abf1284667287828";

// DOM Elements
const newsForm = document.getElementById("news-form");
const newsCardsContainer = document.getElementById("news-cards");
const errorMessage = document.getElementById("error-message");
const toggleButton = document.getElementById("toggle-button");
const newsBulletin = document.getElementById("news-bulletin");
const loadMoreBtn = document.getElementById("load-more-btn");
const resultsCount = document.getElementById("results-count");
const currentDateElement = document.getElementById("current-date");
const scrollTopBtn = document.getElementById("scroll-top-btn");
const categoryButtons = document.querySelectorAll(".category-btn");

// Global Variables
let currentPage = 1;
let currentCategory = "general";
let currentSearch = "";
let totalResults = 0;
let bulletinAnimation;

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
  updateCurrentDate();
  initDarkMode();
  updateBulletin();
  updateNews();
  startTypewriterEffect();
  setupScrollToTopButton();
  setupCategoryButtons();
});

function initDarkMode() {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    toggleButton.innerHTML = '<i class="fas fa-sun" style="font-size: 1.2rem;"></i>';
  }
}

function setupCategoryButtons() {
  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentCategory = button.dataset.category;
      updateNews();
    });
  });
}

function setupScrollToTopButton() {
  window.addEventListener("scroll", () => {
    scrollTopBtn.classList.toggle("visible", window.scrollY > 500);
  });

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function updateCurrentDate() {
  const today = new Date();
  currentDateElement.textContent = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function fetchBulletinNews(limit = 5) {
  try {
    const response = await fetch(
      `/api/news?category=general&page=1&pageSize=${limit}`
    );
    const data = await response.json();
    if (data.status === "error")
      throw new Error(data.message || "Failed to fetch news");
    if (!data.articles?.length) throw new Error("No articles found");
    return data.articles;
  } catch (error) {
    console.error("Error fetching bulletin news:", error);
    showError(error.message);
    return [];
  }
}

async function fetchNews(page = 1, category = "general", searchKeywords = "") {
  try {
    const url = searchKeywords
      ? `/api/news?search=${encodeURIComponent(searchKeywords)}&page=${page}`
      : `/api/news?category=${category}&page=${page}`;

    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "error")
      throw new Error(data.message || "Failed to fetch news");
    if (!data.articles?.length) throw new Error("No articles found");

    return {
      articles: data.articles,
      totalResults: data.totalResults,
    };
  } catch (error) {
    console.error("Error fetching news:", error);
    showError(error.message);
    return { articles: [], totalResults: 0 };
  }
}

async function updateBulletin() {
  const placeholderItems = [
    "Breaking News Headlines Loading...",
    "Stay Tuned for Updates...",
    "Latest Stories Coming Your Way...",
    "Getting Fresh News For You...",
  ];

  const placeholderBulletin = placeholderItems
    .map((item) => `<span class="bulletin-item">${item}</span>`)
    .join(" &bull; ");

  newsBulletin.innerHTML = `${placeholderBulletin} &bull; ${placeholderBulletin}`;
  startBulletinAnimation(0.5);

  const articles = await fetchBulletinNews();

  if (!articles.length) {
    newsBulletin.textContent = "No latest news available.";
    return;
  }

  const bulletinItems = articles
    .map((article) => `<span class="bulletin-item">${article.title}</span>`)
    .join(" &bull; ");

  newsBulletin.innerHTML = `${bulletinItems} &bull; ${bulletinItems}`;
  startBulletinAnimation(0.5);
}

function startBulletinAnimation(speed = 0.5) {
  if (bulletinAnimation) {
    clearInterval(bulletinAnimation);
  }

  const contentWidth = newsBulletin.scrollWidth / 2;

  let position = 0;
  bulletinAnimation = setInterval(() => {
    position -= speed;
    if (position <= -contentWidth) {
      position = 0;
    }
    newsBulletin.style.transform = `translateX(${position}px)`;
  }, 16);
}

async function updateNews() {
  newsCardsContainer.innerHTML = '<div class="loading-spinner"></div>';
  currentPage = 1;
  currentSearch = document.getElementById("search").value.trim();

  const { articles, totalResults } = await fetchNews(
    currentPage,
    currentCategory,
    currentSearch
  );

  this.totalResults = totalResults;
  updateResultsCount(totalResults);

  if (!articles.length) {
    newsCardsContainer.innerHTML =
      '<p class="empty-message">No articles found. Try different filters.</p>';
    loadMoreBtn.style.display = "none";
    return;
  }

  renderNewsCards(articles);
  toggleLoadMoreButton(articles.length, totalResults);
}

function toggleLoadMoreButton(articlesCount, total) {
  loadMoreBtn.style.display = articlesCount < total ? "block" : "none";
  loadMoreBtn.disabled = false;
  loadMoreBtn.textContent = "Load More";
}

async function loadMoreNews() {
  currentPage++;
  loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  loadMoreBtn.disabled = true;

  const { articles, totalResults } = await fetchNews(
    currentPage,
    currentCategory,
    currentSearch
  );

  const totalLoaded = (currentPage - 1) * 12 + articles.length;

  if (!articles.length || totalLoaded >= totalResults) {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = "No more articles";
    setTimeout(() => (loadMoreBtn.style.display = "none"), 2000);
    return;
  }

  renderNewsCards(articles, true);
  toggleLoadMoreButton(totalLoaded, totalResults);
}

function renderNewsCards(articles, append = false) {
  if (!append) newsCardsContainer.innerHTML = "";
  newsCardsContainer.innerHTML += articles.map(createNewsCard).join("");

  document.querySelectorAll(".news-card").forEach((card) => {
    card.addEventListener("click", () => {
      const url = card.dataset.url;
      if (url) window.open(url, "_blank");
    });
  });
}

function createNewsCard(article) {
  const category = getArticleCategory(article);
  const emoji = {
    business: "💼",
    entertainment: "🎬",
    health: "🏥",
    science: "��",
    sports: "⚽",
    technology: "💻",
    general: "📰",
  }[category];

  return `
  <div class="news-card" data-url="${article.url}">
    <div class="card-image">
      <img src="${
        article.urlToImage ||
        "https://via.placeholder.com/300x180?text=No+Image"
      }" alt="${article.title}">
      <span class="card-emoji">${emoji}</span>
    </div>
    <div class="card-content">
      <span class="card-source">${
        article.source?.name || "Unknown Source"
      }</span>
      <h3 class="card-title">${article.title}</h3>
      <p class="card-desc">${truncateDescription(
        article.description || "",
        100
      )}</p>
      <div class="card-footer">
        <span class="card-date">${formatDate(article.publishedAt)}</span>
      </div>
    </div>
  </div>`;
}

function getArticleCategory(article) {
  if (!article.source?.name) return "general";
  const sourceLower = article.source.name.toLowerCase();
  if (/tech|digital/i.test(sourceLower)) return "technology";
  if (/sport/i.test(sourceLower)) return "sports";
  if (/health|medical/i.test(sourceLower)) return "health";
  if (/entertainment|hollywood/i.test(sourceLower)) return "entertainment";
  if (/business|finance/i.test(sourceLower)) return "business";
  if (/science/i.test(sourceLower)) return "science";
  return "general";
}

function truncateDescription(description, maxLength = 100) {
  return !description
    ? "No description available."
    : description.length > maxLength
    ? `${description.substring(0, maxLength)}...`
    : description;
}

function formatDate(dateString) {
  return !dateString
    ? "Date not available"
    : new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

function updateResultsCount(count) {
  resultsCount.textContent = `${count} ${
    count === 1 ? "result" : "results"
  } found`;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add("show");
  setTimeout(() => errorMessage.classList.remove("show"), 5000);
}

function startTypewriterEffect() {
  const subtitle = document.getElementById("typewriter-subtitle");
  const texts = [
    "Your trusted news source",
    "Stay informed",
    "Latest updates",
    "Breaking news",
    "Global coverage",
    "News that slaps",
    "No cap news",
    "Stay in the loop",
  ];
  let textIndex = 0;
  let index = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentText = texts[textIndex];
    subtitle.textContent = isDeleting
      ? currentText.substring(0, index - 1)
      : currentText.substring(0, index + 1);

    if (!isDeleting && index === currentText.length) {
      isDeleting = true;
      typingSpeed = 1500;
    } else if (isDeleting && index === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      typingSpeed = 500;
    } else {
      typingSpeed = isDeleting ? 50 : 100;
      index += isDeleting ? -1 : 1;
    }

    setTimeout(type, typingSpeed);
  }

  setTimeout(type, 1000);
}

// Event Listeners
newsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  updateNews();
});

toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode);
  toggleButton.innerHTML = isDarkMode
    ? '<i class="fas fa-sun" style="font-size: 1.2rem;"></i>'
    : '<i class="fas fa-moon" style="font-size: 1.2rem;"></i>';
});

loadMoreBtn.addEventListener("click", loadMoreNews);
