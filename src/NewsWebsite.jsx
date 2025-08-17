import React, { useState, useEffect, useRef } from "react";
import "./styles.css";

// Your NewsAPI key
const API_KEY = "a7542233f91042b9abf1284667287828";

const NewsWebsite = () => {
  // States
  const [articles, setArticles] = useState([]);
  const [bulletinArticles, setBulletinArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentCategory, setCurrentCategory] = useState("general");
  const [currentSearch, setCurrentSearch] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  // Refs
  const bulletinRef = useRef(null);
  const bulletinIntervalRef = useRef(null);
  const typewriterRef = useRef(null);

  // Typewriter texts
  const typewriterTexts = [
    "Your trusted news source",
    "Stay informed",
    "Latest updates",
    "Breaking news",
    "Global coverage",
    "News that slaps",
    "No cap news",
    "Stay in the loop",
  ];

  // Categories
  const categories = [
    { id: "general", label: "🌐 General" },
    { id: "business", label: "💼 Business" },
    { id: "entertainment", label: "🎬 Entertainment" },
    { id: "health", label: "🏥 Health" },
    { id: "science", label: "🔬 Science" },
    { id: "sports", label: "⚽ Sports" },
    { id: "technology", label: "💻 Tech" },
  ];

  // Category emojis
  const categoryEmojis = {
    business: "💼",
    entertainment: "🎬",
    health: "🏥",
    science: "🔬",
    sports: "⚽",
    technology: "💻",
    general: "📰",
  };

  // --- Effects ---
  useEffect(() => {
    updateDate();
    initDarkMode();
    fetchBulletin();
    fetchNews();
    startTypewriter();
    setupScroll();

    return () => {
      clearInterval(bulletinIntervalRef.current);
      clearTimeout(typewriterRef.current);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    fetchNews();
  }, [currentCategory]);

  // --- Functions ---

  const initDarkMode = () => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.body.classList.toggle("dark-mode", saved);
  };

  const updateDate = () => {
    const today = new Date();
    setCurrentDate(
      today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  };

  const handleScroll = () => setShowScrollTop(window.scrollY > 500);
  const setupScroll = () => window.addEventListener("scroll", handleScroll);

  const fetchBulletin = async () => {
    try {
      const res = await fetch(
        `https://newsapi.org/v2/top-headlines?language=en&country=us&pageSize=5&apiKey=${API_KEY}`
      );
      const data = await res.json();
      if (data.articles?.length) {
        setBulletinArticles(data.articles.map((a) => a.title));
        startBulletin();
      } else {
        setBulletinArticles(["No latest news available."]);
      }
    } catch {
      setBulletinArticles(["Failed to load headlines."]);
    }
  };

  const startBulletin = (speed = 0.5) => {
    clearInterval(bulletinIntervalRef.current);
    let pos = 0;
    bulletinIntervalRef.current = setInterval(() => {
      if (bulletinRef.current) {
        const width = bulletinRef.current.scrollWidth / 2;
        pos -= speed;
        if (pos <= -width) pos = 0;
        bulletinRef.current.style.transform = `translateX(${pos}px)`;
      }
    }, 16);
  };

  const fetchNews = async (page = 1) => {
    setLoading(true);
    try {
      const url = currentSearch
        ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(
            currentSearch
          )}&language=en&sortBy=publishedAt&pageSize=12&page=${page}&apiKey=${API_KEY}`
        : `https://newsapi.org/v2/top-headlines?category=${currentCategory}&language=en&country=us&pageSize=12&page=${page}&apiKey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "error") throw new Error(data.message);
      if (!data.articles?.length) throw new Error("No articles found");

      setArticles(page === 1 ? data.articles : [...articles, ...data.articles]);
      setTotalResults(data.totalResults);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    setLoadingMore(true);
    fetchNews(currentPage + 1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNews(1);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle("dark-mode", newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const startTypewriter = () => {
    let textIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const type = () => {
      const current = typewriterTexts[textIndex];
      setTypewriterText(
        deleting
          ? current.substring(0, charIndex - 1)
          : current.substring(0, charIndex + 1)
      );

      if (!deleting && charIndex === current.length) {
        deleting = true;
        typewriterRef.current = setTimeout(type, 1500);
      } else if (deleting && charIndex === 0) {
        deleting = false;
        textIndex = (textIndex + 1) % typewriterTexts.length;
        typewriterRef.current = setTimeout(type, 500);
      } else {
        charIndex += deleting ? -1 : 1;
        typewriterRef.current = setTimeout(type, deleting ? 50 : 100);
      }
    };

    typewriterRef.current = setTimeout(type, 1000);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Date not available";

  const truncate = (text, len = 100) =>
    !text
      ? "No description available."
      : text.length > len
      ? text.slice(0, len) + "..."
      : text;

  // --- JSX ---
  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <h1 id="typewriter-title">THE INFORMANT</h1>
          <p id="typewriter-subtitle">{typewriterText}</p>
          <div className="date-display">{currentDate}</div>
        </div>
        <button className="toggle-button" onClick={toggleDarkMode}>
          <i className={`fas ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
        </button>
      </header>

      {/* Bulletin */}
      <div className="news-bulletin">
        <div className="bulletin-label">BREAKING</div>
        <div className="bulletin-wrapper">
          <div className="bulletin-content" ref={bulletinRef}>
            {[...bulletinArticles, ...bulletinArticles].map((item, i) => (
              <span key={i} className="bulletin-item">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="categories-container">
        <div className="categories-scroll">
          {categories.map((c) => (
            <button
              key={c.id}
              className={`category-btn ${
                currentCategory === c.id ? "active" : ""
              }`}
              onClick={() => {
                setCurrentCategory(c.id);
                setCurrentSearch("");
                setArticles([]);
                setCurrentPage(1);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="search-section">
        <form onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input
              type="text"
              value={currentSearch}
              onChange={(e) => setCurrentSearch(e.target.value)}
              placeholder="Search for news..."
            />
            <button className="search-btn" type="submit">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && <div className="error-message show">{error}</div>}

      {/* News */}
      <div className="news-results">
        <div className="results-header">
          <h2 className="section-title">Latest News</h2>
          <div className="results-count">
            {loading ? "Loading..." : `${totalResults} results found`}
          </div>
        </div>

        <div className="news-grid">
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            articles.map((a, i) => (
              <div
                key={i}
                className="news-card"
                onClick={() => window.open(a.url, "_blank")}
              >
                <div className="card-image">
                  <img
                    src={
                      a.urlToImage ||
                      "https://via.placeholder.com/300x180?text=No+Image"
                    }
                    alt={a.title}
                  />
                  <span className="card-emoji">
                    {categoryEmojis[currentCategory]}
                  </span>
                </div>
                <div className="card-content">
                  <span className="card-source">
                    {a.source?.name || "Unknown Source"}
                  </span>
                  <h3 className="card-title">{a.title}</h3>
                  <p className="card-desc">{truncate(a.description)}</p>
                  <div className="card-footer">
                    <span className="card-date">
                      {formatDate(a.publishedAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {articles.length > 0 && currentPage * 12 < totalResults && (
          <div className="load-more">
            <button
              className="load-more-btn"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Loading...
                </>
              ) : (
                "Load More"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Scroll Top */}
      {showScrollTop && (
        <button className="scroll-top-btn visible" onClick={scrollToTop}>
          <i className="fas fa-arrow-up"></i>
        </button>
      )}
    </div>
  );
};

export default NewsWebsite;
