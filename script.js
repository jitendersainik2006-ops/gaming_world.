const PASSWORD = "222000";
const categories = ["Arcade", "Puzzle", "Speed", "Brain", "Skill", "Classic", "Action", "Logic"];
const engines = ["clicker", "math", "memory", "typing", "reaction", "color", "target", "luck"];
const names = [
  "Neon Rush", "Pixel Blast", "Galaxy Tap", "Cyber Runner", "Brain Spark", "Speed Grid", "Shadow Click", "Orbit Math",
  "Memory Forge", "Typing Hero", "Reaction Lab", "Color Storm", "Target Arena", "Lucky Vault", "Puzzle Beam", "Retro Pop",
  "Dragon Dash", "Rocket Mind", "Laser Focus", "Crystal Match"
];

const games = Array.from({ length: 120 }, (_, index) => {
  const name = names[index % names.length];
  return {
    id: index + 1,
    title: `${name} ${index + 1}`,
    category: categories[index % categories.length],
    engine: engines[index % engines.length],
    difficulty: ["Easy", "Medium", "Hard", "Pro"][index % 4]
  };
});

const featuredOnlineGames = [
  ["Shell Shockers", "Shooter", "Blue Wizard", "https://shellshock.io/"],
  ["Krunker", "Shooter", "Krunker", "https://krunker.io/"],
  ["Slither.io", "Classic", "Slither", "https://slither.io/"],
  ["Agar.io", "Classic", "Agar", "https://agar.io/"],
  ["1v1.LOL", "Shooter", "Official", "https://1v1.lol/"],
  ["2048", "Puzzle", "Official", "https://play2048.co/"],
  ["Chess", "Strategy", "Chess.com", "https://www.chess.com/play/online"],
  ["Lichess", "Strategy", "Lichess", "https://lichess.org/"],
  ["Tetris", "Classic", "Tetris", "https://tetris.com/play-tetris"],
  ["Skribbl.io", "Multiplayer", "Skribbl", "https://skribbl.io/"],
  ["Gartic Phone", "Multiplayer", "Gartic", "https://garticphone.com/"],
  ["CardGames.io", "Cards", "CardGames", "https://cardgames.io/"]
];

const onlineKeywords = [
  "action", "adventure", "arcade", "battle", "bike", "basketball", "boxing", "car", "chess", "clicker",
  "cooking", "cricket", "defense", "drift", "driving", "escape", "football", "fps", "fighting", "flying",
  "gun", "horror", "io", "kids", "logic", "mahjong", "memory", "minecraft", "monster", "multiplayer",
  "ninja", "parkour", "puzzle", "racing", "robot", "runner", "shooting", "skate", "snake", "soccer",
  "sports", "stickman", "strategy", "survival", "tank", "tower", "truck", "war", "word", "zombie"
];

const onlinePlatforms = [
  { source: "CrazyGames", category: "Arcade", url: (query) => `https://www.crazygames.com/search?q=${encodeURIComponent(query)}` },
  { source: "Poki", category: "Arcade", url: (query) => `https://poki.com/en/search?q=${encodeURIComponent(query)}` },
  { source: "Y8", category: "Arcade", url: (query) => `https://www.y8.com/search?kind=game&category=&tag=&technology=&platform=&q=${encodeURIComponent(query)}` },
  { source: "Itch.io", category: "Indie", url: (query) => `https://itch.io/search?q=${encodeURIComponent(query)}` },
  { source: "Kongregate", category: "Classic", url: (query) => `https://www.kongregate.com/search?q=${encodeURIComponent(query)}` }
];

const onlineGames = [
  ...featuredOnlineGames.map(([title, category, source, url], index) => ({ id: index + 1, title, category, source, url })),
  ...Array.from({ length: 1240 }, (_, index) => {
    const keyword = onlineKeywords[index % onlineKeywords.length];
    const platform = onlinePlatforms[index % onlinePlatforms.length];
    const variant = Math.floor(index / onlineKeywords.length) + 1;
    return {
      id: featuredOnlineGames.length + index + 1,
      title: `${keyword.replace(/\b\w/g, (char) => char.toUpperCase())} Online Pack ${variant}`,
      category: platform.category,
      source: platform.source,
      url: platform.url(keyword)
    };
  })
];

