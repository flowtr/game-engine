import {
    Entity,
    GameLogic,
    PerspectiveCamera,
    Engine,
    MaterialManager,
    MaterialConfig,
    BuiltinShader,
} from "../../../src";
import { TestEntity } from "./test-entity";

export class TestGame extends GameLogic {
    constructor(engine: Engine) {
        super(engine);
    }

    updateReady(): void {
        MaterialManager.registerMaterial(
            MaterialConfig.fromJson({
                name: "white",
                shader: BuiltinShader.COLOR,
                tint: { r: 255, g: 0, b: 0, a: 255 },
            })
        );

        this.scene.addObject(new PerspectiveCamera("camera", this.scene));
        this.scene.addObject(new TestEntity("test", this.scene));
        super.updateReady();
    }
}
