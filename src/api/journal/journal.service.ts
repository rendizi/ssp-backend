import { Injectable, ConflictException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {  Model } from "mongoose";
import { Subject } from "./schemas/subject.schema";
import { StudentSubject } from "./schemas/studentSubject.schema";
import { Evaluation } from "./schemas/evaluation.schema";
import { StudentEvaluation } from "./schemas/studentEvaluation.schema";
import { Rubric } from "./schemas/rubric.schema";
import { StudentRubric } from "./schemas/studentRubric.schema";

@Injectable()
export class JournalService {
    constructor(
        @InjectModel(Subject.name) private subjectModel: Model<Subject>,
        @InjectModel(StudentSubject.name) private studentSubjectModel: Model<StudentSubject>,
        @InjectModel(Evaluation.name) private evaluationModel: Model<Evaluation>,
        @InjectModel(StudentEvaluation.name) private studentEvaluationModel: Model<StudentEvaluation>,
        @InjectModel(Rubric.name) private rubricModel: Model<Rubric>,
        @InjectModel(StudentRubric.name) private studentRubricModel: Model<StudentRubric>,
    ){}

    async createEvaluation(name: string, term: number, year: number, description: string = ' ', maxScore: number) {
        const existingEvaluation = await this.evaluationModel.findOne({ name, term, year }).exec();
        if (existingEvaluation) {
            return existingEvaluation;
        }
    
        const evaluation = new this.evaluationModel({
            name,
            term,
            year,
            description,
            maxScore
        });
    
        await evaluation.save();
        return evaluation;
    }
    

    async createSubject(name: string, term: number, year: number) {
        const existingSubject = await this.subjectModel.findOne({ name, term, year }).exec();
        if (existingSubject) {
            return existingSubject;
        }

        const subject = new this.subjectModel({ name, term, year });
        await subject.save();
        return subject;
    }

    async createRubric(criterion: string, lowDescriptor: string, mediumDescriptor: string, highDescriptor: string) {
        const existingRubric = await this.rubricModel.findOne({ criterion }).exec();
        if (existingRubric) {
            return existingRubric;
        }

        const rubric = new this.rubricModel({ criterion, lowDescriptor, mediumDescriptor, highDescriptor });
        await rubric.save();
        return rubric;
    }

    async createStudentRubric(studentId: string, rubricId: string, lowResult: boolean, mediumResult: boolean, highResult: boolean) {
        const existingStudentRubric = await this.studentRubricModel.findOne({ student: studentId, rubric: rubricId }).exec();
        if (existingStudentRubric) {
            return existingStudentRubric;
        }

        const studentRubric = new this.studentRubricModel({
            student: studentId,
            rubric: rubricId,
            lowResult,
            mediumResult,
            highResult
        });
        await studentRubric.save();
        return studentRubric;
    }

    async createStudentEvaluation(studentId: string, evaluationId: string, score: number, rubrics: string[], month: Date) {
        const existingStudentEvaluation = await this.studentEvaluationModel.findOne({ student: studentId, evaluation: evaluationId }).exec();
        if (existingStudentEvaluation) {
            return existingStudentEvaluation;
        }

        const newStudentEvaluation = new this.studentEvaluationModel({
            student: studentId,
            evaluation: evaluationId,
            score,
            rubrics,
            writtenTime: month
        });
        await newStudentEvaluation.save();
        return newStudentEvaluation;
    }

    async createStudentSubject(studentId: string, subjectId: string, score: number, mark: number, evaluations: string[]) {
        const existingStudentSubject = await this.studentSubjectModel.findOne({ student: studentId, subject: subjectId }).exec();
        if (existingStudentSubject) {
            return existingStudentSubject;
        }

        const newStudentSubjects = new this.studentSubjectModel({
            student: studentId,
            subject: subjectId,
            score,
            mark,
            evaluations
        });
        await newStudentSubjects.save();
        return newStudentSubjects;
    }
}
