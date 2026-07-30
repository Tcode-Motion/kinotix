# 🛠️ Contributing to KinotiX

First off, thank you for considering contributing to KinotiX! It's people like you that make KinotiX such an amazing wallpaper platform for Android.

## 🚀 How Can I Contribute?

### 1. Reporting Bugs
Before creating bug reports, please check the existing issues. When creating a bug report, include:
- Use a clear and descriptive title.
- Describe the exact steps to reproduce the issue.
- Provide your device model, Android version, and KinotiX build version.
- Attach logcat output if applicable.

### 2. Suggesting Enhancements
Enhancement suggestions are tracked as GitHub issues.
- Use a clear title and description.
- Explain why this enhancement would be useful to KinotiX users.

### 3. Pull Requests
1. Fork the repository (`https://github.com/Tanmoy/wallverse`).
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Ensure your Kotlin code conforms to the Android Kotlin Style Guide.
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
5. Push to the branch (`git push origin feature/AmazingFeature`).
6. Open a Pull Request.

## 💻 Build Prerequisites
- **Android Studio**: Ladybug / Jellyfish (2024.1+)
- **JDK**: Java 17+
- **Gradle**: 8.7+
- **Android SDK**: API 35 (Android 15) compile SDK, min SDK API 24 (Android 7.0)

```bash
# Clone repository
git clone https://github.com/Tanmoy/wallverse.git
cd wallverse

# Build Debug APK
./gradlew assembleDebug

# Build Release APK and AAB Bundle
./gradlew assembleRelease bundleRelease
```
