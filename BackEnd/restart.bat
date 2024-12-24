@echo off
echo Restarting backend services...

cd User
start cmd /k "nodemon server.js"
cd ..

cd Music
start cmd /k "nodemon server.js"
cd ..

cd Albums
start cmd /k "nodemon server.js"
cd ..

cd Artist
start cmd /k "nodemon server.js"
cd ..

cd Search
start cmd /k "nodemon server.js"
