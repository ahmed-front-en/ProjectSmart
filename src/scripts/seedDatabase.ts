import { DatabaseService } from "../services/DatabaseService";

const db = DatabaseService.getInstance();

const seedDatabase = async () => {
  try {
    console.log("Starting database seeding...");

    // 1️⃣ نهيّأ الجداول (آمن)
    await db.sync();
    // 2️⃣ Users (Upsert)
    const userIds = await seedUsers();

    // 3️⃣ Posts (Reset + Insert)
    const postIds = await seedPosts(userIds);

    // 4️⃣ Comments (Reset + Insert)
    await seedComments(postIds, userIds);

    // 5️⃣ Actions (Reset + Insert)
    await seedActions(postIds, userIds);

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

/* ================= USERS ================= */

const seedUsers = async (): Promise<number[]> => {
  const users = [
    {
      name: "Ahmed Hassan",
      email: "ahmed@example.com",
      age: 28,
      description: "Software developer passionate about web technologies",
      image: "https://via.placeholder.com/150?text=Ahmed",
    },
    {
      name: "Fatima Ali",
      email: "fatima@example.com",
      age: 26,
      description: "UI/UX Designer and creative thinker",
      image: "https://via.placeholder.com/150?text=Fatima",
    },
    {
      name: "Mohammed Saleh",
      email: "mohammed@example.com",
      age: 32,
      description: "Backend engineer with 10 years experience",
      image: "https://via.placeholder.com/150?text=Mohammed",
    },
    {
      name: "Noor Ibrahim",
      email: "noor@example.com",
      age: 24,
      description: "Full stack developer and tech enthusiast",
      image: "https://via.placeholder.com/150?text=Noor",
    },
    {
      name: "Sara Ahmed",
      email: "sara@example.com",
      age: 29,
      description: "Product manager focused on user experience",
      image: "https://via.placeholder.com/150?text=Sara",
    },
  ];

  const ids: number[] = [];

  for (const user of users) {
    const result = await db.query(
      `
      INSERT INTO "Users"(name, email, age, description, image)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
      `,
      [user.name, user.email, user.age, user.description, user.image]
    );

    if (result.rows.length > 0) {
      ids.push(result.rows[0].id);
    } else {
      const existing = await db.query(
        `SELECT id FROM "Users" WHERE email = $1`,
        [user.email]
      );
      ids.push(existing.rows[0].id);
    }
  }

  console.log(`✓ Users ready (${ids.length})`);
  return ids;
};

/* ================= POSTS ================= */

const seedPosts = async (userIds: number[]): Promise<number[]> => {
  await db.query(`DELETE FROM "Posts"`);

  const posts = [
    {
      title: "Getting Started with TypeScript",
      userId: userIds[0],
      content: "TypeScript adds static typing to JavaScript.",
      type: "text",
    },
    {
      title: "Web Design Trends",
      userId: userIds[1],
      content: "Modern UI/UX trends for 2024.",
      type: "text",
    },
    {
      title: "Database Optimization",
      userId: userIds[2],
      content: "Indexing and query optimization tips.",
      type: "text",
    },
  ];

  const ids: number[] = [];

  for (const post of posts) {
    const res = await db.query(
      `
      INSERT INTO "Posts"(title, "UserId", content, type)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [post.title, post.userId, post.content, post.type]
    );
    ids.push(res.rows[0].id);
  }

  console.log(`✓ Posts seeded (${ids.length})`);
  return ids;
};

/* ================= COMMENTS ================= */

const seedComments = async (postIds: number[], userIds: number[]) => {
  await db.query(`DELETE FROM "Comments"`);

  await db.query(
    `
    INSERT INTO "Comments"(content, "UserId", "PostId")
    VALUES
      ($1, $2, $3),
      ($4, $5, $6)
    `,
    [
      "Great article!",
      userIds[1],
      postIds[0],
      "Very helpful 👌",
      userIds[2],
      postIds[1],
    ]
  );

  console.log("✓ Comments seeded");
};

/* ================= ACTIONS ================= */

const seedActions = async (postIds: number[], userIds: number[]) => {
  await db.query(`DELETE FROM "Actions"`);

  await db.query(
    `
    INSERT INTO "Actions"(type, "PostId", "UserId")
    VALUES
      ('like', $1, $2),
      ('save', $3, $4)
    `,
    [postIds[0], userIds[1], postIds[1], userIds[2]]
  );

  console.log("✓ Actions seeded");
};

/* ================= RUN ================= */

seedDatabase();
