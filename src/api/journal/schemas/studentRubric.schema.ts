import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Evaluation } from "./evaluation.schema";
import { User } from "src/api/users/users.schema";
import { Subject } from "./subject.schema";
import { Rubric } from "./rubric.schema";


@Schema({ timestamps: true })
export class StudentRubric extends Document{
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    student: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: Rubric.name })
    rubric: Types.ObjectId;

    @Prop({required: true})
    lowResult: boolean

    @Prop({required: true})
    mediumResult: boolean

    @Prop({required: true})
    highResult: boolean
}

export const StudentRubricSchema = SchemaFactory.createForClass(StudentRubric)