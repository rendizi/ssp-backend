import { Controller, Get, Query } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";


@Controller("dashboard")
export class DashboardController{
    constructor(
        private dashboardService: DashboardService
    ) {}


    @Get("overview/performace")
    async getSchoolOverview(
        @Query("year") year: number = 2024,
    ){
        return this.dashboardService.getPerformanceOverview(year)
    }

    @Get("overview/monthly")
    async getMonthly(
        @Query("year") year: number = 2024,
        @Query("firstTimePeriod") firstTimePeriod: number = 2024,
        @Query("secondTimePeriod") secondTimePeriod: number = 2023,
    ){
        return this.dashboardService.getMonthlyGpaOverview(year)
    }

    @Get("analitycs/parallel")
    async getParallelAnalitycs(
        @Query("parallel") parallel: number = 7,
        @Query("firstTimePeriod") firstTimePeriod: number = 2024,
        @Query("secondTimePeriod") secondTimePeriod: number = 2023,
    ){
        return this.dashboardService.getParallelAnalytics(firstTimePeriod, secondTimePeriod, parallel)
    }

    @Get("analitycs/grade")
    async getGradeAnalitycs(
        @Query("grade") grade: string = "7A",
        @Query("firstTimePeriod") firstTimePeriod: number = 2024,
        @Query("secondTimePeriod") secondTimePeriod: number = 2023,
    ){
        return this.dashboardService.getGradeAnalytics(grade, firstTimePeriod, secondTimePeriod)
    }

    @Get("analitycs/student")
    async getStudentAnalitics(
        @Query("student") student: string ,
        @Query("firstTimePeriod") firstTimePeriod: number = 2024,
        @Query("secondTimePeriod") secondTimePeriod: number = 2023,
    ){
        return this.dashboardService.getStudentAnalytics(student, firstTimePeriod, secondTimePeriod)
    }

    @Get("leaderboard")
    async getLeaderboard(
        @Query("year") year: number = 0,
        @Query("term") term: number = 0,
        @Query("grade") grade: string = "",
        @Query("parallel") parallel: number = 0
    ) {
        const yearParam = year > 0 ? year : undefined;
        const termParam = term > 0 ? term : undefined;
        const gradeParam = grade !== "" ? grade : undefined;
        const parallelParam = parallel > 0 ? parallel : undefined;

        return this.dashboardService.getLeaderboard(yearParam, termParam, gradeParam, parallelParam);
    }
}