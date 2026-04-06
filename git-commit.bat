@echo off
REM Stage all changes
git add .

REM Ask for commit message
set /p msg=Enter commit message: 

REM Check if message is empty
if "%msg%"=="" (
    echo Commit aborted: no message provided.
    exit /b 1
)

REM Commit and push
git commit -m "%msg%"
git push origin main
echo Changes pushed.