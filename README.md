# WebViewApp

WebViewApp is a simple Android application that utilizes WebView to display HTML content. This project is designed to demonstrate the integration of web technologies with native Android components, specifically using AngularJS and jQuery UI to create a dynamic user interface.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Building the Project](#building-the-project)
- [Running the Application](#running-the-application)
- [Directory Structure](#directory-structure)
- [License](#license)

## Features

- Displays a simple HTML page within an Android WebView.
- Uses AngularJS for dynamic content rendering.
- Implements jQuery UI for interactive components like dialogs.
- Fully customizable styling using CSS.

## Getting Started

To get started with WebViewApp, you will need to have the following installed:

- [Java JDK](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html) (version 11 or higher)
- [Android Studio](https://developer.android.com/studio) (for building and running the Android application)
- [Node.js](https://nodejs.org/) (for managing JavaScript dependencies)
- [Yarn](https://yarnpkg.com/) (optional, for package management)

### Cloning the Repository

```bash
git clone https://github.com/yourusername/webviewapp.git
cd webviewapp
```

### Installing Dependencies

Navigate to the `src` directory and run:

```bash
yarn install
```

## Building the Project

To build the Android application, you can use the Gradle wrapper provided in the project. Run the following command in the root directory:

```bash
./gradlew build
```

This will compile the Android project and generate an APK.

## Running the Application

### Using Android Studio

1. Open Android Studio and import the project as an existing project.
2. Configure your Android Virtual Device (AVD) or connect a physical device.
3. Click on the "Run" button to deploy the application.

### Using Docker

You can also use Docker to build and run the application. Ensure Docker is installed and running, then execute:

```bash
./build.Dockerfile.sh --push
```

This will build the Docker image and push it to the specified registry.

## Directory Structure

```plaintext
.
├── android                  # Android project files
│   ├── build.gradle         # Gradle build script
│   ├── src                  # Source files for the Android app
│   └── ...
├── src                      # Frontend source files
│   ├── css                  # CSS files
│   ├── js                   # JavaScript files
│   ├── index.html           # Main HTML file
│   └── ...
├── Dockerfile               # Dockerfile for building the Android environment
├── package.json             # Node.js package configuration
└── ...
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

Feel free to contribute to this project by submitting issues or pull requests. Happy coding!
