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

