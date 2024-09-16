import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Evaluation } from "./evaluation.schema";
import { User } from "src/api/users/users.schema";
import { Subject } from "./subject.schema";


@Schema({ timestamps: true })
export class StudentSubject extends Document{
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    student: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: Subject.name })
    subject: Types.ObjectId;

    @Prop({required: true})
    score: number 

    @Prop({required: true})
    mark: number 

    @Prop({ type: [{ type: Types.ObjectId, ref: Evaluation.name }], required: true })
    evaluations: Types.ObjectId[];
}

export const StudentSubjectSchema = SchemaFactory.createForClass(StudentSubject)