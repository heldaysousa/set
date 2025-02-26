interface ErrorDetails {
  level: 'error' | 'warning' | 'info'
  message: string
  error?: Error
  context?: Record<string, any>
}

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
}

class Monitoring {
  private metrics: Map<string, PerformanceMetric> = new Map()

  markStart(name: string) {
    this.metrics.set(name, {
      name,
      startTime: performance.now()
    })
  }

  markEnd(name: string) {
    const metric = this.metrics.get(name)
    if (metric) {
      metric.endTime = performance.now()
      metric.duration = metric.endTime - metric.startTime
      this.trackPerformance(metric)
    }
  }

  trackError({ level, message, error, context }: ErrorDetails) {
    console.error(`[${level.toUpperCase()}] ${message}`, {
      error,
      context,
      timestamp: new Date().toISOString()
    })

    // TODO: Enviar para serviço de monitoramento (ex: Sentry)
  }

  trackUserAction(action: string, userId: string) {
    console.info(`[USER ACTION] ${action}`, {
      userId,
      timestamp: new Date().toISOString()
    })

    // TODO: Enviar para serviço de analytics (ex: Mixpanel)
  }

  private trackPerformance(metric: PerformanceMetric) {
    console.info(`[PERFORMANCE] ${metric.name}`, {
      duration: metric.duration,
      timestamp: new Date().toISOString()
    })

    // TODO: Enviar para serviço de monitoramento (ex: New Relic)
  }
}

export const monitoring = new Monitoring()
