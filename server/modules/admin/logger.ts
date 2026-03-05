export interface LogEntry {
  level: 'trace' | 'debug' | 'log' | 'info' | 'warn' | 'error'
  message: string
  ts: number
}

const MAX_LOGS = 500
export const logBuffer: LogEntry[] = []
export const logListeners = new Set<(entry: LogEntry) => void>()

function capture(level: LogEntry['level'], orig: (...args: unknown[]) => void) {
  return (...args: unknown[]) => {
    orig(...args)
    const message = args.map((a) => {
      if (typeof a === 'string')
        return a
      if (a instanceof Error)
        return `${a.name}: ${a.message}`
      return JSON.stringify(a)
    }).join(' ')
    const entry: LogEntry = { level, message, ts: Date.now() }
    if (logBuffer.length >= MAX_LOGS)
      logBuffer.shift()
    logBuffer.push(entry)
    for (const fn of logListeners)
      fn(entry)
  }
}

// Auto-initialize on import
console.trace = capture('trace', console.trace.bind(console))
console.debug = capture('debug', console.debug.bind(console))
console.log = capture('log', console.log.bind(console))
console.info = capture('info', console.info.bind(console))
console.warn = capture('warn', console.warn.bind(console))
console.error = capture('error', console.error.bind(console))
