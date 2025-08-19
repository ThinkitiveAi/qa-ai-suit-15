/**
 * @fileoverview Global test setup configuration
 * @author Senior QA Automation Engineer
 * @version 1.0.0
 */

import { FullConfig } from '@playwright/test';
import { Logger } from '../utils/logger.util';

async function globalSetup(config: FullConfig) {
  Logger.separator('INITIALIZING TEST SUITE');
  Logger.info('🚀 Healthcare Test Automation Framework');
  Logger.info(`📊 Projects: ${config.projects.map(p => p.name).join(', ')}`);
  Logger.info(`⚙️ Workers: ${config.workers || 'auto'}`);
  Logger.info(`🌐 Environment: ${process.env.TEST_ENV || 'staging'}`);
  Logger.separator('SETUP COMPLETED');
}

export default globalSetup; 