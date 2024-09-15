import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './api/users/users.module';
import { AuthModule } from './api/auth/auth.module';
import { SmsModule } from './api/sms/sms.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    UserModule,
    AuthModule,
    SmsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
