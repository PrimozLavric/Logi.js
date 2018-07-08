/**
 * Created by Primoz on 18.5.2016.
 */

LOGI.AmbientLight = class extends LOGI.Light {

    constructor (color, intensity) {
        super(color, intensity);

        this.type = "AmbientLight";
    }

    static fromJson(data) {

        var light = new LOGI.AmbientLight(data.color, data.intensity);

        // Light fromJson
        light = super.fromJson(data, light);

        return light;
    }


};