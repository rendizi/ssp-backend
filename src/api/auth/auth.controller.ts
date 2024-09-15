import { BadRequestException, Body, Controller, Get, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { log } from "console";
import { Response } from 'express';

@Controller('auth')
export class AuthController{
    constructor(
        private authService: AuthService,
        private readonly usersService: UsersService
    ) {}

    @Post("login")
    async signup(
        @Body() body, 
        @Res() res: Response
    ){
        const {login, password} = body
        if (!/^\d{12}$/.test(login)) {
            throw new BadRequestException('Login must be a 12-digit number.');
        }
        const existingUser = await this.usersService.findByLogin(login)
        let user;
        if (existingUser){
            user = await this.authService.validateUser(login, password)
            if (!user) {
                throw new UnauthorizedException();
              }
        }else{
            user = await this.usersService.createUser(login, password)
            if (!user){
                throw new BadRequestException()
            }
        }
        const { accessToken, refreshToken } = await this.authService.login(user);
  
        res.cookie('accessToken', accessToken, { httpOnly: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true });
        return res.send({ message: 'Login successful' });
    }

    @Post('refresh-token')
    async refreshToken(@Req() req, @Res() res: Response) {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new UnauthorizedException();
      }
  
      const newTokens = await this.authService.refreshToken(refreshToken);
      res.cookie('accessToken', newTokens.accessToken, { httpOnly: true });
      res.cookie('refreshToken', newTokens.refreshToken, { httpOnly: true });
      return res.send({ message: 'Token refreshed' });
    }

    @Get("logout") 
    async logout(@Req() req: any, @Res() res: Response) {
      res.clearCookie('accessToken'); 
      res.clearCookie('refreshToken')
      res.status(200).json({ message: 'Logged out successfully' });
    }
}