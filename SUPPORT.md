# 💬 KinotiX Support & Help Center

Welcome to the KinotiX Support Center! If you are experiencing issues with live wallpapers, permissions, or downloads, please check the solutions below.

## 🛠️ Common Support Topics

### 1. Live Wallpaper Stops Moving or Freezes
- **Cause**: Android OS Battery Saver or OEM background task killers (e.g. Xiaomi MIUI, Samsung One UI, Huawei EMUI) killing wallpaper services.
- **Solution**: Go to device **Settings > Apps > KinotiX > Battery > Unrestricted / Do Not Optimize**.

### 2. Live Camera Transparent Wallpaper Black Screen
- **Cause**: Camera permission not granted or `FOREGROUND_SERVICE_CAMERA` blocked.
- **Solution**: Open KinotiX > Settings > Grant Camera Permission when prompted. Ensure no other app is actively locking the camera hardware.

### 3. Downloaded Wallpapers Not Showing in Gallery
- **Cause**: MediaStore scanner pending status.
- **Solution**: KinotiX saves wallpapers to `Pictures/KinotiX` via standard Android MediaStore API. Re-open Google Photos or your Gallery app.

## 📬 Contact Support
- **GitHub Issues**: [Open an Issue](https://github.com/Tanmoy/wallverse/issues)
- **Email Support**: **kinotix.app@gmail.com**
- **Documentation**: [Official Web Docs](https://tanmoy.github.io/wallverse/)
