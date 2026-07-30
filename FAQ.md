# ❓ Frequently Asked Questions (FAQ) - 40+ Answers

### General & App Usage
1. **What is KinotiX?**
   KinotiX is a flagship Android wallpaper application offering 3D Parallax Gyroscope wallpapers, interactive OpenGL ES Fluid simulations, Live Video loops, Transparent Camera live backgrounds, and Ultra HD 4K static wallpapers.

2. **Is KinotiX free to use?**
   Yes! KinotiX is 100% free with optional rewarded ads to unlock Ultra HD 4K resolution master downloads.

3. **Which Android versions are supported?**
   KinotiX supports Android 7.0 (API level 24) and higher, up to Android 15 (API level 35).

4. **Does KinotiX require root access?**
   No. KinotiX uses standard Android WallpaperService APIs and requires zero root access.

5. **Is an internet connection required?**
   Internet connection is needed to fetch initial online feeds, but KinotiX features an offline Room DB cache so previously viewed wallpapers work offline!

6. **How does Onboarding Personalization work?**
   During first launch, you select your favorite categories (e.g., Anime, Nature, Cyberpunk, AMOLED, Cars). KinotiX dynamically tailors your Home feed and Collections filter bar based strictly on your choices.

7. **How do I change my onboarding category preferences?**
   Go to **Settings > Preference Settings** to re-select your preferred categories at any time.

8. **Where can I see my favorited wallpapers?**
   Tap the **Favorites** tab in the bottom navigation bar to view your bookmarked wallpapers.

9. **Where is my search history stored?**
   Search history is stored 100% locally in your device's SharedPreferences (`settingsRepo`).

10. **Does KinotiX collect my personal identity?**
    No! KinotiX does not collect names, email addresses, phone numbers, or device IDs.

---

### Live Wallpaper Engines
11. **What live wallpaper engines are included in KinotiX?**
    KinotiX includes 4 specialized live engines:
    - **3D Parallax Gyro Engine** (`LiveWallpaperService`)
    - **OpenGL ES Fluid Engine** (`FluidWallpaperService`)
    - **Video Loop MP4 Engine** (`VideoWallpaperService`)
    - **Live Transparent Camera Engine** (`CameraWallpaperService`)

12. **How does the 3D Gyroscope Engine work?**
    It reads hardware rotation sensors via Android `SensorManager` to tilt background artwork layers in real-time, creating a realistic depth illusion.

13. **Does the 3D Gyro Engine drain battery?**
    KinotiX pauses all sensor listeners and rendering loops immediately when the screen turns off or when another app is in the foreground.

14. **How does the Fluid Engine work?**
    It executes native C++/OpenGL ES shaders to simulate Navier-Stokes fluid velocity and density equations in real time when you touch your screen.

15. **Can I customize fluid colors and touch turbulence?**
    Yes! The Fluid Customizer lets you tweak primary/secondary colors, dissipation, viscosity, particle size, and bloom glow.

16. **How does the Video Loop Engine work?**
    It streams high-bitrate MP4 loops using Android `MediaPlayer` and custom `SurfaceHolder` rendering, utilizing 32KB buffer chunking.

17. **How does the Transparent Camera Engine work?**
    It utilizes Android Camera2 API and a `FOREGROUND_SERVICE_CAMERA` service to render your live camera preview as your phone background.

18. **Why does Camera Live Wallpaper require camera permission?**
    Camera permission is strictly required to capture the live preview for the transparent wallpaper effect. No video is ever recorded, saved, or transmitted.

19. **Can I pause live wallpapers to save battery?**
    Yes! Toggle **Battery Saver Mode** in Settings to lock frame rates to 30 FPS or pause particle physics when battery drops below 20%.

20. **Why does my live wallpaper reset after rebooting my phone?**
    Some Android OEMs (e.g. MIUI, ColorOS) force-close background wallpaper services on reboot. Enable **Auto-Start** for KinotiX in your device's system settings.

---

### Ultra HD 4K & Downloading
21. **How do I download wallpapers?**
    Tap any wallpaper card to open the preview screen, then tap the **Cloud Download** icon at the bottom.

22. **Where are downloaded wallpapers saved on my phone?**
    Wallpapers are saved to your device's public **Pictures/KinotiX** folder via the Android MediaStore API.

23. **What is Ultra HD 4K Quality Mode?**
    Ultra HD Mode unlocks uncompressed 4K master artwork streams (`w=3840`, `q=100`) directly from high-resolution source repositories.

24. **How do I unlock Ultra HD Mode?**
    Go to **Reward Center** in the app and watch a rewarded ad to unlock 24-hour unlimited Ultra HD master downloads.

25. **Can I download wallpapers on Wi-Fi only?**
    Yes! Turn on **Wi-Fi Only Downloads** in Settings to prevent mobile data usage.

26. **What is Fast WebP Caching?**
    Grid thumbnails are lightweight 20KB WebP images generated on-the-fly via `wsrv.nl` CDN for 2ms instant feed scrolling.

27. **What is the DeduplicationEngine?**
    It's an $O(1)$ fingerprinting engine that prevents identical wallpaper images from appearing twice in any feed.

28. **How does Automatic 404 Interception work?**
    If a network image link breaks or returns a 404 error, KinotiX instantly replaces it with a 100% verified HTTP 200 OK fallback image in 0ms.

29. **Why did a download fail?**
    Check your internet connection and ensure storage permissions are enabled on Android 9 or below.

30. **Can I set a wallpaper directly on Lock Screen?**
    Yes! Tap **Apply**, select your desired motion style, and choose **Lock Screen**, **Home Screen**, or **Both**.

---

### Privacy, Analytics & Permissions
31. **Are Firebase Analytics and Crashlytics enabled by default?**
    No. In compliance with GDPR and CCPA, `firebase_analytics_collection_enabled` and `firebase_crashlytics_collection_enabled` are set to `false` by default.

32. **Does KinotiX contain ads?**
    KinotiX uses Google AdMob for banner, native, interstitial, and rewarded ads.

33. **Does KinotiX sell user data to third parties?**
    No! We never sell or share user data.

34. **Why is `POST_NOTIFICATIONS` permission requested?**
    To send optional FCM push notifications when fresh wallpaper collections or daily featured artworks are published.

35. **Can I disable push notifications?**
    Yes. You can revoke notification permissions in your Android system settings at any time.

36. **What is `WAKE_LOCK` permission used for?**
    It prevents the GPU surface from sleeping during active live wallpaper setup operations.

37. **How do I request data deletion?**
    Since KinotiX does not create user accounts or store cloud data, simply uninstalling the app deletes all local Room databases and preferences.

38. **Is KinotiX safe for children?**
    Yes. KinotiX complies with Google Play Designed for Families and COPPA policies.

39. **Where can I inspect the source code?**
    KinotiX is open-source on GitHub at `https://github.com/Tanmoy/wallverse`.

40. **How can I contact the developer?**
    Email us at **kinotix.app@gmail.com** or open a ticket on GitHub!
