import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    success: false,
    error: {
      message: `无法找到请求的资源: ${req.method} ${req.originalUrl}`,
    },
  });
};
