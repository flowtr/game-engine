var engine;
// The main entry point to the application.
window.onload = function () {
    engine = new TSE.Engine();
    engine.start();
};
window.onresize = function () {
    engine.resize();
};
var TSE;
(function (TSE) {
    /**
     * The main game engine class.
     * */
    var Engine = /** @class */ (function () {
        /**
         * Creates a new engine.
         * */
        function Engine() {
        }
        /**
         * Starts up this engine.
         * */
        Engine.prototype.start = function () {
            this._canvas = TSE.GLUtilities.initialize();
            TSE.gl.clearColor(0, 0, 0, 1);
            this.loadShaders();
            this._shader.use();
            // Load
            this._projection = TSE.Matrix4x4.orthographic(0, this._canvas.width, 0, this._canvas.height, -100.0, 100.0);
            this._sprite = new TSE.Sprite("test");
            this._sprite.load();
            this._sprite.position.x = 200;
            this.resize();
            this.loop();
        };
        /**
         * Resizes the canvas to fit the window.
         * */
        Engine.prototype.resize = function () {
            if (this._canvas !== undefined) {
                this._canvas.width = window.innerWidth;
                this._canvas.height = window.innerHeight;
                // Not actually needed at the moment
                //gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
            }
        };
        Engine.prototype.loop = function () {
            TSE.gl.clear(TSE.gl.COLOR_BUFFER_BIT);
            // Set uniforms.
            var colorPosition = this._shader.getUniformLocation("u_color");
            TSE.gl.uniform4f(colorPosition, 1, 0.5, 0, 1);
            var projectionPosition = this._shader.getUniformLocation("u_projection");
            TSE.gl.uniformMatrix4fv(projectionPosition, false, new Float32Array(this._projection.data));
            var modelLocation = this._shader.getUniformLocation("u_model");
            TSE.gl.uniformMatrix4fv(modelLocation, false, new Float32Array(TSE.Matrix4x4.translation(this._sprite.position).data));
            //
            this._sprite.draw();
            requestAnimationFrame(this.loop.bind(this));
        };
        Engine.prototype.loadShaders = function () {
            var vertexShaderSource = "\nattribute vec3 a_position;\n\nuniform mat4 u_projection;\nuniform mat4 u_model;\n\nvoid main() {\n    gl_Position = u_projection * u_model * vec4(a_position, 1.0);\n}";
            var fragmentShaderSource = "\nprecision mediump float;\n\nuniform vec4 u_color;\n\nvoid main() {\n    gl_FragColor = u_color;\n}\n";
            this._shader = new TSE.Shader("basic", vertexShaderSource, fragmentShaderSource);
        };
        return Engine;
    }());
    TSE.Engine = Engine;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    /**
     * Responsible for setting up a WebGL rendering context.
     * */
    var GLUtilities = /** @class */ (function () {
        function GLUtilities() {
        }
        /**
         * Initializes WebGL, potentially using the canvas with an assigned id matching the provided if it is defined.
         * @param elementId The id of the elment to search for.
         */
        GLUtilities.initialize = function (elementId) {
            var canvas;
            if (elementId !== undefined) {
                canvas = document.getElementById(elementId);
                if (canvas === undefined) {
                    throw new Error("Cannot find a canvas element named:" + elementId);
                }
            }
            else {
                canvas = document.createElement("canvas");
                document.body.appendChild(canvas);
            }
            TSE.gl = canvas.getContext("webgl");
            if (TSE.gl === undefined) {
                throw new Error("Unable to initialize WebGL!");
            }
            return canvas;
        };
        return GLUtilities;
    }());
    TSE.GLUtilities = GLUtilities;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    /**
     * Represents the information needed for a GLBuffer attribute.
     * */
    var AttributeInfo = /** @class */ (function () {
        function AttributeInfo() {
        }
        return AttributeInfo;
    }());
    TSE.AttributeInfo = AttributeInfo;
    /**
     * Represents a WebGL buffer.
     * */
    var GLBuffer = /** @class */ (function () {
        /**
         * Creates a new GL buffer.
         * @param elementSize The size of each element in this buffer.
         * @param dataType The data type of this buffer. Default: gl.FLOAT
         * @param targetBufferType The buffer target type. Can be either gl.ARRAY_BUFFER or gl.ELEMENT_ARRAY_BUFFER. Default: gl.ARRAY_BUFFER
         * @param mode The drawing mode of this buffer. (i.e. gl.TRIANGLES or gl.LINES). Default: gl.TRIANGLES
         */
        function GLBuffer(elementSize, dataType, targetBufferType, mode) {
            if (dataType === void 0) { dataType = TSE.gl.FLOAT; }
            if (targetBufferType === void 0) { targetBufferType = TSE.gl.ARRAY_BUFFER; }
            if (mode === void 0) { mode = TSE.gl.TRIANGLES; }
            this._hasAttributeLocation = false;
            this._data = [];
            this._attributes = [];
            this._elementSize = elementSize;
            this._dataType = dataType;
            this._targetBufferType = targetBufferType;
            this._mode = mode;
            // Determine byte size
            switch (this._dataType) {
                case TSE.gl.FLOAT:
                case TSE.gl.INT:
                case TSE.gl.UNSIGNED_INT:
                    this._typeSize = 4;
                    break;
                case TSE.gl.SHORT:
                case TSE.gl.UNSIGNED_SHORT:
                    this._typeSize = 2;
                    break;
                case TSE.gl.BYTE:
                case TSE.gl.UNSIGNED_BYTE:
                    this._typeSize = 1;
                    break;
                default:
                    throw new Error("Unrecognized data type: " + dataType.toString());
            }
            this._stride = this._elementSize * this._typeSize;
            this._buffer = TSE.gl.createBuffer();
        }
        /**
         * Destroys this buffer.
         * */
        GLBuffer.prototype.destroy = function () {
            TSE.gl.deleteBuffer(this._buffer);
        };
        /**
         * Binds this buffer.
         * @param normalized Indicates if the data should be normalized. Default: false
         */
        GLBuffer.prototype.bind = function (normalized) {
            if (normalized === void 0) { normalized = false; }
            TSE.gl.bindBuffer(this._targetBufferType, this._buffer);
            if (this._hasAttributeLocation) {
                for (var _i = 0, _a = this._attributes; _i < _a.length; _i++) {
                    var it = _a[_i];
                    TSE.gl.vertexAttribPointer(it.location, it.size, this._dataType, normalized, this._stride, it.offset * this._typeSize);
                    TSE.gl.enableVertexAttribArray(it.location);
                }
            }
        };
        /**
         * Unbinds this buffer.
         * */
        GLBuffer.prototype.unbind = function () {
            for (var _i = 0, _a = this._attributes; _i < _a.length; _i++) {
                var it = _a[_i];
                TSE.gl.disableVertexAttribArray(it.location);
            }
            TSE.gl.bindBuffer(TSE.gl.ARRAY_BUFFER, this._buffer);
        };
        /**
         * Adds an attribute with the provided information to this buffer.
         * @param info The information to be added.
         */
        GLBuffer.prototype.addAttributeLocation = function (info) {
            this._hasAttributeLocation = true;
            this._attributes.push(info);
        };
        /**
         * Adds data to this buffer.
         * @param data
         */
        GLBuffer.prototype.pushBackData = function (data) {
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var d = data_1[_i];
                this._data.push(d);
            }
        };
        /**
         * Uploads this buffer's data to the GPU.
         * */
        GLBuffer.prototype.upload = function () {
            TSE.gl.bindBuffer(this._targetBufferType, this._buffer);
            var bufferData;
            switch (this._dataType) {
                case TSE.gl.FLOAT:
                    bufferData = new Float32Array(this._data);
                    break;
                case TSE.gl.INT:
                    bufferData = new Int32Array(this._data);
                    break;
                case TSE.gl.UNSIGNED_INT:
                    bufferData = new Uint32Array(this._data);
                    break;
                case TSE.gl.SHORT:
                    bufferData = new Int16Array(this._data);
                    break;
                case TSE.gl.UNSIGNED_SHORT:
                    bufferData = new Uint16Array(this._data);
                    break;
                case TSE.gl.BYTE:
                    bufferData = new Int8Array(this._data);
                    break;
                case TSE.gl.UNSIGNED_BYTE:
                    bufferData = new Uint8Array(this._data);
                    break;
            }
            TSE.gl.bufferData(this._targetBufferType, bufferData, TSE.gl.STATIC_DRAW);
        };
        /**
         * Draws this buffer.
         * */
        GLBuffer.prototype.draw = function () {
            if (this._targetBufferType === TSE.gl.ARRAY_BUFFER) {
                TSE.gl.drawArrays(this._mode, 0, this._data.length / this._elementSize);
            }
            else if (this._targetBufferType === TSE.gl.ELEMENT_ARRAY_BUFFER) {
                TSE.gl.drawElements(this._mode, this._data.length, this._dataType, 0);
            }
        };
        return GLBuffer;
    }());
    TSE.GLBuffer = GLBuffer;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    /**
     * Represents a WebGL shader.
     * */
    var Shader = /** @class */ (function () {
        /**
         * Creates a new shader.
         * @param name The name of this shader.
         * @param vertexSource The source of the vertex shader.
         * @param fragmentSource The source of the fragment shader.
         */
        function Shader(name, vertexSource, fragmentSource) {
            this._attributes = {};
            this._uniforms = {};
            this._name = name;
            var vertexShader = this.loadShader(vertexSource, TSE.gl.VERTEX_SHADER);
            var fragmentShader = this.loadShader(fragmentSource, TSE.gl.FRAGMENT_SHADER);
            this.createProgram(vertexShader, fragmentShader);
            this.detectAttributes();
            this.detectUniforms();
        }
        Object.defineProperty(Shader.prototype, "name", {
            /**
             * The name of this shader.
             */
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Use this shader.
         * */
        Shader.prototype.use = function () {
            TSE.gl.useProgram(this._program);
        };
        /**
         * Gets the location of an attribute with the provided name.
         * @param name The name of the attribute whose location to retrieve.
         */
        Shader.prototype.getAttributeLocation = function (name) {
            if (this._attributes[name] === undefined) {
                throw new Error("Unable to find attribute named '" + name + "' in shader named '" + this._name + "'");
            }
            return this._attributes[name];
        };
        /**
         * Gets the location of an uniform with the provided name.
         * @param name The name of the uniform whose location to retrieve.
         */
        Shader.prototype.getUniformLocation = function (name) {
            if (this._uniforms[name] === undefined) {
                throw new Error("Unable to find uniform named '" + name + "' in shader named '" + this._name + "'");
            }
            return this._uniforms[name];
        };
        Shader.prototype.loadShader = function (source, shaderType) {
            var shader = TSE.gl.createShader(shaderType);
            TSE.gl.shaderSource(shader, source);
            TSE.gl.compileShader(shader);
            var error = TSE.gl.getShaderInfoLog(shader);
            if (error !== "") {
                throw new Error("Error compiling shader '" + this._name + "': " + error);
            }
            return shader;
        };
        Shader.prototype.createProgram = function (vertexShader, fragmentShader) {
            this._program = TSE.gl.createProgram();
            TSE.gl.attachShader(this._program, vertexShader);
            TSE.gl.attachShader(this._program, fragmentShader);
            TSE.gl.linkProgram(this._program);
            var error = TSE.gl.getProgramInfoLog(this._program);
            if (error !== "") {
                throw new Error("Error linking shader '" + this._name + "': " + error);
            }
        };
        Shader.prototype.detectAttributes = function () {
            var attributeCount = TSE.gl.getProgramParameter(this._program, TSE.gl.ACTIVE_ATTRIBUTES);
            for (var i = 0; i < attributeCount; ++i) {
                var info = TSE.gl.getActiveAttrib(this._program, i);
                if (!info) {
                    break;
                }
                this._attributes[info.name] = TSE.gl.getAttribLocation(this._program, info.name);
            }
        };
        Shader.prototype.detectUniforms = function () {
            var uniformCount = TSE.gl.getProgramParameter(this._program, TSE.gl.ACTIVE_UNIFORMS);
            for (var i = 0; i < uniformCount; ++i) {
                var info = TSE.gl.getActiveUniform(this._program, i);
                if (!info) {
                    break;
                }
                this._uniforms[info.name] = TSE.gl.getUniformLocation(this._program, info.name);
            }
        };
        return Shader;
    }());
    TSE.Shader = Shader;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    /**
     * Represents a 2-dimensional sprite which is drawn on the screen.
     * */
    var Sprite = /** @class */ (function () {
        /**
         * Creates a new sprite.
         * @param name The name of this sprite.
         * @param width The width of this sprite.
         * @param height The height of this sprite.
         */
        function Sprite(name, width, height) {
            if (width === void 0) { width = 100; }
            if (height === void 0) { height = 100; }
            /**
             * The position of this sprite.
             */
            this.position = new TSE.Vector3();
            this._name = name;
            this._width = width;
            this._height = height;
        }
        /**
         * Performs loading routines on this sprite.
         * */
        Sprite.prototype.load = function () {
            this._buffer = new TSE.GLBuffer(3);
            var positionAttribute = new TSE.AttributeInfo();
            positionAttribute.location = 0;
            positionAttribute.offset = 0;
            positionAttribute.size = 3;
            this._buffer.addAttributeLocation(positionAttribute);
            var vertices = [
                // x,y,z
                0, 0, 0,
                0, this._height, 0,
                this._width, this._height, 0,
                this._width, this._height, 0,
                this._width, 0, 0,
                0, 0, 0
            ];
            this._buffer.pushBackData(vertices);
            this._buffer.upload();
            this._buffer.unbind();
        };
        /**
         * Performs update routines on this sprite.
         * @param time The delta time in milliseconds since the last update call.
         */
        Sprite.prototype.update = function (time) {
        };
        /** Draws this sprite. */
        Sprite.prototype.draw = function () {
            this._buffer.bind();
            this._buffer.draw();
        };
        return Sprite;
    }());
    TSE.Sprite = Sprite;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    /** A 4x4 matrix to be used for transformations. */
    var Matrix4x4 = /** @class */ (function () {
        /** Creates a new matrix 4x4. Marked as private to enforce the use of static methods. */
        function Matrix4x4() {
            this._data = [];
            this._data = [
                1.0, 0, 0, 0,
                0, 1.0, 0, 0,
                0, 0, 1.0, 0,
                0, 0, 0, 1.0
            ];
        }
        Object.defineProperty(Matrix4x4.prototype, "data", {
            /** Returns the data contained in this matrix as an array of numbers. */
            get: function () {
                return this._data;
            },
            enumerable: true,
            configurable: true
        });
        /** Creates and returns an identity matrix. */
        Matrix4x4.identity = function () {
            return new Matrix4x4();
        };
        /**
         * Creates and returns a new orthographic projection matrix.
         * @param left The left extents of the viewport.
         * @param right The right extents of the viewport.
         * @param bottom The bottom extents of the viewport.
         * @param top The top extents of the viewport.
         * @param nearClip The near clipping plane.
         * @param farClip The far clipping plane.
         */
        Matrix4x4.orthographic = function (left, right, bottom, top, nearClip, farClip) {
            var m = new Matrix4x4();
            var lr = 1.0 / (left - right);
            var bt = 1.0 / (bottom - top);
            var nf = 1.0 / (nearClip - farClip);
            m._data[0] = -2.0 * lr;
            m._data[5] = -2.0 * bt;
            m._data[10] = 2.0 * nf;
            m._data[12] = (left + right) * lr;
            m._data[13] = (top + bottom) * bt;
            m._data[14] = (farClip + nearClip) * nf;
            return m;
        };
        /**
         * Creates a transformation matrix using the provided position.
         * @param position The position to be used in transformation.
         */
        Matrix4x4.translation = function (position) {
            var m = new Matrix4x4();
            m._data[12] = position.x;
            m._data[13] = position.y;
            m._data[14] = position.z;
            return m;
        };
        /** Returns the data of this matrix as a Float32Array. */
        Matrix4x4.prototype.toFloat32Array = function () {
            return new Float32Array(this._data);
        };
        return Matrix4x4;
    }());
    TSE.Matrix4x4 = Matrix4x4;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    /** Represents a 3-component vector. */
    var Vector3 = /** @class */ (function () {
        /**
         * Creates a new vector 3.
         * @param x The x component.
         * @param y The y component.
         * @param z The z component.
         */
        function Vector3(x, y, z) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            this._x = x;
            this._y = y;
            this._z = z;
        }
        Object.defineProperty(Vector3.prototype, "x", {
            /** The x component. */
            get: function () {
                return this._x;
            },
            /** The x component. */
            set: function (value) {
                this._x = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector3.prototype, "y", {
            /** The y component. */
            get: function () {
                return this._y;
            },
            /** The y component. */
            set: function (value) {
                this._y = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector3.prototype, "z", {
            /** The z component. */
            get: function () {
                return this._z;
            },
            /** The z component. */
            set: function (value) {
                this._z = value;
            },
            enumerable: true,
            configurable: true
        });
        /** Returns the data of this vector as a number array. */
        Vector3.prototype.toArray = function () {
            return [this._x, this._y, this._z];
        };
        /** Returns the data of this vector as a Float32Array. */
        Vector3.prototype.toFloat32Array = function () {
            return new Float32Array(this.toArray());
        };
        return Vector3;
    }());
    TSE.Vector3 = Vector3;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED = "MESSAGE_ASSET_LOADER_ASSET_LOADED::";
    /** Manages all assets in the engine. */
    var AssetManager = /** @class */ (function () {
        /** Private to enforce static method calls and prevent instantiation. */
        function AssetManager() {
        }
        /** Initializes this manager. */
        AssetManager.initialize = function () {
            AssetManager._loaders.push(new TSE.ImageAssetLoader());
        };
        /**
         * Registers the provided loader with this asset manager.
         * @param loader The loader to be registered.
         */
        AssetManager.registerLoader = function (loader) {
            AssetManager._loaders.push(loader);
        };
        /**
         * A callback to be made from an asset loader when an asset is loaded.
         * @param asset
         */
        AssetManager.onAssetLoaded = function (asset) {
            AssetManager._loadedAssets[asset.name] = asset;
            TSE.Message.send(TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED + asset.name, this, asset);
        };
        /**
         * Attempts to load an asset using a registered asset loader.
         * @param assetName The name/url of the asset to be loaded.
         */
        AssetManager.loadAsset = function (assetName) {
            var extension = assetName.split('.').pop().toLowerCase();
            for (var _i = 0, _a = AssetManager._loaders; _i < _a.length; _i++) {
                var l = _a[_i];
                if (l.supportedExtensions.indexOf(extension) !== -1) {
                    l.loadAsset(assetName);
                    return;
                }
            }
            console.warn("Unable to load asset with extension " + extension + " because there is no loader associated with it.");
        };
        /**
         * Indicates if an asset with the provided name has been loaded.
         * @param assetName The asset name to check.
         */
        AssetManager.isAssetLoaded = function (assetName) {
            return AssetManager._loadedAssets[assetName] !== undefined;
        };
        /**
         * Attempts to get an asset with the provided name. If found, it is returned; otherwise, undefined is returned.
         * @param assetName The asset name to get.
         */
        AssetManager.getAsset = function (assetName) {
            if (AssetManager._loadedAssets[assetName] !== undefined) {
                return AssetManager._loadedAssets[assetName];
            }
            else {
                AssetManager.loadAsset(assetName);
            }
            return undefined;
        };
        AssetManager._loaders = [];
        AssetManager._loadedAssets = {};
        return AssetManager;
    }());
    TSE.AssetManager = AssetManager;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    /** Represents message priorities. */
    var MessagePriority;
    (function (MessagePriority) {
        /** Normal message priority, meaning the message is sent as soon as the queue allows. */
        MessagePriority[MessagePriority["NORMAL"] = 0] = "NORMAL";
        /** High message priority, meaning the message is sent immediately. */
        MessagePriority[MessagePriority["HIGH"] = 1] = "HIGH";
    })(MessagePriority = TSE.MessagePriority || (TSE.MessagePriority = {}));
    /** Represents a message which can be sent and processed across the system. */
    var Message = /** @class */ (function () {
        /**
         * Creates a new message.
         * @param code The code for this message, which is subscribed to and listened for.
         * @param sender The class instance which sent this message.
         * @param context Free-form context data to be included with this message.
         * @param priority The priority of this message.
         */
        function Message(code, sender, context, priority) {
            if (priority === void 0) { priority = MessagePriority.NORMAL; }
            this.code = code;
            this.sender = sender;
            this.context = context;
            this.priority = priority;
        }
        /**
         * Sends a normal-priority message with the provided parameters.
         * @param code The code for this message, which is subscribed to and listened for.
         * @param sender The class instance which sent this message.
         * @param context Free-form context data to be included with this message.
         */
        Message.send = function (code, sender, context) {
            TSE.MessageBus.post(new Message(code, sender, context, MessagePriority.NORMAL));
        };
        /**
         * Sends a high-priority message with the provided parameters.
         * @param code The code for this message, which is subscribed to and listened for.
         * @param sender The class instance which sent this message.
         * @param context Free-form context data to be included with this message.
         */
        Message.sendPriority = function (code, sender, context) {
            TSE.MessageBus.post(new Message(code, sender, context, MessagePriority.HIGH));
        };
        /**
         * Subscribes the provided handler to listen for the message code provided.
         * @param code The code to listen for.
         * @param handler The message handler to be called when a message containing the provided code is sent.
         */
        Message.subscribe = function (code, handler) {
            TSE.MessageBus.addSubscription(code, handler);
        };
        /**
         * Unsubscribes the provided handler from listening for the message code provided.
         * @param code The code to no longer listen for.
         * @param handler The message handler to unsubscribe.
         */
        Message.unsubscribe = function (code, handler) {
            TSE.MessageBus.removeSubscription(code, handler);
        };
        return Message;
    }());
    TSE.Message = Message;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    /** The message manager responsible for sending messages across the system. */
    var MessageBus = /** @class */ (function () {
        /** Constructor hidden to prevent instantiation. */
        function MessageBus() {
        }
        /**
         * Adds a subscription to the provided code using the provided handler.
         * @param code The code to listen for.
         * @param handler The handler to be subscribed.
         */
        MessageBus.addSubscription = function (code, handler) {
            if (MessageBus._subscriptions[code] !== undefined) {
                MessageBus._subscriptions[code] = [];
            }
            if (MessageBus._subscriptions[code].indexOf(handler) !== -1) {
                console.warn("Attempting to add a duplicate handler to code: " + code + ". Subscription not added.");
            }
            else {
                MessageBus._subscriptions[code].push(handler);
            }
        };
        /**
         * Removes a subscription to the provided code using the provided handler.
         * @param code The code to no longer listen for.
         * @param handler The handler to be unsubscribed.
         */
        MessageBus.removeSubscription = function (code, handler) {
            if (MessageBus._subscriptions[code] === undefined) {
                console.warn("Cannot unsubscribe handler from code: " + code + " Because that code is not subscribed to.");
                return;
            }
            var nodeIndex = MessageBus._subscriptions[code].indexOf(handler);
            if (nodeIndex !== -1) {
                MessageBus._subscriptions[code].splice(nodeIndex, 1);
            }
        };
        /**
         * Posts the provided message to the message system.
         * @param message The message to be sent.
         */
        MessageBus.post = function (message) {
            console.log("Message posted:", message);
            var handlers = MessageBus._subscriptions[message.code];
            if (handlers === undefined) {
                return;
            }
            for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
                var h = handlers_1[_i];
                if (message.priority === TSE.MessagePriority.HIGH) {
                    h.onMessage(message);
                }
                else {
                    MessageBus._normalMessageQueue.push(new TSE.MessageSubscriptionNode(message, h));
                }
            }
        };
        /**
         * Performs update routines on this message bus.
         * @param time The delta time in milliseconds since the last update.
         */
        MessageBus.update = function (time) {
            if (MessageBus._normalMessageQueue.length === 0) {
                return;
            }
            var messageLimit = Math.min(MessageBus._normalQueueMessagePerUpdate, MessageBus._normalMessageQueue.length);
            for (var i = 0; i < messageLimit; ++i) {
                var node = MessageBus._normalMessageQueue.pop();
                node.handler.onMessage(node.message);
            }
        };
        MessageBus._subscriptions = {};
        MessageBus._normalQueueMessagePerUpdate = 10;
        MessageBus._normalMessageQueue = [];
        return MessageBus;
    }());
    TSE.MessageBus = MessageBus;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var MessageSubscriptionNode = /** @class */ (function () {
        function MessageSubscriptionNode(message, handler) {
            this.message = message;
            this.handler = handler;
        }
        return MessageSubscriptionNode;
    }());
    TSE.MessageSubscriptionNode = MessageSubscriptionNode;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    /** Represents an image asset */
    var ImageAsset = /** @class */ (function () {
        /**
         * Creates a new image asset.
         * @param name The name of this asset.
         * @param data The data of this asset.
         */
        function ImageAsset(name, data) {
            this.name = name;
            this.data = data;
        }
        Object.defineProperty(ImageAsset.prototype, "width", {
            /** The width of this image asset. */
            get: function () {
                return this.data.width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ImageAsset.prototype, "height", {
            /** The height of this image asset. */
            get: function () {
                return this.data.height;
            },
            enumerable: true,
            configurable: true
        });
        return ImageAsset;
    }());
    TSE.ImageAsset = ImageAsset;
    /** Represents an image asset loader. */
    var ImageAssetLoader = /** @class */ (function () {
        function ImageAssetLoader() {
        }
        Object.defineProperty(ImageAssetLoader.prototype, "supportedExtensions", {
            /** The extensions supported by this asset loader. */
            get: function () {
                return ["png", "gif", "jpg"];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Loads an asset with the given name.
         * @param assetName The name of the asset to be loaded.
         */
        ImageAssetLoader.prototype.loadAsset = function (assetName) {
            var image = new Image();
            image.onload = this.onImageLoaded.bind(this, assetName, image);
            image.src = assetName;
        };
        ImageAssetLoader.prototype.onImageLoaded = function (assetName, image) {
            console.log("onImageLoaded: assetName/image", assetName, image);
            var asset = new ImageAsset(assetName, image);
            TSE.AssetManager.onAssetLoaded(asset);
        };
        return ImageAssetLoader;
    }());
    TSE.ImageAssetLoader = ImageAssetLoader;
})(TSE || (TSE = {}));
//# sourceMappingURL=main.js.map