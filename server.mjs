import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const dataDir = path.join(__dirname, "data");
const progressFile = path.join(dataDir, "progress.json");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

const lessons = [
  {
    id: "script",
    title: "Dari Script Starter",
    category: "Script",
    level: "Beginner",
    minutes: 12,
    summary: "Recognize common Persian-Arabic letters and sound patterns used in Dari.",
    items: [
      { dari: "ا", latin: "alef", meaning: "a / aa sound", note: "Often carries a vowel at the start of a word." },
      { dari: "ب", latin: "be", meaning: "b sound", note: "Connects to the next letter." },
      { dari: "پ", latin: "pe", meaning: "p sound", note: "Used in Dari and Persian; not in Arabic." },
      { dari: "ت", latin: "te", meaning: "t sound" },
      { dari: "د", latin: "dal", meaning: "d sound" },
      { dari: "ر", latin: "re", meaning: "r sound" },
      { dari: "س", latin: "seen", meaning: "s sound" },
      { dari: "ش", latin: "sheen", meaning: "sh sound" },
      { dari: "خ", latin: "khe", meaning: "kh sound", note: "Like the ch in Scottish loch." },
      { dari: "چ", latin: "che", meaning: "ch sound", note: "Very common in everyday Dari words." },
      { dari: "گ", latin: "gaaf", meaning: "g sound" },
      { dari: "ی", latin: "ye", meaning: "y / ee sound" }
    ],
    tip: "Dari is written right to left. Learn letters by sound families first, then practice reading short words."
  },
  {
    id: "greetings",
    title: "Greetings and Courtesy",
    category: "Greetings",
    level: "Beginner",
    minutes: 10,
    summary: "Meet people politely, respond warmly, and leave conversations naturally.",
    items: [
      { dari: "سلام", latin: "salaam", meaning: "hello", note: "The safest greeting in almost every setting." },
      { dari: "علیکم سلام", latin: "alaykum salaam", meaning: "hello back / peace to you too" },
      { dari: "صبح بخیر", latin: "sobh bakhair", meaning: "good morning" },
      { dari: "روز بخیر", latin: "roz bakhair", meaning: "good day" },
      { dari: "شام بخیر", latin: "shaam bakhair", meaning: "good evening" },
      { dari: "شب بخیر", latin: "shab bakhair", meaning: "good night" },
      { dari: "تشکر", latin: "tashakor", meaning: "thank you" },
      { dari: "خیلی تشکر", latin: "khayli tashakor", meaning: "thank you very much" },
      { dari: "خواهش می‌کنم", latin: "khahesh mekonam", meaning: "you are welcome / please" },
      { dari: "ببخشید", latin: "bebakhshid", meaning: "excuse me / sorry" },
      { dari: "معذرت می‌خواهم", latin: "mazerat mekhaham", meaning: "I apologize" },
      { dari: "خدا حافظ", latin: "khoda haafez", meaning: "goodbye" }
    ],
    tip: "Use tashakor for thanks, bebakhshid to get attention politely, and khoda haafez when leaving."
  },
  {
    id: "introductions",
    title: "Introductions and Identity",
    category: "People",
    level: "Beginner",
    minutes: 12,
    summary: "Say your name, ask about someone else, and explain what languages you speak.",
    items: [
      { dari: "نام من ... است", latin: "naam-e man ... ast", meaning: "my name is ..." },
      { dari: "نام شما چیست؟", latin: "naam-e shomaa cheest?", meaning: "what is your name?" },
      { dari: "خوش شدم", latin: "khosh shodam", meaning: "nice to meet you" },
      { dari: "من از امریکا هستم", latin: "man az amrika hastam", meaning: "I am from America" },
      { dari: "شما از کجا هستید؟", latin: "shomaa az kojaa hasteed?", meaning: "where are you from?" },
      { dari: "من شاگرد هستم", latin: "man shaagerd hastam", meaning: "I am a student" },
      { dari: "من کار می‌کنم", latin: "man kaar mekonam", meaning: "I work" },
      { dari: "من انگلیسی صحبت می‌کنم", latin: "man inglisi sohbat mekonam", meaning: "I speak English" },
      { dari: "کمی دری صحبت می‌کنم", latin: "kami dari sohbat mekonam", meaning: "I speak a little Dari" },
      { dari: "دری یاد می‌گیرم", latin: "dari yaad megiram", meaning: "I am learning Dari" }
    ],
    tip: "Shomaa is the respectful form of you. Use it with elders, teachers, strangers, and formal situations."
  },
  {
    id: "learning",
    title: "Classroom and Learning Phrases",
    category: "Learning",
    level: "Beginner",
    minutes: 14,
    summary: "Ask for repetition, spelling, meaning, and slower speech while studying.",
    items: [
      { dari: "لطفاً آهسته صحبت کنید", latin: "lotfan aahesta sohbat koneed", meaning: "please speak slowly" },
      { dari: "لطفاً تکرار کنید", latin: "lotfan takraar koneed", meaning: "please repeat" },
      { dari: "این یعنی چه؟", latin: "een yaani che?", meaning: "what does this mean?" },
      { dari: "چطور می‌نویسید؟", latin: "chetor menawised?", meaning: "how do you write it?" },
      { dari: "چطور تلفظ می‌شود؟", latin: "chetor talaffoz meshawad?", meaning: "how is it pronounced?" },
      { dari: "من نمی‌فهمم", latin: "man namefahmam", meaning: "I do not understand" },
      { dari: "فهمیدم", latin: "fahmidam", meaning: "I understood" },
      { dari: "یک مثال بدهید", latin: "yak mesaal bedehed", meaning: "give an example" },
      { dari: "لطفاً بنویسید", latin: "lotfan benawised", meaning: "please write it" },
      { dari: "درست است؟", latin: "dorost ast?", meaning: "is it correct?" },
      { dari: "اشتباه کردم", latin: "eshtibaah kardam", meaning: "I made a mistake" },
      { dari: "دوباره امتحان می‌کنم", latin: "dobaara emtehaan mekonam", meaning: "I will try again" }
    ],
    tip: "These phrases keep a real conversation going when your vocabulary runs out."
  },
  {
    id: "questions",
    title: "Question Words",
    category: "Questions",
    level: "Beginner",
    minutes: 10,
    summary: "Build simple questions with the most useful Dari question words.",
    items: [
      { dari: "چه؟", latin: "che?", meaning: "what?" },
      { dari: "کی؟", latin: "ki?", meaning: "who?" },
      { dari: "کجا؟", latin: "kojaa?", meaning: "where?" },
      { dari: "چرا؟", latin: "cheraa?", meaning: "why?" },
      { dari: "چطور؟", latin: "chetor?", meaning: "how?" },
      { dari: "کدام؟", latin: "kodaam?", meaning: "which?" },
      { dari: "چه وقت؟", latin: "che waqt?", meaning: "when?" },
      { dari: "چند؟", latin: "chand?", meaning: "how many / how much?" },
      { dari: "این چیست؟", latin: "een cheest?", meaning: "what is this?" },
      { dari: "او کی است؟", latin: "oo ki ast?", meaning: "who is he / she?" },
      { dari: "کجا می‌روید؟", latin: "kojaa merawed?", meaning: "where are you going?" },
      { dari: "چرا نه؟", latin: "cheraa na?", meaning: "why not?" }
    ],
    tip: "Most early conversations become easier once you can ask che, kojaa, chetor, and chand."
  },
  {
    id: "numbers",
    title: "Numbers, Time, and Dates",
    category: "Numbers",
    level: "Beginner",
    minutes: 16,
    summary: "Count, ask prices, and talk about time in everyday situations.",
    items: [
      { dari: "صفر", latin: "sefr", meaning: "zero" },
      { dari: "یک", latin: "yak", meaning: "one" },
      { dari: "دو", latin: "do", meaning: "two" },
      { dari: "سه", latin: "se", meaning: "three" },
      { dari: "چهار", latin: "chahaar", meaning: "four" },
      { dari: "پنج", latin: "panj", meaning: "five" },
      { dari: "ده", latin: "dah", meaning: "ten" },
      { dari: "بیست", latin: "beest", meaning: "twenty" },
      { dari: "صد", latin: "sad", meaning: "one hundred" },
      { dari: "امروز", latin: "emroz", meaning: "today" },
      { dari: "فردا", latin: "fardaa", meaning: "tomorrow" },
      { dari: "دیروز", latin: "diroz", meaning: "yesterday" },
      { dari: "ساعت چند است؟", latin: "saat chand ast?", meaning: "what time is it?" },
      { dari: "حالا", latin: "haalaa", meaning: "now" }
    ],
    tip: "Chand appears in both price and quantity questions, so it is a high-value word."
  },
  {
    id: "family",
    title: "Family and Relationships",
    category: "People",
    level: "Beginner",
    minutes: 12,
    summary: "Name family members and talk about people close to you.",
    items: [
      { dari: "خانواده", latin: "khaanawaada", meaning: "family" },
      { dari: "پدر", latin: "padar", meaning: "father" },
      { dari: "مادر", latin: "maadar", meaning: "mother" },
      { dari: "برادر", latin: "baraadar", meaning: "brother" },
      { dari: "خواهر", latin: "khwaahar", meaning: "sister" },
      { dari: "پسر", latin: "pesar", meaning: "son / boy" },
      { dari: "دختر", latin: "dokhtar", meaning: "daughter / girl" },
      { dari: "دوست", latin: "dost", meaning: "friend" },
      { dari: "همسر", latin: "hamsar", meaning: "spouse" },
      { dari: "طفل", latin: "tefl", meaning: "child" },
      { dari: "بزرگ", latin: "bozorg", meaning: "older / big" },
      { dari: "خورد", latin: "khord", meaning: "younger / small" }
    ],
    tip: "Dost means friend and also appears in friendly phrases like dost daaram, meaning I like or love."
  },
  {
    id: "food",
    title: "Food, Drink, and Hospitality",
    category: "Food",
    level: "Beginner",
    minutes: 14,
    summary: "Order food, accept hospitality, and explain simple needs.",
    items: [
      { dari: "آب", latin: "aab", meaning: "water" },
      { dari: "چای", latin: "chaay", meaning: "tea", note: "Tea is central to hospitality in many Afghan homes." },
      { dari: "نان", latin: "naan", meaning: "bread" },
      { dari: "برنج", latin: "berenj", meaning: "rice" },
      { dari: "گوشت", latin: "gosht", meaning: "meat" },
      { dari: "سبزی", latin: "sabzi", meaning: "vegetables / greens" },
      { dari: "میوه", latin: "mewa", meaning: "fruit" },
      { dari: "من گرسنه هستم", latin: "man gorosna hastam", meaning: "I am hungry" },
      { dari: "من تشنه هستم", latin: "man teshna hastam", meaning: "I am thirsty" },
      { dari: "بسیار خوشمزه است", latin: "besyaar khoshmaza ast", meaning: "it is very delicious" },
      { dari: "لطفاً کمی آب", latin: "lotfan kami aab", meaning: "a little water, please" },
      { dari: "من گوشت نمی‌خورم", latin: "man gosht namekhoram", meaning: "I do not eat meat" }
    ],
    tip: "Khoshmaza is an easy compliment at a meal. It means delicious."
  },
  {
    id: "travel",
    title: "Travel and Directions",
    category: "Travel",
    level: "Beginner",
    minutes: 16,
    summary: "Ask where things are, get around, and talk about transportation.",
    items: [
      { dari: "کجا است؟", latin: "kojaa ast?", meaning: "where is it?" },
      { dari: "راه کدام طرف است؟", latin: "raah kodaam taraf ast?", meaning: "which way is the road?" },
      { dari: "چپ", latin: "chap", meaning: "left" },
      { dari: "راست", latin: "raast", meaning: "right" },
      { dari: "مستقیم", latin: "mostaqim", meaning: "straight ahead" },
      { dari: "نزدیک", latin: "nazdik", meaning: "near" },
      { dari: "دور", latin: "door", meaning: "far" },
      { dari: "موتر", latin: "motar", meaning: "car" },
      { dari: "تکسی", latin: "taksi", meaning: "taxi" },
      { dari: "بس", latin: "bas", meaning: "bus" },
      { dari: "میدان هوایی", latin: "maydaan-e hawaayi", meaning: "airport" },
      { dari: "ایستگاه کجا است؟", latin: "estgaah kojaa ast?", meaning: "where is the station?" },
      { dari: "لطفاً اینجا توقف کنید", latin: "lotfan eenjaa tawaqof koneed", meaning: "please stop here" }
    ],
    tip: "Pair kojaa ast with a place word to ask where anything is."
  },
  {
    id: "shopping",
    title: "Shopping and Money",
    category: "Shopping",
    level: "Beginner",
    minutes: 14,
    summary: "Ask prices, choose items, and use simple market language.",
    items: [
      { dari: "این چند است؟", latin: "een chand ast?", meaning: "how much is this?" },
      { dari: "قیمت", latin: "qeemat", meaning: "price" },
      { dari: "پول", latin: "pul", meaning: "money" },
      { dari: "ارزان", latin: "arzaan", meaning: "cheap / inexpensive" },
      { dari: "گران", latin: "giraan", meaning: "expensive" },
      { dari: "من این را می‌خواهم", latin: "man een raa mekhaham", meaning: "I want this" },
      { dari: "دیگر دارید؟", latin: "deegar daared?", meaning: "do you have another?" },
      { dari: "بسیار خوب", latin: "besyaar khoob", meaning: "very good" },
      { dari: "کمتر می‌شود؟", latin: "kamtar meshawad?", meaning: "can it be less?" },
      { dari: "رسید", latin: "raseed", meaning: "receipt" },
      { dari: "کارت قبول می‌کنید؟", latin: "kaart qabol mekoneed?", meaning: "do you accept cards?" },
      { dari: "نقد", latin: "naqd", meaning: "cash" }
    ],
    tip: "Een chand ast is one of the most practical phrases for markets, taxis, and shops."
  },
  {
    id: "home",
    title: "Home, Objects, and Places",
    category: "Home",
    level: "Beginner",
    minutes: 12,
    summary: "Name common places and objects around a home or building.",
    items: [
      { dari: "خانه", latin: "khaana", meaning: "home / house" },
      { dari: "اتاق", latin: "otaq", meaning: "room" },
      { dari: "دروازه", latin: "darwaaza", meaning: "door / gate" },
      { dari: "کلکین", latin: "kalkin", meaning: "window" },
      { dari: "چوکی", latin: "chawki", meaning: "chair" },
      { dari: "میز", latin: "mez", meaning: "table" },
      { dari: "کتاب", latin: "ketaab", meaning: "book" },
      { dari: "قلم", latin: "qalam", meaning: "pen" },
      { dari: "تیلیفون", latin: "telefon", meaning: "phone" },
      { dari: "کلید", latin: "kaleed", meaning: "key" },
      { dari: "تشناب", latin: "tashnaab", meaning: "bathroom / toilet" },
      { dari: "آشپزخانه", latin: "aashpazkhaana", meaning: "kitchen" }
    ],
    tip: "Pointing plus een cheest can turn any object into a vocabulary lesson."
  },
  {
    id: "health",
    title: "Health and Help",
    category: "Health",
    level: "Beginner",
    minutes: 14,
    summary: "Explain basic health needs and ask for help in urgent situations.",
    items: [
      { dari: "کمک کنید", latin: "komak koneed", meaning: "help me / please help" },
      { dari: "داکتر", latin: "daaktar", meaning: "doctor" },
      { dari: "شفاخانه", latin: "shafaakhaana", meaning: "hospital" },
      { dari: "دوا", latin: "dawaa", meaning: "medicine" },
      { dari: "من مریض هستم", latin: "man mareez hastam", meaning: "I am sick" },
      { dari: "سرم درد می‌کند", latin: "saram dard mekonad", meaning: "my head hurts" },
      { dari: "دل من درد می‌کند", latin: "del-e man dard mekonad", meaning: "my stomach hurts" },
      { dari: "تب دارم", latin: "tab daaram", meaning: "I have a fever" },
      { dari: "خطر", latin: "khatar", meaning: "danger" },
      { dari: "عاجل", latin: "aajel", meaning: "urgent" },
      { dari: "آدرس شما چیست؟", latin: "adres-e shomaa cheest?", meaning: "what is your address?" },
      { dari: "شماره تیلیفون", latin: "shomaara-ye telefon", meaning: "phone number" }
    ],
    tip: "For serious situations, komak koneed and shafaakhaana are the words to recognize quickly."
  },
  {
    id: "verbs",
    title: "High-Value Verbs",
    category: "Verbs",
    level: "Beginner",
    minutes: 18,
    summary: "Learn common action words that help you build many sentences.",
    items: [
      { dari: "بودن", latin: "budan", meaning: "to be" },
      { dari: "داشتن", latin: "daashtan", meaning: "to have" },
      { dari: "رفتن", latin: "raftan", meaning: "to go" },
      { dari: "آمدن", latin: "aamadan", meaning: "to come" },
      { dari: "کردن", latin: "kardan", meaning: "to do / to make" },
      { dari: "گفتن", latin: "goftan", meaning: "to say" },
      { dari: "دیدن", latin: "deedan", meaning: "to see" },
      { dari: "خوردن", latin: "khordan", meaning: "to eat" },
      { dari: "نوشیدن", latin: "noshidan", meaning: "to drink" },
      { dari: "خواستن", latin: "khaastan", meaning: "to want" },
      { dari: "یاد گرفتن", latin: "yaad gereftan", meaning: "to learn" },
      { dari: "صحبت کردن", latin: "sohbat kardan", meaning: "to speak / talk" },
      { dari: "فهمیدن", latin: "fahmidan", meaning: "to understand" },
      { dari: "نوشتن", latin: "naweshtan", meaning: "to write" }
    ],
    tip: "Many Dari expressions use kardan with a noun, similar to make/do in English."
  },
  {
    id: "descriptions",
    title: "Descriptions and Feelings",
    category: "Descriptions",
    level: "Beginner",
    minutes: 14,
    summary: "Describe people, places, feelings, size, and quality.",
    items: [
      { dari: "خوب", latin: "khoob", meaning: "good / well" },
      { dari: "خراب", latin: "kharaab", meaning: "bad / broken" },
      { dari: "زیبا", latin: "zebaa", meaning: "beautiful" },
      { dari: "کلان", latin: "kalaan", meaning: "big" },
      { dari: "خورد", latin: "khord", meaning: "small / young" },
      { dari: "نو", latin: "naw", meaning: "new" },
      { dari: "کهنه", latin: "kohna", meaning: "old" },
      { dari: "آسان", latin: "aasaan", meaning: "easy" },
      { dari: "مشکل", latin: "moshkel", meaning: "difficult / problem" },
      { dari: "خوش", latin: "khosh", meaning: "happy / pleasant" },
      { dari: "خفه", latin: "khafa", meaning: "sad / upset" },
      { dari: "خسته", latin: "khasta", meaning: "tired" },
      { dari: "سرد", latin: "sard", meaning: "cold" },
      { dari: "گرم", latin: "garm", meaning: "hot / warm" }
    ],
    tip: "Khoob is extremely flexible: good, fine, okay, and well."
  },
  {
    id: "conversation",
    title: "Everyday Conversation Builders",
    category: "Conversation",
    level: "Beginner",
    minutes: 18,
    summary: "Use short sentence pieces that make real conversations sound smoother.",
    items: [
      { dari: "بلی", latin: "bale", meaning: "yes" },
      { dari: "نه", latin: "na", meaning: "no" },
      { dari: "شاید", latin: "shaayad", meaning: "maybe" },
      { dari: "حتماً", latin: "hatman", meaning: "certainly / of course" },
      { dari: "مشکل نیست", latin: "moshkel nest", meaning: "no problem" },
      { dari: "درست است", latin: "dorost ast", meaning: "that is correct / okay" },
      { dari: "من فکر می‌کنم", latin: "man fekr mekonam", meaning: "I think" },
      { dari: "به نظر من", latin: "ba nazar-e man", meaning: "in my opinion" },
      { dari: "من دوست دارم", latin: "man dost daaram", meaning: "I like / I love" },
      { dari: "من ضرورت دارم", latin: "man zaroorat daaram", meaning: "I need" },
      { dari: "من وقت ندارم", latin: "man waqt nadaaram", meaning: "I do not have time" },
      { dari: "بعداً می‌بینمت", latin: "baadan mebinamet", meaning: "see you later" },
      { dari: "همین طور", latin: "hameen tor", meaning: "like this / this way" },
      { dari: "بسیار عالی", latin: "besyaar aali", meaning: "excellent" }
    ],
    tip: "Short builders like bale, na, shaayad, and dorost ast make you conversational early."
  }
];

