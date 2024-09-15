import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { UsersService } from "../users/users.service";
import { decrypt } from "src/utils/encryption";

@Injectable()
export class AuthService{
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService
    ) {}

    async validateUser(login: string, password: string): Promise<any> {
        const user = await this.usersService.findByLogin(login);
        if (user && (decrypt(user.password) === password)) {
          const { password, ...result } = user;
          return result;
        }
        return null;
      }

      async login(user: any) {
        const payload = { email: user._doc.login, sub: user._doc._id };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    
        return {
          accessToken,
          refreshToken,
        };
      }

      async refreshToken(refreshToken: string): Promise<any> {
        try {
          const payload = this.jwtService.verify(refreshToken);
          const user = await this.usersService.findByLogin(payload.email);
          if (!user) {
            throw new UnauthorizedException('User not found');
          }
          const newPayload = { email: user.email, sub: (user as any)._id };
          const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
          return {
            accessToken: newAccessToken,
            refreshToken, 
          };
        } catch (error) {
          throw new UnauthorizedException('Invalid refresh token');
        }
      }
    
}