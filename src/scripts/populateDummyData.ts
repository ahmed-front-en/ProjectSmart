import { DatabaseService } from '../services/DatabaseService';


async function populateDummyData(): Promise<void> {
  console.log('Starting to populate database with dummy data...');
  const db = DatabaseService.getInstance();

  try {
    // Add Users
    console.log('Creating users...');
    const usersResult = await db.query(`
      INSERT INTO "Users" (name, email, age, description, image)
      VALUES
        ('Alice Johnson', 'alice@example.com', 28, 'Software developer interested in web technologies', 'alice.jpg'),
        ('Bob Smith', 'bob@example.com', 34, 'UX designer with 10 years of experience', 'bob.jpg'),
        ('Carol White', 'carol@example.com', 22, 'Computer science student', 'carol.jpg'),
        ('David Brown', 'david@example.com', 42, 'Senior architect and tech lead', 'david.jpg'),
        ('Eva Green', 'eva@example.com', 31, 'Mobile app developer and tech blogger', 'eva.jpg')
      RETURNING id;
    `);

    const userIds = usersResult.rows.map(row => row.id);
    console.log(`Created ${userIds.length} users`);

    // Add Posts
    console.log('Creating posts...');
    const postsResult = await db.query(`
      INSERT INTO "Posts" (title, "userId", content, type)
      VALUES
        ('Introduction to TypeScript', $1, 'TypeScript is a strongly typed programming language that builds on JavaScript. Learn the basics in this post.', 'text'),
        ('Building RESTful APIs with Node.js', $2, 'A comprehensive guide to creating robust APIs using Node.js and Express.', 'text'),
        ('UI Design Principles', $3, 'Key principles every designer should follow for creating intuitive user interfaces.', 'text'),
        ('My Coding Journey', $4, 'Video showcasing my journey from beginner to professional developer.', 'video'),
        ('PostgreSQL Performance Tips', $5, 'Advanced techniques to optimize your PostgreSQL database performance.', 'text'),
        ('React vs Angular in 2025', $1, 'Comparing the two popular frameworks in the current ecosystem.', 'text'),
        ('Mobile Development Trends', $5, 'Exploring the latest trends in mobile application development.', 'video')
      RETURNING id;
    `, [userIds[0], userIds[1], userIds[2], userIds[3], userIds[4]]);

    const postIds = postsResult.rows.map(row => row.id);
    console.log(`Created ${postIds.length} posts`);

    // Add Comments
    console.log('Creating comments...');
    const commentsResult = await db.query(`
      INSERT INTO "Comments" (content, "userId", "postId")
      VALUES
        ('Great introduction! Very helpful for beginners.', $1, $6),
        ('I would add that TypeScript also improves code quality.', $2, $6),
        ('This was exactly what I needed. Thanks!', $3, $7),
        ('Could you elaborate more on middleware usage?', $4, $7),
        ('I disagree with some points, but overall good article.', $5, $8),
        ('The video quality could be better, but content is excellent.', $1, $9),
        ('Bookmarked for future reference!', $2, $10),
        ('I implemented these tips and saw 30% performance improvement.', $3, $10),
        ('Interesting comparison, but I think the conclusion is biased.', $4, $11),
        ('Can you make a video about Flutter too?', $5, $12)
      RETURNING id;
    `, [...userIds, ...postIds]);

    const commentIds = commentsResult.rows.map(row => row.id);
    console.log(`Created ${commentIds.length} comments`);

    // Add Actions
    console.log('Creating actions...');

    // Actions on posts - FIX: Carefully count parameters to match placeholders
    await db.query(`
      INSERT INTO "Actions" (type, "postId", "userId", "commentId")
      VALUES
        ('like', $6, $1, NULL),
        ('like', $6, $2, NULL),
        ('like', $6, $3, NULL),
        ('save', $7, $1, NULL),
        ('like', $7, $4, NULL),
        ('dislike', $8, $5, NULL),
        ('save', $9, $2, NULL),
        ('like', $10, $3, NULL),
        ('like', $11, $1, NULL),
        ('save', $12, $4, NULL)
    `, [userIds[0], userIds[1], userIds[2], userIds[3], userIds[4], ...postIds]);

    // Actions on comments - Ensuring parameter count matches
    await db.query(`
      INSERT INTO "Actions" (type, "postId", "userId", "commentId")
      VALUES
        ('like', NULL, $1, $6),
        ('like', NULL, $2, $6),
        ('dislike', NULL, $3, $7),
        ('like', NULL, $4, $8),
        ('like', NULL, $5, $9),
        ('like', NULL, $1, $10),
        ('dislike', NULL, $2, $11),
        ('like', NULL, $3, $12),
        ('like', NULL, $4, $13),
        ('save', NULL, $5, $14),
        ('like', NULL, $2, $7),
        ('like', NULL, $3, $8),
        ('like', NULL, $4, $9),
        ('dislike', NULL, $5, $10)
    `, [userIds[0], userIds[1], userIds[2], userIds[3], userIds[4], ...commentIds]);

    // Additional comment actions - Split into separate query to avoid parameter count issues
    await db.query(`
      INSERT INTO "Actions" (type, "postId", "userId", "commentId")
      VALUES
        ('dislike', NULL, $1, $11),
        ('save', NULL, $2, $12),
        ('save', NULL, $3, $13),
        ('like', NULL, $4, $14),
        ('like', NULL, $5, $6),
        ('save', NULL, $1, $8)
    `, [userIds[0], userIds[1], userIds[2], userIds[3], userIds[4], commentIds[0], commentIds[2], commentIds[5], commentIds[7], commentIds[8]]);

    console.log('Successfully added actions');
    console.log('Database successfully populated with dummy data!');
  } catch (error) {
    console.error('Error populating database:', error);
  } 
}

// Execute the function
  populateDummyData()
    .then(() => console.log('Script completed'))
    .catch(err => console.error('Script failed:', err));
