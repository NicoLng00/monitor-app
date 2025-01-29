import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { BadRequestException } from "@nestjs/common";

/**
 * Valida e converte un ID in ObjectId di MongoDB
 * @param id - L'id come stringa
 * @returns Types.ObjectId
 * @throws BadRequestException se l'id non è valido
 */
@Injectable()
export class ObjectIdUtil {
	static validate(id: string): Types.ObjectId {
		if (!Types.ObjectId.isValid(id)) {
			throw new Error(`Invalid ObjectId: ${id}`);
		}
		return new Types.ObjectId(id);
	}
}