const quiz = lessons.flatMap((lesson) =>
  lesson.items.map((item) => ({
    lessonId: lesson.id,
    prompt: item.dari,
    answer: item.meaning,
    latin: item.latin
  }))
);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

async function readProgress() {
  if (!existsSync(progressFile)) {
    return { completedLessons: [], quizAttempts: [], streak: 0 };
  }

  return JSON.parse(await readFile(progressFile, "utf8"));
}

async function saveProgress(progress) {
  await writeFile(progressFile, JSON.stringify(progress, null, 2));
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString() || "{}");
}

async function handleApi(request, response) {
  if (request.method === "GET" && request.url === "/api/lessons") {
    return sendJson(response, 200, lessons);
  }

  if (request.method === "GET" && request.url === "/api/quiz") {
    return sendJson(response, 200, quiz);
  }

  if (request.method === "GET" && request.url === "/api/progress") {
    return sendJson(response, 200, await readProgress());
  }

  if (request.method === "POST" && request.url === "/api/progress/lesson") {
    const body = await readRequestBody(request);
    const progress = await readProgress();
    if (!lessons.some((lesson) => lesson.id === body.lessonId)) {
      return sendJson(response, 400, { error: "Unknown lesson." });
    }
    progress.completedLessons = Array.from(new Set([...progress.completedLessons, body.lessonId]));
    progress.streak = Math.max(progress.streak || 0, 1);
    await saveProgress(progress);
    return sendJson(response, 200, progress);
  }

  if (request.method === "POST" && request.url === "/api/progress/quiz") {
    const body = await readRequestBody(request);
    const progress = await readProgress();
    progress.quizAttempts = [
      {
        score: Number(body.score || 0),
        total: Number(body.total || 0),
        date: new Date().toISOString()
      },
      ...progress.quizAttempts
    ].slice(0, 10);
    progress.streak = Math.max(progress.streak || 0, 1);
    await saveProgress(progress);
    return sendJson(response, 200, progress);
  }

  sendJson(response, 404, { error: "API route not found." });
}

async function serveStatic(request, response) {
  const requestedUrl = new URL(request.url, `http://${request.headers.host}`);
  const normalized = path.normalize(decodeURIComponent(requestedUrl.pathname));
  const relativePath = normalized === "/" ? "index.html" : normalized.replace(/^\/+/, "");
  const filePath = path.join(publicDir, relativePath);

  if (!filePath.startsWith(publicDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const content = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(content);
  } catch {
    const fallback = await readFile(path.join(publicDir, "index.html"));
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(fallback);
  }
}

const server = createServer(async (request, response) => {
  try {
    if (request.url.startsWith("/api/")) {
      await handleApi(request, response);
      return;
    }
    await serveStatic(request, response);
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
});

server.listen(port, host, () => {
  console.log(`Learn Dari is running at http://${host}:${port}`);
});
