FROM debian:trixie-slim

ARG CHROMIUM_DRIVER_VERSION=146.0.7680.80-1~deb13u1

ENV ELECTRON_DISABLE_SANDBOX=1
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

RUN apt-get update && apt-get install -y \
    xvfb \
    chromium-driver=${CHROMIUM_DRIVER_VERSION} \
    libgtk-3-0 \
    libnss3 \
    libgbm1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libpango-1.0-0 \
    libcairo2 \
    xdotool \
    dbus-x11 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
