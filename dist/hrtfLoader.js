"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The loading of ones HRTFs
 * @file hrtfLoader.js
 * @author goddarna
 * @class HrtfLoader
 */

var kdt = require('kdt');
/*

****KD-TREE INFO****

This is a fairly straightforward port of the simple & excellent kd-tree javascript 
library put together by Ubilabs. Their library can be used as-is in node, but this 
port changes its API to be more node-like and not require calling a new expression. 
It also wasn't on npm, and everything should be on npm.

Copyright (c) 2012 Ubilabs

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.*/

var HrtfLoader = function () {
    function HrtfLoader(audioContext) {
        _classCallCheck(this, HrtfLoader);

        this.audioContext = audioContext;
        this.indexAmount = 62; //amount of hrtfs
        //this.hrtfDatabase = new Array();//database that will contain the spherical coords, cartesian coords and the hrtf buffers
        this.azimuths = [0, 30, 45, 60, 90, 110, 135, 180, 225, 250, 270, 300, 315, 330, 0, 30, 45, 60, 90, 110, 135, 180, 225, 250, 270, 300, 315, 330, 0, 30, 45, 60, 90, 110, 135, 180, 225, 250, 270, 300, 315, 330, 0, 30, 45, 90, 110, 135, 180, 225, 250, 270, 315, 330, 45, 90, 135, 180, 225, 270, 315, 0]; //array of azimuths available
        this.elevations = [-15, -15, -15, -15, -15, -15, -15, -15, -15, -15, -15, -15, -15, -15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 70, 70, 70, 70, 70, 70, 70, 90]; //array of elevations available
        this.kdt = kdt; //kdt tree used to store and sort the hrtfDatabase
        this._HRTFDataset = null;
        this._HRTFDatasetLength = null;
    }

    /**
     * creates a hrtfdatabase with the selected hrtf sample length
     * @function
     * @param {number} sampleLength
     * @param {number} callback a callback to return the tree database for the binauraliser
     */


    _createClass(HrtfLoader, [{
        key: "createHrtfDatabase",
        value: function createHrtfDatabase(sampleLength, callback) {
            var _this = this;

            var tree = null;
            var hrtfSize = sampleLength;
            var hrtfFile = "./hrtfs/hrtf_" + hrtfSize + ".bin"; //hrtfs are stored in a  binary file in ./hrtfs

            var loadFileReq = new XMLHttpRequest();
            loadFileReq.open("GET", hrtfFile, true);
            loadFileReq.responseType = "arraybuffer";

            loadFileReq.onload = function () {
                var arrayBuffer = loadFileReq.response;
                var rawData = new Float32Array(arrayBuffer);
                var s = 0;
                var t = 2 * _this.indexAmount * hrtfSize / 2;
                var that = _this;

                //create array buffers containing the hrtf data with the amount equivalent to indexAmount
                for (var i = 0; i < that.indexAmount; i++) {
                    var hrtfBuffer = that.audioContext.createBuffer(2, hrtfSize, that.audioContext.sampleRate);
                    var buffer_L = hrtfBuffer.getChannelData(0);
                    var buffer_R = hrtfBuffer.getChannelData(1);
                    for (var j = 0; j < hrtfSize; j++) {
                        buffer_L[j] = rawData[s];
                        s++;
                        buffer_R[j] = rawData[t];
                        t++;
                    }

                    //convert the spherical into cartesians then load the database array with the positions and the buffers
                    var cartResult = that.convertSphericalToCartesian(that.azimuths[i], that.elevations[i]);
                    that.hrtfDatabase[i] = { azimuth: that.azimuths[i], elevation: that.elevations[i], buffer: hrtfBuffer, x: cartResult.x, y: cartResult.y, z: cartResult.z };
                }

                var distance = function distance(a, b) {
                    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2);
                };

                //create and return a kdTree containing the database and the distance algorithm
                tree = that.kdt.createKdTree(that.hrtfDatabase, distance, ['x', 'y', 'z']);
                callback(tree);
            };
            loadFileReq.send();
        }
    }, {
        key: "convertSphericalToCartesian",


        /**
         * converts spherical into cartesian
         * @function
         * @param {number} az_in
         * @param {number} el_in
         * @return {array} cartesian coords
         */
        value: function convertSphericalToCartesian(az_in, el_in) {
            var degToRad = Math.PI / 180;

            var tmp_el = (90 - el_in) * degToRad;
            var tmp_az = (90 - az_in) * degToRad;

            var x_out = 1 * (Math.sin(tmp_el) * Math.cos(tmp_az));
            var y_out = 1 * (Math.sin(tmp_az) * Math.sin(tmp_el));
            var z_out = 1 * Math.cos(tmp_el);

            return {
                x: x_out,
                y: y_out,
                z: z_out
            };
        }
    }, {
        key: "HRTFDataset",
        set: function set(hrtfData) {
            this._HRTFDataset = hrtfData;
            this._HRTFDataset = this._HRTFDataset.length;

            console.log(this._HRTFDatasetLength);
            console.log(this._HRTFDataset);
        },
        get: function get() {
            return this._HRTFDataset;
        }
    }]);

    return HrtfLoader;
}();

module.exports = HrtfLoader;