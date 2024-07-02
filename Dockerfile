# Use a base image with OpenJDK and Android SDK
FROM openjdk:11

# Install dependencies
RUN apt-get update && apt-get install -y \
    unzip \
    wget \
    git \
    gradle

# Download and install Android SDK
RUN wget https://dl.google.com/android/repository/commandlinetools-linux-8512546_latest.zip -O sdk-tools.zip \
    && mkdir -p /usr/local/android-sdk/cmdline-tools \
    && unzip sdk-tools.zip -d /usr/local/android-sdk/cmdline-tools \
    && rm sdk-tools.zip

# Set environment variables
ENV ANDROID_HOME /usr/local/android-sdk
ENV PATH $ANDROID_HOME/cmdline-tools/tools/bin:$ANDROID_HOME/platform-tools:$PATH

# Accept licenses
RUN yes | sdkmanager --licenses

# Install necessary SDK packages
RUN sdkmanager "platform-tools" "platforms;android-30" "build-tools;30.0.3"

# Set the working directory
WORKDIR /app

# Expose the source code directory as a volume
VOLUME ["/app", "/src"]

# Default command
CMD ["bash"]
