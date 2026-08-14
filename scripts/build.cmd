@echo off
rem 7000 Solutions v3.0 - Windows build wrapper.
rem git-bash exports an MSYS-style PATH that cmd.exe cannot parse, which breaks
rem npm run scripts (cmd cannot find 'next'). This wrapper restores a native
rem Windows PATH so `npm run build` works identically to CI/Vercel.
set "PATH=C:\Program Files\nodejs;C:\Users\kstep\AppData\Roaming\npm;%SystemRoot%\System32;%SystemRoot%;%SystemRoot%\System32\Wbem"
cd /d "%~dp0.."
call npm run build
exit /b %errorlevel%
