/**
 * @fileoverview Global test teardown configuration
 * @author Senior QA Automation Engineer
 * @version 1.0.0
 */

import { FullConfig } from '@playwright/test';
import { Logger } from '../utils/logger.util';

async function globalTeardown(config: FullConfig) {
  Logger.separator('TEST SUITE TEARDOWN');
  Logger.info('🧹 Cleaning up test resources');
  Logger.info('📊 Generating final reports');
  Logger.info('✅ Test execution completed');
  Logger.separator('TEARDOWN COMPLETED');
}

export default globalTeardown; 