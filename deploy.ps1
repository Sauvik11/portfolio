param(
  [string]$Message = "Update portfolio"
)

$ErrorActionPreference = "Stop"

Write-Host "Checking repository status..."
git status --short

git add index.html styles.css script.js README.md

if (git diff --cached --quiet) {
  Write-Host "No portfolio changes to deploy."
  exit 0
}

git commit -m $Message
git push origin main

Write-Host "Pushed to GitHub. Cloudflare Pages should deploy automatically."
