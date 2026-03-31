/**
 * App Logger - Custom logger for general application logs.
 *
 * Visual distinction:
 *   custom logger  → purple/magenta, "─" separators, 🟣 prefix
 *   network logger → cyan/blue,      "=" separators, 🌐 prefix  (see NetworkLogger.ts)
 *
 * Usage:
 *   import { logger } from '@/utils/Logger';
 *
 *   logger.info('User logged in', { userId: '123' });
 *   logger.warn('Token expiring soon');
 *   logger.error('Failed to load data', error);
 *   logger.debug('Component mounted', { props });
 *   logger.success('Profile updated');
 */

import { Colors, colorize } from './ConsoleColors';

// ─── Log Levels ───────────────────────────────────────────────────────────────

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

interface LoggerConfig {
  enabled: boolean;
  showTimestamp: boolean;
  showLevel: boolean;
  tag: string; // e.g. "MyFeature" to scope logs
}

// ─── Level Config ─────────────────────────────────────────────────────────────

const LEVEL_META: Record<LogLevel, { emoji: string; color: string; label: string }> = {
  info:    { emoji: 'ℹ️ ', color: Colors.bright + Colors.magenta, label: 'INFO   ' },
  warn:    { emoji: '⚠️ ', color: Colors.bright + Colors.yellow,  label: 'WARN   ' },
  error:   { emoji: '🔴', color: Colors.bright + Colors.red,     label: 'ERROR  ' },
  debug:   { emoji: '🔍', color: Colors.dim    + Colors.white,   label: 'DEBUG  ' },
  success: { emoji: '✅', color: Colors.bright + Colors.green,   label: 'SUCCESS' },
};

const SEPARATOR = colorize('─'.repeat(70), Colors.magenta);
const HEADER_COLOR = Colors.bright + Colors.magenta;

// ─── Logger Class ─────────────────────────────────────────────────────────────

class AppLogger {
  private config: LoggerConfig = {
    enabled: __DEV__,
    showTimestamp: true,
    showLevel: true,
    tag: '',
  };

  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /** Scoped logger — returns a new logger instance with a fixed tag */
  scope(tag: string): ScopedLogger {
    return new ScopedLogger(tag, this.config);
  }

  info(message: string, data?: any): void {
    this.print('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.print('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.print('error', message, data);
  }

  debug(message: string, data?: any): void {
    this.print('debug', message, data);
  }

  success(message: string, data?: any): void {
    this.print('success', message, data);
  }

  private print(level: LogLevel, message: string, data?: any, tag?: string): void {
    if (!this.config.enabled) return;

    const { emoji, color, label } = LEVEL_META[level];
    const ts = this.config.showTimestamp
      ? colorize(new Date().toISOString(), Colors.dim)
      : '';
    const lvl = this.config.showLevel
      ? colorize(`[${label}]`, color)
      : '';
    const scope = tag ?? this.config.tag;
    const scopeStr = scope ? colorize(`[${scope}]`, Colors.bright + Colors.cyan) : '';
    const prefix = colorize('custom logger :', HEADER_COLOR);

    console.log(`\n${SEPARATOR}`);
    console.log(`${prefix} ${emoji} ${lvl} ${scopeStr} ${ts}`);
    console.log(colorize(`  ${message}`, color));

    if (data !== undefined) {
      const formatted =
        typeof data === 'object'
          ? JSON.stringify(data, null, 2)
          : String(data);
      console.log(colorize(formatted, Colors.dim + Colors.white));
    }

    console.log(`${SEPARATOR}\n`);
  }

  // Expose internal print for ScopedLogger
  _print(level: LogLevel, message: string, data?: any, tag?: string): void {
    this.print(level, message, data, tag);
  }
}

// ─── Scoped Logger ────────────────────────────────────────────────────────────

class ScopedLogger {
  constructor(
    private readonly tag: string,
    private readonly config: LoggerConfig,
  ) {}

  info(message: string, data?: any): void    { logger._print('info',    message, data, this.tag); }
  warn(message: string, data?: any): void    { logger._print('warn',    message, data, this.tag); }
  error(message: string, data?: any): void   { logger._print('error',   message, data, this.tag); }
  debug(message: string, data?: any): void   { logger._print('debug',   message, data, this.tag); }
  success(message: string, data?: any): void { logger._print('success', message, data, this.tag); }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const logger = new AppLogger();
