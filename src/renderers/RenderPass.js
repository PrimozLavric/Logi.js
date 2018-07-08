/**
 * Created by Primoz on 26-Nov-16.
 */

LOGI.RenderPass = class {

    constructor(type, initialize, preprocess, target, viewport, outDepthID = null, outTextures = []) {

        /**
         * Can be either:
         * LOGI.RenderPass.BASIC - Requires a preprocess function to return array [LOGI.Scene, LOGI.Camera]. Performs basic render pass
         *                        with the given scene and camera rendering to either Texture or Screen (defined by the target).
         *
         * LOGI.RenderPass.TEXTURE_MERGE - Requires a preprocess function to return array [LOGI.CustomShaderMaterial, [LOGI.Texture,..]].
         *                                It then uses the given LOGI.CustomShaderMaterial to merge the given textures using (rendering is done on quad).
         */
        this._type = type;

        /**
         * This is set to true by RenderQueue after the initialize step is executed.
         */
        this._isInitialized = false;

        /**
         * This function is called only once, when the render pass in executed for the first time. In this step you can initialize scene, textures..
         */
        this._initialize = initialize;

        /**
         * This function is called before the rendering with two parameters (PreviousRPTextures, PreviousRPData). And it should return
         * either an object {scene: LOGI.Scene, camera: LOGI.Camera} (for RenderPass.BASIC) or {material: LOGI.CustomShaderMaterial, textures: [LOGI.Texture,..]} (for RenderPass.TEXTURE_MERGE).
         */
        this._preprocess = preprocess;

        /**
         * Specifies if the render pass should render to texture (RenderPass.TEXTURE) or directly to screen (RenderPass.SCREEN)
         */
        this._target = target;

        /**
         * Viewport of render pass
         */
        this._viewport = viewport;

        /**
         * String ID to which output texture will be bound. If null is specified as the ID the depth texture will not be rendered.
         */
        this._outDepthID = outDepthID;

        /**
         * Array of templates (order important) for output textures, COLOR_ATTACHMENTS (when using target TEXTURE).
         * Template format:
         *      {
         *          id: string,
         *          textureConfig: {wrapS, WrapT, minFilter, magFilter, internalFormat, format, type}
         *      }
         * For the texture config parameters refer to LOGI.Texture class and
         * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
         * for format and type explanation.
         */
        this._outTextures = outTextures;
    }

    get type() {
        return this._type;
    }
    get initialize() {
        return this._initialize;
    }
    get preprocess() {
        return this._preprocess;
    }
    get target() {
        return this._target;
    }
    get viewport() {
        return this._viewport;
    }
    get outDepthID() {
        return this._outDepthID;
    }
    get outTextures() {
        return this._outTextures;
    }


    set type(value) {
        this._type = value;
    }
    set initialize(value) {
        this._initialize = value;
    }
    set preprocess(value) {
        this._preprocess = value;
    }
    set target(value) {
        this._target = value;
    }
    set viewport(value) {
        this._viewport = value;
    }
    set outDepthID(value) {
        if (this._type === LOGI.RenderPass.SCREEN) {
            console.warn("Warning: Setting output depth texture to RenderPass that renders to screen!")
        }

        this._outDepthID = value;
    }
    set outTextures(value) {
        if (this._type === LOGI.RenderPass.SCREEN) {
            console.warn("Warning: Setting output color textures to RenderPass that renders to screen!")
        }

        this._outTextures = value;
    }
};

// Render pass types
LOGI.RenderPass.BASIC = 0;
LOGI.RenderPass.TEXTURE_MERGE = 1;

// Render pass target
LOGI.RenderPass.TEXTURE = 2;
LOGI.RenderPass.SCREEN = 3;

LOGI.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG = {wrapS: LOGI.Texture.ClampToEdgeWrapping,
                                                wrapT: LOGI.Texture.ClampToEdgeWrapping,
                                                minFilter: LOGI.Texture.LinearFilter,
                                                magFilter: LOGI.Texture.LinearFilter,
                                                internalFormat: LOGI.Texture.RGBA,
                                                format: LOGI.Texture.RGBA,
                                                type: LOGI.Texture.UNSIGNED_BYTE};


LOGI.RenderPass.FLOAT_RGB_TEXTURE_CONFIG = {wrapS: LOGI.Texture.ClampToEdgeWrapping,
    wrapT: LOGI.Texture.ClampToEdgeWrapping,
    minFilter: LOGI.Texture.LinearFilter,
    magFilter: LOGI.Texture.LinearFilter,
    internalFormat: LOGI.Texture.RGBA16F,
    format: LOGI.Texture.RGBA,
    type: LOGI.Texture.HALF_FLOAT};



LOGI.RenderPass.DEFAULT_RGB_TEXTURE_CONFIG = {wrapS: LOGI.Texture.ClampToEdgeWrapping,
                                                wrapT: LOGI.Texture.ClampToEdgeWrapping,
                                                minFilter: LOGI.Texture.LinearFilter,
                                                magFilter: LOGI.Texture.LinearFilter,
                                                internalFormat: LOGI.Texture.RGB,
                                                format: LOGI.Texture.RGB,
                                                type: LOGI.Texture.UNSIGNED_BYTE};
