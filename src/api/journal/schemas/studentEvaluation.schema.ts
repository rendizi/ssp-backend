import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Evaluation } from "./evaluation.schema";
import { User } from "src/api/users/users.schema";
import { Subject } from "./subject.schema";
import { Rubric } from "./rubric.schema";


@Schema({ timestamps: true })
export class StudentEvaluation extends Document {
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    student: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: Evaluation.name })
    evaluation: Types.ObjectId;

    @Prop({ required: true })
    score: number;

    @Prop({ type: [{ type: Types.ObjectId, ref: Rubric.name }], required: true })
    rubrics: Types.ObjectId[];

    @Prop({ type: Date, required: true }) 
    writtenTime: Date;
}

export const StudentEvaluationSchema = SchemaFactory.createForClass(StudentEvaluation)