import { Module } from "@nestjs/common";
import { SmsController } from "./sms.controller";
import { SmsService } from "./sms.service";
import { UserModule } from "../users/users.module";


@Module({
    imports: [UserModule],
    controllers: [SmsController],
    providers: [SmsService],
    exports: [SmsService]
})

export class SmsModule {}