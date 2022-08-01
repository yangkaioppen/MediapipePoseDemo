# MediapipePoseDemo
Demo for Mediapipe Pose

See [the official page of Mediapipe Pose](https://google.github.io/mediapipe/solutions/pose.html) for the details of APIs and outputs.

## Usage
Install `Node.js` and then install `yarn` and `gulp-cli` globally by `npm`.
Clone this repository  and run:
```bash
$  yarn install
$  gulp
```
Web files will then be generated in `dist/` folder.

## Notes
Use the `https` protocol otherwise you will get a `No navigator.mediaDevices.getUserMedia exists` error.

The web server should return `application/wasm` MIME type for `.wasm` files.

It can not be run on Safari on iOS devices currently.

