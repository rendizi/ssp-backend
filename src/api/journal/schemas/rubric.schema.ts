import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Rubric extends Document{
    @Prop({required: true})
    criterion: string 

    @Prop({required: true})
    lowDescriptor: string 

    @Prop({required: true})
    mediumDescriptor: string 

    @Prop({required: true})
    highDescriptor: string 
}

export const RubricSchema = SchemaFactory.createForClass(Rubric)