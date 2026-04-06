import path from "path";
import { randomBytes, randomUUID, pbkdf2Sync } from "crypto";
import { createClient } from "@libsql/client";

const dbPath = process.env.SQLITE_PATH ?? path.join(process.cwd(), "data", "app.db");
const dbUrl = process.env.SQLITE_URL ?? `file:${dbPath}`;
const db = createClient({ url: dbUrl });

const now = Date.now();
const hour = 60 * 60 * 1000;

const demoUsers = [
  "selin",
  "emre",
  "ayse",
  "mert",
  "zeynep",
  "burak",
  "elif",
  "can",
  "deniz",
  "eda",
  "kerem",
  "melis",
];

const titleOpeners = [
  "Next.js 15 ile",
  "SQLite kullanan",
  "Design pattern odakli",
  "Threaded comment yapisina sahip",
  "Top ve trending feed sunan",
  "Factory ve repository desenlerini birlestiren",
  "Role toggle iceren",
  "Comment agacini sade tutan",
  "Vote akisini iki yonlu yapan",
  "Moderator aksiyonlarini ayristiran",
  "Builder kullanan",
  "Servis katmani sade olan",
];

const titleSubjects = [
  "bir ders projesinde submit akisini toparlamak",
  "bir sosyal haber uygulamasinda feed siralamasi kurmak",
  "bir topluluk urununde yorum derinligini yonetmek",
  "bir forum benzeri yapida auth akisini sade tutmak",
  "bir demo uygulamada moderation farklarini gostermek",
  "bir topluluk sayfasinda modern UI dili yakalamak",
  "bir oylama sisteminde duplicate vote sorununu onlemek",
  "bir app router projesinde veri akislarini netlestirmek",
  "bir TypeScript projesinde domain kurallarini ayirmak",
  "bir mini Reddit klonunda etkiletimi artirmak",
  "bir pattern sunumunda use case odakli ilerlemek",
  "bir student project icin gercekci demo veri uretmek",
];

const titleAngles = [
  "neden beklenenden daha etkili oluyor",
  "icin en pratik yol ne olabilir",
  "sirasinda dikkat edilmesi gerekenler",
  "icin hangi yapi daha rahat bakim saglar",
  "tasarlarken en sik yapilan hata ne",
  "icin hangi abstraction seviyesinde durmali",
  "kurarken performansi nasil etkiliyor",
  "olustururken kodu nasil daha okunur yapiyor",
  "ve ekip ici gelistirme hizina etkisi",
  "icin mantikli bir baslangic seti olabilir mi",
];

const textBodies = [
  "Burada asil kazanc kodun daha kolay anlatilabilir hale gelmesi oldu. Ozellikle route, service ve repository sinirlari belirginlesince ekip ici tartismalar da azaldi.",
  "Kucuk capli projelerde mimariyi fazla agirlastirmadan pattern gostermek gerekiyor. Dengeli bir ayrim olunca hem dokumantasyon hem implementasyon daha temiz kaliyor.",
  "Kullanicinin gordugu akis sade olunca arka plandaki kurallar daha net test edilebiliyor. Bu da demo sirasinda beklenmedik davranislari azaltuyor.",
  "UI tarafi ne kadar akiciysa use case gostermek o kadar kolay oluyor. Ozellikle submit, vote ve moderation akislari hizli okunabilir olmali.",
  "Ayni anda hem patternleri gostermek hem de urunu gercek hissettirmek kolay degil. Bu tip durumlarda veri ve metin kalitesi oldukca fark yaratiyor.",
  "Benzer projelerde en buyuk farki genelde validasyon ve state gecisleri yaratiyor. Bu katmanlar net olunca geri kalan kisim daha rahat sekilleniyor.",
];

const linkPairs = [
  ["libSQL client paketi", "https://www.npmjs.com/package/@libsql/client"],
  ["Next.js app router belgeleri", "https://nextjs.org/docs/app"],
  ["React rendering lists dokumani", "https://react.dev/learn/rendering-lists"],
  ["TypeScript handbook", "https://www.typescriptlang.org/docs/"],
  ["SQLite resmi sayfasi", "https://www.sqlite.org/index.html"],
  ["Hacker News", "https://news.ycombinator.com"],
  ["MDN fetch API", "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API"],
  ["Web Content Accessibility Guidelines", "https://www.w3.org/WAI/standards-guidelines/wcag/"],
];