const gate = document.getElementById("gate");
const shell = document.getElementById("siteShell");
const passwordForm = document.getElementById("passwordForm");
const passwordInput = document.getElementById("passwordInput");
const gateHint = document.getElementById("gateHint");
const gameGrid = document.getElementById("gameGrid");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const arenaTitle = document.getElementById("arenaTitle");
const playArea = document.getElementById("playArea");
const currentScore = document.getElementById("currentScore");
const scoreList = document.getElementById("scoreList");
const bestScore = document.getElementById("bestScore");
const totalGames = document.getElementById("totalGames");
const lockBtn = document.getElementById("lockBtn");
const onlineGameGrid = document.getElementById("onlineGameGrid");
const onlineSearchInput = document.getElementById("onlineSearchInput");
const onlineCategoryFilter = document.getElementById("onlineCategoryFilter");
const onlineCount = document.getElementById("onlineCount");
const onlinePager = document.getElementById("onlinePager");

let activeGame = null;
let score = 0;
let timers = [];
let onlinePage = 1;
const onlinePageSize = 96;

function unlockSite() {
  gate.hidden = true;
  shell.hidden = false;
  sessionStorage.setItem("jitender-world-unlocked", "yes");
}

if (sessionStorage.getItem("jitender-world-unlocked") === "yes") {
  unlockSite();
}

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (passwordInput.value.trim() === PASSWORD) {
    gateHint.textContent = "Access granted. Loading Jitender World...";
    gateHint.classList.remove("error");
    setTimeout(unlockSite, 450);
  } else {
    gateHint.textContent = "Wrong password. Try again.";
    gateHint.classList.add("error");
  }
});

lockBtn.addEventListener("click", () => {
  sessionStorage.removeItem("jitender-world-unlocked");
  location.reload();
});

function clearTimers() {
  timers.forEach((timer) => clearTimeout(timer));
  timers.forEach((timer) => clearInterval(timer));
  timers = [];
}

function setScore(value) {
  score = Math.max(0, value);
  currentScore.textContent = score;
}

function addScore(points) {
  setScore(score + points);
}

function saveScore(game) {
  const scores = JSON.parse(localStorage.getItem("jitender-world-scores") || "[]");
  scores.unshift({ title: game.title, score, date: new Date().toLocaleString() });
  localStorage.setItem("jitender-world-scores", JSON.stringify(scores.slice(0, 12)));
  renderScores();

  fetch("/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: game.title, score })
  }).catch(() => {});
}

function renderScores() {
  const scores = JSON.parse(localStorage.getItem("jitender-world-scores") || "[]");
  const top = scores.reduce((max, item) => Math.max(max, item.score), 0);
  bestScore.textContent = top;
  scoreList.innerHTML = scores.length
    ? scores.map((item) => `<li><strong>${item.score}</strong> - ${item.title} <span>${item.date}</span></li>`).join("")
    : "<li>No scores yet. Play a game and save your score.</li>";
}

function renderFilters() {
  categoryFilter.innerHTML = `<option value="all">All categories</option>${categories.map((category) => `<option value="${category}">${category}</option>`).join("")}`;
  const onlineCategories = [...new Set(onlineGames.map((game) => game.category))].sort();
  onlineCategoryFilter.innerHTML = `<option value="all">All online categories</option>${onlineCategories.map((category) => `<option value="${category}">${category}</option>`).join("")}`;
}

function renderGames() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const filtered = games.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(query) || game.category.toLowerCase().includes(query);
    const matchesCategory = category === "all" || game.category === category;
    return matchesSearch && matchesCategory;
  });

  gameGrid.innerHTML = filtered.map((game) => `
    <article class="game-card">
      <span class="tag">${game.category}</span>
      <h3>${game.title}</h3>
      <p>${game.difficulty} ${game.engine} challenge. Launch and score as high as possible.</p>
      <button type="button" data-game-id="${game.id}">Play Now</button>
    </article>
  `).join("");
}

