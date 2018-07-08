/**
 * Created by Primoz on 29.6.2016.
 */

LOGI.Group = class extends LOGI.Object3D {
    constructor () {
        super(LOGI.Object3D);

        this.type = "Group";
    }

    static fromJson(data) {

        var group = new LOGI.Group();

        // Object3D fromJson
        group = super.fromJson(data, group);

        return group;
    }
};
