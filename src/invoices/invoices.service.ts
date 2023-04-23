import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async decreaseStock(idPro: string, quantity: number) {
    const product = await this.productRepository.findOne({
      where: { id: idPro },
      select: { name: true, stock: true, id: true },
    });

    const newStock = product.stock - quantity;

    await this.productRepository.update({ id: idPro }, { stock: newStock });
  }

  async create(createInvoiceDto: CreateInvoiceDto, user: User) {
    const newPayment = createInvoiceDto.payments.map((payment) => {
      const paymentDb = new Payment();
      paymentDb.product = payment.product;
      paymentDb.quantity = payment.quantity;
      this.decreaseStock(
        payment.product as unknown as string,
        payment.quantity,
      );

      return paymentDb;
    });

    await this.paymentRepository.save(newPayment);

    const invoice = new Invoice();
    invoice.customer = user;
    invoice.payments = newPayment;

    try {
      const savedInvoice = await this.invoiceRepository.save(invoice);
      return { savedInvoice, message: 'agregada con exito ' };
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 15, offset = 0 } = paginationDto;
    try {
      return await this.invoiceRepository.find({
        relations: {
          customer: true,
          payments: {
            product: true,
          },
        },
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(id: string) {
    let invoice: Invoice;

    if (!isUUID(id)) {
      throw new BadRequestException('venta no valida');
    }

    invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        payments: {
          product: true,
        },
      },
    });

    if (!invoice) throw new NotFoundException('Venta no existe');

    return invoice;
  }

  update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    return `This action updates a #${id} invoice`;
  }

  remove(id: number) {
    return `This action removes a #${id} invoice`;
  }
}
