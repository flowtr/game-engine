import { IOwnable } from "../Data/IOwnable";
import { INameable } from "../Data/nameable";
import { Entity } from "../World";

/**
 * Represents a behavior, which can be attached to a TEntity. Behaviors do not get rendered,
 * but affect the object they are attached to in some way. Behaviors may apply themselves either
 * during the update call or directly using apply(), depending on the behavior itself.
 */
export interface IBehavior extends IOwnable<Entity>, INameable {
    /**
     * Sets the owner of this behavior.
     * @param owner The owner.
     */
    setOwner(owner: Entity): void;

    /**
     * Performs pre-update procedures on this behavior.
     */
    updateReady(): void;

    /**
     * Performs update procedures on this behavior.
     * @param time The delta time in milliseconds since the last update.
     */
    update(time: number): void;

    /**
     * Applys this behavior with the given user data.
     * @param userData The user data to be applied.
     */
    apply(userData: any): void;
}
