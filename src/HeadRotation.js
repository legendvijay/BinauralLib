/**
 * Deals with the rotation of ones head
 * @file headRotation.js
 * @author goddarna
 * @class HeadRotation
 */

"use strict";

class HeadRotation{
    constructor(){
        this.yaw = 0;
        this.pitch = 0;
        this.roll = 0;
    }

    /**
     *applys head rotation algorithms to the positional values and returns cartesian coordinates with the added quaternions
     * @function
     * @param {number} yaw
     * @param {number} pitch
     * @param {number} roll
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {array} cartesian coords
     */
    applyHeadRotation(x, y, z){
        let quaternionResult = this.calculateQuaternion(this.yaw, this.pitch, this.roll);
        let cartesianResult = this.applyQuaternion(x, y, z, quaternionResult);

        return {x:cartesianResult.x, y:cartesianResult.y, z:cartesianResult.z};
    }
    
    /**
     *calculates the quaternions from the spherical coordinates
     * @function
     * @param {number} yaw
     * @param {number} pitch
     * @param {number} roll
     * @return {array} rotaion quaternion result
     */
    calculateQuaternion(yaw, pitch, roll){

        const degToRad = Math.PI/180;

        let q1 = new Array(0, 0, 0, 0);
        let q2 = new Array(0, 0, 0, 0);
        let q3 = new Array(0, 0, 0, 0);
        let rotationQuat = new Array();

        let yaw_rad = yaw * degToRad;
        let pitch_rad = pitch * degToRad;
        let roll_rad = roll * degToRad;

        q1[0] = Math.cos(yaw_rad/2);
        q2[0] = Math.cos(pitch_rad/2);
        q3[0] = Math.cos(roll_rad/2);
        q2[1] = -Math.sin(pitch_rad/2);
        q3[2] = -Math.sin(roll_rad/2);
        q1[3] = Math.sin(yaw_rad/2);

        rotationQuat[0] = q3[0]* q2[0]*q1[0]   -   q3[2]*-q2[1]*q1[3];
        rotationQuat[1] = q3[0]* q2[1]*q1[0]   +   q3[2]* q2[0]*q1[3];
        rotationQuat[2] = q3[0]*-q2[1]*q1[3]   +   q3[2]* q2[0]*q1[0];
        rotationQuat[3] = q3[0]* q2[0]*q1[3]   -   q3[2]* q2[1]*q1[0];
        
        return rotationQuat;
    }

    /**
     *calculates the quaternions from the spherical coordinates
     * @function
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {array} cartesian coords
     */
    applyQuaternion(x, y, z, rotationQuat){

        let x_in = x;
        let y_in = y;
        let z_in = z;

        let x_out = 2*(rotationQuat[0]*(rotationQuat[2]*z_in - rotationQuat[3]*y_in) + rotationQuat[1]*( rotationQuat[2]*y_in + rotationQuat[3]*z_in))    +   x_in*(rotationQuat[0]*rotationQuat[0] + rotationQuat[1]*rotationQuat[1] - rotationQuat[3]*rotationQuat[3] - rotationQuat[2]*rotationQuat[2]);
        let y_out = 2*(rotationQuat[2]*(rotationQuat[1]*x_in + rotationQuat[3]*z_in) + rotationQuat[0]*( rotationQuat[3]*x_in - rotationQuat[1]*z_in))    +   y_in*(rotationQuat[2]*rotationQuat[2] + rotationQuat[0]*rotationQuat[0] - rotationQuat[3]*rotationQuat[3] - rotationQuat[1]*rotationQuat[1]);
        let z_out = 2*(rotationQuat[3]*(rotationQuat[1]*x_in + rotationQuat[2]*y_in) + rotationQuat[0]*(-rotationQuat[2]*x_in + rotationQuat[1]*y_in))    +   z_in*(rotationQuat[3]*rotationQuat[3] + rotationQuat[0]*rotationQuat[0] - rotationQuat[2]*rotationQuat[2] - rotationQuat[1]*rotationQuat[1]);

        return {x:x_out, y:y_out, z:z_out};
    }
}

module.exports = HeadRotation;
