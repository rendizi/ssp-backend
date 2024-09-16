import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Evaluation } from "./evaluation.schema";
import { User } from "src/api/users/users.schema";


@Schema()
export class Subject extends Document{
    @Prop({required: true})
    name: string 

    @Prop({required: true})
    term: number 

    @Prop({required: true})
    year: number  
}

export const SubjectSchema = SchemaFactory.createForClass(Subject)