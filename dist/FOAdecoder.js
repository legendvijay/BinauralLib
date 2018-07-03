/**
 * The processing of ones FOA file
 * @file FOAdecoder.js
 * @author goddarna
 * @class FOAdecoder
 */

"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FOAdecoder = function FOAdecoder(audioContext) {
    var _foaSquare, _foaCube;

    _classCallCheck(this, FOAdecoder);

    this.audioContext = audioContext;
    this.splitter = this.audioContext.createChannelSplitter(4); //for the 4 FOA channels
    this.merger = this.audioContext.createChannelMerger(8); //for the 8 speaker/cube configuration

    this.foaOrder = [0, 2, 3, 1]; //ACN ordering
    this.foaSquare = (_foaSquare = {}, _defineProperty(_foaSquare, 0, [0.35355, 0.35355, 0.35355, 0.00000]), _defineProperty(_foaSquare, 1, [0.35355, 0.35355, -0.35355, 0.00000]), _defineProperty(_foaSquare, 2, [0.35355, -0.35355, 0.35355, 0.00000]), _defineProperty(_foaSquare, 3, [0.35355, -0.35355, -0.35355, 0.00000]), _foaSquare);

    this.foaCube = (_foaCube = {}, _defineProperty(_foaCube, 0, [0.35355, 0.23570, 0.23570, -0.35355]), _defineProperty(_foaCube, 1, [0.35355, 0.23570, -0.23570, -0.35355]), _defineProperty(_foaCube, 2, [0.35355, -0.23570, 0.23570, -0.35355]), _defineProperty(_foaCube, 3, [0.35355, -0.23570, -0.23570, -0.35355]), _defineProperty(_foaCube, 4, [-0.00000, 0.16667, 0.16667, 0.35355]), _defineProperty(_foaCube, 5, [-0.00000, 0.16667, -0.16667, 0.35355]), _defineProperty(_foaCube, 6, [-0.00000, -0.16667, 0.16667, 0.35355]), _defineProperty(_foaCube, 7, [-0.00000, -0.16667, -0.16667, 0.35355]), _foaCube);

    //create an array of 8 virtual loudspeakers for the cube configuration
    this.speaker = new Array(8);
    for (var i = 0; i < 8; i++) {
        this.speaker[i] = new VirtualSpeaker(this.audioContext, this.foaCube[i]);
    }

    this.input = this.splitter; //split the 4 channels
    this.output = this.merger; //merge the 8 channels

    for (var _i = 0; _i < 8; _i++) {
        this.input.connect(this.speaker[_i].cW, 0);
        this.input.connect(this.speaker[_i].cY, 1);
        this.input.connect(this.speaker[_i].cZ, 2);
        this.input.connect(this.speaker[_i].cX, 3);

        this.speaker[_i].cW.connect(this.merger, 0, _i);
        this.speaker[_i].cX.connect(this.merger, 0, _i);
        this.speaker[_i].cY.connect(this.merger, 0, _i);
        this.speaker[_i].cZ.connect(this.merger, 0, _i);
    }
};

/**
 * a spaker containing all the given coefficients
 * @class VirtualSpeaker
 * @constructor audioContext
 * @constructor coeff
 */


var VirtualSpeaker = function VirtualSpeaker(audioContext, coeff) {
    _classCallCheck(this, VirtualSpeaker);

    this.audioContext = audioContext;
    this.coefficients = coeff;
    this.cW = this.audioContext.createGain();
    this.cX = this.audioContext.createGain();
    this.cY = this.audioContext.createGain();
    this.cZ = this.audioContext.createGain();

    this.cW.gain.value = this.coefficients[0];
    this.cX.gain.value = this.coefficients[1];
    this.cY.gain.value = this.coefficients[2];
    this.cZ.gain.value = this.coefficients[3];
};

module.exports = FOAdecoder;

//foa decoding from headphonelib

