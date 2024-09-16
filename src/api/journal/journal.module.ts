import { Module, OnModuleInit } from "@nestjs/common";
import { Model } from "mongoose";
import { JournalService } from "./journal.service";
import { SmsService } from "../sms/sms.service";

import * as cron from 'node-cron';
import { SmsModule } from "../sms/sms.module";
import { UserModule } from "../users/users.module";
import { UsersService } from "../users/users.service";
import { decrypt } from "src/utils/encryption";
import { MongooseModule } from "@nestjs/mongoose";
import { Subject, SubjectSchema } from "./schemas/subject.schema";
import { StudentSubject, StudentSubjectSchema } from "./schemas/studentSubject.schema";
import { Evaluation, EvaluationSchema } from "./schemas/evaluation.schema";
import { StudentEvaluation, StudentEvaluationSchema } from "./schemas/studentEvaluation.schema";
import { Rubric, RubricSchema } from "./schemas/rubric.schema";
import { StudentRubric, StudentRubricSchema } from "./schemas/studentRubric.schema";
import { MektepModule } from "../mektep/mektep.module";
@Module({
    imports: [SmsModule, UserModule,
        MongooseModule.forFeature([
            { name: Subject.name, schema: SubjectSchema },
            { name: StudentSubject.name, schema: StudentSubjectSchema },
            { name: Evaluation.name, schema: EvaluationSchema },
            { name: StudentEvaluation.name, schema: StudentEvaluationSchema },
            { name: Rubric.name, schema: RubricSchema },
            { name: StudentRubric.name, schema: StudentRubricSchema },
        ]), MektepModule
    ],
    providers: [JournalService, SmsService, UsersService],
    exports: [JournalService]
})
export class CronModule implements OnModuleInit {
    constructor(
        private readonly smsService: SmsService,
        private readonly journalService: JournalService,
        private readonly usersService: UsersService
    ) {}
  
