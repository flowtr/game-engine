import { Tensor, Vector } from "@toes/core";
import { IEntity } from "../Data/object";
import { IBehavior } from "../Behaviors";
import { Matrix4x4, Transform } from "../Math";
import { IGameObject } from "../Objects";
import { RenderView } from "../Renderer";
import { SceneGraph } from "./SceneGraph";

/**
 * Represents a single entity in the world. TEntities themselves do not get rendered or have behaviors.
 * The do, however, have transforms and may have child TEntities. Components and behaviors may be
 * attached to TEntities to decorate functionality.
 */
export class Entity implements IEntity {
    protected _children: Entity[] = [];
    protected _parent: Entity;
    private _isLoaded: boolean = false;
    private _sceneGraph: SceneGraph;
    private _behaviors: IBehavior[] = [];
    private _isVisible: boolean = true;

    private _localMatrix: Matrix4x4 = Matrix4x4.identity();
    private _worldMatrix: Matrix4x4 = Matrix4x4.identity();

    get behaviors(): IBehavior[] {
        return [...this._behaviors];
    }

    type: string;
    id: string;
    /** The name of this object. */
    name: string;

    /** The transform of this entity. */
    transform: Transform = new Transform();

    /**
     * Creates a new entity.
     * @param name The name of this entity.
     * @param sceneGraph The scenegraph to which this entity belongs.
     */
    constructor(name: string, sceneGraph?: SceneGraph) {
        this.name = name;
        this._sceneGraph = sceneGraph;
        this.type = this.constructor.name.toLowerCase();
    }
    getChildren(): IGameObject[] {
        return this._children;
    }

    destroy(): void {}

    /** Returns the parent of this entity. */
    getParent(): IGameObject {
        return this._parent as IGameObject;
    }

    setParent(p: Entity) {
        this._parent = p;
    }

    /** Returns the world transformation matrix of this entity. */
    get worldMatrix(): Matrix4x4 {
        return this._worldMatrix;
    }

    /** Indicates if this entity has been loaded. */
    get isLoaded(): boolean {
        return this._isLoaded;
    }

    /** Indicates if this entity is currently visible. */
    get isVisible(): boolean {
        return this._isVisible;
    }

    /** Sets visibility of this entity. */
    set isVisible(value: boolean) {
        this._isVisible = value;
    }

    /**
     * Attempts to remove the provided entity as a child of this one, if it is in fact
     * a child of this entity. Otherwise, nothing happens.
     * @param child The child to be added.
     */
    removeChild(child: Entity): void {
        let index = this._children.indexOf(child);
        if (index !== -1) {
            child._parent = undefined;
            this._children.splice(index, 1);
        }
    }

    /**
     * Recursively attempts to retrieve a behavior with the given name from this entity or its children.
     * @param name The name of the behavior to retrieve.
     */
    getBehaviorByName(name: string): IBehavior {
        for (let behavior of this._behaviors)
            if (behavior.name === name) return behavior;

        for (let child of this._children) {
            let behavior = child.getBehaviorByName(name);
            if (behavior !== undefined) return behavior;
        }

        return undefined;
    }

    /**
     * Recursively attempts to retrieve a child entity with the given name from this entity or its children.
     * @param name The name of the entity to retrieve.
     */
    getEntityByName(name: string): Entity {
        if (this.name === name) {
            return this;
        }

        for (let child of this._children) {
            let result = child.getEntityByName(name);
            if (result !== undefined) return result;
        }

        return undefined;
    }

    /**
     * Adds the provided entity as a child of this one.
     * @param child The child to be added.
     */
    addChild(child: Entity): void {
        child._parent = this;
        this._children.push(child);
        child.onAdded(this._sceneGraph);
    }

    /**
     * Adds the given behavior to this entity.
     * @param behavior The behavior to be added.
     */
    addBehavior(behavior: IBehavior): void {
        this._behaviors.push(behavior);
        behavior.setOwner(this);
    }

    /** Performs loading procedures on this entity. */
    load(): void {
        this._isLoaded = true;

        for (let c of this._children) c.load();
    }

    /** Performs pre-update procedures on this entity. */
    updateReady(): void {
        for (let b of this._behaviors) b.updateReady();

        for (let c of this._children) c.updateReady();
    }

    /**
     * Performs update procedures on this entity (recurses through children,
     * components and behaviors as well).
     * @param time The delta time in milliseconds since the last update call.
     */
    update(time: number): void {
        this._localMatrix = this.transform.getTransformationMatrix();
        this.updateWorldMatrix(
            this._parent !== undefined ? this._parent.worldMatrix : undefined
        );
        for (let b of this._behaviors) b.update(time);

        for (let c of this._children) c.update(time);
    }

    /**
     * Renders this entity and its children.
     */
    render(renderView: RenderView): void {
        if (!this._isVisible) return;

        for (let c of this._children) c.render(renderView);
    }

    /** Returns the world position of this entity. */
    getWorldPosition(): Tensor<Vector> {
        return Tensor.from(
            this._worldMatrix.data[12],
            this._worldMatrix.data[13],
            this._worldMatrix.data[14]
        );
    }

    /**
     * Called when this entity is added to a scene graph.
     * @param sceneGraph The scenegraph to which this entity was added.
     */
    protected onAdded(sceneGraph: SceneGraph): void {
        this._sceneGraph = sceneGraph;
    }

    private updateWorldMatrix(parentWorldMatrix: Matrix4x4): void {
        if (parentWorldMatrix !== undefined)
            this._worldMatrix = Matrix4x4.multiply(
                parentWorldMatrix,
                this._localMatrix
            );
        else this._worldMatrix.copyFrom(this._localMatrix);
    }
}
