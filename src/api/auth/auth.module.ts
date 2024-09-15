import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthController } from "./auth.controller";


@Module({
    imports: [
        JwtModule.register({
            secret: 'yourSecretKey',
            signOptions: {expiresIn: '1h'}
        }),
        UserModule,
    ],
    providers: [AuthService, JwtStrategy, JwtAuthGuard],
    controllers: [AuthController],
    exports: [AuthService, JwtAuthGuard]
})

export class AuthModule {}