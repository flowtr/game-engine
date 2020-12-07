import { IBehavior } from "../Behaviors";
import { IGameObject } from "../Objects/BaseObject";
import { Transform } from "../Math";
import { INameable } from "./nameable";

export interface IEntity extends INameable, IGameObject {
    type: string;
    transform: Transform;
    behaviors: IBehavior[];
}
