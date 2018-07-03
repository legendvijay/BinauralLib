"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The configuration of ones VR device
 * @file webVR.js
 * @author goddarna
 * 
 */

var WebVR = function () {
    function WebVR() {
        _classCallCheck(this, WebVR);

        this.hmd;
        this.positionSensor;
        this.WebVRDetected = false;
        this.frameData = null;
        this.vrDisplay = null;
        this.checkVRsupport();
    }

    _createClass(WebVR, [{
        key: "checkVRsupport",
        value: function checkVRsupport() {
            if (typeof navigator.getVRDisplays === "function") {
                console.log("WebVR API is supported by this browser");
                this.WebVRDetected = true;
            } else {
                console.log("WebVR API is not supported by this browser");
                this.WebVRDetected = false;
            }
        }
    }, {
        key: "initialise",
        value: function initialise() {
            var _this = this;

            if (this.WebVRDetected === true) {
                navigator.getVRDisplays().then(function (displays) {

                    _this.frameData = new VRFrameData();
                    console.log(_this.frameData);

                    if (displays.length > 0) {
                        _this.vrDisplay = displays[displays.length - 1];
                        console.log(_this.vrDisplay);
                    } else {
                        console.log("No VR device found");
                    }
                    /*console.log(devices);//should return an object with PositionSensorDevice and HMDVDDevice
                    for (let i = 0; i < devices.length; i++){
                        if(devices[i] instanceof HMDVRDevice){
                            this.hmd = devices[i];
                            break;
                        }
                    }
                      if(this.hmd){
                        for (let i = 0; i < devices.length; i++){
                            if(devices[i] instanceof PositionSensorVRDevice && devices[i].hardwareUnitId == this.hmd.hardwareUnitId){
                                this.positionSensor = devices[i];
                                break;
                            }
                        }
                    }
                    console.log(this.hmd, this.positionSensor);
                    this.getPosition();*/
                });
            } else {}
        }
    }, {
        key: "getPosition",
        value: function getPosition() {
            //let statePos = this.positionSensor.state.orientation;
            //console.log(statePos);
        }
    }]);

    return WebVR;
}();

module.exports = WebVR;