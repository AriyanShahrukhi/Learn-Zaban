const state = {
  lessons: [],
  quiz: [],
  progress: { completedLessons: [], quizAttempts: [], streak: 0 },
  currentQuestion: 0,
  score: 0,
  answered: false
};

const selectors = {
  lessonGrid: document.querySelector("#lessonGrid"),
  phraseList: document.querySelector("#phraseList"),
  phraseSearch: document.querySelector("#phraseSearch"),
  categoryFilters: document.querySelector("#categoryFilters"),
  completedCount: document.querySelector("#completedCount"),
  quizAverage: document.querySelector("#quizAverage"),
  streakCount: document.querySelector("#streakCount"),
  totalLessons: document.querySelector("#totalLessons"),
  totalTerms: document.querySelector("#totalTerms"),
  totalCategories: document.querySelector("#totalCategories"),
  quizCounter: document.querySelector("#quizCounter"),
  quizPrompt: document.querySelector("#quizPrompt"),
  quizLatin: document.querySelector("#quizLatin"),
  answerGrid: document.querySelector("#answerGrid"),
  quizFeedback: document.querySelector("#quizFeedback"),
  nextQuestion: document.querySelector("#nextQuestion")
};

let activeCategory = "all";

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function allPhrases() {
  return state.lessons.flatMap((lesson) =>
    lesson.items.map((item) => ({
      ...item,
      lessonTitle: lesson.title,
      category: lesson.category || lesson.title
    }))
  );
}

function updateStats() {
  const phrases = allPhrases();
  const categories = new Set(state.lessons.map((lesson) => lesson.category || lesson.title));

  selectors.completedCount.textContent = state.progress.completedLessons.length;
  selectors.streakCount.textContent = state.progress.streak || 0;
  selectors.totalLessons.textContent = state.lessons.length;
  selectors.totalTerms.textContent = phrases.length;
  selectors.totalCategories.textContent = categories.size;

  const attempts = state.progress.quizAttempts;
  const average = attempts.length
    ? Math.round(
        attempts.reduce((sum, attempt) => sum + attempt.score / Math.max(attempt.total, 1), 0) /
          attempts.length *
          100
      )
    : 0;
  selectors.quizAverage.textContent = `${average}%`;
}

function renderLessons() {
  selectors.lessonGrid.innerHTML = state.lessons
    .map((lesson) => {
      const done = state.progress.completedLessons.includes(lesson.id);
      const items = lesson.items
        .map(
          (item) => `
            <div class="lesson-item">
              <span class="dari" dir="rtl">${item.dari}</span>
              <span class="latin">${item.latin}</span>
              <span class="meaning">${item.meaning}</span>
              ${item.note ? `<span class="note">${item.note}</span>` : ""}
            </div>
          `
        )
        .join("");

      return `
        <article class="lesson-card ${done ? "done" : ""}">
          <div class="card-top">
            <div>
              <p class="meta">${lesson.level} · ${lesson.minutes} min</p>
              <h3 class="lesson-title">${lesson.title}</h3>
              <p class="meaning">${lesson.summary}</p>
            </div>
            <div class="lesson-badges" aria-label="Lesson status and size">
              <span class="status-pill">${done ? "Done" : "New"}</span>
              <span class="status-pill quiet">${lesson.items.length} terms</span>
            </div>
          </div>
          <div class="lesson-items">${items}</div>
          <p class="lesson-tip">${lesson.tip}</p>
          <button class="primary-button complete-button" type="button" data-lesson-id="${lesson.id}">
            ${done ? "Review again" : "Mark complete"}
          </button>
        </article>
      `;
    })
    .join("");
}

