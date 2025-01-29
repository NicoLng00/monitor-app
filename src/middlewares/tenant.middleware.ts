import {
	Injectable,
	NestMiddleware,
	BadRequestException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { TenantContext } from "../utils/tenant.util";

/**
 * Middleware per la gestione del multi-tenant
 *
 * Funzionalità:
 * - Estrazione tenant dall'header
 * - Validazione tenant
 * - Routing alla connessione corretta
 * - Gestione errori tenant non valido
 *
 * Sicurezza:
 * - Validazione tenant ammessi
 * - Sanitizzazione input
 * - Prevenzione accessi non autorizzati
 *
 * Utilizzo:
 * - Applicato globalmente
 * - Richiesto per tutte le route protette
 * - Integrazione con MongoConnectionService
 */

export type ValidTenant = "it" | "fr" | "se" | "ee" | "lv" | "lt" | "dk" | "fi" | "global";

@Injectable()
export class TenantMiddleware implements NestMiddleware {
	private readonly validTenants: ValidTenant[] = [
		"it",
		"fr",
		"se",
		"ee",
		"lv",
		"lt",
		"dk",
		"fi",
		"global",
	];

	private normalizeTenants(tenants: string[]): ValidTenant[] {
		return tenants.map(tenant => {
			const normalizedTenant = tenant.toLowerCase();
			if (!this.validTenants.includes(normalizedTenant as ValidTenant)) {
				throw new BadRequestException(`Invalid tenant: ${tenant}`);
			}
			return normalizedTenant as ValidTenant;
		});
	}

	use(req: Request, res: Response, next: NextFunction) {
		const tenantHeader =
			req.headers["x-tenant"] ||
			req.headers["X-TENANT"] ||
			req.query.tenant ||
			"";

		if (!tenantHeader) {
			throw new BadRequestException("Tenant header is missing");
		}

		// Dividi gli tenant se sono una lista separata da virgola
		const tenants = tenantHeader
			.toString()
			.split(',')
			.map(tenant => tenant.trim().toLowerCase())
			.filter(tenant => tenant.length > 0);

		if (tenants.length === 0) {
			throw new BadRequestException("No valid tenants provided");
		}

		// Validazione di ciascun tenant
		tenants.forEach(tenant => {
			if (!this.validTenants.includes(tenant as ValidTenant)) {
				throw new BadRequestException(`Invalid tenant: ${tenant}`);
			}
		});

		TenantContext.setTenants(tenants as ValidTenant[]);

		// Aggiungi i tenant anche alle response headers per debugging
		res.setHeader("X-TENANTS", tenants.join(','));

		next();
	}
}
