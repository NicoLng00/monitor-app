import { ValidationPipe, BadRequestException } from '@nestjs/common';

export function createValidationPipe() {
    return new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
            const messages = errors.map(error => {
                return error.constraints ? Object.values(error.constraints).join(', ') : 'unknown error';
            });
            return new BadRequestException(messages);
        },
    });
} 