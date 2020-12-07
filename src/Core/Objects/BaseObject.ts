import { Indentifable } from "../Data/Identifiable";

/**
 * The basis from which all objects should be inherited. TObjects are each given
 * a unique identifier which can be used to identify the object for debugging purposes.
 * Objects ultimately inheriting from TObject should be prefixed with a T to denote this.
 */
export interface IGameObject extends Indentifable {
    getChildren(): IGameObject[];
    getParent(): IGameObject;

    /** Performs pre-update procedures on this component. */
    updateReady(): void;

    /** Loads this component. */
    load(): void;

    /**
     * Updates this component.
     * @param time The amount of time in milliseconds since the last update.
     */
    update(time: number): void;

    destroy(): void;
}
