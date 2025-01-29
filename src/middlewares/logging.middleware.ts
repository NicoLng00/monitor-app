import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid"; // Importa uuid

/**
 * Middleware per il logging completo delle richieste e delle risposte HTTP
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
	private readonly logger = new Logger("HTTP");
	private readonly logsDir: string;

	constructor() {
		this.logsDir = path.join(process.cwd(), "logs");
		try {
			this.ensureLogsDirectory();
		} catch (error: any) {
			this.logger.error(`Error initializing logs directory: ${error.message}`);
		}
	}

	private ensureLogsDirectory(): void {
		if (!fs.existsSync(this.logsDir)) {
			fs.mkdirSync(this.logsDir, { recursive: true });
			this.logger.log(`Created logs directory at: ${this.logsDir}`);
		}
	}

	private ensureLogFile(filePath: string): void {
		if (!fs.existsSync(filePath)) {
			fs.writeFileSync(filePath, ""); // Crea un file vuoto
		}
	}

	private getLogFilePath(): string {
		const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
		const filePath = path.join(this.logsDir, `${today}.log`);
		this.ensureLogFile(filePath);
		return filePath;
	}

	use(req: Request, res: Response, next: NextFunction): void {
		const { method, originalUrl, headers, body, query, cookies } = req;
		const userAgent = req.get("user-agent") || "";
		const startTime = Date.now();

		// Genera un UUID per il log
		const logId = uuidv4();

		// Intercetta l'output della risposta
		const originalWrite = res.write.bind(res);
		const originalEnd = res.end.bind(res);
		const chunks: Buffer[] = [];

		// Sovrascrivi `res.write` per catturare i dati della risposta
		res.write = (
			chunk: any,
			encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void),
			callback?: (error?: Error | null) => void
		): boolean => {
			if (typeof encodingOrCallback === "function") {
				callback = encodingOrCallback; // Se il secondo parametro è una funzione, è il callback
				encodingOrCallback = undefined; // Reset encoding
			}

			if (chunk) {
				chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
			}

			return originalWrite(
				chunk,
				encodingOrCallback as BufferEncoding,
				callback
			);
		};

		// Sovrascrivi `res.end` per catturare i dati finali della risposta
		res.end = (
			chunk?: any,
			encodingOrCallback?: BufferEncoding | (() => void),
			callback?: () => void
		): Response => {
			if (typeof encodingOrCallback === "function") {
				callback = encodingOrCallback; // Se il secondo parametro è una funzione, è il callback
				encodingOrCallback = undefined; // Reset encoding
			}

			if (chunk) {
				chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
			}

			const responseBody = Buffer.concat(chunks).toString("utf8");
			const { statusCode } = res;
			const contentLength = res.get("content-length") || "0";
			const duration = Date.now() - startTime;

			const logDetails = {
				logId, // UUID univoco per il log
				timestamp: new Date().toISOString(),
				method,
				url: originalUrl,
				statusCode,
				duration: `${duration}ms`,
				contentLength,
				headers: {
					requestHeaders: headers,
					responseHeaders: res.getHeaders(), // Intestazioni della risposta
				},
				query,
				cookies,
				body: body, // Corpo della richiesta
				response: this.parseJsonResponse(responseBody), // Corpo della risposta formattato come JSON
				userAgent,
			};

			const logMessage = `${JSON.stringify(logDetails, null, 2)}\n`;
			const logFile = this.getLogFilePath();

			try {
				fs.appendFileSync(logFile, logMessage);
			} catch (error: any) {
				this.logger.error(`Failed to write log: ${error.message}`);
			}

			return originalEnd(chunk, encodingOrCallback as BufferEncoding, callback);
		};

		next();
	}

	/**
	 * Prova a formattare la risposta come JSON, se possibile
	 * @param responseBody - Corpo della risposta
	 * @returns JSON o stringa originale
	 */
	private parseJsonResponse(responseBody: string): any {
		try {
			return JSON.parse(responseBody);
		} catch {
			return responseBody; // Torna la stringa originale se non è un JSON valido
		}
	}
}
