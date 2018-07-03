/**
 * Core of the library containing the FoaDecoder, Binauraliser, Head Rotation and the HrtfLoader
 * @file main.js
 * @author goddarna
 * @class BinauralLib
 */


const kdt = require('kdt');
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

//const HrtfLoader =  require('./src/hrtfLoader.js');
const HeadRotation =  require('./src/HeadRotation.js');
const Binauraliser =  require('./src/Binauraliser.js');
const FOAdecoder =  require('./src/FOAdecoder.js');
const HRTFs = require('./src/defaultHRTFs.js')


class BinauralLib {
    constructor(AudioCtx){
        this.AudioCtx = AudioCtx; //define this.AudioCtx to use Web Audio nodes
        this.kdt = kdt;
        this._HRTFSampleLength = 512; //512 as default like Web Audio Panner Node
        this._HRTFDataset = HRTFs.hrtfData;//save default hrtf data
        this._HRTFDatasetLength = this._HRTFDataset.length;//number of hrtf positions

        this.createHRTFDatabase();
    }

    /**
     * creates a kd-tree database including the filled buffers 
     * and hrtf positions from the hrtf array and assigned thsi to the Binauraliser class
     * @function
     */
    createHRTFDatabase(){
        let HRTFDatabase = [];

        for (let i = 0; i < this._HRTFDatasetLength; i++){
            let hrtfBuffer = this.AudioCtx.createBuffer(2, this._HRTFSampleLength, this.AudioCtx.sampleRate);
            let buffer_L = hrtfBuffer.getChannelData(0);
            let buffer_R = hrtfBuffer.getChannelData(1);

            for (let j = 0; j < this._HRTFSampleLength; j++){
                buffer_L[j] = this._HRTFDataset[i].coeffs_left[j];
                buffer_R[j] = this._HRTFDataset[i].coeffs_right[j];                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
            }

            let cartResult = this.convertSphericalToCartesian(this._HRTFDataset[i].azimuth, this._HRTFDataset[i].elevation);
            HRTFDatabase[i] = {azimuth:this._HRTFDataset[i].azimuth, elevation:this._HRTFDataset[i].elevation, buffer:hrtfBuffer, x: cartResult.x, y: cartResult.y, z: cartResult.z};
    
        }

        let distance = function(a, b){
                return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2);
            }
       
            //create and return a kdTree containing the database and the distance algorithm
        let tree = this.kdt.createKdTree(HRTFDatabase, distance, ['x', 'y', 'z']);
     
        Binauraliser.hrtfData = tree;
        Binauraliser.hrtfSampleLength = this._HRTFSampleLength;
        
    }

    /**
     * loads the hrtf js file to  create anew database
     * @function
     * @param {array} hrtfData
     * @param {number} sampleLength
     */
    loadHRTFDataset(hrtfData, sampleLength){
        this._HRTFDataset = hrtfData;
        this._HRTFDataset = this._HRTFDataset.length;
        this._HRTFSampleLength = sampleLength;

        this.createHRTFDatabase();
    }

     /** 
     * setting the new hrtfSample length value creates a new database
    */
    set HRTFSampleLength(length){
        this._HRTFSampleLength = length;
        this.createHRTFDatabase();
    }

    /**
     * converts spherical into cartesian
     * @function
     * @param {number} az_in
     * @param {number} el_in
     * @return {array} cartesian coords
     */
    convertSphericalToCartesian(az_in, el_in) {
        const degToRad = Math.PI/180;

        let tmp_el = (90 - el_in) * degToRad;
        let tmp_az = (90 - az_in) * degToRad;

        let x_out = 1 * (Math.sin(tmp_el) * Math.cos(tmp_az));
        let y_out = 1 * (Math.sin(tmp_az) * Math.sin(tmp_el));
        let z_out = 1 * (Math.cos(tmp_el));  

        return {
            x: x_out,
            y: y_out,
            z: z_out
        };
    }

    createBinauraliser(){
        //return an instance of the Binauraliser.js class
        return new Binauraliser(this.AudioCtx);
    }

    createFOAdecoder(){
         //return an instance of the FOAdecoder.js class
        return new FOAdecoder(this.AudioCtx);
    }
    
    createHeadRotator(){
        //return an instance of the FOAdecoder.js class
        return new HeadRotation();
    }

}


module.exports = BinauralLib;

