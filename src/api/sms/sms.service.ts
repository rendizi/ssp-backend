import { Injectable } from "@nestjs/common";
import axios, { AxiosRequestConfig } from "axios";
import { Interface } from "readline";
import { ApiEndpoints } from "src/constants/apiEndpoints";
import { BaseUrls } from "src/constants/baseUrls";
import proxy from "src/utils/proxy";
import internal from "stream";


@Injectable()
export class SmsService {

    private async sendRequest(method: 'get' | 'post', url: string, params?: any, cookies?: Record<string, string | null>, referef?: string) {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
            'Cookie': cookies ? this.cookiesToString(cookies) : undefined,
            'Referer': referef ? referef : undefined
        };

        try {
            const response = method === 'post'
                ? await axios.post(url, new URLSearchParams(params).toString(), { headers })
                : await axios.get(url, { headers });
                
            if (response.status !== 200) {
                return { success: false, message: 'Request failed', status_code: response.status };
            }
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async loginToSms(login: string, password: string, city: string, cookies?: string) {
        const url = ApiEndpoints.SMS_LOGIN(city);
        const params = {
            login: login || '',
            password: password || '',
            captchaInput: '',
            twoFactorAuthCode: '',
            application2FACode: ''
        };
        const response = await axios.post(url, new URLSearchParams(params).toString(), { 
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...(cookies && { 'Cookie': cookies }) } 
        });
        return response.status !== 200
            ? { success: false, message: 'Request failed', status_code: response.status }
            : response.data;
    }

    async getYears(city: string, cookies: Record<string, string | null>) {
        const url = ApiEndpoints.SMS_YEARS(city);
        const response = await this.sendRequest('get', url, undefined, cookies);
        if (response.success) {
            const transformedData = response.data.data.map((year: any) => ({
                Name: year.Name,
                Id: year.Id,
                isActual: year.Data?.IsActual
            }));
            return { success: true, data: transformedData };
        }
        return response.data;
    }

    async getTerms(city: string, cookies: Record<string, string | null>, yearId: string) {
        const url = ApiEndpoints.SMS_TERMS(city);
        return this.sendRequest('post', url, { schoolYearId: yearId }, cookies);
    }

    async getParallels(city: string, cookies: Record<string, string | null>, termId: string) {
        const url = ApiEndpoints.SMS_PARALLELS(city);
        const response = await this.sendRequest('post', url, { periodId: termId }, cookies);
        if (response.success) response.data.params = { periodId: termId };
        return response;
    }

    async getKlasses(city: string, cookies: Record<string, string | null>, params: { periodId: string; parallelId: string }) {
        const url = ApiEndpoints.SMS_KLASSES(city);
        const response = await this.sendRequest('post', url, params, cookies);
        if (response.success) response.data.params = params;
        return response;
    }

    async getStudents(city: string, cookies: Record<string, string | null>, params: { periodId: string; parallelId: string; klassId: string }) {
        const url = ApiEndpoints.SMS_STUDENTS(city);
        const response = await this.sendRequest('post', url, params, cookies);
        if (response.success) response.data.params = params;
        return response;
    }

    async getDiaryLink(city: string, cookies: Record<string, string | null>, params: { periodId: string; parallelId: string; klassId: string; studentId: string }) {
        const url = ApiEndpoints.SMS_DIARY_LINK(city);
        const response = await this.sendRequest('post', url, params, cookies);
        if (response.success) response.data.params = params;
        return response;
    }

    async getNewCookies(cookies: Record<string, string | null>, params: { periodId: string; parallelId: string; klassId: string; studentId: string }, url: string) {
        const headers: AxiosRequestConfig['headers'] = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
            'Cookie': cookies ? this.cookiesToString(cookies) : undefined
        };
        
        const response = await axios.get(url,  { 
            headers 
        });
            const responseCookies = response.headers['set-cookie'] || [];
            const extractedCookies = responseCookies.map(cookie => cookie.split(';')[0]);
            return {params, cookies: extractedCookies };
            }

    async getPeriodsData(city: string, cookies: Record<string, string | null>, params: { periodId: string; parallelId: string; klassId: string; studentId: string }, referer: string ) {
        const url = ApiEndpoints.SMS_PERIODS_DATA(city);
        const response = await this.sendRequest('post', url, params, cookies, referer);
        if (response.success) response.data.params = params;
        return response;
    }

    async getSubject(city: string, cookies: Record<string, string | null>, journalId: string, evalId: string){
        const params = {
            journalId,
            evalId
        }
        const url = ApiEndpoints.SMS_EVALUATIONS(city)
        const response = await this.sendRequest('post', url, params, cookies)
        if (response.success) response.data.params = params 
        return response 
    }

    async getRubrics(city: string,  cookies: Record<string, string | null>, sectionId: string, rubricId: string){
        const params = {
            sectionId,
            rubricId
        }
        const url = ApiEndpoints.SMS_RUBRIC(city)
        const response = await this.sendRequest('post', url, params, cookies)
        if (response.success) response.data.params = params 
        return response 
    }

    private cookiesToString(cookies: Record<string, string | null>): string {
        return Object.entries(cookies)
            .filter(([_, value]) => value !== null)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }
}