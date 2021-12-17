import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Err } from './../error';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const exitstigUser = await this.findUserByEmail(createUserDto.email);
    if (exitstigUser) {
      throw new BadRequestException(Err.USER.EXISTING_USER);
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return await this.userRepository.save({
      email: createUserDto.email,
      password: hashedPassword,
    });
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findUserById(id: number) {
    const existingUser = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (!existingUser) {
      throw new BadRequestException(Err.USER.NOT_FOUND);
    }
    return existingUser;
  }
}
