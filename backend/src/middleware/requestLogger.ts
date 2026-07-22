import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";

export function Logger(req: Request, res: Response, next: NextFunction) {
    const ogSend = res.send;
    res.send = function (body: any) {
        if (res.statusCode < 400) {
            logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`);
        } else {
            logger.error(`${req.method} ${req.originalUrl} ${res.statusCode} ${body}`);
        }
        return ogSend.call(this, body);
    };
    next();
}