import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    createProductDto.name = createProductDto.name.toLowerCase();

    delete user.password
    delete user.roles

    const ProductFound = await this.productRepository.findOneBy({
      name: createProductDto.name,
    });
    if (ProductFound) throw new BadRequestException('Producto ya existe');

    try {
      const product = new Product();
      product.name = createProductDto.name;
      product.description = createProductDto.description;
      product.purchase_price = createProductDto.purchase_price;
      product.sale_price = createProductDto.sale_price;
      product.stock = createProductDto.stock;
      product.user = user;

      const productSave = await this.productRepository.save(product);
      return { productSave, message: 'Agregado con exito' };
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    try {
      const dataProducts = await this.productRepository.find({
        take: limit,
        skip: offset,
      });
     return dataProducts
     
    } catch (error) {
      console.log(error);
    }
  }

  

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      product = await this.productRepository.findOneBy({ name: term });
    }

    if (!product) throw new NotFoundException('producto no existe');

    return { product };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    updateProductDto.name = updateProductDto.name.toLowerCase();

    if (!isUUID(id)) {
      throw new BadRequestException('producto no valido');
    }

    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException('producto no existe');

    try {
      await this.productRepository.update(id, updateProductDto);
      const productUpdate = await this.productRepository.findOneBy({ id });
      return { productUpdate, message: 'Editado con exito' };
    } catch (error) {
      console.log(error);
    }
  }

  async remove(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('producto no valido');
    }

    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException('producto no existe');

    try {
      await this.productRepository.softDelete(id);
      return { message: 'Eliminado con exito' };
    } catch (error) {
      console.log(error);
    }
  }
}
