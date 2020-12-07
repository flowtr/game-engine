import { Tensor, Vector } from "@toes/core";
import {
    Entity,
    Matrix4x4,
    RenderView,
    SceneGraph,
    Sprite,
} from "../../../src";

export class TestEntity extends Entity {
    sprite: Sprite;

    constructor(name: string, scene?: SceneGraph) {
        super(name, scene);
    }

    updateReady() {
        super.updateReady();
        this.sprite = new Sprite("test", "white");
        this.sprite.load();
        this.sprite.origin.x = 200;
        this.sprite.origin.y = 100;
        console.log("Hi from test entity");
    }

    render(renderView: RenderView): void {
        super.render(renderView);
        this.sprite.draw(
            Matrix4x4.identity(),
            Matrix4x4.identity(),
            Matrix4x4.identity()
        );
    }
}
