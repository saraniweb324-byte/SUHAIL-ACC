@echo off
set NODE_ENV=development
start /b npx vite --port 5174
npx wait-on http://localhost:5174
npx electron .
