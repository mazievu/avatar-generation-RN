<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>
 
# Generations - A Life Sim (React Native)
 
This is a multi-generational life simulation game built with React Native and Expo.
 
## Running the Project Locally
 
**Prerequisites:**
*   Node.js (LTS version recommended)
*   An iOS or Android device with the Expo Go app installed, or a local simulator/emulator.
 
1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start the development server:**
    ```bash
    npm start
    ```
    This will open the Expo Dev Tools in your browser. You can then scan the QR code with the Expo Go app on your phone to run the game.

## Known Issues and Decisions

**NPM Deprecation Warnings (inflight, rimraf, glob):**
During dependency installation, you may observe `npm warn deprecated` messages for packages like `inflight@1.0.6`, `rimraf@3.0.2`, and `glob@7.2.3`. These are transitive dependencies (dependencies of other packages) primarily brought in by `expo` and some `react-native` sub-dependencies.

**Decision:**
After thorough investigation, including running `npm audit` (which reported 0 vulnerabilities), it has been determined that these warnings do not indicate immediate security risks or critical bugs causing application breakage. The current versions of `expo` and `react-native` are stable, and directly overriding these transitive dependencies carries a significant risk of introducing new, hard-to-debug issues.

Therefore, the decision is to:
1.  **Accept the current state:** These warnings will be present during `npm install` but are deemed safe to ignore for now.
2.  **Monitor for official updates:** We will actively monitor the Expo Blog and changelogs for new Expo SDK releases. A future major Expo SDK update is the most appropriate and stable path to resolve these underlying dependency issues, as it will come with officially tested and compatible dependency trees.

This approach prioritizes application stability and leverages the quality assurance processes of the Expo maintainers.
