# Cargo-Core Driver App 🚚

This is the native Android driver app repository for the **Cargo-Core** logistics platform, a Software Engineering Project (2026) for IIT Madras. The app is designed to digitize driver workflows for small logistics businesses, with direct integrations for device hardware features like the camera and GPS.

## 🚀 Tech Stack

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API with `<script setup>`)
- **Native Bridge:** [Capacitor 6](https://capacitorjs.com/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Routing:** [Vue Router](https://router.vuejs.org/)
- **Native Integrations:** `@capacitor/camera`, `@capacitor/geolocation`, ML-Kit Barcode & OCR

## ✅ Production Status

The driver app is production-ready and connected to backend APIs.

- Driver authentication and workflow APIs are integrated with backend services.
- Tracking, attendance, and delivery actions are expected to use live backend data.
- Use valid backend-issued credentials while testing on emulator/device.

## 🛠️ Project Setup

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).
For compiling and debugging the native APK, you **must** also have:
- [Android Studio](https://developer.android.com/studio) (Ladybug/Koala or later recommended)
- **Java Development Kit (JDK):** Version 21 (Required for Gradle build compatibility)

### Installation
```bash
# Navigate to the driver-app directory
cd driver-app

# Install dependencies
npm install

# If you encounter peer dependency errors, use:
# npm install --legacy-peer-deps
```

### Web Development (UI Testing)
Start the local development server with Hot Module Replacement (HMR) for browser preview:
```bash
npm run dev
```
*(Note: Native features like CameraX and Geolocation require an Android emulator or a physical device to function fully).*

## 📱 Native Android Setup & Compilation

To build the APK and access native hardware modules, you must bridge the Vue web assets to the Android native wrapper.

### 1. Build & Sync
Build the Vite production assets and sync them to the Android project folder (`android/`):
```bash
npm run build
npx cap sync android
```

### 2. Android Manifest Configuration
The app requires specific hardware permissions declared in `android/app/src/main/AndroidManifest.xml`:
- `CAMERA`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` (for Photo/QR/OCR scanning)
- `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` (for Route progress & Geofencing)
- `POST_NOTIFICATIONS` (for Local and Push alerts)

### 3. Running on Emulator / Physical Device
To compile and launch the app directly onto a connected device via the command line:
```bash
npx cap run android
```

### 4. Advanced Native Debugging
To open the native Java/Kotlin Android project inside Android Studio for deep debugging, SDK management, or Gradle configuration:
```bash
npx cap open android
```

## 📁 Project Structure

```text
driver-app/
├── android/            # Capacitor native Android shell (Java/Kotlin/Gradle)
├── src/
│   ├── assets/         # Static images, icons, and global CSS
│   ├── components/     # Reusable Vue components & Native Wrappers (Camera)
│   ├── composables/    # Modular logic (Permissions, Camera, Geolocation APIs)
│   ├── layouts/        # Root Layouts (MainLayout, CameraLayout)
│   ├── router/         # Vue Router configurations
│   ├── services/       # External service integrations (e.g. Firebase, APIs)
│   ├── stores/         # Pinia global state management
│   ├── utils/          # Helper functions and formatting tools
│   └── views/          # Full-page View components
└── capacitor.config.js # Native bridge configuration
```

## 🔌 Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Android Studio](https://developer.android.com/studio) (for native debugging and compilation)

## 🤝 Contribution

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Commit your changes: `git commit -m 'Add some feature'`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Open a Pull Request.

---
*Developed by QuadCore-Devs(Team-003) @ IIT Madras (2026)*
