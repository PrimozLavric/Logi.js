/**
 * Created by Primoz on 2. 08. 2016.
 */

LOGI.Contour = class extends LOGI.Mesh {

    constructor(xy0, xy1, thickness) {

        var geometry = new LOGI.Geometry();

        // Quad vertices
        geometry.vertices = LOGI.Float32Attribute(
            [
                // Bottom left
                xy0.x,                xy1.y,                0,
                xy0.x - thickness,    xy1.y - thickness,    0,

                // Top right
                xy1.x,                xy0.y,                0,
                xy1.x + thickness,    xy0.y + thickness,    0,

                // Top left
                xy0.x,                xy0.y,                0,
                xy0.x - thickness,    xy0.y + thickness,    0,

                // Bottom right
                xy1.x,                xy1.y,                0,
                xy1.x + thickness,    xy1.y - thickness,    0
            ], 3
        );

        // Quad triangle vertices
        geometry.indices = LOGI.Uint32Attribute(
            [
                1, 7, 6,
                1, 6, 0,
                1, 0, 4,
                1, 4, 5,
                3, 6, 7,
                3, 2, 6,
                3, 5, 4,
                3, 4, 2
            ], 1);
        geometry.computeVertexNormals();

        var material = new LOGI.MeshBasicMaterial();
        material.lights = false;
        material.side = LOGI.FRONT_AND_BACK_SIDE;

        // Super LOGI.Mesh
        super(geometry, material);

        this.type = "Contour";
    }

    updateParameters(xy0, xy1, thickness) {
        this._geometry.vertices = LOGI.Float32Attribute(
                [
                    // Bottom left
                    xy0.x,                xy1.y,                0,
                    xy0.x - thickness,    xy1.y - thickness,    0,

                    // Top right
                    xy1.x,                xy0.y,                0,
                    xy1.x + thickness,    xy0.y + thickness,    0,

                    // Top left
                    xy0.x,                xy0.y,                0,
                    xy0.x - thickness,    xy0.y + thickness,    0,

                    // Bottom right
                    xy1.x,                xy1.y,                0,
                    xy1.x + thickness,    xy1.y - thickness,    0
                ], 3
            );
    }

};