const commentOpeners = [
  "Bu kisim sunumda oldukca net gorunuyor.",
  "Bence burada en dogru tercih sade kalmak olmus.",
  "Buna benzer bir akisi baska bir projede de denemistim.",
  "Bu karar feed davranisini daha tutarli yapiyor.",
  "Burada servis katmaninin rolu daha belirgin hale gelmis.",
  "Bence kullanici acisindan en degerli kisim bu.",
  "Bu detay moderasyon akisini daha anlasilir yapiyor.",
  "Bence veri tarafindaki disiplin UI tarafina da yansimis.",
  "Bu cozum yorum akisini daha okunur hale getirmis.",
  "Bence bu noktada vote mantiginin net olmasi kritik.",
  "Bu tercih dokumantasyon ile implementasyonu daha yakin tutuyor.",
  "Bence burada dogru abstraction seviyesi yakalanmis.",
];

const commentMiddles = [
  "Ozellikle pattern secimini use case ile baglamaniz iyi olmus.",
  "Ayni davranisin UI ve API tarafinda ayni sekilde hissedilmesi onemli.",
  "Gercekci demo veri olunca urun daha guven veriyor.",
  "Hide ve remove farkinin artik net olmasi iyi olmus.",
  "Thread yapisinda derinlik arttikca okunabilirlik daha kritik hale geliyor.",
  "Bu tarz bir projede local database secimi ciddi hiz kazandiriyor.",
  "Bence score davranisini gosteren mini geribildirimler de faydali olur.",
  "Route dosyalarinin gereksiz kosullardan arinmis olmasi bakimi kolaylastiriyor.",
  "Vote engellerinin repository ve service tarafinda birlikte ele alinmasi dogru.",
  "Bu tip bir board icin iki sutunlu ana sayfa gayet is goruyor.",
];

