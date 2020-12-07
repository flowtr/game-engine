import { TypedArray } from "@toes/core";

export interface ITransform {
    position: ITensor;
}

export interface ITensor<
    S extends number[] = number[],
    T extends TypedArray = TypedArray
> {
    data: T;
    size: S;
}
