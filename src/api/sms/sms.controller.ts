import { Body, Controller, Get, Headers, Param, Post, Query, Res, UnauthorizedException } from "@nestjs/common";
import { SmsService } from "./sms.service";
import * as jwt from 'jsonwebtoken'  
import { setMaxIdleHTTPParsers } from "http";
import { UsersService } from "../users/users.service";
import { log } from "console";
import { Response } from 'express';
const SECRET_KEY = 'your_secret_key_here';

@Controller('sms')
export class SmsController{
    constructor(
        private readonly smsService: SmsService,
        private readonly usersService: UsersService
    ) {}

    @Post('login')
    async loginToSms(
        @Body() body: { login: string; password: string },
        @Query('city') city: string,
        @Headers('cookie') cookies: string | undefined,
        @Res() res: Response 
    ) {
        const { login, password } = body;
        const response = await this.smsService.loginToSms(login, password, city, cookies);

        if (response.status_code){
            res.status(response.status_code).send(response)
        }

        // let user = await this.usersService.findByLogin(login);
        // if (!user) {
        //     user = await this.usersService.createUser(login, password);
        // }

        const token = jwt.sign(
            { cookies: response.cookies, city: city },
            SECRET_KEY,
            { expiresIn: '1w' }
        );

        res.cookie('token', token, {
            httpOnly: true,  
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            message: response.message,
        });
    }

    @Get('years')
    async getYears(
        @Headers('cookie') cookies: string | undefined
    ) {
        if (!cookies) {
            throw new UnauthorizedException('No cookies found');
        }

        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (!tokenMatch) {
            throw new UnauthorizedException('Token not found in cookies');
        }

        const token = tokenMatch[1];

        try {
            const decoded: any = jwt.verify(token, SECRET_KEY);

            const { cookies: tokenCookies, city, userId } = decoded;

            const years = await this.smsService.getYears(city, tokenCookies);
            return years.data;

        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    @Get("terms")
    async getTerms(
        @Headers('cookie') cookies: string | undefined,
        @Query("yearId") yearId: string 
    ){
        if (!cookies) {
            throw new UnauthorizedException('No cookies found');
        }

        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (!tokenMatch) {
            throw new UnauthorizedException('Token not found in cookies');
        }

        const token = tokenMatch[1];

        try {
            const decoded: any = jwt.verify(token, SECRET_KEY);

            const { cookies: tokenCookies, city, userId } = decoded;

            const terms = await this.smsService.getTerms(city, tokenCookies, yearId);
            return terms.data.data;

        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    @Get('diary/:termId')
    async getTermData(
        @Param("termId") termId: string,
        @Headers('cookie') cookies: string | undefined,
        @Res() res: Response 
    ){
        if (!cookies) {
            throw new UnauthorizedException('No cookies found');
        }

        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (!tokenMatch) {
            throw new UnauthorizedException('Token not found in cookies');
        }

        const token = tokenMatch[1];

        try {
            const decoded: any = jwt.verify(token, SECRET_KEY);

            const { cookies: tokenCookies, city, userId } = decoded;

            const parallels = await this.smsService.getParallels(city, tokenCookies, termId);
            parallels.data.params.parallelId = parallels.data.data[0].Id
            console.log(parallels.data.params)
            const klasses = await this.smsService.getKlasses(city, tokenCookies, parallels.data.params)
            parallels.data.params.klassId = klasses.data.data[0].Id 
            const students = await this.smsService.getStudents(city, tokenCookies, parallels.data.params)
            parallels.data.params.studentId = students.data.data[0].Id
            console.log(parallels.data.params) 
            const diaryLink = await this.smsService.getDiaryLink(city, tokenCookies, parallels.data.params)
            const newCookies = await this.smsService.getNewCookies(tokenCookies, parallels.data.params, diaryLink.data.data.Url)
            const cookiesRecord: Record<string, string | null> = newCookies.cookies.reduce((acc, cookie) => {
                const parts = cookie.split(';').map(part => part.trim());
                const [keyValue] = parts;
                const [key, value] = keyValue.split('=');
                if (key) {
                    acc[key.trim()] = value ? value.trim() : null;
                }
                return acc;
            }, {} as Record<string, string | null>);
            const mergedCookies: Record<string, string | null> = { ...tokenCookies, ...cookiesRecord };
            console.log('Merged Cookies:', mergedCookies);       
            const periodsData = await this.smsService.getPeriodsData(city, mergedCookies, parallels.data.params,diaryLink.data.data.Url)
            
            const newtoken = jwt.sign(
                { cookies: mergedCookies, city: city, userId: userId },
                SECRET_KEY,
                { expiresIn: '1w' }
            );
            res.cookie('token', newtoken, {
                httpOnly: true,  
                secure: process.env.NODE_ENV === 'production', 
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
    
            res.send(periodsData.data.data)

        } catch (error) {
            console.log(error)
            throw new UnauthorizedException('Invalid token');
        }
    }

    @Get("subject")
    async getSubject(
        @Query("journalId") journalId: string ,
        @Query("evaluations") evaluations: string[],
        @Headers('cookie') cookies: string | undefined,
    ){
        if (!cookies) {
            throw new UnauthorizedException('No cookies found');
        }

        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (!tokenMatch) {
            throw new UnauthorizedException('Token not found in cookies');
        }

        const token = tokenMatch[1];
        const decoded: any = jwt.verify(token, SECRET_KEY);

        const { cookies: tokenCookies, city, userId } = decoded;

        const [subject1, subject2] = await Promise.all([
            this.smsService.getSubject(city, tokenCookies, journalId, evaluations[0]),
            this.smsService.getSubject(city, tokenCookies, journalId, evaluations[1]),
        ]);        
        return [subject1.data.data, subject2.data.data]
    }

    @Get("rubric")
    async getRubric(
        @Query("sectionId") sectionId: string ,
        @Query("rubricId") rubricId: string,
        @Headers('cookie') cookies: string | undefined,
    ){
        if (!cookies) {
            throw new UnauthorizedException('No cookies found');
        }

        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (!tokenMatch) {
            throw new UnauthorizedException('Token not found in cookies');
        }

        const token = tokenMatch[1];
        const decoded: any = jwt.verify(token, SECRET_KEY);

        const { cookies: tokenCookies, city, userId } = decoded;

        const rubric = await this.smsService.getRubrics(city, tokenCookies, sectionId, rubricId)
 
        return rubric.data.data
    }
}