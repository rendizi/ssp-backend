import { BaseUrls } from "./baseUrls";

export const ApiEndpoints = {
    MEKTEP_LOGIN: `${BaseUrls.IDENTITY_MEKTEP}/v1/Users/Authenticate`,
    MEKTEP_USER: `${BaseUrls.CONTI_MEKTEP}/Api/AdditionalUserInfo`,
    SMS_LOGIN: (city: string) => `${BaseUrls.SMS(city)}/root/Account/LogOn`,
    SMS_YEARS: (city: string) => `${BaseUrls.SMS(city)}/Ref/GetSchoolYears?fullData=true&page=1&start=0&limit=100`,
    SMS_TERMS: (city: string) => `${BaseUrls.SMS(city)}/Ref/GetPeriods`,
    SMS_PARALLELS: (city: string) => `${BaseUrls.SMS(city)}/JceDiary/GetParallels`,
    SMS_KLASSES: (city: string) => `${BaseUrls.SMS(city)}/JceDiary/GetKlasses`,
    SMS_STUDENTS: (city: string) => `${BaseUrls.SMS(city)}/JceDiary/GetStudents`,
    SMS_DIARY_LINK: (city: string) => `${BaseUrls.SMS(city)}/JceDiary/GetJceDiary`,
    SMS_PERIODS_DATA: (city: string) => `${BaseUrls.SMS(city)}/Jce/Diary/GetSubjects`,
    SMS_EVALUATIONS: (city: string) => `${BaseUrls.SMS(city)}/Jce/Diary/GetResultByEvalution`,
    SMS_RUBRIC: (city: string) => `${BaseUrls.SMS(city)}/Jce/Diary/GetRubricResults`
}