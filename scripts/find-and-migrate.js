const { Client } = require('pg');
const fs = require('fs');

const regions = [
  'ap-south-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ca-central-1',
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
  'sa-east-1', 'me-central-1', 'me-south-1', 'af-south-1'
];

const projectRef = 'wsmvrxnmyfrggkunihro';
const password = process.argv[2] || 'Vishu@4179';
const sql = fs.readFileSync('./supabase/schema.sql', 'utf8');

async function checkAll() {
  for (const r of regions) {
    const host = `aws-0-${r}.pooler.supabase.com`;
    process.stdout.write(`Testing ${r}... `);

    const client = new Client({
      host,
      port: 6543,
      user: `postgres.${projectRef}`,
      password,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3500,
    });

    try {
      await client.connect();
      console.log(`\n\n🎉 SUCCESS! Connected to region: ${r} (${host})`);
      console.log('Running schema migration...');
      await client.query(sql);
      console.log('✓ Migration executed successfully!');

      const res = await client.query("SELECT to_regclass('public.bible_notes') as table_exists;");
      console.log('Table verification:', res.rows[0]);
      await client.end();
      process.exit(0);
    } catch (err) {
      if (err.message.includes('password authentication failed')) {
        console.log(`Region is ${r}! But password failed: ${err.message}`);
        process.exit(1);
      } else if (!err.message.includes('not found') && !err.message.includes('ENOTFOUND')) {
        console.log(`Other error: ${err.message}`);
      } else {
        process.stdout.write(`not ${r}\n`);
      }
      try { await client.end(); } catch (_) {}
    }
  }
  console.log('\nCould not locate region pooler.');
}

checkAll();
