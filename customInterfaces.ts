export interface DataRes {
    baseTemperature: number;
    monthlyVariance: Array<{ year: number, month: number, variance: number }>
}