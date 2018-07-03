/**
 * The processing of ones FOA file
 * @file FOAdecoder.js
 * @author goddarna
 * @class FOAdecoder
 */

"use strict";

class FOAdecoder{
    constructor(audioContext){
        this.audioContext = audioContext;
        this.splitter = this.audioContext.createChannelSplitter(4);//for the 4 FOA channels
        this.merger = this.audioContext.createChannelMerger(8);//for the 8 speaker/cube configuration

        this.foaOrder = [0, 2, 3, 1];//ACN ordering
        this.foaSquare = {
            //each loudspeaker holds the W, X, Y, Z component at 0 elevation
            [0]: [0.35355, 0.35355, 0.35355, 0.00000],//loudspeaker 1 -45
            [1]: [0.35355, 0.35355, -0.35355, 0.00000],// loudspeaker 2 45
            [2]: [0.35355, -0.35355, 0.35355, 0.00000],//loudspeaker 3 -135
            [3]: [0.35355, -0.35355, -0.35355, 0.00000]//loudspeaker 4 135
        };

        this.foaCube = {
            [0]: [0.35355, 0.23570, 0.23570,-0.35355],//loudspeaker 1 0 -45
            [1]: [0.35355, 0.23570,-0.23570,-0.35355],//loudspeaker 2 0 45
            [2]: [0.35355,-0.23570, 0.23570,-0.35355],//loudspeaker 3 0 -135
            [3]: [0.35355,-0.23570,-0.23570,-0.35355],//loudspeaker 4 0 135
            [4]: [-0.00000, 0.16667, 0.16667, 0.35355],//loudspeaker 5 45 -145
            [5]: [-0.00000, 0.16667,-0.16667, 0.35355],//loudspeaker 6 45 45
            [6]: [-0.00000,-0.16667, 0.16667, 0.35355],//loudspeaker 7 45 -135
            [7]: [-0.00000,-0.16667,-0.16667, 0.35355]//loudspeaker 8 45 135
        };

        //create an array of 8 virtual loudspeakers for the cube configuration
        this.speaker = new Array(8);
        for (let i = 0; i < 8; i++){
            this.speaker[i] = new VirtualSpeaker(this.audioContext, this.foaCube[i]);
        }

        this.input = this.splitter;//split the 4 channels
        this.output = this.merger;//merge the 8 channels
        
        for (let i = 0; i < 8; i++){
            this.input.connect(this.speaker[i].cW, 0);
            this.input.connect(this.speaker[i].cY, 1);
            this.input.connect(this.speaker[i].cZ, 2);
            this.input.connect(this.speaker[i].cX, 3);

            this.speaker[i].cW.connect(this.merger, 0, i);
            this.speaker[i].cX.connect(this.merger, 0, i);
            this.speaker[i].cY.connect(this.merger, 0, i);
            this.speaker[i].cZ.connect(this.merger, 0, i);

        }
    }

}

/**
 * a spaker containing all the given coefficients
 * @class VirtualSpeaker
 * @constructor audioContext
 * @constructor coeff
 */
class VirtualSpeaker {
    constructor (audioContext, coeff){
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
    }
}



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