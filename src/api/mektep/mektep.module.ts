import { Module } from "@nestjs/common";
import { MektepService } from "./mektep.service";


@Module({
    providers: [MektepService],
    exports: [MektepService]
})

export class MektepModule {}