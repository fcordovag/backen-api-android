import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    const { email } = rest;
    const emailToLowerCase = email.toLowerCase().trim();

    const userEmail = await this.userRepository.findOneBy({
      email: emailToLowerCase,
    });
    if (userEmail) {
      throw new BadRequestException('Este email ya existe');
    }

    try {
      const user = this.userRepository.create({
        ...rest,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete user.password;

      return { message: 'Registrado con exito' };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const emailToLowerCase = email.toLowerCase().trim();

    const user = await this.userRepository.findOne({
      where: { email: emailToLowerCase },
      select: {
        email: true,
        password: true,
        id: true,
      },
    });

    if (!user) throw new BadRequestException('Email o Password no valido');

    if (!bcrypt.compareSync(password, user.password))
      throw new BadRequestException('Email o Password no valido');

    delete user.password;
    delete user.email;
    
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload): string {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async getPerfil(user: User) {
    return user;
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
