/**
 * Created by Ziga on 20.4.2016.
 */

LOGI.Volume = class extends LOGI.Object3D {

	constructor(data, dimensions) {
		super();

		this.dimensions = dimensions;
		this.data = data;
		this.color = new THREE.Color(0x00ff00);

		this._material = new LOGI.VolumeBasicMaterial();
	}

	get material() { return this._material; }
};