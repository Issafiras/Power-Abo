/**
 * Unit tests for Logger utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import logger, { LOG_LEVELS } from './logger.js';

describe('Logger', () => {
  let consoleSpies;

  beforeEach(() => {
    // Mock console methods
    consoleSpies = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      group: vi.spyOn(console, 'group').mockImplementation(() => {}),
      groupCollapsed: vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {}),
      groupEnd: vi.spyOn(console, 'groupEnd').mockImplementation(() => {}),
      table: vi.spyOn(console, 'table').mockImplementation(() => {}),
      time: vi.spyOn(console, 'time').mockImplementation(() => {}),
      timeEnd: vi.spyOn(console, 'timeEnd').mockImplementation(() => {}),
    };

    // Reset logger til standard state
    logger.setEnabled(true);
    logger.setLevel(LOG_LEVELS.DEBUG);
    logger.setShowTimestamp(true);
    logger.setShowIcons(true);
    logger.setUseColors(true);
    logger.clearCategories();
  });

  afterEach(() => {
    // Restore console methods
    Object.values(consoleSpies).forEach(spy => spy.mockRestore());
  });

  describe('Basic logging', () => {
    it('should log debug messages', () => {
      logger.debug('Test', 'Debug message');
      expect(consoleSpies.debug).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('Test', 'Info message');
      expect(consoleSpies.log).toHaveBeenCalled();
    });

    it('should log warning messages', () => {
      logger.warn('Test', 'Warning message');
      expect(consoleSpies.warn).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('Test', 'Error message');
      expect(consoleSpies.error).toHaveBeenCalled();
    });
  });

  describe('Log levels', () => {
    it('should respect log level filtering', () => {
      logger.setLevel(LOG_LEVELS.WARN);

      logger.debug('Test', 'Debug');
      logger.info('Test', 'Info');
      logger.warn('Test', 'Warn');
      logger.error('Test', 'Error');

      expect(consoleSpies.debug).not.toHaveBeenCalled();
      expect(consoleSpies.log).not.toHaveBeenCalled();
      expect(consoleSpies.warn).toHaveBeenCalled();
      expect(consoleSpies.error).toHaveBeenCalled();
    });

    it('should disable all logging with NONE level', () => {
      logger.setLevel(LOG_LEVELS.NONE);

      logger.debug('Test', 'Debug');
      logger.info('Test', 'Info');
      logger.warn('Test', 'Warn');
      logger.error('Test', 'Error');

      expect(consoleSpies.debug).not.toHaveBeenCalled();
      expect(consoleSpies.log).not.toHaveBeenCalled();
      expect(consoleSpies.warn).not.toHaveBeenCalled();
      expect(consoleSpies.error).not.toHaveBeenCalled();
    });
  });

  describe('Enable/Disable', () => {
    it('should not log when disabled', () => {
      logger.setEnabled(false);

      logger.debug('Test', 'Debug');
      logger.info('Test', 'Info');
      logger.warn('Test', 'Warn');
      logger.error('Test', 'Error');

      expect(consoleSpies.debug).not.toHaveBeenCalled();
      expect(consoleSpies.log).not.toHaveBeenCalled();
      expect(consoleSpies.warn).not.toHaveBeenCalled();
      expect(consoleSpies.error).not.toHaveBeenCalled();
    });

    it('should log when re-enabled', () => {
      logger.setEnabled(false);
      logger.info('Test', 'Should not log');

      logger.setEnabled(true);
      logger.info('Test', 'Should log');

      expect(consoleSpies.log).toHaveBeenCalledTimes(1);
    });
  });

  describe('Categories', () => {
    it('should track used categories', () => {
      logger.info('Category1', 'Message');
      logger.info('Category2', 'Message');
      logger.info('Category1', 'Another message');

      const categories = logger.getCategories();
      expect(categories).toContain('Category1');
      expect(categories).toContain('Category2');
      expect(categories).toHaveLength(2);
    });

    it('should mute specific categories', () => {
      logger.muteCategory('MutedCategory');

      logger.info('MutedCategory', 'Should not log');
      logger.info('ActiveCategory', 'Should log');

      expect(consoleSpies.log).toHaveBeenCalledTimes(1);
    });

    it('should unmute categories', () => {
      logger.muteCategory('Test');
      logger.info('Test', 'Should not log');

      logger.unmuteCategory('Test');
      logger.info('Test', 'Should log');

      expect(consoleSpies.log).toHaveBeenCalledTimes(1);
    });

    it('should check if category is muted', () => {
      logger.muteCategory('Muted');

      expect(logger.isCategoryMuted('Muted')).toBe(true);
      expect(logger.isCategoryMuted('NotMuted')).toBe(false);
    });
  });

  describe('Groups', () => {
    it('should create log groups', () => {
      logger.group('Test', 'Group Name', () => {
        logger.info('Test', 'Inside group');
      });

      expect(consoleSpies.group).toHaveBeenCalled();
      expect(consoleSpies.log).toHaveBeenCalled();
      expect(consoleSpies.groupEnd).toHaveBeenCalled();
    });

    it('should create collapsed groups', () => {
      logger.group(
        'Test',
        'Collapsed Group',
        () => {
          logger.info('Test', 'Inside collapsed group');
        },
        true
      );

      expect(consoleSpies.groupCollapsed).toHaveBeenCalled();
      expect(consoleSpies.groupEnd).toHaveBeenCalled();
    });

    it('should not create groups for muted categories', () => {
      logger.muteCategory('Muted');

      logger.group('Muted', 'Should not appear', () => {
        logger.info('Muted', 'Inside group');
      });

      expect(consoleSpies.group).not.toHaveBeenCalled();
      expect(consoleSpies.groupCollapsed).not.toHaveBeenCalled();
    });
  });

  describe('Tables', () => {
    it('should log tables', () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];

      logger.table('Test', data);

      expect(consoleSpies.log).toHaveBeenCalled();
      expect(consoleSpies.table).toHaveBeenCalledWith(data, undefined);
    });

    it('should log tables with specific columns', () => {
      const data = [
        { id: 1, name: 'Item 1', extra: 'data' },
        { id: 2, name: 'Item 2', extra: 'data' },
      ];
      const columns = ['id', 'name'];

      logger.table('Test', data, columns);

      expect(consoleSpies.table).toHaveBeenCalledWith(data, columns);
    });

    it('should not log tables for muted categories', () => {
      logger.muteCategory('Muted');

      logger.table('Muted', [{ id: 1 }]);

      expect(consoleSpies.table).not.toHaveBeenCalled();
    });
  });

  describe('Timers', () => {
    it('should start and stop timers', () => {
      logger.time('Test', 'operation');
      logger.timeEnd('Test', 'operation');

      expect(consoleSpies.time).toHaveBeenCalledWith('Test:operation');
      expect(consoleSpies.timeEnd).toHaveBeenCalledWith('Test:operation');
    });

    it('should not create timers for muted categories', () => {
      logger.muteCategory('Muted');

      logger.time('Muted', 'operation');
      logger.timeEnd('Muted', 'operation');

      expect(consoleSpies.time).not.toHaveBeenCalled();
      expect(consoleSpies.timeEnd).not.toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should show current configuration', () => {
      logger.showConfig();

      expect(consoleSpies.log).toHaveBeenCalled();
    });

    it('should allow toggling timestamps', () => {
      logger.setShowTimestamp(false);
      logger.info('Test', 'Message');

      const callArgs = consoleSpies.log.mock.calls[0][0];
      expect(callArgs).toBeDefined();
    });

    it('should allow toggling icons', () => {
      logger.setShowIcons(false);
      logger.info('Test', 'Message');

      const callArgs = consoleSpies.log.mock.calls[0][0];
      expect(callArgs).toBeDefined();
    });

    it('should allow toggling colors', () => {
      logger.setUseColors(false);
      logger.info('Test', 'Message');

      const callArgs = consoleSpies.log.mock.calls[0][0];
      expect(callArgs).toBeDefined();
    });
  });

  describe('Multiple arguments', () => {
    it('should handle multiple log arguments', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };

      logger.info('Test', 'Message', obj1, obj2);

      expect(consoleSpies.log).toHaveBeenCalled();
      const [, ...args] = consoleSpies.log.mock.calls[0];
      expect(args).toContain('Message');
      expect(args).toContain(obj1);
      expect(args).toContain(obj2);
    });
  });
});