function renderOnlineGames() {
  const query = onlineSearchInput.value.trim().toLowerCase();
  const category = onlineCategoryFilter.value;
  const filtered = onlineGames.filter((game) => {
    const matchesSearch = `${game.title} ${game.category} ${game.source}`.toLowerCase().includes(query);
    const matchesCategory = category === "all" || game.category === category;
    return matchesSearch && matchesCategory;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / onlinePageSize));
  onlinePage = Math.min(onlinePage, totalPages);
  const start = (onlinePage - 1) * onlinePageSize;
  const visible = filtered.slice(start, start + onlinePageSize);

  onlineGameGrid.innerHTML = visible.map((game) => `
    <article class="online-card">
      <span class="tag">${game.category}</span>
      <h3>${game.title}</h3>
      <p>Play from the official ${game.source} website. Opens in a new tab and needs internet.</p>
      <span class="source">${game.source}</span>
      <a href="${game.url}" target="_blank" rel="noopener noreferrer">Play Online</a>
    </article>
  `).join("");

  const pageButtons = [];
  if (onlinePage > 1) pageButtons.push(`<button type="button" data-online-page="${onlinePage - 1}">Prev</button>`);
  pageButtons.push(`<button type="button" class="active">Page ${onlinePage} of ${totalPages}</button>`);
  if (onlinePage < totalPages) pageButtons.push(`<button type="button" data-online-page="${onlinePage + 1}">Next</button>`);
  onlinePager.innerHTML = pageButtons.join("");
}

function gameShell(game, html) {
  activeGame = game;
  clearTimers();
  setScore(0);
  arenaTitle.textContent = game.title;
  playArea.innerHTML = `<div class="game-screen">${html}<button class="game-btn" id="saveScoreBtn" type="button">Save Score</button></div>`;
  document.getElementById("saveScoreBtn").addEventListener("click", () => saveScore(game));
  location.hash = "arena";
}

function startClicker(game) {
  gameShell(game, `<h3>Click Rush</h3><p>Click the glowing button as many times as you can in 20 seconds.</p><button class="game-btn" id="clickerBtn" type="button">Click Me</button><p id="timerText">20 seconds left</p>`);
  let time = 20;
  document.getElementById("clickerBtn").addEventListener("click", () => addScore(1));
  const interval = setInterval(() => {
    time -= 1;
    document.getElementById("timerText").textContent = `${time} seconds left`;
    if (time <= 0) {
      clearInterval(interval);
      document.getElementById("clickerBtn").disabled = true;
    }
  }, 1000);
  timers.push(interval);
}

function startMath(game) {
  const makeQuestion = () => {
    const a = Math.ceil(Math.random() * 20);
    const b = Math.ceil(Math.random() * 20);
    const answer = a + b;
    const choices = [answer, answer + 1, answer - 2, answer + 4].sort(() => Math.random() - 0.5);
    playArea.querySelector(".game-screen").innerHTML = `<h3>Solve Fast</h3><p>What is ${a} + ${b}?</p><div class="choice-grid">${choices.map((choice) => `<button data-answer="${choice}">${choice}</button>`).join("")}</div><button class="game-btn" id="saveScoreBtn" type="button">Save Score</button>`;
    playArea.querySelectorAll("[data-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        addScore(Number(button.dataset.answer) === answer ? 10 : -3);
        makeQuestion();
      });
    });
    document.getElementById("saveScoreBtn").addEventListener("click", () => saveScore(game));
  };
  gameShell(game, "");
  makeQuestion();
}

function startMemory(game) {
  const sequence = Array.from({ length: 5 }, () => Math.ceil(Math.random() * 9));
  gameShell(game, `<h3>Memory Forge</h3><p>Remember this sequence:</p><h2>${sequence.join(" ")}</h2><input class="word-input" id="memoryInput" placeholder="Type numbers without spaces"><button class="game-btn" id="checkMemory" type="button">Check</button>`);
  timers.push(setTimeout(() => {
    playArea.querySelector("h2").textContent = "Hidden";
  }, 2500));
  document.getElementById("checkMemory").addEventListener("click", () => {
    const value = document.getElementById("memoryInput").value.replace(/\s/g, "");
    addScore(value === sequence.join("") ? 50 : 0);
  });
}

