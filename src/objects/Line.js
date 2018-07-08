/**
 * Created by Primoz on 6. 08. 2016.
 */

/**
 * Created by Primoz on 23. 07. 2016.
 */

LOGI.Line = class extends LOGI.Mesh {
    constructor(points, material, geometry) {

        if (geometry === undefined) {
            var geometry = new LOGI.Geometry();

            // Quad vertices
            geometry.vertices = LOGI.Float32Attribute(points, 3);

            if (material === undefined) {
                material = new LOGI.MeshBasicMaterial();
            }
        }

        // Super LOGI.Mesh
        super(geometry, material);

        this.type = "Line";
    }

    setPoints(points) {
        this._geometry.vertices.array = new Float32Array(points);
    }

    static fromJson(data, geometry, material) {
        // Create mesh object
        var line = new LOGI.Line(undefined, material, geometry);

        // Import Object3D parameters
        line = super.fromJson(data, undefined, undefined, line);

        return line;
    }

};