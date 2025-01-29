import { PipelineStage } from 'mongoose';
import { AgGridRequestDto } from '../../modules/Apps/dto/ag-grid-request.dto';
import * as fs from 'fs';
import * as path from 'path';
import { TenantContext } from '../tenant.util';

interface AgGridQueryOptions {
    defaultSortField?: string;
}

interface FilterCondition {
    filterType: 'text' | 'number' | 'set' | 'date';
    type?: string;
    filter?: string | number;
    dateFrom?: string;
    dateTo?: string;
    values?: any[];
}

function logToFile(message: string) {
    const logDir = path.join(__dirname, '../../logs'); // Percorso della directory dei log
    const logFilePath = path.join(logDir, 'ag-grid-query.log');
    
    // Crea la directory se non esiste
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
}

export function buildAggregationPipeline(
    request: AgGridRequestDto,
    options: AgGridQueryOptions = {}
): PipelineStage[] {
    const pipeline: PipelineStage[] = [];

    // Aggiungi lo stage $match per i tenant
    const tenants = TenantContext.getTenants();
    if (tenants && tenants.length > 0) {
        pipeline.push({ $match: { tenant: { $in: tenants } } });
    }

    // Gestione dei filtri
    if (request.filterModel && Object.keys(request.filterModel).length > 0) {
        const matchStage: Record<string, any> = {};
        for (const [field, filter] of Object.entries(request.filterModel)) {
            if (filter.operator && filter.conditions) {
                const conditions = filter.conditions.map((condition: FilterCondition) => ({
                    [field]: handleFilterByType(condition)
                })).filter((cond: Record<string, any>) => Object.keys(cond[field]).length > 0);
                
                if (filter.operator === 'AND') {
                    matchStage['$and'] = matchStage['$and'] || [];
                    matchStage['$and'].push(...conditions);
                } else if (filter.operator === 'OR') {
                    matchStage['$or'] = matchStage['$or'] || [];
                    matchStage['$or'].push(...conditions);
                }
            } else {
                matchStage[field] = handleFilterByType(filter);
            }
        }
        pipeline.push({ $match: matchStage });
    }

    // Gestione dell'ordinamento
    if (request.sortModel && request.sortModel.length > 0) {
        const sortStage = buildSortStage(request.sortModel);
        pipeline.push({ $sort: sortStage });
    } else if (options.defaultSortField) {
        pipeline.push({ $sort: { [options.defaultSortField]: 1 } });
    }

    
    // Log del pipeline di aggregazione
    logToFile(`Aggregation Pipeline: ${JSON.stringify(pipeline, null, 2)}`);

    return pipeline;
}

function handleFilterByType(filter: FilterCondition): any {
    switch (filter.filterType) {
        case 'text':
            return handleTextFilter(filter);
        case 'number':
            return handleNumberFilter(filter);
        case 'set':
            return handleSetFilter(filter);
        case 'date':
            return handleDateFilter(filter);
        default:
            return {};
    }
}

function handleTextFilter(filter: FilterCondition): any {
    switch (filter.type) {
        case 'contains':
            return { $regex: filter.filter || '', $options: 'i' };
        case 'notContains':
            return { $not: { $regex: filter.filter || '', $options: 'i' } };
        case 'equals':
            return filter.filter || '';
        case 'notEquals':
            return { $ne: filter.filter || '' };
        case 'blank':
            return { $in: [null, '', 0] };
        case 'notBlank':
            return { $nin: [null, '', 0] };
        case 'startsWith':
            return { $regex: `^${filter.filter || ''}`, $options: 'i' };
        case 'endsWith':
            return { $regex: `${filter.filter || ''}$`, $options: 'i' };
        default:
            return {};
    }
}

function handleNumberFilter(filter: FilterCondition): any {
    switch (filter.type) {
        case 'equals':
            return filter.filter;
        case 'notEquals':
            return { $ne: filter.filter };
        case 'greaterThan':
            return { $gt: filter.filter };
        case 'lessThan':
            return { $lt: filter.filter };
        case 'greaterThanOrEqual':
            return { $gte: filter.filter };
        case 'lessThanOrEqual':
            return { $lte: filter.filter };
        default:
            return {};
    }
}

function handleSetFilter(filter: FilterCondition): any {
    if (Array.isArray(filter.values) && filter.values.length > 0) {
        return { $in: filter.values };
    }
    return {};
}

function handleDateFilter(filter: FilterCondition): any {
    if (filter.type === 'inRange' && filter.dateFrom && filter.dateTo) {
        return {
            $gte: new Date(filter.dateFrom),
            $lte: new Date(filter.dateTo),
        };
    } else if (filter.type === 'after' && filter.dateFrom) {
        return {
            $gte: new Date(filter.dateFrom),
        };
    } else if (filter.type === 'before' && filter.dateTo) {
        return {
            $lte: new Date(filter.dateTo),
        };
    }
    return {};
}

function buildSortStage(sortModel: { colId: string, sort: 'asc' | 'desc' }[]): Record<string, 1 | -1> {
    const sortStage: Record<string, 1 | -1> = {};
    sortModel.forEach(sort => {
        sortStage[sort.colId] = sort.sort === 'asc' ? 1 : -1;
    });
    return sortStage;
} 