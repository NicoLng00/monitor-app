import { AgGridRequestDto } from '../../modules/Apps/dto/ag-grid-request.dto';
import { ObjectIdUtil } from '../object-id.util';

/**
 * Costruisce un payload Ag-Grid per una richiesta specifica.
 * @param id - L'ID della gift card da cercare.
 * @param filterModel - Modello di filtro opzionale.
 * @param sortModel - Modello di ordinamento opzionale.
 * @param startRow - Riga iniziale opzionale per la paginazione.
 * @param endRow - Riga finale opzionale per la paginazione.
 * @returns Il payload Ag-Grid.
 */
export function buildAgGridPayload(
    id: string,
    filterModel: Record<string, any> = {},
    sortModel: { colId: string, sort: 'asc' | 'desc' }[] = [],
    startRow: number = 0,
    endRow: number = 1
): AgGridRequestDto {

    return {
        filterModel: {
            _id: {
                filterType: 'text',
                type: 'equals',
                filter:  ObjectIdUtil.validate(id)
            },
            ...filterModel
        },
        sortModel,
        startRow,
        endRow,
        rowGroupCols: [], 
        valueCols: [],
        pivotCols: [],
        pivotMode: false, 
        groupKeys: [] 
    };
} 