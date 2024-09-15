import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './users.schema';
import { MektepService } from '../mektep/mektep.service';
import { encrypt } from 'src/utils/encryption';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mektepService: MektepService
  ) {}

  async findByLogin(login: string): Promise<User | null> {
    return this.userModel.findOne({ login }).exec();
  }

  async createUser(login: string, password: string): Promise<User> {
    const userInformation = await this.mektepService.login(login, password)
    const encryptedPassword = encrypt(password)
    const newUser = new this.userModel({
        login,
        password: encryptedPassword,
        type: userInformation.UserType,
        email: userInformation.Email,
        shortName: userInformation.ShortName,
        fullName: userInformation.FullName
    });
    const user = await newUser.save();

    return user;
  }

  async getUserProfile(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username: username }).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