    onModuleInit() {
        if (!this.usersService){
            console.error("Undefined users servie")
            console.log(this.smsService, this.journalService,this.usersService )
            return 
        }
      this.scheduleCronJobs();
    }

  
    private async scheduleCronJobs() {
    //   cron.schedule('0 0 * * *', async () => {
        const users = await this.usersService.getUsers()
        const city = "hbsh"
        for (const user of users){
            if (user.type != 1){
                continue
            }
            let StudentKlass = "7A"
            let StudentParallel = 7
            const password = decrypt(user.password)
            const login = await this.smsService.loginToSms(user.login, password, city)
            const cookies = login.cookies 
            const yearsObject = await this.smsService.getYears(city, cookies)
            const years = yearsObject.data 
            const currentYearPart = years[0].Name.slice(0, 4);
            const currentYear = parseInt(currentYearPart, 10);
            for (const yearObject of years){
                
                const yearPart = yearObject.Name.slice(0, 4);
                const year = parseInt(yearPart, 10);
                if (user.historyLoaded && year < currentYear){
                    break 
                }
                if (StudentParallel - 7 < currentYear - year){
                    break 
                }
                const yearId = yearObject.Id 
                const termsObject = await this.smsService.getTerms(city, cookies, yearId)
                const terms = termsObject.data.data
                let i = 4
                for (const term of terms){
                    const termId = term.Id 

                    const parallels = await this.smsService.getParallels(city, cookies, termId);
                    parallels.data.params.parallelId = parallels.data.data[0].Id
                    if (currentYear === year){
                        StudentParallel = parallels.data.data[0].Name 
                    }

                    const klasses = await this.smsService.getKlasses(city, cookies, parallels.data.params)
                    parallels.data.params.klassId = klasses.data.data[0].Id 
                    if (currentYear === year){
                        StudentKlass = parallels.data.data[0].Name 
                    }

                    const students = await this.smsService.getStudents(city, cookies, parallels.data.params)
                    if (!students.data.data || students.data.data.length === 0){
                        i -= 1
                        continue 
                    }
                    parallels.data.params.studentId = students.data.data[0].Id

                    const diaryLink = await this.smsService.getDiaryLink(city, cookies, parallels.data.params)
                    if(diaryLink.data.message === 'Нет утвержденной нагрузки на данную четверть!'){
                        continue 
                    }
                    const newCookies = await this.smsService.getNewCookies(cookies, parallels.data.params, diaryLink.data.data.Url)
                    const cookiesRecord: Record<string, string | null> = newCookies.cookies.reduce((acc, cookie) => {
                        const parts = cookie.split(';').map(part => part.trim());
                        const [keyValue] = parts;
                        const [key, value] = keyValue.split('=');
                        if (key) {
                            acc[key.trim()] = value ? value.trim() : null;
                        }
                        return acc;
                    }, {} as Record<string, string | null>);
                    const mergedCookies: Record<string, string | null> = { ...cookies, ...cookiesRecord };

                    const periodsDataObject = await this.smsService.getPeriodsData(city, mergedCookies, parallels.data.params,diaryLink.data.data.Url)
                    const periodsData = periodsDataObject.data.data 
                    for (const periodData of periodsData){
                        const evaluationIds = []
                        const savedPeriodData = await this.journalService.createSubject(periodData.Name, i, year)
                        let saucount = -1 
                        let current = 0
                        for (const evaluations of periodData.Evaluations){
                            const evaluationsDataObject = await this.smsService.getSubject(city, mergedCookies, periodData.JournalId, evaluations.Id)
                            const evaluationsData = evaluationsDataObject.data.data 
                            if (!evaluationsData){
                                continue
                            }
                            if (saucount === -1){
                                saucount = evaluationsData.length + 1
                            }
                            for (const evaluation of evaluationsData){
                                const rubricIds = []
                                const rubircsObject = await this.smsService.getRubrics(city, mergedCookies, evaluation.Id, evaluation.RubricId)
                                const rubrics = rubircsObject.data.data 
                                if (rubrics){
                                    for (const rubric of rubrics){
                                        const savedRubric = await this.journalService.createRubric(rubric.Criterion, rubric.LowDescriptor, rubric.MediumDescriptor, rubric.HighDescriptor)
                                        const savedUserRubric = await this.journalService.createStudentRubric(user._id as string, savedRubric._id as string, rubric.LowResult, rubric.MediumResult, rubric.HighResult)
                                        rubricIds.push(savedUserRubric._id as string )
                                    }
                                }
                                const savedEvaluation = await this.journalService.createEvaluation(evaluation.Name, i, year,evaluation.Description || "",evaluation.MaxScore)
                                
                                const monthDate = monthById(year, i,saucount, current )
                                
                                const savedUserEvaluation = await this.journalService.createStudentEvaluation(user._id as string, savedEvaluation._id as string,evaluation.Score, rubricIds, monthDate )
                                evaluationIds.push(savedUserEvaluation._id as string)
                                current ++
                            }
                        }
                        await this.journalService.createStudentSubject(user._id as string, savedPeriodData._id as string, periodData.Score, periodData.Mark,evaluationIds)
                    }
                    i-=1
                }
            }

            await this.usersService.updateUser(user.login, {klass: StudentKlass,  historyLoaded: true})
        }
        
      }
    // );
    // }
  }

  function monthById(year: number, term: number, number_of_sat: number, sau_id: number): Date {
    const monthDic: { [key: number]: number[] } = {
        1: [8, 9], 
        2: [10, 11], 
        3: [0, 1, 2], 
        4: [3, 4] 
    };
    
    let day = 15; 
    const number_of_sau = number_of_sat - 1; 
    
    console.log(year, term, number_of_sat, sau_id)
    const daysInTerm = monthDic[term].length * 30; 
    const slope_of_sau = daysInTerm / number_of_sau; 
    day += slope_of_sau * (sau_id);

    const month_id = Math.floor((day % daysInTerm) / 30); 
   
    if (month_id >= 0 && month_id < monthDic[term].length) {
        const month = monthDic[term][month_id];
        const dayInMonth = Math.floor(day % 30) + 1;
        return new Date(year, month, dayInMonth);
    } else {
        throw new Error('Invalid month index calculated.');
    }
}
