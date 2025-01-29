import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class AgGridRequestDto {
    @IsNumber()
    startRow: number;

    @IsNumber()
    endRow: number;

    @IsArray()
    @IsOptional()
    rowGroupCols: any[];

    @IsArray()
    @IsOptional()
    valueCols: any[];

    @IsArray()
    @IsOptional()
    pivotCols: any[];

    @IsBoolean()
    pivotMode: boolean;

    @IsArray()
    @IsOptional()
    groupKeys: any[];

    @IsObject()
    @IsOptional()
    filterModel: Record<string, any>;

    @IsArray()
    @IsOptional()
    sortModel: { colId: string, sort: 'asc' | 'desc' }[];
} 