import { RenderView } from "../Renderer";
import { Entity } from "./Entity";

/**
 * A scene graph, which is responsible for managing the heirarchy of objects in a scene (essentially,
 * it is the scene itself).
 */
export class SceneGraph {
    private _root: Entity;

    /** Creates a new SceneGraph */
    public constructor() {
        this._root = new Entity("__ROOT__", this);
    }

    /** Returns the root object. */
    public get root(): Entity {
        return this._root;
    }

    /** Indicates if this scene is loaded. */
    public get isLoaded(): boolean {
        return this._root.isLoaded;
    }

    /**
     * Adds an entity to the root entity of this scene graph.
     * @param entity The entity to be added.
     */
    public addObject<T extends Entity>(entity: T): T {
        this._root.addChild(entity);
        return entity;
    }

    /**
     * Recursively searches this scene graph for an entity with the provided name.
     * @param name The name of the entity to retrieve.
     */
    public getEntityByName(name: string): Entity {
        return this._root.getEntityByName(name);
    }

    /** Loads this scene graph. */
    public load(): void {
        this._root.load();
    }

    /**
     * Performs update procedures on this scene graph.
     * @param time The delta time in milliseconds since the last update.
     */
    public update(time: number): void {
        this._root.update(time);
    }

    /**
     * Renders this scene graph.
     */
    public render(renderView: RenderView): void {
        this._root.render(renderView);
    }
}
