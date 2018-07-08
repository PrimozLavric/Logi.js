/**
 * Created by Primoz on 24.4.2016.
 */

// Requested WebGL version
LOGI.WEBGL1 = "gl1";
LOGI.WEBGL2 = "gl2";

LOGI.GLManager = class {

    /**
     * Creates new WebGL context manager. The context is retrieved from the given canvas.
     * @param {canvas} canvas HTML5 canvas from which GL context is retrieved
     * @param gl_version Specifies which version of GL context should be retrieved
     */
    constructor (canvas, glVersion) {
        // region GL Context fetch
        this._gl = null;
        this._glVersion = glVersion;

        var glKeys = (glVersion == LOGI.WEBGL1) ? ["webgl", "experimental-webgl"] : ["webgl2", "experimental-webgl2"];

        // Try to fetch GL context
        for (var i = 0; i < glKeys.length; i++) {
            try {
                this._gl = canvas.getContext(glKeys[i]);
            } catch (e){
                console.error(e);
            }

            if (this._gl) {
                break;
            }
        }

        // Warn the user if the context could not be retrieved
        if (!this._gl) {
            throw 'ERROR: Failed to retrieve GL Context.'
        }
        // endregion

        let ext = this._gl.getExtension("EXT_color_buffer_float");

        // region CONSTANTS
        this._FIRST_COLOR_ATTACHMENT = this._gl.COLOR_ATTACHMENT0;
        this._LAST_COLOR_ATTACHMENT = this._gl.COLOR_ATTACHMENT15;
        // endregion

        this._fboManager = new LOGI.GLFrameBufferManager(this._gl);
        this._textureManager = new LOGI.GLTextureManager(this._gl);
        this._attributeManager = new LOGI.GLAttributeManager(this._gl);

        // region Clear values
        this.autoClear = true;
        this._clearColor = new THREE.Vector4(0, 0, 0, 0);
        this._clearDepth = null;
        this._clearStencil = null;

        // Initialize clear values
        this.setClearColor(0, 0, 0, 0);
        this.setClearDepth(1);
        this.setClearStencil(0);
        // endregion
    }

    updateBufferAttribute(bufferAttribute, isElementBuffer) {
        if (isElementBuffer) {
            this._attributeManager.updateAttribute(bufferAttribute, this._gl.ELEMENT_ARRAY_BUFFER);
        }
        else {
            this._attributeManager.updateAttribute(bufferAttribute, this._gl.ARRAY_BUFFER);
        }
    }

    /**
     * Updates object geometry attributes (creates GL buffers or updates them if they already exist)
     * @param object
     */
    updateObjectData(object) {
        // BufferedGeometry
        let geometry = object.geometry;

        // region GEOMETRY ATTRIBUTES
        if (geometry.indices !== null) {
            this._attributeManager.updateAttribute(geometry.indices, this._gl.ELEMENT_ARRAY_BUFFER);
        }

        if (geometry.vertices != null) {
            this._attributeManager.updateAttribute(geometry.vertices, this._gl.ARRAY_BUFFER);
        }
        
        if (geometry.drawWireframe) {
            if (geometry.wireframeIndices === null) {
                geometry.buildWireframeBuffer();
            }
            
            this._attributeManager.updateAttribute(geometry.wireframeIndices, this._gl.ELEMENT_ARRAY_BUFFER);
        }

        if (geometry.normals != null) {
            this._attributeManager.updateAttribute(geometry.normals, this._gl.ARRAY_BUFFER);
        }

        if (geometry._vertColor != null) {
            this._attributeManager.updateAttribute(geometry._vertColor, this._gl.ARRAY_BUFFER);
        }

        if (geometry._uv != null) {
            this._attributeManager.updateAttribute(geometry._uv, this._gl.ARRAY_BUFFER);
        }
        // endregion

        // region MATERIAL ATTRIBUTES
        let material = object.material;

        // Update textures
        let textures = material.maps;

        for (let i = 0; i < textures.length; i++) {
            this._textureManager.updateTexture(textures[i], false);
        }

        // CustomShaderMaterial may specify extra attributes
        if (object.material instanceof LOGI.CustomShaderMaterial) {
            let customAttributes = object.material._attributes;

            // Update GL version of all of the custom attributes
            for (let name in customAttributes) {
                if (customAttributes.hasOwnProperty(name)) {
                    this._attributeManager.updateAttribute(customAttributes[name], this._gl.ARRAY_BUFFER);
                }
            }
        }
        //endregion
    }

    initRenderTarget(renderTarget) {
        let glTexture;
        let drawBuffersLength;
        let drawAttachments = [];

        // Bind the framebuffer matching the specified render target
        this._fboManager.bindFramebuffer(renderTarget);

        // region DEPTH
        if (renderTarget.depthTexture !== null) {
            // Fetch and update the texture
            glTexture = this._textureManager.updateTexture(renderTarget.depthTexture, true);

            // Attach as framebuffer depth attachment
            this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.TEXTURE_2D, glTexture, 0);

            // Unbind the texture (binded in the texture manager)
            this._gl.bindTexture(this._gl.TEXTURE_2D, null);
        }
        else {
            // If the depth texture is not specified remove the depth attachment from the frame buffer
            this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.TEXTURE_2D, null, 0);
        }
        // endregion

        // region COLOR ATTACHMENTS (DRAW BUFFERS)
        drawBuffersLength = renderTarget.sizeDrawBuffers();

        // TODO: Is it reasonable to check if there are more than 15 draw buffers?
        for (let i = 0; i < drawBuffersLength; i++) {
            glTexture = this._textureManager.updateTexture(renderTarget._drawBuffers[i], true);

            // Attach draw buffer as color attachment (in specified order)
            this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._FIRST_COLOR_ATTACHMENT + i, this._gl.TEXTURE_2D, glTexture, 0);
            drawAttachments.push(this._FIRST_COLOR_ATTACHMENT + i);
        }

        // Unbind the texture (binded in the texture manager)
        this._gl.bindTexture(this._gl.TEXTURE_2D, null);

        // Unbind any attachments left from the previous renders
        if (renderTarget.__fboLength !== null && renderTarget.__fboLength > drawBuffersLength) {
            for (let i = drawBuffersLength; i < renderTarget.__fboLength; i++) {
                this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._FIRST_COLOR_ATTACHMENT + i, this._gl.TEXTURE_2D, null, 0);
            }
        }

        // Setup draw buffers
        this._gl.drawBuffers(drawAttachments);

        // Private length specifying number of attachments used in previous renders
        renderTarget.__fboLength = drawBuffersLength;
        // endregion

        // Validation
        if (this._gl.checkFramebufferStatus(this._gl.FRAMEBUFFER) !== this._gl.FRAMEBUFFER_COMPLETE) {
            console.error("Render target: framebuffer not complete!")

            switch (this._gl.checkFramebufferStatus(this._gl.FRAMEBUFFER)) {
                case this._gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                    console.error("FRAMEBUFFER_INCOMPLETE_ATTACHMENT: The attachment types are mismatched or not all framebuffer attachment points are framebuffer attachment complete.");
                    break;
                case this._gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                    console.error("FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: There is no attachment.");
                    break;
                case this._gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                    console.error("FRAMEBUFFER_INCOMPLETE_DIMENSIONS: Problem with the texture dimensions.");
                    break;
                case this._gl.FRAMEBUFFER_UNSUPPORTED:
                    console.error("FRAMEBUFFER_UNSUPPORTED: The format of the attachment is not supported or if depth and stencil attachments are not the same renderbuffer.");
                    break;
                case this._gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE:
                    console.error("FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: The values of gl.RENDERBUFFER_SAMPLES are different among attached renderbuffers, or are non-zero if the attached images are a mix of renderbuffers and textures.");
                    break;
                default:
                    console.error("Unknown error! Abandon hope all ye who enter here.")
            }
        }
    }

    cleanupRenderTarget() {
        this._fboManager.unbindFramebuffer();
    }

    getTexture(reference) {
        return this._textureManager.getTexture(reference);
    }

    getAttributeBuffer (attribute) {
        return this._attributeManager.getCachedBuffer(attribute);
    }

    clearAttributeBuffers() {
        this._attributeManager.clearBuffers();
    }

    //region CLEARING FUNCTIONS
    /**
     * Clears the selected gl buffers with their preset value
     * @param {boolean} color true if clear, false if not
     * @param {boolean} depth true if clear, false if not
     * @param {boolean} stencil true if clear, false if not
     */
    clear (color, depth, stencil) {
        var bits = 0;

        if ( color === undefined || color ) bits |= this._gl.COLOR_BUFFER_BIT;
        if ( depth === undefined || depth ) bits |= this._gl.DEPTH_BUFFER_BIT;
        if ( stencil === undefined || stencil ) bits |= this._gl.STENCIL_BUFFER_BIT;

        this._gl.clear(bits);
    };

    /**
     * Sets clear color values
     * @param r Red
     * @param g Green
     * @param b Blue
     * @param a Alpha
     */
    setClearColor (r, g, b, a) {
        var color = new THREE.Vector4(r, g, b, a);

        if (this._clearColor.equals(color) === false) {
            this._gl.clearColor(r, g, b, a);
            this._clearColor.copy(color);
        }
    };

    /**
     * Sets depth buffer clear value
     * @param depth Depth buffer clear value (0 - 1)
     */
    setClearDepth (depth) {
        if (this._clearDepth !== depth) {
            this._gl.clearDepth(depth);
            this._clearDepth = depth;
        }
    };

    /**
     * Sets stencil buffer clear value
     * @param stencil Stencil buffer clear value
     */
    setClearStencil (stencil) {
        if (this._clearStencil !== stencil) {
            this._gl.clearStencil(stencil);
            this._clearStencil = stencil;
        }
    };

    //endregion


    /**
     * GETTERS & SETTERS
     */
    get context () { return this._gl; }

    get glVersion () { return this._glVersion; }

    get cache_programs () { return LOGI._ProgramCaching; }

    set cache_programs (enable) { LOGI._ProgramCaching = enable; }
};