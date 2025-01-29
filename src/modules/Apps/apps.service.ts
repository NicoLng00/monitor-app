import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { App } from './swagger/app.schema';
import { AppDocument } from './swagger/app.schema';
import { buildAgGridPayload } from 'src/utils/AgGrid/ag-grid-payload.util';
import { buildAggregationPipeline } from 'src/utils/AgGrid/ag-grid-query.util';
import { TenantContext } from 'src/utils/tenant.util';
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
} 