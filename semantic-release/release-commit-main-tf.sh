#!/bin/bash

# Find all main.tf files and add them to the staging area
find . -type f -name 'main.tf' | while read file; do
    git add "$file"
done

# Commit the changes if there are any files in the staging area
if [ -n "$(git diff --name-only --cached)" ]; then
    git commit -m "chore(release): update main.tf versions to ${1} [skip ci]"
fi