function renderPhrasebook(query = "") {
  const normalized = query.trim().toLowerCase();
  const phrases = allPhrases().filter((phrase) => {
    const haystack = `${phrase.dari} ${phrase.latin} ${phrase.meaning} ${phrase.lessonTitle} ${phrase.category} ${phrase.note || ""}`.toLowerCase();
    const matchesQuery = haystack.includes(normalized);
    const matchesCategory = activeCategory === "all" || phrase.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  selectors.phraseList.innerHTML = phrases
    .map(
      (phrase) => `
        <div class="phrase-row">
          <span class="dari" dir="rtl">${phrase.dari}</span>
          <span class="latin">${phrase.latin}</span>
          <span class="meaning">${phrase.meaning}</span>
          <span class="note">${phrase.category}${phrase.note ? ` · ${phrase.note}` : ""}</span>
        </div>
      `
    )
    .join("") || `<p class="empty-state">No matches yet. Try a different Dari word, transliteration, English meaning, or category.</p>`;
}

function renderCategoryFilters() {
  const categories = ["all", ...new Set(state.lessons.map((lesson) => lesson.category || lesson.title))];
  selectors.categoryFilters.innerHTML = categories
    .map(
      (category) => `
        <button class="filter-chip ${activeCategory === category ? "active" : ""}" type="button" data-category="${category}">
          ${category === "all" ? "All" : category}
        </button>
      `
    )
    .join("");
}

function getQuestion() {
  return state.quiz[state.currentQuestion % state.quiz.length];
}

function renderQuiz() {
  if (!state.quiz.length) return;

  const question = getQuestion();
  const wrongAnswers = shuffle(state.quiz.filter((item) => item.answer !== question.answer))
    .slice(0, 3)
    .map((item) => item.answer);
  const options = shuffle([question.answer, ...wrongAnswers]);

  state.answered = false;
  selectors.quizCounter.textContent = `Question ${(state.currentQuestion % 8) + 1} of 8`;
  selectors.quizPrompt.textContent = question.prompt;
  selectors.quizLatin.textContent = question.latin;
  selectors.quizFeedback.textContent = "";
  selectors.nextQuestion.disabled = true;
  selectors.answerGrid.innerHTML = options
    .map(
      (option) => `
        <button class="answer-option" type="button" data-answer="${option}">
          ${option}
        </button>
      `
    )
    .join("");
}

async function finishQuizRound() {
  state.progress = await api("/api/progress/quiz", {
    method: "POST",
    body: JSON.stringify({ score: state.score, total: 8 })
  });
  updateStats();
  selectors.quizFeedback.textContent = `Round saved: ${state.score} out of 8.`;
  state.score = 0;
}

selectors.lessonGrid.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-lesson-id]");
  if (!button) return;

  state.progress = await api("/api/progress/lesson", {
    method: "POST",
    body: JSON.stringify({ lessonId: button.dataset.lessonId })
  });
  updateStats();
  renderLessons();
});

selectors.answerGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-answer]");
  if (!button || state.answered) return;

  const question = getQuestion();
  const isCorrect = button.dataset.answer === question.answer;
  state.answered = true;
  state.score += isCorrect ? 1 : 0;
  selectors.quizFeedback.textContent = isCorrect
    ? "Correct. Nice recall."
    : `Answer: ${question.answer}`;
  selectors.nextQuestion.disabled = false;

  document.querySelectorAll(".answer-option").forEach((option) => {
    if (option.dataset.answer === question.answer) option.classList.add("correct");
    if (option === button && !isCorrect) option.classList.add("incorrect");
  });
});

selectors.nextQuestion.addEventListener("click", async () => {
  state.currentQuestion += 1;
  if (state.currentQuestion % 8 === 0) {
    await finishQuizRound();
  }
  renderQuiz();
});

selectors.phraseSearch.addEventListener("input", (event) => {
  renderPhrasebook(event.target.value);
});

selectors.categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategoryFilters();
  renderPhrasebook(selectors.phraseSearch.value);
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

async function init() {
  const [lessons, quiz, progress] = await Promise.all([
    api("/api/lessons"),
    api("/api/quiz"),
    api("/api/progress")
  ]);
  state.lessons = lessons;
  state.quiz = shuffle(quiz);
  state.progress = progress;

  updateStats();
  renderLessons();
  renderCategoryFilters();
  renderPhrasebook();
  renderQuiz();
}

init().catch((error) => {
  document.body.innerHTML = `<main class="content-section"><h1>Something went wrong</h1><p>${error.message}</p></main>`;
});
