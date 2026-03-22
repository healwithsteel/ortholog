#!/bin/bash
# Copy dist to a temp location
TMPDIR=$(mktemp -d)
cp -r dist/* "$TMPDIR/"

# Copy service worker and manifest to dist root
cp public/sw.js "$TMPDIR/" 2>/dev/null
cp public/manifest.json "$TMPDIR/" 2>/dev/null
cp public/icon-*.png "$TMPDIR/" 2>/dev/null
cp public/rocf-logo.png "$TMPDIR/" 2>/dev/null

# Create 404.html for SPA routing
cp "$TMPDIR/index.html" "$TMPDIR/404.html"

# Create CNAME if we have a custom domain
# echo "ortholog.app" > "$TMPDIR/CNAME"

# Create .nojekyll to bypass Jekyll processing
touch "$TMPDIR/.nojekyll"

# Deploy to gh-pages branch
cd "$TMPDIR"
git init
git checkout -b gh-pages
git add -A
git config user.email "ksiebuhr@reconorthofl.com"
git config user.name "Karl Siebuhr"
git commit -m "Deploy OrthoLog to GitHub Pages"
git remote add origin https://healwithsteel:Pennybob12345@github.com/healwithsteel/ortholog.git
git push -f origin gh-pages

echo "Deployed to: https://healwithsteel.github.io/ortholog/"
rm -rf "$TMPDIR"
