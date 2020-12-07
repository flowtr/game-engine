import { SceneGraph } from "../SceneGraph";
import { BaseCamera } from "./BaseCamera";

export class PerspectiveCamera extends BaseCamera {
    public constructor(name: string, sceneGraph?: SceneGraph) {
        super(name, sceneGraph);
    }
}
