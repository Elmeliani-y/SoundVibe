@echo off
echo Stopping existing services...
call stop.bat

echo.
echo Starting backend services...
timeout /t 2 /nobreak > nul

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

cd Playlist
start cmd /k "nodemon server.js"
cd ..

cd Search
start cmd /k "nodemon server.js"
cd ..

echo All services started!
