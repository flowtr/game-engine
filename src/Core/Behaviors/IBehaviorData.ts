import { INameable } from "../Data/nameable";

/**
 * Represents data which is used to construct behaviors.
 */
export interface IBehaviorData extends INameable {
    /**
     * Sets the properties of this data from the provided json.
     * @param json The json to set from.
     */
    setFromJson(json: unknown): void;
}
