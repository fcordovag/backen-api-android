import { IsArray, IsOptional, IsString } from 'class-validator';
import { Payment } from '../entities/payment.entity';

export class CreateInvoiceDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsArray()
  payments?: Payment[];
}
