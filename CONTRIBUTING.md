# Contributing to Smart Sprint

Thank you for considering contributing to Smart Sprint! This document outlines the process for contributing to this project.

## Code of Conduct

In the interest of fostering an open and welcoming environment, we expect all participants to adhere to respectful behavior both online and in real life.

## How to Contribute

### Reporting Bugs

Bugs are tracked as [GitHub issues](https://github.com/mrudul-UmassD/smart_sprint_adduser/issues). When you are creating a bug report, please include as many details as possible:

1. Use a clear and descriptive title.
2. Describe the exact steps to reproduce the problem.
3. Provide specific examples to demonstrate the steps.
4. Describe the behavior you observed after following the steps.
5. Explain which behavior you expected to see instead and why.
6. Include screenshots or animated GIFs if possible.
7. Include any relevant details about your environment.

### Suggesting Enhancements

Enhancement suggestions are also tracked as [GitHub issues](https://github.com/mrudul-UmassD/smart_sprint_adduser/issues).

1. Use a clear and descriptive title.
2. Provide a detailed description of the suggested enhancement.
3. Explain why this enhancement would be useful.
4. Include any relevant examples or mockups.

### Pull Requests

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes.
4. Commit your changes with meaningful commit messages.
5. Push to your branch: `git push origin feature/your-feature-name`.
6. Open a pull request.

## Development Process

### Setting Up Your Environment

1. Clone the repository.
2. Install dependencies:
   ```
   # For backend
   cd backend
   npm install
   
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