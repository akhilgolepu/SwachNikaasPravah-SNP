"""
Download 4 short royalty-free stock videos for drain CCTV simulation.
Uses Pixabay API (free, no-auth for low-res) and direct CDN links.

Videos are placed in backend/videos/ as feed_1.mp4 through feed_4.mp4
"""
import os
import sys
import urllib.request
import ssl

VIDEOS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "videos")

# Curated list of free, royalty-free video URLs from Pexels (CC0 / Pexels License)
# These are direct CDN links to short clips showing water/drainage/urban scenes
VIDEOS = [
    {
        "name": "feed_1.mp4",
        "desc": "Sewerage / water drain scene",
        "url": "https://videos.pexels.com/video-files/856283/856283-hd_1920_1080_25fps.mp4",
    },
    {
        "name": "feed_2.mp4",
        "desc": "Water flowing into storm drain",
        "url": "https://videos.pexels.com/video-files/9632855/9632855-uhd_2560_1440_24fps.mp4",
    },
    {
        "name": "feed_3.mp4",
        "desc": "Raining on street / water flowing on road",
        "url": "https://videos.pexels.com/video-files/12244080/12244080-uhd_2562_1440_60fps.mp4",
    },
    {
        "name": "feed_4.mp4",
        "desc": "Urban water / drainage scene",
        "url": "https://videos.pexels.com/video-files/3044275/3044275-sd_640_360_24fps.mp4",
    },
]


def download_video(url: str, dest: str, desc: str) -> bool:
    """Download a video file with progress indication."""
    print(f"  Downloading: {desc}")
    print(f"  URL: {url}")
    print(f"  Saving to: {dest}")

    try:
        # Create SSL context that doesn't verify (for corporate proxies)
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })

        with urllib.request.urlopen(req, context=ctx) as response:
            total = int(response.headers.get("Content-Length", 0))
            downloaded = 0
            chunk_size = 65536

            with open(dest, "wb") as f:
                while True:
                    chunk = response.read(chunk_size)
                    if not chunk:
                        break
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total > 0:
                        pct = downloaded * 100 // total
                        bar = "#" * (pct // 5) + "." * (20 - pct // 5)
                        print(f"\r  [{bar}] {pct}% ({downloaded // 1024}KB / {total // 1024}KB)", end="", flush=True)

            size_kb = os.path.getsize(dest) // 1024
            print(f"\n  [OK] Done! ({size_kb} KB)")
            return True

    except Exception as e:
        print(f"\n  [FAIL] Failed: {e}")
        return False


def main():
    os.makedirs(VIDEOS_DIR, exist_ok=True)
    print(f"=" * 50)
    print(f"  SNP Video Feed Downloader")
    print(f"  Downloading 4 short stock clips for drain CCTV")
    print(f"=" * 50)
    print(f"\nTarget directory: {VIDEOS_DIR}\n")

    success = 0
    for i, video in enumerate(VIDEOS, 1):
        dest = os.path.join(VIDEOS_DIR, video["name"])
        if os.path.exists(dest):
            size_kb = os.path.getsize(dest) // 1024
            print(f"[{i}/4] {video['name']} - already exists ({size_kb} KB), skipping")
            success += 1
            continue

        print(f"[{i}/4] {video['name']}")
        if download_video(video["url"], dest, video["desc"]):
            success += 1
        print()

    print(f"{'=' * 50}")
    if success == 4:
        print(f"[OK] All 4 videos downloaded successfully!")
        print(f"  Videos are in: {VIDEOS_DIR}")
        print(f"\n  Start the backend with: python run.py")
    else:
        print(f"[WARN] {success}/4 videos downloaded. Failed ones will use synthetic fallback frames.")
        print(f"  You can re-run this script to retry, or manually place MP4 files in:")
        print(f"  {VIDEOS_DIR}")


if __name__ == "__main__":
    main()