const commentClosers = [
  "Sunum sirasinda bunu gostermek avantaj saglar.",
  "Kullanicinin kafasi daha az karisiyor.",
  "Bu sayede akisin mantigi daha kolay izleniyor.",
  "Bence final teslimde guclu gorunecek.",
  "Ozellikle demo yaparken fark hemen hissediliyor.",
  "Bu detay projeyi daha derli toplu hissettiriyor.",
  "Buradan sonra sadece ince ayar kalmis gibi duruyor.",
  "Ben olsam bu yapiyi bu sekilde korurdum.",
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(items) {
  return items[randomInt(0, items.length - 1)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function buildUniqueTitle(index) {
  const opener = titleOpeners[index % titleOpeners.length];
  const subject = titleSubjects[Math.floor(index / titleOpeners.length) % titleSubjects.length];
  const angle = titleAngles[Math.floor(index / (titleOpeners.length * 2)) % titleAngles.length];
  return `${opener} ${subject} ${angle}?`;
}

function buildUniquePost(index) {
  if (index % 4 === 0) {
    const [label, url] = linkPairs[Math.floor(index / 4) % linkPairs.length];
    return {
      title: `${label} uzerinden ilham alinabilecek bir SlashNews referansi #${index + 1}`,
      type: "link",
      url,
    };
  }

  return {
    title: buildUniqueTitle(index),
    type: "text",
    text: `${pick(textBodies)} Ornek senaryo #${index + 1} icin bu akis ozellikle mantikli gorunuyor.`,
  };
}

function buildUniqueComment(index, contextLabel) {
  const opener = commentOpeners[index % commentOpeners.length];
  const middle = commentMiddles[Math.floor(index / commentOpeners.length) % commentMiddles.length];
  const closer = commentClosers[Math.floor(index / (commentOpeners.length * 2)) % commentClosers.length];
  return `${opener} ${middle} ${contextLabel} hakkinda bakinca bu detay daha da on plana cikiyor. ${closer}`;
}

async function usernameExists(username) {
  const result = await db.execute({
    sql: "SELECT id FROM users WHERE username = ? LIMIT 1",
    args: [username],
  });

  return result.rows.length > 0;
}

async function createUser(username) {
  let candidate = username;
  let suffix = 2;

  while (await usernameExists(candidate)) {
    candidate = `${username}${suffix}`;
    suffix += 1;
  }

  const password = "demo12345";
  const { salt, hash } = hashPassword(password);
  const user = {
    id: randomUUID(),
    username: candidate,
    password_hash: hash,
    password_salt: salt,
    created_at: now - randomInt(24, 24 * 25) * hour,
  };

  await db.execute({
    sql: `
      INSERT INTO users (id, username, password_hash, password_salt, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    args: [user.id, user.username, user.password_hash, user.password_salt, user.created_at],
  });

  return { id: user.id, username: user.username, password };
}

async function insertPost(template, authorId, createdAt, status = "normal") {
  const id = randomUUID();

  await db.execute({
    sql: `
      INSERT INTO posts (id, title, type, url, text, author_id, score, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      template.title,
      template.type,
      template.url ?? null,
      template.text ?? null,
      authorId,
      0,
      status,
      createdAt,
    ],
  });

  return { id, createdAt, type: template.type, title: template.title };
}

async function insertComment(postId, authorId, content, createdAt, parentCommentId = null, status = "normal") {
  const id = randomUUID();

  await db.execute({
    sql: `
      INSERT INTO comments (id, post_id, author_id, parent_comment_id, content, score, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [id, postId, authorId, parentCommentId, content, 0, status, createdAt],
  });

  return { id, postId, content };
}

async function applyPostVote(userId, postId, createdAt) {
  await db.execute({
    sql: `
      INSERT INTO votes (id, user_id, target_type, target_id, value, created_at)
      VALUES (?, ?, 'post', ?, 1, ?)
    `,
    args: [randomUUID(), userId, postId, createdAt],
  });

  await db.execute({
    sql: "UPDATE posts SET score = score + 1 WHERE id = ?",
    args: [postId],
  });
}

async function applyCommentVote(userId, commentId, createdAt) {
  await db.execute({
    sql: `
      INSERT INTO votes (id, user_id, target_type, target_id, value, created_at)
      VALUES (?, ?, 'comment', ?, 1, ?)
    `,
    args: [randomUUID(), userId, commentId, createdAt],
  });

  await db.execute({
    sql: "UPDATE comments SET score = score + 1 WHERE id = ?",
    args: [commentId],
  });
}

async function main() {
  const users = [];
  for (const username of demoUsers) {
    users.push(await createUser(username));
  }

  const posts = [];
  for (let i = 0; i < 24; i += 1) {
    const template = buildUniquePost(i);
    const author = pick(users);
    const createdAt = now - randomInt(2, 96) * hour - randomInt(0, 59) * 60_000;
    const status = i === 22 ? "hidden" : "normal";
    posts.push(await insertPost(template, author.id, createdAt, status));
  }

  const comments = [];
  let commentCounter = 0;

  for (const post of posts) {
    const topLevelCount = randomInt(2, 5);
    const topLevelComments = [];

    for (let i = 0; i < topLevelCount; i += 1) {
      const author = pick(users);
      const content = buildUniqueComment(commentCounter, `"${post.title}" postu`);
      commentCounter += 1;

      const comment = await insertComment(
        post.id,
        author.id,
        content,
        post.createdAt + randomInt(20, 600) * 60_000
      );

      topLevelComments.push(comment);
      comments.push(comment);
    }

    const replyBase = shuffle(topLevelComments).slice(0, randomInt(1, topLevelComments.length));
    for (const parent of replyBase) {
      const author = pick(users);
      const content = buildUniqueComment(
        commentCounter,
        `"${parent.content.slice(0, 36)}..." yorumu`
      );
      commentCounter += 1;

      const reply = await insertComment(
        post.id,
        author.id,
        content,
        post.createdAt + randomInt(10, 900) * 60_000,
        parent.id
      );

      comments.push(reply);
    }
  }

  const postVotePairs = new Set();
  for (const post of posts) {
    const voters = shuffle(users).slice(0, randomInt(2, Math.min(7, users.length)));
    for (const voter of voters) {
      const key = `${voter.id}:post:${post.id}`;
      if (postVotePairs.has(key)) {
        continue;
      }

      postVotePairs.add(key);
      await applyPostVote(voter.id, post.id, post.createdAt + randomInt(1, 12) * hour);
    }
  }

  const commentVotePairs = new Set();
  for (const comment of shuffle(comments).slice(0, Math.min(65, comments.length))) {
    const voters = shuffle(users).slice(0, randomInt(1, 4));
    for (const voter of voters) {
      const key = `${voter.id}:comment:${comment.id}`;
      if (commentVotePairs.has(key)) {
        continue;
      }

      commentVotePairs.add(key);
      await applyCommentVote(voter.id, comment.id, now - randomInt(1, 72) * hour);
    }
  }

  if (comments.length > 3) {
    await db.execute({
      sql: "UPDATE comments SET status = 'hidden' WHERE id = ?",
      args: [comments[2].id],
    });
  }

  console.log(`Created ${users.length} users`);
  console.log(`Created ${posts.length} posts`);
  console.log(`Created ${comments.length} comments`);
  console.log(`Created ${postVotePairs.size + commentVotePairs.size} votes`);
  console.log("Demo login password for seeded users: demo12345");
  console.log(
    `Sample accounts: ${users
      .slice(0, 5)
      .map((user) => user.username)
      .join(", ")}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