/*processFOASquare(inputBuffer){
     console.log("processing FOA");
     let input = {
         ['w']: {},
         ['y']: {},
         ['z']: {},
         ['x']: {}
     };
     let output = new Array();
     let outputBuffer = this.audioContext.createBuffer(4, inputBuffer.length, this.audioContext.sampleRate);
       for (let ch = 0; ch < 4; ch++){
         input[this.foaOrder[ch]] = inputBuffer.getChannelData(ch);
         output[ch] = outputBuffer.getChannelData(ch);
     }
       for (let s = 0; s < inputBuffer.length; s++){
         output[0][s] += (this.foaSquare[0][0] * input['w'][s] + this.foaSquare[0][1] * input['x'][s] + this.foaSquare[0][2] * input['y'][s] + this.foaSquare[0][3] * input['z'][s]);
         output[1][s] += (this.foaSquare[1][0] * input['w'][s] + this.foaSquare[1][1] * input['x'][s] + this.foaSquare[1][2] * input['y'][s] + this.foaSquare[1][3] * input['z'][s]);
         output[2][s] += (this.foaSquare[2][0] * input['w'][s] + this.foaSquare[2][1] * input['x'][s] + this.foaSquare[2][2] * input['y'][s] + this.foaSquare[2][3] * input['z'][s]);
         output[3][s] += (this.foaSquare[3][0] * input['w'][s] + this.foaSquare[3][1] * input['x'][s] + this.foaSquare[3][2] * input['y'][s] + this.foaSquare[3][3] * input['z'][s]);
     }
       return outputBuffer;
 }
   processFOACube(inputBuffer){
     console.log("processing FOA");
     let input = {
         ['w']: {},
         ['y']: {},
         ['z']: {},
         ['x']: {}
     };
     let output = new Array();
     let outputBuffer = this.audioContext.createBuffer(8, inputBuffer.length, this.audioContext.sampleRate);
     
     for (let ch = 0; ch < 4; ch++){
         input[this.foaOrder[ch]] = inputBuffer.getChannelData(ch);
     }
       for (let ch = 0; ch < 8; ch++){
         output[ch] = outputBuffer.getChannelData(ch);
     }
       for (let s = 0; s < inputBuffer.length; s++){
         output[0][s] += (this.foaCube[0][0] * input['w'][s] + this.foaCube[0][1] * input['x'][s] + this.foaCube[0][2] * input['y'][s] + this.foaCube[0][3] * input['z'][s]);
         output[1][s] += (this.foaCube[1][0] * input['w'][s] + this.foaCube[1][1] * input['x'][s] + this.foaCube[1][2] * input['y'][s] + this.foaCube[1][3] * input['z'][s]);
         output[2][s] += (this.foaCube[2][0] * input['w'][s] + this.foaCube[2][1] * input['x'][s] + this.foaCube[2][2] * input['y'][s] + this.foaCube[2][3] * input['z'][s]);
         output[3][s] += (this.foaCube[3][0] * input['w'][s] + this.foaCube[3][1] * input['x'][s] + this.foaCube[3][2] * input['y'][s] + this.foaCube[3][3] * input['z'][s]);
         output[4][s] += (this.foaCube[4][0] * input['w'][s] + this.foaCube[4][1] * input['x'][s] + this.foaCube[4][2] * input['y'][s] + this.foaCube[4][3] * input['z'][s]);
         output[5][s] += (this.foaCube[5][0] * input['w'][s] + this.foaCube[5][1] * input['x'][s] + this.foaCube[5][2] * input['y'][s] + this.foaCube[5][3] * input['z'][s]);
         output[6][s] += (this.foaCube[6][0] * input['w'][s] + this.foaCube[6][1] * input['x'][s] + this.foaCube[6][2] * input['y'][s] + this.foaCube[6][3] * input['z'][s]);
         output[7][s] += (this.foaCube[7][0] * input['w'][s] + this.foaCube[7][1] * input['x'][s] + this.foaCube[7][2] * input['y'][s] + this.foaCube[7][3] * input['z'][s]);
     }
       return outputBuffer;
 }*/