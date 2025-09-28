@echo off
echo 🔧 Installing AI Tools Manager (ATM)...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first:
    echo    https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available

REM Install ATM globally
echo 📦 Installing ATM globally...

npm install -g ai-tools-manager
if %errorlevel% equ 0 (
    echo ✅ ATM installed successfully!
    echo.
    echo 🎉 You can now use 'atm' command from anywhere!
    echo    Run 'atm' to start managing your AI tools.
) else (
    echo ❌ Failed to install ATM from npm registry
    echo Please check your internet connection and try again.
)

echo.
echo 🚀 Installation completed!
echo    Run 'atm --help' to get started.
pause