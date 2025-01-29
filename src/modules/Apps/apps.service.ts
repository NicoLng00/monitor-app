import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { App, AppDocument } from './swagger/app.schema';
import { buildAgGridPayload } from 'src/utils/AgGrid/ag-grid-payload.util';
import { buildAggregationPipeline } from 'src/utils/AgGrid/ag-grid-query.util';
import { TenantContext } from 'src/utils/tenant.util';
import { MongoConnector } from '../../utils/mongo.utils';

@Injectable()
export class AppsService {
    constructor(
        @InjectModel(App.name, 'apps') private appModel: Model<AppDocument>
    ) {}

    async getAppById(id: string) {
        const agGridPayload = buildAgGridPayload(id, {}, [], 0, 1);
        const pipeline = buildAggregationPipeline(agGridPayload);
        TenantContext.addTenantFilter(pipeline);

        const [result] = await this.appModel.aggregate(pipeline).exec();

        if (!result) {
            throw new NotFoundException(`App with ID ${id} not found`);
        }

        return result;
    }

    async createApp(appData: App) {
        // Salva l'app nel database
        const newApp = new this.appModel(appData);
        await newApp.save();
        return newApp; // Restituisci l'app creata
    }

    async updateApp(id: string, appData: App) {
        const updatedApp = await this.appModel.findByIdAndUpdate(id, appData, { new: true });
        if (!updatedApp) {
            throw new NotFoundException(`App with ID ${id} not found`);
        }
        return updatedApp;
    }

    async deleteApp(id: string) {
        const deletedApp = await this.appModel.findByIdAndDelete(id);
        if (!deletedApp) {
            throw new NotFoundException(`App with ID ${id} not found`);
        }
        return { message: `App with ID ${id} deleted successfully` };
    }
}