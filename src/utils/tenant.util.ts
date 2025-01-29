import { Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { ValidTenant } from "../middlewares/tenant.middleware";
import { PipelineStage } from "mongoose";

@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
	private static tenants: ValidTenant[];

	constructor() {
		// I tenant verranno impostati dal middleware
	}

	static setTenants(tenants: ValidTenant[]) {
		this.tenants = tenants;
	}

	static getTenants(): ValidTenant[] {
		return this.tenants;
	}

	static addTenantFilter(pipeline: PipelineStage[]): void {
		const tenants = this.getTenants();
		if (tenants && tenants.length > 0) {
			pipeline.unshift({ $match: { tenant: { $in: tenants } } });
		}
	}
}
