// Centralized logger for server-side and API routes
// Usage: import { logger } from '@/lib/logger'

interface LogContext {
  userId?: string
  email?: string
  endpoint?: string
  duration?: number
  [key: string]: any
}

const getTimestamp = () => new Date().toISOString()

export const logger = {
  /**
   * Log info level messages
   */
  info: (message: string, context?: LogContext) => {
    const logEntry = {
      timestamp: getTimestamp(),
      level: "INFO",
      message,
      ...context,
    }
    console.log(JSON.stringify(logEntry))
  },

  /**
   * Log error level messages
   */
  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    const errorData =
      error instanceof Error
        ? {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
          }
        : { error: String(error) }

    const logEntry = {
      timestamp: getTimestamp(),
      level: "ERROR",
      message,
      ...errorData,
      ...context,
    }
    console.error(JSON.stringify(logEntry))
  },

  /**
   * Log warning level messages
   */
  warn: (message: string, context?: LogContext) => {
    const logEntry = {
      timestamp: getTimestamp(),
      level: "WARN",
      message,
      ...context,
    }
    console.warn(JSON.stringify(logEntry))
  },

  /**
   * Log debug level messages (development only)
   */
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === "development") {
      const logEntry = {
        timestamp: getTimestamp(),
        level: "DEBUG",
        message,
        ...context,
      }
      console.debug(JSON.stringify(logEntry))
    }
  },

  /**
   * Track API request/response
   */
  trackRequest: (method: string, path: string, statusCode: number, duration: number) => {
    logger.info(`${method} ${path}`, {
      statusCode,
      duration: `${duration}ms`,
    })
  },

  /**
   * Track authentication events
   */
  trackAuth: (action: string, success: boolean, context?: LogContext) => {
    logger.info(`Auth: ${action}`, {
      success,
      ...context,
    })
  },
}

export default logger
