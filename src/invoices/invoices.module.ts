import { Module, forwardRef } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService],

  imports: [
    TypeOrmModule.forFeature([Invoice, Payment]),
    forwardRef(() => InvoicesModule),
    forwardRef(() => ProductsModule),
    forwardRef(() => AuthModule),
  ],

  exports: [InvoicesService, TypeOrmModule],
})
export class InvoicesModule {}
