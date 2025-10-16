# Contributing to Smart Sprint

Thank you for your interest in contributing to Smart Sprint! This document provides comprehensive guidelines and information for contributors.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Contributing Process](#contributing-process)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Issue Reporting](#issue-reporting)
9. [Community](#community)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **MongoDB** (v6.0 or higher)
- **Git** (latest version)
- A **GitHub account**

### First-Time Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-sprint.git
   cd smart-sprint
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/mrudul-UmassD/smart_sprint_adduser.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   
   # For frontend
   cd frontend
   npm install
   ```
3. Set up environment variables (refer to the README for details).
4. Run the development server:
   ```
   # For backend
   cd backend
   npm run dev
   
   # For frontend (in a separate terminal)
   cd frontend
   npm start
   ```

### Coding Guidelines

- Follow the existing code style.
- Write meaningful commit messages.
- Comment your code where necessary.
- Add tests for new features.
- Update documentation for any changes.

### Testing

- Run tests before submitting a pull request:
  ```
  # For backend
  cd backend
  npm test
  
  # For frontend
  cd frontend
  npm test
  ```

## Branching Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: For new features
- `bugfix/*`: For bug fixes
- `hotfix/*`: For urgent production fixes

Thank you for your contributions!