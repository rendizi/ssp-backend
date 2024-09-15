import { Injectable } from "@nestjs/common";
import { ApiEndpoints } from "src/constants/apiEndpoints";
import proxy from "src/utils/proxy";
import {v4} from "uuid"
import * as jwt from 'jsonwebtoken';
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

        const loginResponse: LoginResponse = {
            UserType: userInfo.UserType,
            Email: userInfo.Email,
            ShortName: userInfo.ShortName,
            FullName: userInfo.FullName
        };

        return loginResponse
    }
}