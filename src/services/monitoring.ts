/**
 * @fileoverview Serviço de monitoramento e logging
 */

interface LogData {
  level: 'info' | 'warn' | 'error'
  message: string
  context?: Record<string, unknown>
  timestamp?: string
  userId?: string
}

interface ErrorData extends LogData {
  error: Error
  stackTrace?: string
}

interface MetricData {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp?: string
}

interface ErrorDetails {
  level: 'error' | 'warning' | 'info'
  message: string
  error: Error
  context?: Record<string, unknown>
}

interface UserAction {
  action: string
  userId: string
  metadata?: Record<string, unknown>
}

class MonitoringService {
  private static instance: MonitoringService
  private isDevelopment = process.env.NODE_ENV === 'development'
  private timers: Record<string, number> = {}

  private constructor() {
    // Singleton
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  // Logging
  private formatLogData(data: LogData): LogData {
    return {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
      context: {
        environment: process.env.NODE_ENV,
        ...data.context,
      },
    }
  }

  log(data: LogData): void {
    const formattedData = this.formatLogData(data)

    if (this.isDevelopment) {
      switch (data.level) {
        case 'info':
          console.log(
            `[${formattedData.timestamp}] INFO:`,
            formattedData.message,
            formattedData.context
          )
          break
        case 'warn':
          console.warn(
            `[${formattedData.timestamp}] WARN:`,
            formattedData.message,
            formattedData.context
          )
          break
        case 'error':
          console.error(
            `[${formattedData.timestamp}] ERROR:`,
            formattedData.message,
            formattedData.context
          )
          break
      }
    } else {
      // TODO: Enviar logs para serviço de logging (ex: Sentry, LogRocket)
    }
  }

  // Error tracking
  trackError({ level, message, error, context }: ErrorDetails): void {
    const formattedData = this.formatLogData({
      level: level,
      message: message,
      error: error,
      context: context,
    })

    if (this.isDevelopment) {
      console.error(
        `[${formattedData.timestamp}] ERROR:`,
        formattedData.message,
        formattedData.context
      )
    } else {
      // TODO: Enviar erro para serviço de tracking (ex: Sentry)
    }
  }

  // Performance monitoring
  trackMetric(data: MetricData): void {
    const formattedData = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
      tags: {
        environment: process.env.NODE_ENV,
        ...data.tags,
      },
    }

    if (this.isDevelopment) {
      console.log(
        `[${formattedData.timestamp}] METRIC:`,
        formattedData.name,
        formattedData.value,
        formattedData.tags
      )
    } else {
      // TODO: Enviar métrica para serviço de monitoramento (ex: DataDog, New Relic)
    }
  }

  // User tracking
  trackUserAction(action: string, userId: string, metadata?: Record<string, unknown>): void {
    this.log({
      level: 'info',
      message: `User Action: ${action}`,
      userId,
      context: metadata,
    })
  }

  // Performance marks
  markStart(label: string): void {
    this.timers[label] = performance.now()
  }

  markEnd(label: string): void {
    const startTime = this.timers[label]
    if (!startTime) {
      console.warn(`Timer "${label}" não foi iniciado`)
      return
    }

    const duration = performance.now() - startTime
    delete this.timers[label]

    // Aqui você pode enviar a métrica para seu serviço de monitoramento
    console.debug(`[Monitoring] ${label}: ${duration.toFixed(2)}ms`)
  }
}

export const monitoring = MonitoringService.getInstance()
