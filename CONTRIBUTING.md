# Contributing to Learning English

Thank you for your interest in contributing to the Learning English project! We welcome contributions from everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project and everyone participating in it is expected to maintain a respectful and inclusive environment. Please be considerate and respectful in all interactions.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (browser, OS, Node.js version)

### Suggesting Features

We welcome feature suggestions! Please create an issue with:
- A clear description of the feature
- Use cases and benefits
- Any implementation ideas you might have

### Code Contributions

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test your changes thoroughly
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## Development Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/learning-english.git
cd learning-english
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Make your changes and test them locally

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Avoid using `any` type when possible
- Define proper interfaces and types
- Use meaningful variable and function names

### React

- Use functional components with hooks
- Keep components small and focused
- Use meaningful component names
- Follow React best practices

### Code Style

- Run `npm run lint` before committing
- Use `npm run lint:fix` to automatically fix style issues
- Follow the existing code formatting
- Write self-documenting code

### Example of Good Code

```typescript
interface WordData {
  word: string;
  translation: string;
  definition?: string;
}

const addNewWord = async (wordData: WordData): Promise<void> => {
  if (!wordData.word) {
    throw new Error("Word is required");
  }
  
  await saveToStorage(wordData);
};
```

### Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Keep the first line under 50 characters
- Be descriptive but concise
- Reference issues when applicable

Good commit messages:
```
Add pronunciation feature for words
Fix translation API error handling
Update README with setup instructions
```

## Pull Request Process

1. **Update Documentation**: If you add features, update the README
2. **Test Your Changes**: Ensure all functionality works as expected
3. **Lint Your Code**: Run `npm run lint` and fix any issues
4. **Clear Description**: Explain what changes you made and why
5. **Link Issues**: Reference any related issues in your PR description
6. **Be Responsive**: Respond to feedback and make requested changes

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
How did you test your changes?

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Fixes #(issue number)
```

## Project Structure Guidelines

When adding new files, follow this structure:

```
src/
├── app/              # Next.js pages
├── components/       # Reusable components
│   └── ui/          # UI components (buttons, inputs, etc.)
├── hooks/           # Custom React hooks
└── lib/             # Utility functions and helpers
```

### Component Guidelines

- Place page components in `src/app/[page-name]/page.tsx`
- Place reusable components in `src/components/`
- Place UI primitives in `src/components/ui/`
- Place custom hooks in `src/hooks/`

## Testing Guidelines

Currently, the project does not have a formal testing framework. When adding tests:
- Focus on critical functionality
- Test edge cases
- Test API integrations with mocks
- Test component rendering

## API Integration Guidelines

When working with external APIs:
- Always handle errors gracefully
- Provide fallback mechanisms
- Don't expose API keys in the code
- Document API usage and limitations

## Need Help?

If you have questions or need help:
- Open an issue with the "question" label
- Review existing issues and discussions
- Check the README for basic information

## Recognition

Contributors will be recognized in the project documentation. Thank you for making Learning English better!
