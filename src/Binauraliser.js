/**
 * Where the binaural processing happens
 * @file binauraliser.js
 * @author goddarna
 * @class Binauralizer
 */

"use strict";

class Binauralizer {
    constructor(audioContext){
        this.audioContext = audioContext;
        /** 
         * Default positional values of the binauraliser
        */
        this._x = 0;
        this._y = 0;
        this._z = 0;
        this._azimuth = 0;
        this._elevation = 0;
        this._distance = 1;
     
        /** 
         * Instances of the HrtfConvolver which includes a convolver and a gain node,
         * these are crossfaded to allow for smoother interpolation between hrtfs
        */
        this.targetConvolver = new HrtfConvolver(this.audioContext);
        this.currentConvolver = new HrtfConvolver(this.audioContext);
        this.crossfadeDuration = 500;

        this.distanceGain = this.audioContext.createGain();
        /** 
         * Previous azimuth, elevation and sample length values to prevent un-needed or repeated convolutions
        */
        this.previousPosition_az = undefined;
        this.previousPosition_el = undefined;
        this.previousSampleLength = null;
    }

    /** 
     * hrtfData is obtained via the core of the binaural library
    */
    get hrtfData(){
        return this.constructor.hrtfData;
    }

    /** 
     * hrtfSampleLength is obtained via the core of the binaural library
    */
    get hrtfSampleLength(){
        return this.constructor.hrtfSampleLength;
    }

    /** 
     * setters and getters for all of the positional values
    */
    get x(){
        return this._x;
    }

    set x(value){
        this._x = value;
        this.setSpherical();
    }

    get y(){
        return this._y;
    }

    set y(value){
        this._y = value;
        this.setSpherical();
    }

    get z(){
        return this._z;
    }

    set z(value){
        this._z = value;
        this.setSpherical();
    }

    get azimuth(){
        return this._azimuth;
    }

    set azimuth(value){
        this._azimuth = value;
        this.setCartesian();
    }

    get elevation(){
        return this._azimuth;
    }

    set elevation(value){
        this._elevation = value;
        this.setCartesian();
    }



    /**
     * convert spherical into cartesian
     * @function
     */
    setCartesian(){
        let cartesianResult = this.convertSphericalToCartesian(this._azimuth, this._elevation);
        this._x = cartesianResult.x;
        this._y = cartesianResult.y;
        this._z = cartesianResult.z;
    }
    /**
     * convert spherical into cartesian
     * @function
     */
    setSpherical(){
        let sphericalResult = this.convertCartesianToSpherical(this._x, this._y, this._z);
        this._azimuth = sphericalResult.azimuth;
        this._elevation = sphericalResult.elevation;
        this._distance = sphericalResult.distance;
    }
    /**
     * apply the head rotation algorithm to the x, y, z values using the yaw, pitch, roll values 
     * @function
     */
    /*setHeadRotation(){
        let cartesianResult = this.headRotation.applyHeadRotation(this._yaw, this._pitch, this._roll, this._x, this._y, this._z);
        this._x = cartesianResult.x;
        this._y = cartesianResult.y;
        this._z = cartesianResult.z;

    }*/

    /**
     * gets the nearest buffer from the positions given, fills the buffer, then crossafes betweent the previous and current convolvers
     * with set position, the user can either use the existing positional values or new values
     * @function
     * @param {number} xPos
     * @param {number} yPos
     * @param {number} zPos
     */
    setPosition(xPos = this._x, yPos = this._y, zPos = this._z){
        
        let nearest; 
        
        if(xPos !== this._x || yPos !== this._y || zPos !== zPos){
            nearest = this.constructor.hrtfData.nearest({x: xPos, y: yPos, z: zPos}, 1)[0];
        }
        else {
            nearest = this.constructor.hrtfData.nearest({x: this._x, y: this._y, z: this._z}, 1)[0];
        }

        //this.setHeadRotation();
        //calculate distance gain from distance result
        this.setDistanceGain(this._distance);

        //find nearest result within the hrtf tree nearest to the azimuth and elevation values

        if(nearest[0].azimuth !== this.previousPosition_az || nearest[0].elevation !== this.previousPosition_el || this.constructor.hrtfSampleLength !== this.previousSampleLength){
            //apply convolution and crossfade
            this.targetConvolver.fillBuffer(nearest[0].buffer);
            this.previousPosition_az = nearest[0].azimuth;
            this.previousPosition_el = nearest[0].elevation;
            this.previousSampleLength = this.constructor.hrtfSampleLength;
            this.crossfade();
        }
      
    }

    /**
     * converts cartesian into spherical
     * @function
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {array}
     */
    convertCartesianToSpherical(x, y, z) {
        const radToDeg = 180/Math.PI;

        let distXY = Math.sqrt((x * x) + (y * y));
        let az_out = Math.atan2(x, y) * radToDeg;
        let el_out = Math.atan2(z, distXY) * radToDeg;
        let r_out = Math.sqrt(x * x + y * y + z * z);
        
        if (az_out < 0)
            {
                az_out = az_out + 360;
            }

        return {
            azimuth: az_out,
            elevation: el_out,
            distance: r_out
        };
    } 

    /**
     * converts spherical into cartesian
     * @function
     * @param {number} az_in
     * @param {number} el_in
     * @return {array}
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

    /**
     * crossfade between the previous and current convolver for a smooth interpolation between hrtfs
     * @function
     */
    crossfade(){
        this.targetConvolver.crossfadeGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.targetConvolver.crossfadeGain.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + (this.crossfadeDuration / 1000));

        this.currentConvolver.crossfadeGain.gain.setValueAtTime(1, this.audioContext.currentTime);
        this.currentConvolver.crossfadeGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + (this.crossfadeDuration / 1000));

        let t = this.targetConvolver;
        this.targetConvolver = this.currentConvolver;
        this.currentConvolver = t;
    }

    /**
     * calculates and sets the gain value from the distance value
     * @function
     * @param {number} distance
     */
    setDistanceGain(distance){
        let a = distance / 0.2;
        let b = a / 10;
        b = 1 - b;
        
        this.distanceGain.gain.value = b;
    }

    /**
     * connects the source to the previous and current convolvers then to the destination
     * @function
     * @param {AudioContext} source
     * @param {AudioContext} destination
     */
    connect(source, destination){

        source.connect(this.targetConvolver.convolver);
        this.targetConvolver.crossfadeGain.connect(this.distanceGain);
        
        source.connect(this.currentConvolver.convolver);
        this.currentConvolver.crossfadeGain.connect(this.distanceGain);

        this.distanceGain.connect(destination);
    }

    /**
     * disconnect the convolvers from the destination
     * @function
     * @param {AudioContext} destination
     */
    disconnect(destination){

        this.targetConvolver.crossfadeGain.disconnect(this.distanceGain);
        this.currentConvolver.crossfadeGain.disconnect(this.distanceGain);

        this.distanceGain.disconnect(destination);
    }
}

/**
 * creates and connects a convolver and a crossfade gain
 * @class HrtfConvolver
 * @param {AudioContext} audioContext
 */
class HrtfConvolver {
    constructor (audioContext){
        this.convolver = audioContext.createConvolver();
        this.convolver.normalize = false;
        this.crossfadeGain = audioContext.createGain();
        this.convolver.connect(this.crossfadeGain);
    }

    /**
     * fills the convolver buffer with the new hrtf buffer
     * @function
     * @param {ArrayBuffer} hrtfLR
     */
    fillBuffer(hrtfLR){
        this.convolver.buffer = hrtfLR;
    }
}

module.exports = Binauralizer;