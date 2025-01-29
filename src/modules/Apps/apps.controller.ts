import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    NotFoundException,
  } from '@nestjs/common';
import { AppsService } from './apps.service';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { App } from './swagger/app.schema';


@ApiTags('apps')
@Controller('apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get(':id')
  @ApiHeader({
    name: 'X-TENANT',
    description: 'Tenant identifier',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Return App from its id.' })
  async getAppById(@Param('id') id: string) {
    return this.appsService.getAppById(id);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Create a new app.' })
  async createApp(@Body() appData: App) {
    return this.appsService.createApp(appData);
  }
}

  