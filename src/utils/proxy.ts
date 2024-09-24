import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import * as https from 'https';
import * as cookie from "cookie"

const httpsAgent = new https.Agent({  
  rejectUnauthorized: false
});

const proxy = axios.create({
    httpsAgent,
    proxy: {
        host: process.env.PROXY_HOST,
        port: 3128,
        protocol: 'https'
    }
});

proxy.interceptors.request.use((config) => {
    config.headers['user-agent'] = 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0';
    config.headers.cookie = 'Culture=ru-RU;';
    return config;
});

proxy.interceptors.response.use((response: AxiosResponse) => {
    const cookiesHeader = response.headers['set-cookie'] as string[] | undefined;

    if (cookiesHeader) {
        const parsedCookies = cookiesHeader.reduce((acc: Record<string, string>, cookieString: string) => {
            const parsed = cookie.parse(cookieString);
            return { ...acc, ...parsed };
        }, {});

        response.data = {
            ...response.data,
            cookies: parsedCookies
        };
    }

    return response;
}, (error) => {
    return Promise.reject(error);
});

export default proxy;
