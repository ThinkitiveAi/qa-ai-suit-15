/**
 * @fileoverview Enhanced logging utility for test execution
 * @author Senior QA Automation Engineer
 * @version 1.0.0
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SUCCESS = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  category?: string;
  testRunId?: number;
}

class TestLogger {
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private testRunId?: number;

  constructor() {
    this.logLevel = process.env.LOG_LEVEL ? 
      parseInt(process.env.LOG_LEVEL) : LogLevel.INFO;
  }

  setTestRunId(runId: number): void {
    this.testRunId = runId;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private formatMessage(level: LogLevel, message: string, category?: string): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level].toUpperCase();
    const prefix = category ? `[${category}]` : '';
    const runId = this.testRunId ? `[RUN:${this.testRunId}]` : '';
    
    return `${timestamp} ${runId} [${levelStr}] ${prefix} ${message}`;
  }

  private log(level: LogLevel, message: string, category?: string): void {
    if (level < this.logLevel) return;

    const formattedMessage = this.formatMessage(level, message, category);
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      testRunId: this.testRunId
    };

    this.logs.push(logEntry);

    // Console output with colors
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`\x1b[90m${formattedMessage}\x1b[0m`); // Gray
        break;
      case LogLevel.INFO:
        console.log(`\x1b[36m${formattedMessage}\x1b[0m`); // Cyan
        break;
      case LogLevel.WARN:
        console.warn(`\x1b[33m${formattedMessage}\x1b[0m`); // Yellow
        break;
      case LogLevel.ERROR:
        console.error(`\x1b[31m${formattedMessage}\x1b[0m`); // Red
        break;
      case LogLevel.SUCCESS:
        console.log(`\x1b[32m${formattedMessage}\x1b[0m`); // Green
        break;
    }
  }

  debug(message: string, category?: string): void {
    this.log(LogLevel.DEBUG, message, category);
  }

  info(message: string, category?: string): void {
    this.log(LogLevel.INFO, message, category);
  }

  warn(message: string, category?: string): void {
    this.log(LogLevel.WARN, message, category);
  }

  error(message: string, category?: string): void {
    this.log(LogLevel.ERROR, message, category);
  }

  success(message: string, category?: string): void {
    this.log(LogLevel.SUCCESS, message, category);
  }

  // Specialized logging methods
  step(stepNumber: number, description: string): void {
    this.info(`STEP ${stepNumber}: ${description}`, 'TEST_STEP');
  }

  dependency(message: string): void {
    this.info(message, 'DEPENDENCY');
  }

  assertion(message: string, passed: boolean): void {
    if (passed) {
      this.success(`✓ ${message}`, 'ASSERTION');
    } else {
      this.error(`✗ ${message}`, 'ASSERTION');
    }
  }

  performance(action: string, duration: number): void {
    this.info(`${action} completed in ${duration}ms`, 'PERFORMANCE');
  }

  separator(title?: string): void {
    const line = '='.repeat(80);
    if (title) {
      const padding = Math.max(0, (80 - title.length - 2) / 2);
      const paddedTitle = ' '.repeat(Math.floor(padding)) + title + ' '.repeat(Math.ceil(padding));
      this.info(line);
      this.info(paddedTitle);
      this.info(line);
    } else {
      this.info(line);
    }
  }

  startTest(testName: string): void {
    this.separator(`Starting Test: ${testName}`);
  }

  endTest(testName: string, status: 'PASSED' | 'FAILED' | 'SKIPPED'): void {
    const statusIcon = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⏭️';
    this.separator(`Test ${status}: ${testName} ${statusIcon}`);
  }

  // Get logs for reporting
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }

  // Export logs to file (for CI/CD integration)
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const Logger = new TestLogger();

// Legacy compatibility with existing code
export const logger = {
  info: (message: string) => Logger.info(message),
  error: (message: string) => Logger.error(message),
  success: (message: string) => Logger.success(message),
  dependency: (message: string) => Logger.dependency(message)
}; 