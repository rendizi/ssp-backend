import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Subject } from "../journal/schemas/subject.schema";
import { StudentSubject } from "../journal/schemas/studentSubject.schema";
import { Evaluation } from "../journal/schemas/evaluation.schema";
import { StudentEvaluation } from "../journal/schemas/studentEvaluation.schema";
import { Rubric } from "../journal/schemas/rubric.schema";
import { StudentRubric } from "../journal/schemas/studentRubric.schema";
import { Model, ObjectId, Types } from "mongoose";
import { User } from "../users/users.schema";

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Subject.name) private subjectModel: Model<Subject>,
        @InjectModel(StudentSubject.name) private studentSubjectModel: Model<StudentSubject>,
        @InjectModel(Evaluation.name) private evaluationModel: Model<Evaluation>,
        @InjectModel(StudentEvaluation.name) private studentEvaluationModel: Model<StudentEvaluation>,
        @InjectModel(Rubric.name) private rubricModel: Model<Rubric>,
        @InjectModel(StudentRubric.name) private studentRubricModel: Model<StudentRubric>,
    ) {}

    private async getStudentSubjects(studentIds: Types.ObjectId[], subjectIds: Types.ObjectId[]) {
        return this.studentSubjectModel.find({
            student: { $in: studentIds },
            subject: { $in: subjectIds },
        }).populate({
            path: 'subject',
            select: 'year term'
        }).exec();
    }

    private createTermSubjectMap(subjects: any[]) {
        return subjects.reduce((acc, subject) => {
            const key = `${subject.year}-${subject.term}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(subject._id as Types.ObjectId);
            return acc;
        }, {} as Record<string, Types.ObjectId[]>);
    }

    private calculateAverageGpaByTerm(studentSubjects: any[]) {
        const gpaMap = new Map<string, number[]>();

        studentSubjects.forEach(record => {
            const subject = record.subject as unknown as { year: number, term: number };
            const key = `${subject.year}-${subject.term}`;
            if (!gpaMap.has(key)) gpaMap.set(key, []);
            gpaMap.get(key)?.push(record.score);
        });

        return Array.from(gpaMap.entries()).map(([key, scores]) => {
            const [year, term] = key.split('-').map(Number);
            const averageGpa = scores.reduce((a, b) => a + b, 0) / scores.length;
            return { year, term, averageGpa: this.roundToThreeSignificantDigits(averageGpa) };
        });
    }

    private roundToThreeSignificantDigits(num: number): number {
        return Number(num.toFixed(1));
    }

    async getPerformanceOverview(year: number): Promise<any> {
        const students = await this.userModel.find({ type: 1 }).exec();

        const subjects = await this.subjectModel.find({ 
            year: { $in: [year, year - 1] } 
        }).exec();

        const termSubjectMap = this.createTermSubjectMap(subjects);

        const studentSubjects = await this.studentSubjectModel.find({
            student: { $in: students.map(student => student._id) },
            subject: { $in: Object.values(termSubjectMap).flat() },
        }).populate({
            path: 'subject',
            select: 'year term'
        }).exec();

        return this.calculateAverageGpaByTerm(studentSubjects);
    }

    async getMonthlyGpaOverview(year: number): Promise<any> {
        const startOfCurrentYear = new Date(year, 8, 1); // September 1st of the current year
        const endOfCurrentYear = new Date(year + 1, 4, 31); // May 31st of the next year
    
        const startOfPrevYear = new Date(year - 1, 8, 1); // September 1st of the previous year
        const endOfPrevYear = new Date(year, 4, 31); // May 31st of the current year
    
        const evaluations = await this.evaluationModel.find({
            year: { $in: [year, year - 1, year + 1] }
        }).exec();
    
        const evaluationIds = evaluations.map(evaluation => evaluation._id);
    
        const studentEvaluations = await this.studentEvaluationModel.find({
            evaluation: { $in: evaluationIds },
            writtenTime: { $gte: startOfPrevYear, $lte: endOfCurrentYear }
        }).populate({
            path: 'evaluation',
            select: 'maxScore'
        }).exec();
    
        const calculateMonthlyGpa = (records: any[], startDate: Date, endDate: Date) => {
            const monthGpaMap = new Map<number, number[]>();
            records.forEach(record => {
                const writtenTime = new Date(record.writtenTime);
                if (writtenTime >= startDate && writtenTime <= endDate) {
                    const month = writtenTime.getMonth() + 1;
                    const percentageScore = (record.score / record.evaluation.maxScore) * 100;
                    if (!monthGpaMap.has(month)) monthGpaMap.set(month, []);
                    monthGpaMap.get(month)?.push(percentageScore);
                }
            });
    
            return Array.from(monthGpaMap.entries()).map(([month, scores]) => {
                const averageGpa = scores.reduce((a, b) => a + b, 0) / scores.length;
                return { month, averageGpa: this.roundToThreeSignificantDigits(averageGpa) };
            });
        };
    
        const prevYearMonthlyGpa = calculateMonthlyGpa(studentEvaluations, startOfPrevYear, endOfPrevYear);
        const currentYearMonthlyGpa = calculateMonthlyGpa(studentEvaluations, startOfCurrentYear, endOfCurrentYear);
    
        return {
            previousYear: prevYearMonthlyGpa,
            currentYear: currentYearMonthlyGpa
        };
    }
    
    

    async getParallelAnalytics(firstYear: number, secondYear: number, parallel: number) {
        const students = await this.userModel.find({ type: 1, parallel }).exec();

        const subjects = await this.subjectModel.find({ 
            year: { $in: [firstYear, firstYear + 1, secondYear, secondYear + 1] } 
        }).exec();

        const termSubjectMap = this.createTermSubjectMap(subjects);

        const studentSubjects = await this.studentSubjectModel.find({
            student: { $in: students.map(student => student._id) },
            subject: { $in: Object.values(termSubjectMap).flat() },
        }).populate({
            path: 'subject',
            select: 'year term'
        }).exec();

        return this.calculateAverageGpaByTerm(studentSubjects);
    }

    async getGradeAnalytics(grade: string, firstYear: number, secondYear: number) {
        const students = await this.userModel.find({ type: 1, klass: grade }).exec();

        const subjects = await this.subjectModel.find({ 
            year: { $in: [firstYear, firstYear + 1, secondYear, secondYear + 1] } 
        }).exec();

        const termSubjectMap = this.createTermSubjectMap(subjects);

        const studentSubjects = await this.studentSubjectModel.find({
            student: { $in: students.map(student => student._id) },
            subject: { $in: Object.values(termSubjectMap).flat() },
        }).populate({
            path: 'subject',
            select: 'year term'
        }).exec();

        return this.calculateAverageGpaByTerm(studentSubjects);
    }

    async getStudentAnalytics(student: string, firstYear: number, secondYear: number) {
        const students = await this.userModel.find({ type: 1, fullName: student }).exec();

        const subjects = await this.subjectModel.find({ 
            year: { $in: [firstYear, firstYear + 1, secondYear, secondYear + 1] } 
        }).exec();

        const termSubjectMap = this.createTermSubjectMap(subjects);

        const studentSubjects = await this.studentSubjectModel.find({
            student: { $in: students.map(student => student._id) },
            subject: { $in: Object.values(termSubjectMap).flat() },
        }).populate({
            path: 'subject',
            select: 'year term'
        }).exec();

        return this.calculateAverageGpaByTerm(studentSubjects);
    }

    private async getFilteredStudentSubjects(year?: number, term?: number, grade?: string, parallel?: number) {
        let query: any = {};

        if (grade) {
            query['klass'] = grade;
        }

        if (parallel) {
            query['parallel'] = parallel;
        }

        const students = await this.userModel.find({ type: 1, ...query }).select('-password').exec();
        const studentIds = students.map(student => student._id);

        const subjectsQuery: any = {};
        if (year) {
            subjectsQuery['year'] = year;
        }

        const subjects = await this.subjectModel.find(subjectsQuery).exec();
        const termSubjectMap = this.createTermSubjectMap(subjects);
        const subjectIds = Object.values(termSubjectMap).flat();

        let studentSubjectsQuery: any = {
            student: { $in: studentIds },
            subject: { $in: subjectIds }
        };

        if (term) {
            studentSubjectsQuery['subject.term'] = term;
        }

        return this.studentSubjectModel.find(studentSubjectsQuery)
            .populate({
                path: 'subject',
                select: 'year term'
            }).exec();
    }

    private aggregateGpaByStudent(studentSubjects: any[]) {
        const studentGpaMap = new Map<string, number[]>();

        studentSubjects.forEach(record => {
            const studentId = record.student.toString();
            if (!studentGpaMap.has(studentId)) studentGpaMap.set(studentId, []);
            studentGpaMap.get(studentId)?.push(record.score);
        });

        return Array.from(studentGpaMap.entries()).map(([studentId, scores]) => {
            const averageGpa = scores.reduce((a, b) => a + b, 0) / scores.length;
            return { studentId, averageGpa: this.roundToThreeSignificantDigits(averageGpa) };
        });
    }

    async getLeaderboard(year?: number, term?: number, grade?: string, parallel?: number): Promise<any[]> {
        const studentSubjects = await this.getFilteredStudentSubjects(year, term, grade, parallel);
        const studentGpaData = this.aggregateGpaByStudent(studentSubjects);

        // Fetch student details for the leaderboard
        const studentIds = studentGpaData.map(data => data.studentId);
        const students = await this.userModel.find({ _id: { $in: studentIds } }).exec();

        // Create a map of studentId to student details
        const studentDetailsMap = new Map<string, any>();
        students.forEach(student => {
            studentDetailsMap.set(student._id.toString(), student);
        });

        // Combine student GPA data with student details
        return studentGpaData.map(data => ({
            ...studentDetailsMap.get(data.studentId)._doc,
            averageGpa: data.averageGpa
        })).sort((a, b) => b.averageGpa - a.averageGpa); // Sort by GPA descending
    }
}
