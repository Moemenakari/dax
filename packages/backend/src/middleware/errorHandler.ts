import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status  = err.status  || 500
  const message = err.message || 'Internal Server Error'
  console.error(`[ERROR] ${status} — ${message}`)
  res.status(status).json({ message })
}
