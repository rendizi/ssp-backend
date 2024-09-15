import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./users.schema";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { MektepService } from "../mektep/mektep.service";
import { MektepModule } from "../mektep/mektep.module";


@Module({
    imports:[
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
        MektepModule
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService, MongooseModule]
})

export class UserModule {}