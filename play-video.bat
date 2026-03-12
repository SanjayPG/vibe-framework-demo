@echo off
REM Quick script to play the latest test video

echo.
echo 🎥 Opening latest test video...
echo.

cd test-results

REM Find the most recent test folder
for /f "delims=" %%i in ('dir /b /ad /o-d') do (
    if exist "%%i\video.webm" (
        echo Found: %%i\video.webm
        start "" "%%i\video.webm"
        goto :done
    )
)

echo No video found!
goto :end

:done
echo.
echo ✅ Video opened!
echo.

:end
pause
