# TikTok TTS
TikTok TTS may sometimes fail if your account is using the wrong API.

To fix this, use dev tools on the TikTok website, and upload a video. Look for anything that looks something like "https://api16-normal-useast5.us.tiktokv.com/media/api/text/speech/invoke", and set the TIKTOK_API_URL environment variable to your new URL.