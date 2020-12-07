import { Tensor, Vector } from "@toes/core";
import { IShape2D, IShape2DSerialization } from "./IShape2D";
import { Rectangle2D } from "./Rectangle2d";

/** Represents a 2D circle. */
export class Circle2D implements IShape2D {
    /** The position of this shape. */
    public position: Tensor<Vector<2>> = Tensor.zeros([2]);

    /** The origin of this shape. */
    public origin: Tensor<Vector<2>> = Tensor.zeros([2]);

    /** The redius of this circle. */
    public radius: number;

    /** The offset of this shape. */
    public get offset(): Tensor<Vector<2>> {
        return Tensor.from(
            this.radius + this.radius * this.origin.x,
            this.radius + this.radius * this.origin.y
        );
    }

    /**
     * Sets the properties of this shape from the provided json.
     * @param json The json to set from.
     */
    public setFromJson(json: IShape2DSerialization): void {
        if (json.position !== undefined) this.position.set(...json.position);

        if (json.origin !== undefined) this.origin.set(...json.origin);

        if (json.radius === undefined) {
            throw new Error("Rectangle2D requires radius to be present.");
        }
        this.radius = Number(json.radius);
    }

    /**
     * Indicates if this shape intersects the other shape.
     * @param other The other shape to check.
     */
    public intersects(other: IShape2D): boolean {
        if (other instanceof Circle2D) {
            let distance = Math.abs(other.position.distance(this.position));
            let radiusLengths = this.radius + other.radius;
            if (distance <= radiusLengths) {
                return true;
            }
        }

        if (other instanceof Rectangle2D) {
            let deltaX =
                this.position.x -
                Math.max(
                    other.position.x,
                    Math.min(this.position.x, other.position.x + other.width)
                );
            let deltaY =
                this.position.y -
                Math.max(
                    other.position.y,
                    Math.min(this.position.y, other.position.y + other.height)
                );
            if (deltaX * deltaX + deltaY * deltaY < this.radius * this.radius) {
                return true;
            }
        }

        return false;
    }

    /**
     * Indicates if the provided point is contained within this shape.
     * @param point The point to check.
     */
    public pointInShape(point: Tensor<Vector<2>>): boolean {
        let absDistance = Math.abs(this.position.distance(point));
        if (absDistance <= this.radius) {
            return true;
        }

        return false;
    }
}
