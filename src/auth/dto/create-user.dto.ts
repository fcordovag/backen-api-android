import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password minimo 6 carecteres' })
  password: string;

  @IsString()
  @MinLength(1)
  firstname: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  lastname: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  roles: string[];
}
