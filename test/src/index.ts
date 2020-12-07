import { Engine } from "../../src";
import { TestGame } from "./game/game";

window.onload = () => {
    const engine = new Engine();
    engine.start(new TestGame(engine), "#canvas");
};
