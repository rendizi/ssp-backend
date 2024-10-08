import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Rubric } from "./rubric.schema";
import { User } from "src/api/users/users.schema";

@Schema()
export class Evaluation extends Document{
    @Prop({required: true})
    name: string 

    @Prop({required: true})
    term: number 

    @Prop({required: true})
    year: number  

    @Prop({required: false, default:""})
    description: string 

    @Prop({required: true})
    maxScore: number 
}

export const EvaluationSchema = SchemaFactory.createForClass(Evaluation)