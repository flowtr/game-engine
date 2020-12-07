import { Matrix4x4 } from "../../Math";
import { SceneGraph } from "../SceneGraph";
import { Entity } from "../Entity";

/**
 * The base class from which all cameras should inherit.
 */
export abstract class BaseCamera extends Entity {
    /**
     * Creates a new camera.
     * @param name The name of this camera.
     * @param sceneGraph The scene graph to be used with this camera.
     */
    public constructor(name: string, sceneGraph?: SceneGraph) {
        super(name, sceneGraph);
    }



    /** Returns the view for this camera. */
    public get view(): Matrix4x4 {
        return this.transform.getTransformationMatrix();
    }
}
