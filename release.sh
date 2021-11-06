
npm version $1 $2 --no-git-tag-version
version=$(npm -s run env echo '$npm_package_version')
sed -i '' 's@version.*@version: "'$version'",@' apps/ui/src/environments/environment.prod.ts
echo "" > CHANGELOG.md
changelog $1 -t latest -x=ci
read -p " REVIEW CHANGELOG"
git add CHANGELOG.md
git add apps/ui/src/environments/environment.prod.ts
git add package.json
git commit -m "ci(release): bump up version: $version"

git tag v$version -f
if [[ $1 == pre* ]]; then
    echo "skip latest tag"
else 
    git tag latest -f
fi
git push
git push origin --tags -f