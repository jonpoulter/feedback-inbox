# Base image for Cursor cloud agents (and remote dev sessions).
#
# Cursor manages the workspace checkout, so we do NOT COPY project code here.
# This image only provides the system-level toolchain the repo needs:
#   - Python 3.12 + python3-venv + pip  (so `python3 -m venv .venv` works;
#     the default base image is missing ensurepip/python3-venv, which made
#     `.venv` creation fail on startup)
#   - Node.js 22 + npm                  (for the Vite/React frontend)
#   - git / curl / build-essential      (common dev tooling)
#
# Dependency installation itself stays in `.cursor/environment.json`'s
# `install` command (pip install + npm install), which Cursor re-runs on every
# startup against the freshly checked-out code.
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Python (with venv/ensurepip) + core build/dev tooling.
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        sudo \
        build-essential \
        python3 \
        python3-venv \
        python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Node.js 22 (matches the version the frontend is developed against) + npm.
RUN curl --retry 3 --retry-delay 5 -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Cursor cloud agents run as the non-root `ubuntu` user with passwordless sudo.
RUN id -u ubuntu >/dev/null 2>&1 || useradd -m -s /bin/bash ubuntu \
    && usermod -aG sudo ubuntu \
    && echo "ubuntu ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/ubuntu \
    && chmod 0440 /etc/sudoers.d/ubuntu

USER ubuntu
WORKDIR /home/ubuntu
