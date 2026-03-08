# Project Structure: Cheque.io

This document provides an overview of the file structure and the purpose of each component in the **Cheque.io** project. This project is a millimeter-accurate cheque printing system designed to adhere to the CTS-2010 standard.

---

## 📂 Root Directory

```text
Cheque Printer/
├── .gitignore               # Patterns for files to exclude from Git
├── PROJECT_STRUCTURE.md     # (This file) Overview of the project layout
├── README.md                # Main documentation and user guide
├── app.js                   # Core application logic and event handling
├── chequelogo.jpg           # Logo asset for the cheque layout
├── index.css                # Precise styling and @media print rules
├── index.html               # Main structure of the web interface
├── package.json             # Project dependencies and script metadata
├── package-lock.json        # Exact versions of installed dependencies
├── playwright.config.js     # Configuration for Playwright E2E tests
├── tests/                   # Test suite directory
│   └── app.spec.js          # Playwright test specifications
└── test-results/            # Generated reports from test runs
```

---

## 🛠️ Core Components

### 📄 [index.html](file:///c:/Users/kanis/Downloads/Project%20Data/Cheque%20Printer/index.html)
The entry point of the application. It defines the UI for user input (Payee, Date, Amount, etc.) and the visual representation of the cheque that will be printed.

### 🎨 [index.css](file:///c:/Users/kanis/Downloads/Project%20Data/Cheque%20Printer/index.css)
Contains all styling. Key features include:
- **Millimeter Precision**: Uses `mm` units to ensure the printed cheque matches standard sizes.
- **Print Optimization**: Uses `@media print` to hide UI controls and show only the cheque during printing.
- **Micro-Animations**: Provides a premium feel to the interface.

### ⚙️ [app.js](file:///c:/Users/kanis/Downloads/Project%20Data/Cheque%20Printer/app.js)
Dynamic logic for the application, including:
- **Currency to Words**: Automatically converts numeric amounts into written format (e.g., "Five Thousand Only").
- **Date Formatting**: Handles and formats the date into the individual DDMMYYYY boxes.
- **Calibration**: Logic for adjusting print offsets (X/Y) to account for different printer feeds.
- **Print Triggers**: Window print management.

### 🧪 [tests/](file:///c:/Users/kanis/Downloads/Project%20Data/Cheque%20Printer/tests/)
Automated testing directory. 
- **[app.spec.js](file:///c:/Users/kanis/Downloads/Project%20Data/Cheque%20Printer/tests/app.spec.js)**: Uses Playwright to verify that the app loads correctly, forms handle input as expected, and the layout remains accurate across updates.

---

## 📦 Dependency Management

The project uses `npm` for managing tools and dependencies.
- **package.json**: Defines scripts like `npm test` and lists dev-dependencies like `playwright`.
- **node_modules/**: Local installation of third-party libraries.

---

## 🚀 Getting Started

1. **Install Dependencies**: `npm install`
2. **Launch App**: Open `index.html` in a modern browser (Chrome/Edge recommended for printing).
3. **Run Tests**: `npx playwright test`

For detailed usage instructions, please refer to the [README.md](file:///c:/Users/kanis/Downloads/Project%20Data/Cheque%20Printer/README.md).
