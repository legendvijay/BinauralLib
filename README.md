# BinauralLib
A library facilitating binaural audio, FOA decoding and head tracking via the Web Audio API.
Aims to solve the limitations of Web Audio's PannerNode.
---------------------------------------------------------------------------------------------------------------------------------
> Documentation is incomplete
## Quick Start
See index.html for reference.
### 1. Initialise an Audio Context
```
let audioCtx = new AudioContext();
```
### 2. Create an instance of the BinauralLib
```
const binauralLib = new BinauralLib(audioCtx);
```
### 3. Create an instance of a binauraliser
The amount of binauralisers instantiated should equal total amount of mono audio files
```
let binauraliser = binauralLib.createBinauraliser();
```
#### 4. Connect the mono source to the Binauraliser
```
binauraliser.connect(source, audioCtx.destination);
```

## Binauraliser 
Convolves a mono audio source with HRTFs of the defined positions. These positions can be given as cartesian or spherical coordinates.
```
binauraliser.azimuth = 30;
```
```
binauraliser.x = 3;
```
Once positions have been changed, update the binauraliser.
```
binauraliser.setPosition();
```
## Head Rotation
Rotates the set HRTF positions according to the movement of the users head. This feature can be applied for VR applications by inputting the Euler angles from the VR headset.
> Code examples to be uploaded

## FOA Decoding
FOA is represented as a 4 channel B format file which holds the omnidirectional component in the W, and the directional components in X, Y, Z channels. These can be decoded to a loudspeaker representation. Though decoding to any arbitrary loudspeaker setup is possible, typically 8 loudspeakers that form the corners of a cube are used.
 The higher the number of loudspeakers, the more accurate the representation of the sound field.
 As the demand of 3D audio is increasing, FOA is becoming more popular as a scene-based solution where the amount of data needed remains constant with the increasing number of sources, as opposed to object- or channel-based audio.
> Code examples to be uploaded
