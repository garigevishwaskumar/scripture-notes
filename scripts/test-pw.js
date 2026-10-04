const { Client } = require('pg');
const fs = require('fs');

const host = 'aws-0-ap-northeast-1.pooler.supabase.com';
const projectRef = 'wsmvrxnmyfrggkunihro';
const pw = 'Vishu@4179';
const sql = fs.readFileSync('./supabase/schema.sql', 'utf8');

async function testCombinations() {
  const configs = [
    { port: 5432, user: `postgres.${projectRef}` },
    { port: 6543, user: `postgres.${projectRef}` },
    { port: 5432, user: 'postgres' },
  ];

  for (const cfg of configs) {
    console.log(`Testing port ${cfg.port} with user "${cfg.user}"...`);
    const client = new Client({
      host,
      port: cfg.port,
      user: cfg.user,
      password: pw,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      console.log(`✓ CONNECTED on port ${cfg.port}!`);
      console.log('Running SQL migration...');
      await client.query(sql);
      console.log('✓ Migration executed successfully!');
      const res = await client.query("SELECT to_regclass('public.bible_notes') as table_exists;");
      console.log('Table exists:', res.rows[0]);
      await client.end();
      return true;
    } catch (err) {
      console.log(`Failed (port ${cfg.port}): ${err.message}`);
      try { await client.end(); } catch (_) {}
    }
  }
  return false;
}

testCombinations().then(success => {
  if (success) {
    console.log('Database successfully initialized!');
    process.exit(0);
  } else {
    process.exit(1);
  }
});
