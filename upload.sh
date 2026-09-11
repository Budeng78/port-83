#!/bin/bash
# Script upload Laravel ke GitHub (versi aman)

# Pastikan remote sudah benar
git remote set-url origin https://github.com/Budeng78/port-83.git

# Tambahkan file ke staging
git add .

# Commit perubahan
git commit -m "Upload Laravel project (safe version with .gitignore)"

# Pastikan branch utama bernama main
git branch -M main

# Push ke GitHub
git push -u origin main

echo "✅ Laravel project berhasil diunggah ke GitHub (versi aman)."
echo "Pastikan file sensitif (.env, vendor/, node_modules/) sudah terabaikan oleh .gitignore."
