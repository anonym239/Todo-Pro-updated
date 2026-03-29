name: Build TWA APK

# Wird ausgeführt bei jedem Push auf main ODER manuell
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-apk:
    runs-on: ubuntu-latest
    
    steps:
      # 1. Repo auschecken
      - name: Checkout Repository
        uses: actions/checkout@v4

      # 2. Java 17 installieren (Android braucht das)
      - name: Set up Java 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      # 3. Node.js installieren
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      # 4. Android SDK installieren
      - name: Set up Android SDK
        uses: android-actions/setup-android@v3

      # 5. Bubblewrap (TWA Builder) installieren
      - name: Install Bubblewrap CLI
        run: npm install -g @bubblewrap/cli@latest

      # 6. Bubblewrap initialisieren mit deiner Netlify-URL
      - name: Initialize TWA Project
        run: |
          mkdir -p twa-project
          cd twa-project
          bubblewrap init \
            --manifest https://todo-list43.netlify.app/manifest.json \
            --directory . \
            --skip-pwa-validation
        env:
          BUBBLEWRAP_SKIP_UPDATE_CHECK: 'true'

      # 7. APK bauen
      - name: Build APK
        run: |
          cd twa-project
          bubblewrap build --skipSigning

      # 8. APK als Artifact hochladen (kannst du dann herunterladen)
      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: TodoPro-APK
          path: |
            twa-project/app/build/outputs/apk/release/*.apk
            twa-project/app/build/outputs/apk/debug/*.apk
          if-no-files-found: warn
          retention-days: 30
