import { Tensor, Vector } from "@toes/core";
import { ITransform } from "../Data/math";
import { Matrix4x4 } from "./Matrix4x4";

/**
 * Represents the transformation of an object, providing position, rotation and scale.
 */
export class Transform implements ITransform {
    /** The position. Default: Tensor.zeros([3]) */
    public position: Tensor<Vector> = Tensor.VECTOR_ZERO;

    /** The rotation. Default: Tensor.zeros([3]) */
    public rotation: Tensor<Vector> = Tensor.VECTOR_ZERO;

    /** The rotation. Default: Vector3.one */
    public scale: Tensor<Vector> = Tensor.fill([3], 1);

    constructor(
        position?: Tensor<Vector>,
        rotation?: Tensor<Vector>,
        scale?: Tensor<Vector>
    ) {
        if (position) this.position = position;
        if (rotation) this.rotation = rotation;
        if (scale) this.scale = scale;
    }

    /**
     * Creates a copy of the provided transform.
     * @param transform The transform to be copied.
     */
    public clone(): Transform {
        return new Transform(
            this.position.clone(),
            this.rotation.clone(),
            this.scale.clone()
        );
    }

    setFromJson(transform: unknown) {
        const t = transform as Record<string, Record<string, unknown>>;
        this.position = new Tensor(t.position.data as number[]);
        this.rotation = new Tensor(t.rotation.data as number[]);
        this.scale = new Tensor(t.scale.data as number[]);
    }

    /** Creates and returns a matrix based on this transform. */
    public getTransformationMatrix(): Matrix4x4 {
        let translation = Matrix4x4.translation(this.position);

        let rotation = Matrix4x4.rotationXYZ(
            this.rotation.x,
            this.rotation.y,
            this.rotation.z
        );
        let scale = Matrix4x4.scale(this.scale);

        // T * R * S
        return Matrix4x4.multiply(
            Matrix4x4.multiply(translation, rotation),
            scale
        );
    }
}
