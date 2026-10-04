/**
 * Helper to create a GitHub repository using a personal access token and push local code.
 * Usage: node scripts/create-github-repo.js <GITHUB_TOKEN> [REPO_NAME] [IS_PRIVATE]
 */

const https = require('https');
const { execSync } = require('child_process');

const token = process.argv[2] || process.env.GITHUB_PERSONAL_ACCESS_TOKEN || process.env.GITHUB_TOKEN;
const repoName = process.argv[3] || 'scripture-notes';
const isPrivate = process.argv[4] === 'true';

if (!token) {
  console.error('Error: Please provide your GitHub Personal Access Token.');
  console.log('Usage: node scripts/create-github-repo.js <GITHUB_TOKEN> [REPO_NAME] [IS_PRIVATE]');
  process.exit(1);
}

console.log(`Connecting to GitHub to create repository "${repoName}"...`);

const payload = JSON.stringify({
  name: repoName,
  description: 'ScriptureNotes - High-performance Bible note-taking PWA with Supabase sync',
  private: isPrivate,
  auto_init: false,
});

const req = https.request(
  {
    hostname: 'api.github.com',
    path: '/user/repos',
    method: 'POST',
    headers: {
      'User-Agent': 'ScriptureNotes-Setup',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  },
  (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      try {
        const responseData = JSON.parse(body);

        if (res.statusCode === 201) {
          console.log(`✓ Repository created successfully: ${responseData.html_url}`);
          pushRepo(responseData.clone_url, token);
        } else if (res.statusCode === 422 && responseData.message?.includes('already exists')) {
          console.log(`Notice: Repository "${repoName}" already exists on your account.`);
          // Fetch user info to get clone url
          fetchUserAndPush(token, repoName);
        } else {
          console.error(`Failed to create repository (${res.statusCode}):`, responseData.message);
          if (responseData.errors) console.error(responseData.errors);
        }
      } catch (err) {
        console.error('Error parsing response:', err, body);
      }
    });
  }
);

req.on('error', (err) => console.error('Network error:', err));
req.write(payload);
req.end();

function fetchUserAndPush(tkn, rName) {
  https.get(
    {
      hostname: 'api.github.com',
      path: '/user',
      headers: {
        'User-Agent': 'ScriptureNotes-Setup',
        'Authorization': `Bearer ${tkn}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    },
    (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => {
        const u = JSON.parse(b);
        const cloneUrl = `https://github.com/${u.login}/${rName}.git`;
        pushRepo(cloneUrl, tkn);
      });
    }
  );
}

function pushRepo(cloneUrl, tkn) {
  try {
    const authCloneUrl = cloneUrl.replace('https://', `https://${tkn}@`);
    console.log('Configuring git remote and pushing to main...');

    try {
      execSync('git remote remove origin', { stdio: 'ignore' });
    } catch (_) {}

    execSync(`git remote add origin ${authCloneUrl}`);
    execSync('git branch -M main');
    execSync('git push -u origin main');

    // Clean remote to not leave token in .git/config
    execSync(`git remote set-url origin ${cloneUrl}`);
    console.log(`\n🎉 All code successfully pushed to ${cloneUrl}!`);
  } catch (err) {
    console.error('Git push failed:', err.message);
  }
}