function startTyping(game) {
  const words = ["arcade", "galaxy", "winner", "speed", "neon", "world", "player", "future"];
  const word = words[Math.floor(Math.random() * words.length)];
  gameShell(game, `<h3>Typing Hero</h3><p>Type this word exactly:</p><h2>${word}</h2><input class="word-input" id="typeInput" placeholder="Type here"><button class="game-btn" id="typeCheck" type="button">Submit</button>`);
  document.getElementById("typeCheck").addEventListener("click", () => {
    addScore(document.getElementById("typeInput").value.trim().toLowerCase() === word ? 30 : -5);
  });
}

function startReaction(game) {
  gameShell(game, `<h3>Reaction Lab</h3><p>Wait for green, then click.</p><button class="game-btn" id="reactBtn" type="button">Wait...</button>`);
  const button = document.getElementById("reactBtn");
  let ready = false;
  timers.push(setTimeout(() => {
    ready = true;
    button.textContent = "Click Now";
    button.style.background = "linear-gradient(135deg, #42ff9e, #20e3ff)";
  }, 1200 + Math.random() * 2400));
  button.addEventListener("click", () => {
    addScore(ready ? 40 : -10);
    button.textContent = ready ? "Great reaction" : "Too early";
  });
}

function startColor(game) {
  const colors = ["red", "blue", "green", "yellow"];
  const target = colors[Math.floor(Math.random() * colors.length)];
  gameShell(game, `<h3>Color Storm</h3><p>Choose: ${target}</p><div class="choice-grid">${colors.map((color) => `<button data-color="${color}" style="background:${color}; color:#fff">${color}</button>`).join("")}</div>`);
  playArea.querySelectorAll("[data-color]").forEach((button) => {
    button.addEventListener("click", () => addScore(button.dataset.color === target ? 25 : -5));
  });
}

function startTarget(game) {
  gameShell(game, `<h3>Target Arena</h3><p>Hit the moving target.</p><button class="big-target" id="targetBtn" type="button" aria-label="Target"></button>`);
  const target = document.getElementById("targetBtn");
  const move = () => {
    target.style.left = `${Math.random() * 78 + 4}%`;
    target.style.top = `${Math.random() * 70 + 12}%`;
  };
  target.addEventListener("click", () => {
    addScore(15);
    move();
  });
  move();
}

function startLuck(game) {
  gameShell(game, `<h3>Lucky Vault</h3><p>Pick a vault. One gives a jackpot.</p><div class="choice-grid"><button data-vault="1">Vault 1</button><button data-vault="2">Vault 2</button><button data-vault="3">Vault 3</button><button data-vault="4">Vault 4</button></div>`);
  const winning = String(Math.ceil(Math.random() * 4));
  playArea.querySelectorAll("[data-vault]").forEach((button) => {
    button.addEventListener("click", () => addScore(button.dataset.vault === winning ? 60 : 5));
  });
}

function launchGame(game) {
  const starters = { clicker: startClicker, math: startMath, memory: startMemory, typing: startTyping, reaction: startReaction, color: startColor, target: startTarget, luck: startLuck };
  starters[game.engine](game);
}

gameGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-game-id]");
  if (!button) return;
  const game = games.find((item) => item.id === Number(button.dataset.gameId));
  launchGame(game);
});

searchInput.addEventListener("input", renderGames);
categoryFilter.addEventListener("change", renderGames);
onlineSearchInput.addEventListener("input", () => {
  onlinePage = 1;
  renderOnlineGames();
});
onlineCategoryFilter.addEventListener("change", () => {
  onlinePage = 1;
  renderOnlineGames();
});
onlinePager.addEventListener("click", (event) => {
  const button = event.target.closest("[data-online-page]");
  if (!button) return;
  onlinePage = Number(button.dataset.onlinePage);
  renderOnlineGames();
  document.getElementById("online").scrollIntoView({ behavior: "smooth" });
});
totalGames.textContent = games.length;
onlineCount.textContent = `${onlineGames.length}+`;
renderFilters();
renderGames();
renderOnlineGames();
renderScores();
