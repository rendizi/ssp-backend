import { Injectable } from "@nestjs/common";
import { ApiEndpoints } from "src/constants/apiEndpoints";
import proxy from "src/utils/proxy";
import {v4} from "uuid"
import * as jwt from 'jsonwebtoken';
import axios from "axios";
@Injectable()
export class MektepService{
    async login(username: string, password: string):Promise<LoginResponse>{
        const response = await proxy.post(
            ApiEndpoints.MEKTEP_LOGIN, 
            {
                deviceInfo:"SM-G950F",
                username,
                password,
                action: "/v1/Users/Authenticate",
                operationId: v4()
            }
        )
        const token = response.data.accessToken

        const decodedToken: any = jwt.decode(token);

        const userInfo = JSON.parse(decodedToken.UserInfo);

        const additional = await this.getAdditionalInformation(token)

        const loginResponse: LoginResponse = {
            UserType: userInfo.UserType,
            Email: userInfo.Email,
            ShortName: userInfo.ShortName,
            FullName: userInfo.FullName,
            Klass: additional.data.Klass,
            School: additional.data.School.Name.ru,
            PhotoUrl: additional.data.PhotoUrl
        };

        return loginResponse
    }

    async getAdditionalInformation(token: string):Promise<AdditionalResponse>{
        const response = await proxy.post<AdditionalResponse>(
            ApiEndpoints.MEKTEP_USER,
            {
                deviceInfo:"SM-G950F",
                action: "Api/AdditionalUserInfo",
                operationId: v4()
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        return response.data
    }
}