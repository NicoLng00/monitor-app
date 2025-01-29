import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { App, AppDocument } from './swagger/app.schema';
import { buildAgGridPayload } from 'src/utils/AgGrid/ag-grid-payload.util';
import { buildAggregationPipeline } from 'src/utils/AgGrid/ag-grid-query.util';
import { TenantContext } from 'src/utils/tenant.util';
import { MongoConnector } from '../../utils/mongo.utils';
import * as fs from 'fs';
import * as path from 'path';

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

    async monitorApp(id: string) {
        const app = await this.appModel.findById(id);
        if (!app) {
            throw new NotFoundException(`App with ID ${id} not found`);
        }

        await MongoConnector.connect({
            uri: app.mongodb.uri,
            dbName: app.mongodb.db_name,
            authSource: "admin",
        });

        this.logConnection(app.app_name);

        return { message: `Monitoring started for app: ${app.app_name}` };
    }

    private logConnection(appName: string) {
        const logDir = path.join(__dirname, '../../logs');
        const logFilePath = path.join(logDir, `connection-${appName}.log`);

        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const logMessage = `${new Date().toISOString()} - Connected to database for app: ${appName}\n`;
        fs.appendFileSync(logFilePath, logMessage, 'utf8');
    }

    async getLogs() {
        const db = MongoConnector.getDatabase();
        const logs = await db.collection('system.profile').find().toArray();
        return logs;
    }
}