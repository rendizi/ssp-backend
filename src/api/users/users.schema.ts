import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';


@Schema()
export class User extends Document{
    @Prop({required: true, unique: true})
    login: string 

    @Prop({required: true})
    password: string 

    @Prop({required: true, default: 1})
    type: number

    @Prop({required: true})
    email: string 

    @Prop({required: true})
    shortName: string 

    @Prop({required: true})
    fullName: string 
}

export const UserSchema = SchemaFactory.createForClass(User)