import { Controller, Get, Param } from "@nestjs/common";
import { UsersService } from "./users.service";


@Controller("users")
export class UsersController{
    constructor(
        private usersService: UsersService
    ) {}

    @Get("/:login")
    async getProfile(
        @Param("login") login: string
    ){
        const user = await this.usersService.findByLogin(login)
        user.password = ""
        return user 
    }
}