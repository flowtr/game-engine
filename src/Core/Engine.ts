﻿import {
    Renderer,
    RendererViewportCreateInfo,
    ViewportProjectionType,
    gl,
    AssetManager,
    InputManager,
    AudioManager,
} from ".";
import { GameLogic } from "../Game";
import { BitmapFontManager } from "./Graphics/BitmapFontManager";
import { MaterialManager } from "./Graphics/MaterialManager";
import { ShaderManager } from "./Graphics/ShaderManager";
import { degToRad } from "./Math/MathExtensions";
import { MessageBus } from "./Message";

/**
 * The main game engine class.
 * */
export class Engine {
    private _previousTime: number = 0;
    private _gameWidth: number;
    private _gameHeight: number;

    private _isFirstUpdate: boolean = true;

    private _renderer: Renderer;
    private _game: GameLogic;

    /**
     * Creates a new engine.
     * @param width The width of the game in pixels.
     * @param height The height of the game in pixels.
     * */
    public constructor(width?: number, height?: number) {
        this._gameWidth = width;
        this._gameHeight = height;
    }

    /**
     * Starts up this engine.
     * @param game The object containing game-specific logic.
     * @param elementName The name (id) of the HTML element to use as the viewport. Must be the id of a canvas element.
     * */
    public start(game: GameLogic, elementName?: string): void {
        this._game = game;

        let rendererViewportCreateInfo: RendererViewportCreateInfo = new RendererViewportCreateInfo();
        rendererViewportCreateInfo.elementId = elementName;
        rendererViewportCreateInfo.projectionType =
            ViewportProjectionType.PERSPECTIVE;
        rendererViewportCreateInfo.width = this._gameWidth;
        rendererViewportCreateInfo.height = this._gameHeight;
        rendererViewportCreateInfo.nearClip = 0.1;
        rendererViewportCreateInfo.farClip = 1000.0;
        rendererViewportCreateInfo.fov = degToRad(45.0);
        rendererViewportCreateInfo.x = 0;
        rendererViewportCreateInfo.y = 0;

        this._renderer = new Renderer(rendererViewportCreateInfo);

        console.debug(
            `GL_VERSION:               ${gl.getParameter(gl.VERSION)}`
        );
        console.debug(
            `GL_VENDOR:                ${gl.getParameter(gl.VENDOR)}`
        );
        console.debug(
            `GL_RENDERER:              ${gl.getParameter(gl.RENDERER)}`
        );
        console.debug(
            `SHADING_LANGUAGE_VERSION: ${gl.getParameter(
                gl.SHADING_LANGUAGE_VERSION
            )}`
        );

        // Attempt to load additional information.
        const debugRendererExtension = gl.getExtension(
            "WEBGL_debug_renderer_info"
        );
        if (
            debugRendererExtension !== undefined &&
            debugRendererExtension !== null
        ) {
            console.debug(
                `UNMASKED_VENDOR_WEBGL:    ${gl.getParameter(
                    debugRendererExtension.UNMASKED_VENDOR_WEBGL
                )}`
            );
            console.debug(
                `UNMASKED_RENDERER_WEBGL:  ${gl.getParameter(
                    debugRendererExtension.UNMASKED_RENDERER_WEBGL
                )}`
            );
        }

        // Initialize various sub-systems.
        AssetManager.Initialize();
        ShaderManager.Initialize();
        InputManager.Initialize(this._renderer.windowViewportCanvas);

        /*         // Load fonts
        BitmapFontManager.load();
        // Load material configs
        MaterialManager.load();

        // Load audio. Note that this does not hold up the engine from being ready.
        AudioManager.load(); */

        // Trigger a resize to make sure the viewport is corrent.
        this.resize();

        this._game.scene.load();

        // Begin the preloading phase, which waits for various thing to be loaded before starting the game.
        this.preloading();
    }

    /**
     * Resizes the canvas to fit the window.
     * */
    public resize(): void {
        if (this._renderer) {
            this._renderer.onResize();
        }
    }

    /**
     * The main game loop.
     */
    private loop(): void {
        if (this._isFirstUpdate) {
        }

        let delta = performance.now() - this._previousTime;

        this.update(delta);
        this.render(delta);

        this._previousTime = performance.now();

        requestAnimationFrame(this.loop.bind(this));
    }

    private preloading(): void {
        // Make sure to always update the message bus.
        MessageBus.update(0);

        // Perform items such as loading the first/initial level, etc.
        this._game.updateReady();

        // Kick off the render loop.
        this.loop();
    }

    private update(delta: number): void {
        MessageBus.update(delta);
        //CollisionManager.update( delta );

        this._game.update(delta);
    }

    private render(delta: number): void {
        this._renderer.beginRender(delta, this._game);

        this._renderer.endRender();
    }
}
