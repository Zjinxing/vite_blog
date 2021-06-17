#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd docs/.vitepress/dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

cp ../CNAME CNAME

# if you are deploying to https://<USERNAME>.github.io
git push -f https://${GITHUB_TOKEN}@github.com/Zjinxing/Zjinxing.github.io master

cd -