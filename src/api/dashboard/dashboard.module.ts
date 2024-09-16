import { Module } from "@nestjs/common";
import { CronModule } from "../journal/journal.module";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Subject, SubjectSchema } from "../journal/schemas/subject.schema";
import { StudentSubject, StudentSubjectSchema } from "../journal/schemas/studentSubject.schema";
import { Evaluation, EvaluationSchema } from "../journal/schemas/evaluation.schema";
import { StudentEvaluation, StudentEvaluationSchema } from "../journal/schemas/studentEvaluation.schema";
import { Rubric, RubricSchema } from "../journal/schemas/rubric.schema";
import { StudentRubric, StudentRubricSchema } from "../journal/schemas/studentRubric.schema";
import { UserModule } from "../users/users.module";


@Module({
    imports: [
        CronModule,
        MongooseModule.forFeature([
            { name: Subject.name, schema: SubjectSchema },
            { name: StudentSubject.name, schema: StudentSubjectSchema },
            { name: Evaluation.name, schema: EvaluationSchema },
            { name: StudentEvaluation.name, schema: StudentEvaluationSchema },
            { name: Rubric.name, schema: RubricSchema },
            { name: StudentRubric.name, schema: StudentRubricSchema },
        ]),
        UserModule
    ],
    providers: [DashboardService],
    controllers: [DashboardController]
})

export class DashboardModule {}