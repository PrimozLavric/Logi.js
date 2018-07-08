/**
 * Created by Ziga & Primoz on 1.4.2016.
 */

LOGI.BufferAttribute = class {

	constructor(array, itemSize) {
		this._array = array;
		this._itemSize = itemSize;

		// Tells if local copies are up to date
		this._dirty = true;
	}

	/**
	 * Returns the number of items in data array (numValues / itemSize)
	 * @returns {number} Item count
	 */
	count() {
		return this._array.length / this._itemSize;
	}

	set array(val) {
		this._array = val;
		this._dirty = true;
	}
	set itemSize(val) {
		this._itemSize = val;
		this._dirty = true;
	}
	set dirty(val) {
		this._dirty = val;
	}

	get array() { return this._array; }
	get itemSize() { return this._itemSize; }
	get dirty() { return this._dirty; }
};

LOGI.Int8Attribute = function(array, itemSize) {
	return new LOGI.BufferAttribute(new Int8Array(array), itemSize);
};

LOGI.Uint8Attribute = function(array, itemSize) {
	return new LOGI.BufferAttribute(new Uint8Array(array), itemSize);
};

LOGI.Uint8ClampedAttribute = function(array, itemSize) {
	return new LOGI.BufferAttribute(new Uint8ClampedArray(array), itemSize);
};

LOGI.Int16Attribute = function(array, itemSize) {
	return new LOGI.BufferAttribute(new Int16Array(array), itemSize);
};

LOGI.Uint16Attribute = function(array, itemSize) {
	return new LOGI.BufferAttribute(new Uint16Array(array), itemSize);
};

LOGI.Int32Attribute = function(array, itemSize) {
	return new LOGI.BufferAttribute(new Int32Array(array), itemSize);
};

LOGI.Uint32Attribute = function(array, itemSize) {
	return new LOGI.BufferAttribute(new Uint32Array(array), itemSize);
};

LOGI.Float32Attribute = function(array, itemSize) {
	return new LOGI.BufferAttribute(new Float32Array(array), itemSize);
};

LOGI.Float64Attribute = function(array, itemSize) {
	return new LOGI.BufferAttribute(new Float64Array(array), itemSize);
};