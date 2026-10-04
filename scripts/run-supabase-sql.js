/**
 * Executes supabase/schema.sql on Supabase project via Management API
 * Usage: node scripts/run-supabase-sql.js <SUPABASE_PERSONAL_ACCESS_TOKEN> [PROJECT_REF]
 */

const https = require('https');
const fs = require('fs');

const token = process.argv[2] || process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.argv[3] || 'wsmvrxnmyfrggkunihro';

if (!token) {
  console.error('Error: Please provide your Supabase Personal Access Token.');
  console.log('Usage: node scripts/run-supabase-sql.js <SUPABASE_PERSONAL_ACCESS_TOKEN> [PROJECT_REF]');
  process.exit(1);
}

const sql = fs.readFileSync('./supabase/schema.sql', 'utf8');

console.log(`Executing SQL migration on project ${projectRef}...`);

const payload = JSON.stringify({ query: sql });

const req = https.request(
  {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${projectRef}/database/query`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  },
  (res) => {
    let body = '';
    res.on('data', (c) => (body += c));
    res.on('end', () => {
      console.log('Response Status:', res.statusCode);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('✓ Successfully executed SQL migration on Supabase!');
        console.log(body);
      } else {
        console.error('Error response from Supabase:', body);
      }
    });
  }
);

req.on('error', (err) => console.error('Network error:', err));
req.write(payload);
req.end();
