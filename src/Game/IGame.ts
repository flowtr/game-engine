import { Engine, RenderView, SceneGraph } from "../Core";

/**
 * An interface which represents an object that holds game-specific information.
 * Used for loading the first/initial level, etc. Each game should implement
 * their own class for this.
 */
export abstract class GameLogic {
    public scene: SceneGraph;
    public engine: Engine;

    constructor(engine: Engine) {
        this.scene = new SceneGraph();
        this.engine = engine;
    }

    /**
     * Called before the main update loop, after updateReady has been called on the engine subsystems.
     * Used for loading the first/initial level, etc.
     */
    updateReady(): void {
        this.scene.root.updateReady();
    }

    /**
     * Performs update procedures on this game. Called after all engine subsystems have updated.
     * @param time The delta time in milliseconds since the last update.
     */
    update(time: number): void {
        this.scene.update(time);
    }

    /**
     * Renders this game. Called after all engine subsystems have rendered.
     * @param time The delta time in milliseconds since the last frame.
     * @param renderView The view of information used for this render pass.
     */
    render(time: number, renderView: RenderView): void {
        this.scene.render(renderView);
    }
}
