import { Prop, Schema } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Evaluation extends Document{
    @Prop({required: true})
    name: string 

    @Prop({required: true})
    score: number 

    @Prop({required: true})
    maxScore: number 
}