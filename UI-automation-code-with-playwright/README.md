# Healthcare Management Test Automation Framework

**Professional End-to-End Test Suite for Healthcare Management Workflows**

[![Playwright](https://img.shields.io/badge/Playwright-1.54.1-green.svg)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/Coverage-95%25-brightgreen.svg)](#)

## 👨‍💻 Framework Credits

**Developed by:** Sainath Gaikwad  
**Team:** QA Core  
**Version:** 1.0.0

## 📋 Overview

This comprehensive test automation framework provides end-to-end testing capabilities for healthcare management workflows, including provider creation, patient registration, availability management, and appointment booking. Built with TypeScript and Playwright, following industry best practices and Page Object Model design patterns.

## 🏗️ Architecture

```
├── src/                          # Source code
│   ├── pages/                    # Page Object Model classes
│   ├── data/                     # Test data management
│   ├── utils/                    # Utility functions
│   ├── config/                   # Configuration management
│   ├── types/                    # TypeScript interfaces
│   └── constants/                # Application constants
├── test-suites/                  # Organized test suites
│   ├── healthcare-workflow/      # Main workflow tests
│   ├── regression/               # Regression test suite
│   └── smoke/                    # Smoke test suite
├── reports/                      # Test execution reports
└── docs/                         # Documentation
```

## 🚀 Features

### ✨ Professional Test Framework
- **Page Object Model**: Clean separation of concerns with reusable page objects
- **Type Safety**: Full TypeScript implementation with comprehensive interfaces
- **Data Factory**: Dynamic test data generation with uniqueness guarantees
- **Enhanced Logging**: Professional logging with categories and performance metrics
- **Browser Utilities**: Robust browser interaction with error handling

### 🔧 Test Capabilities
- **Provider Management**: Complete provider creation and configuration
- **Patient Registration**: Patient onboarding and data management
- **Availability Setup**: Provider schedule and availability configuration
- **Appointment Booking**: End-to-end appointment booking workflow
- **Cross-Browser Testing**: Chrome, Firefox, Safari support

### 📊 Reporting & Monitoring
- **Detailed Reports**: Comprehensive HTML reports with screenshots
- **Performance Metrics**: Page load times and interaction performance
- **Error Tracking**: Enhanced error capture with context
- **CI/CD Integration**: Ready for continuous integration pipelines

## 🛠️ Installation

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd healthcare-test-automation

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run tests
npm run test:healthcare
```

## 📝 Usage

### Running Tests

```bash
# Run complete healthcare workflow
npm run test:healthcare

# Run specific test suite
npm run test:regression
npm run test:smoke

# Run with headed browser (for debugging)
npm run test:debug

# Run in specific browser
npm run test:chrome
npm run test:firefox
npm run test:safari
```

### Test Configuration

Configure test environment in `src/config/test.config.ts`:

```typescript
export const ENVIRONMENTS = {
  staging: {
    baseUrl: 'https://stage.example.com',
    credentials: { email: 'test@example.com', password: 'password' }
  },
  production: {
    baseUrl: 'https://prod.example.com',
    credentials: { email: process.env.PROD_EMAIL, password: process.env.PROD_PASSWORD }
  }
};
```

### Environment Variables

```bash
# Test environment (staging, production, development)
TEST_ENV=staging

# Production credentials (for production testing)
PROD_EMAIL=your-prod-email@example.com
PROD_PASSWORD=your-prod-password

# Logging level (0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=SUCCESS)
LOG_LEVEL=1
```

## 🧪 Test Structure

### Healthcare Workflow Tests
Located in `test-suites/healthcare-workflow/`

1. **Provider Creation** - Creates healthcare provider with unique data
2. **Patient Registration** - Registers patient with comprehensive information
3. **Availability Setup** - Configures provider schedule and availability
4. **Appointment Booking** - Complete appointment booking workflow

### Example Test Usage

```typescript
import { test } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { testDataFactory } from '../../src/data/test-data.factory';

test('Provider Creation', async ({ page }) => {
  const testSession = testDataFactory.generateTestSession();
  const loginPage = new LoginPage(page);
  
  await loginPage.login(getCredentials());
  // ... test implementation
});
```

## 🔧 Framework Components

### Page Objects
```typescript
// Base page with common functionality
export abstract class BasePage {
  protected async safeClick(selector: string): Promise<void>
  protected async safeType(selector: string, text: string): Promise<void>
  protected async selectDropdownOption(dropdown: string, option: string): Promise<boolean>
}

// Specific page implementations
export class LoginPage extends BasePage {
  async login(credentials: UserCredentials): Promise<void>
  async logout(): Promise<void>
}
```

### Test Data Factory
```typescript
// Generate unique test data for each run
const testSession = testDataFactory.generateTestSession();

// Access generated data
console.log(testSession.provider.fullName);  // "Dr. John Smith"
console.log(testSession.patient.email);      // "patient.1234567890.123@example.com"
```

### Enhanced Logging
```typescript
import { Logger } from '../utils/logger.util';

Logger.step(1, 'Logging into application');
Logger.success('Login completed successfully');
Logger.performance('Page load', 1250);
Logger.assertion('Provider created', true);
```

## 📊 Reporting

### HTML Reports
```bash
# Generate and view HTML report
npx playwright show-report
```

### Screenshots & Videos
- Automatic screenshot capture on test failure
- Video recording for failed tests (configurable)
- Debug screenshots with timestamps

### Performance Metrics
- Page load time tracking
- Browser responsiveness monitoring
- Network request analysis

## 🔍 Debugging

### Debug Mode
```bash
# Run with browser visible and dev tools
npm run test:debug

# Run specific test with debugging
npx playwright test healthcare-workflow --debug
```

### Troubleshooting
1. **Browser Issues**: Ensure browsers are installed with `npx playwright install`
2. **Timeout Issues**: Increase timeouts in `src/config/test.config.ts`
3. **Element Selection**: Use browser dev tools to verify selectors
4. **Data Conflicts**: Each test run generates unique data automatically

## 📈 Best Practices

### Test Organization
- ✅ Use descriptive test names and step functions
- ✅ Implement proper test dependencies with serial execution
- ✅ Generate unique test data for each run
- ✅ Capture screenshots on failures

### Code Quality
- ✅ TypeScript for type safety
- ✅ Page Object Model for maintainability
- ✅ Centralized configuration management
- ✅ Comprehensive error handling

### CI/CD Integration
- ✅ Parallel test execution
- ✅ Retry mechanisms for flaky tests
- ✅ HTML report generation
- ✅ Environment-specific configuration

## 🤝 Contributing

### Development Guidelines
1. Follow existing code patterns and TypeScript conventions
2. Add comprehensive JSDoc comments for new functions
3. Update tests when modifying page objects
4. Ensure all new features include proper error handling

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Run full test suite: `npm run test:all`
4. Update documentation if needed
5. Submit pull request with detailed description

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Page Object Model Best Practices](https://playwright.dev/docs/pom)
- [CI/CD Integration Guide](https://playwright.dev/docs/ci)

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the repository

---

## 🎯 Built with Excellence

**Framework Architect:** Sainath Gaikwad  
**QA Team:** QA Core  
**Technology Stack:** TypeScript + Playwright  
**Design Pattern:** Page Object Model (POM)

*© 2025 QA Core Team - Professional Test Automation Solutions*
- Contact the QA team: qa-team@company.com
- Slack: #test-automation channel

---

**Built with ❤️ by the QA Automation Team** 