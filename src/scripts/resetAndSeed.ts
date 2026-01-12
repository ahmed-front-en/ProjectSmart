import { DatabaseService } from "../services/DatabaseService";

const db = DatabaseService.getInstance();

const resetAndSeed = async () => {
  try {
    console.log("🔄 Resetting database...");

    // امسح الداتا بس (مش الجداول)
    await db.query(`
      TRUNCATE TABLE
        "Actions",
        "Comments",
        "Posts",
        "Users"
      RESTART IDENTITY
      CASCADE;
    `);

    console.log("✅ Database cleared");

    // رجّع الجداول لو مش موجودة
    await db.sync();

    console.log("🌱 Seeding database...");

    await seedUsers();
    await seedPosts();
    await seedComments();
    await seedActions();

    console.log("🎉 Done! Database ready.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Reset & Seed failed:", error);
    process.exit(1);
  }
};

/* ================= SEED FUNCTIONS ================= */

const seedUsers = async () => {
  const users = [
    ["Ahmed Hassan", "ahmed@example.com", 28],
    ["Fatima Ali", "fatima@example.com", 26],
    ["Mohammed Saleh", "mohammed@example.com", 32],
    ["Noor Ibrahim", "noor@example.com", 24],
    ["Sara Ahmed", "sara@example.com", 29],
  ];

  for (const user of users) {
    await db.query(
      `INSERT INTO "Users"(name,email,age)
       VALUES ($1,$2,$3)
       ON CONFLICT (email) DO NOTHING`
      , user
    );
  }

  console.log("✓ Users ready");
};

const seedPosts = async () => {
  await db.query(`
    INSERT INTO "Posts"(title,"UserId",content,type)
    SELECT
      'Sample Post',
      id,
      'Demo content',
      'text'
    FROM "Users"
    LIMIT 3;
  `);

  console.log("✓ Posts seeded");
};

const seedComments = async () => {
  await db.query(`
    INSERT INTO "Comments"(content,"UserId","PostId")
    SELECT
      'Nice post!',
      u.id,
      p.id
    FROM "Users" u, "Posts" p
    LIMIT 5;
  `);

  console.log("✓ Comments seeded");
};

const seedActions = async () => {
  await db.query(`
    INSERT INTO "Actions"(type,"PostId","UserId")
    SELECT
      'like',
      p.id,
      u.id
    FROM "Posts" p, "Users" u
    LIMIT 5;
  `);

  console.log("✓ Actions seeded");
};

resetAndSeed();
