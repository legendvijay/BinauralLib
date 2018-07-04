/**
 * Deals with the rotation of ones head 
 * @file headRotation.js
 * @author goddarna
 * @class HeadRotation
 */

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HeadRotation = function () {
        function HeadRotation() {
                _classCallCheck(this, HeadRotation);

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


        _createClass(HeadRotation, [{
                key: "applyHeadRotation",
                value: function applyHeadRotation(x, y, z) {
                        var quaternionResult = this.calculateQuaternion(this.yaw, this.pitch, this.roll);
                        var cartesianResult = this.applyQuaternion(x, y, z, quaternionResult);

                        return { x: cartesianResult.x, y: cartesianResult.y, z: cartesianResult.z };
                }

                /**
                 *calculates the quaternions from the spherical coordinates
                 * @function
                 * @param {number} yaw
                 * @param {number} pitch
                 * @param {number} roll
                 * @return {array} rotaion quaternion result
                 */

        }, {
                key: "calculateQuaternion",
                value: function calculateQuaternion(yaw, pitch, roll) {

                        var degToRad = Math.PI / 180;

                        var q1 = new Array(0, 0, 0, 0);
                        var q2 = new Array(0, 0, 0, 0);
                        var q3 = new Array(0, 0, 0, 0);
                        var rotationQuat = new Array();

                        var yaw_rad = yaw * degToRad;
                        var pitch_rad = pitch * degToRad;
                        var roll_rad = roll * degToRad;

                        q1[0] = Math.cos(yaw_rad / 2);
                        q2[0] = Math.cos(pitch_rad / 2);
                        q3[0] = Math.cos(roll_rad / 2);
                        q2[1] = -Math.sin(pitch_rad / 2);
                        q3[2] = -Math.sin(roll_rad / 2);
                        q1[3] = Math.sin(yaw_rad / 2);

                        rotationQuat[0] = q3[0] * q2[0] * q1[0] - q3[2] * -q2[1] * q1[3];
                        rotationQuat[1] = q3[0] * q2[1] * q1[0] + q3[2] * q2[0] * q1[3];
                        rotationQuat[2] = q3[0] * -q2[1] * q1[3] + q3[2] * q2[0] * q1[0];
                        rotationQuat[3] = q3[0] * q2[0] * q1[3] - q3[2] * q2[1] * q1[0];

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

        }, {
                key: "applyQuaternion",
                value: function applyQuaternion(x, y, z, rotationQuat) {

                        var x_in = x;
                        var y_in = y;
                        var z_in = z;

                        var x_out = 2 * (rotationQuat[0] * (rotationQuat[2] * z_in - rotationQuat[3] * y_in) + rotationQuat[1] * (rotationQuat[2] * y_in + rotationQuat[3] * z_in)) + x_in * (rotationQuat[0] * rotationQuat[0] + rotationQuat[1] * rotationQuat[1] - rotationQuat[3] * rotationQuat[3] - rotationQuat[2] * rotationQuat[2]);
                        var y_out = 2 * (rotationQuat[2] * (rotationQuat[1] * x_in + rotationQuat[3] * z_in) + rotationQuat[0] * (rotationQuat[3] * x_in - rotationQuat[1] * z_in)) + y_in * (rotationQuat[2] * rotationQuat[2] + rotationQuat[0] * rotationQuat[0] - rotationQuat[3] * rotationQuat[3] - rotationQuat[1] * rotationQuat[1]);
                        var z_out = 2 * (rotationQuat[3] * (rotationQuat[1] * x_in + rotationQuat[2] * y_in) + rotationQuat[0] * (-rotationQuat[2] * x_in + rotationQuat[1] * y_in)) + z_in * (rotationQuat[3] * rotationQuat[3] + rotationQuat[0] * rotationQuat[0] - rotationQuat[2] * rotationQuat[2] - rotationQuat[1] * rotationQuat[1]);

                        return { x: x_out, y: y_out, z: z_out };
                }
        }]);

        return HeadRotation;
}();

module.exports = HeadRotation;
