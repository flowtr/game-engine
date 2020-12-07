import { Tensor, Vector } from "@toes/core";

export type IShape2DSerialization<E = Record<string, unknown>> = E & {
    position: number[];
    origin: number[];
};

/** Represents a basic 2D shape. */
export interface IShape2D {
    /** The position of this shape. */
    position: Tensor<Vector<2>>;

    /** The origin of this shape. */
    origin: Tensor<Vector<2>>;

    /** The offset of this shape. */
    readonly offset: Tensor<Vector<2>>;

    /**
     * Sets the properties of this shape from the provided json.
     * @param json The json to set from.
     */
    setFromJson(json: IShape2DSerialization): void;

    /**
     * Indicates if this shape intersects the other shape.
     * @param other The other shape to check.
     */
    intersects(other: IShape2D): boolean;

    /**
     * Indicates if the provided point is contained within this shape.
     * @param point The point to check.
     */
    pointInShape(point: Tensor<Vector<2>>): boolean;
}
