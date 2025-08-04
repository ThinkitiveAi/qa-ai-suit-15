# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
npx playwright install
```

### 2. Run Your First Test
```bash
# Complete healthcare workflow
npm run test:healthcare

# View results
npm run report:show
```

### 3. Debug a Test
```bash
# Run with browser visible
npm run test:debug

# Record new test actions
npm run dev:record
```

## 📁 Project Structure

```
src/
├── pages/          # Page Object Model classes
│   ├── base.page.ts          # Base page with common functions
│   └── login.page.ts         # Login page object
├── data/           # Test data management
│   └── test-data.factory.ts  # Generates unique test data
├── utils/          # Utility functions
│   ├── logger.util.ts        # Enhanced logging
│   └── browser.util.ts       # Browser utilities
├── config/         # Configuration
│   └── test.config.ts        # Environment settings
├── types/          # TypeScript interfaces
└── constants/      # App constants and selectors

test-suites/
├── healthcare-workflow/       # Main e2e tests
├── regression/               # Regression tests
└── smoke/                   # Smoke tests
```

## 🧪 Writing Your First Test

```typescript
import { test } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { testDataFactory } from '../../src/data/test-data.factory';

test('My First Test', async ({ page }) => {
  // Generate unique test data
  const testSession = testDataFactory.generateTestSession();
  
  // Use page objects
  const loginPage = new LoginPage(page);
  await loginPage.login(getCredentials());
  
  // Access generated data
  console.log(testSession.provider.fullName); // "Dr. John Smith"
  console.log(testSession.patient.email);     // "patient.123456789@example.com"
});
```

## 📊 Common Commands

```bash
# Test execution
npm run test:healthcare        # Run healthcare workflow
npm run test:chrome           # Run in Chrome only
npm run test:parallel         # Run with 4 workers
npm run test:serial           # Run tests sequentially

# Development
npm run test:debug            # Debug mode (headed browser)
npm run dev:record            # Record new actions
npm run type:check            # TypeScript validation

# Reports
npm run report:show           # View HTML report
npm run report:open           # Open report server
npm run clean                 # Clean old reports

# Maintenance
npm run setup                 # Full setup from scratch
npm run lint                  # Code linting
npm run lint:fix              # Auto-fix linting issues
```

## 🔧 Configuration

### Environment Variables
```bash
# .env file
TEST_ENV=staging              # staging, production, development
LOG_LEVEL=1                   # 0=DEBUG, 1=INFO, 2=WARN, 3=ERROR
HEADED=true                   # Run with visible browser
```

### Test Timeouts
Edit `src/config/test.config.ts`:
```typescript
export const TEST_CONFIG = {
  timeouts: {
    test: 300000,             # 5 minutes per test
    navigation: 90000,        # 90 seconds for page loads
    element: 60000,           # 60 seconds for element interactions
  }
};
```

## 🐛 Troubleshooting

### Common Issues

**Tests timeout frequently**
```bash
# Increase timeouts in src/config/test.config.ts
# Run with headed browser to see what's happening
npm run test:debug
```

**Elements not found**
```bash
# Use browser dev tools to verify selectors
# Check if page loaded completely
# Add explicit waits before interactions
```

**Data conflicts between test runs**
```bash
# Framework generates unique data automatically
# Check testDataFactory.generateTestSession()
# Verify test run ID is different each time
```

**Browser crashes**
```bash
# Update browsers: npx playwright install
# Check available memory
# Run with single worker: npm run test:serial
```

### Debug Tools

```bash
# Trace viewer for failed tests
npx playwright show-trace test-results/trace.zip

# Test generator for new tests
npx playwright codegen https://your-app.com

# Playwright inspector
npx playwright test --debug
```

## 📋 Best Practices

### ✅ Do This
- Use Page Object Model classes
- Generate unique test data for each run
- Add descriptive test names and steps
- Use proper TypeScript types
- Handle errors gracefully
- Take screenshots on failures

### ❌ Avoid This
- Hard-coded test data
- Direct page interactions in tests
- Long test names without steps
- Ignoring TypeScript errors
- Tests that depend on specific data existing
- Tests without proper cleanup

## 🔗 Need Help?

- 📚 **Full Documentation**: [README.md](../README.md)
- 🐛 **Report Issues**: Create GitHub issue
- 💬 **Ask Questions**: Slack #test-automation
- 📧 **Email**: qa-team@company.com

---

**Happy Testing! 🎉** 