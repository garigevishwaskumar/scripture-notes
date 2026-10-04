const { Client } = require('pg');
const fs = require('fs');

const password = process.argv[2] || 'Vishu@4179';
const projectRef = 'wsmvrxnmyfrggkunihro';
const sql = fs.readFileSync('./supabase/schema.sql', 'utf8');

const hostsToTry = [
  // Direct connection
  { host: `db.${projectRef}.supabase.co`, port: 5432, user: 'postgres' },
  // Common Supabase poolers (Mumbai ap-south-1, us-east-1, eu-central-1, etc.)
  { host: 'aws-0-ap-south-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
  { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
  { host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
  { host: 'aws-0-us-west-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
  { host: 'aws-0-eu-central-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
  { host: 'aws-0-eu-west-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
];

async function attemptMigration() {
  for (const config of hostsToTry) {
    console.log(`Attempting connection to ${config.host}:${config.port} (user: ${config.user})...`);
    const client = new Client({
      host: config.host,
      port: config.port,
      user: config.user,
      password: password,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      console.log(`✓ Connected successfully to ${config.host}!`);
      console.log('Executing schema migration...');
      await client.query(sql);
      console.log('✓ Migration executed successfully!');

      // Verify bible_notes table exists
      const res = await client.query("SELECT to_regclass('public.bible_notes') as table_exists;");
      console.log('Table verification:', res.rows[0]);
      await client.end();
      return true;
    } catch (err) {
      console.log(`Failed on ${config.host}: ${err.message}`);
      try { await client.end(); } catch (_) {}
    }
  }
  return false;
}

attemptMigration().then((success) => {
  if (success) {
    console.log('\n🎉 ALL DONE! Supabase database schema is initialized and verified.');
    process.exit(0);
  } else {
    console.error('\nCould not connect via tried poolers. Please check region or direct access.');
    process.exit(1);
  }
});
