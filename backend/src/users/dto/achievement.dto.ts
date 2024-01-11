import { Expose } from 'class-transformer'

export class AchievementDto {

    @Expose()
    id: number;

    @Expose()
    title: string;

    @Expose()
    description: string;

    @Expose()
    image: string;
}
