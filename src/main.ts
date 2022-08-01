import * as Pose from '@mediapipe/pose';
import * as DrawingUtils from '@mediapipe/drawing_utils';
import * as CameraUtils from '@mediapipe/camera_utils';

// video input
const video_element = document.getElementsByClassName('input_video')[0] as HTMLVideoElement;
// final output canvas
const canvas_element = document.getElementsByClassName('output_canvas')[0] as HTMLCanvasElement;
const canvas_ctx = canvas_element.getContext('2d');
// canvas for intermediate cropping
const crop_canvas_element = document.getElementsByClassName('crop_canvas')[0] as HTMLCanvasElement;
const crop_canvas_ctx = crop_canvas_element.getContext('2d');
// btn for toggling font/back cameras
const toggle_btn = document.getElementById("toggle-camera-btn");
const fps_label = document.getElementById("fps");

canvas_element.width = window.innerWidth;
canvas_element.height = window.innerHeight;
crop_canvas_element.width = 320;
crop_canvas_element.height = 320 / window.innerWidth * window.innerHeight;


var frame_count = 0;
var time_total = 0.0;
var last_time = (new Date()).getTime();

// callback function called when pose results returned
function onResults(results) {
  canvas_ctx.save();
  canvas_ctx.clearRect(0, 0, canvas_element.width, canvas_element.height);
  canvas_ctx.drawImage(
      results.image, 0, 0, canvas_element.width, canvas_element.height);

  if (results.poseLandmarks) {
    DrawingUtils.drawConnectors(canvas_ctx, results.poseLandmarks, Pose.POSE_CONNECTIONS,
                   {color: '#00FF00', lineWidth: 5});
    DrawingUtils.drawLandmarks(canvas_ctx, results.poseLandmarks, {color: '#FF0000', lineWidth: 2});
  }
  canvas_ctx.restore();

  // show fps
  const curr_time = (new Date()).getTime();
  time_total += curr_time - last_time;
  ++frame_count;
  last_time = curr_time;
  if (frame_count % 30 == 0) {
    const fps: number = frame_count / (time_total / 1000);
    time_total = 0.0;
    frame_count = 0;
    fps_label.innerHTML = fps.toFixed(2) + " fps";
  }
}

// crop the middle part of the video image according to aspect ratio
function cropImage() {
  var video_width = video_element.videoWidth;
  var video_height = video_element.videoHeight;

  const aspect_ratio_video = video_height / video_width;
  const aspect_ratio_crop = crop_canvas_element.height / crop_canvas_element.width;

  var src_x = 0;
  var src_y = 0;
  var src_w = video_width;
  var src_h = video_height;
  var dst_x = 0;
  var dst_y = 0;
  var dst_w = crop_canvas_element.width;
  var dst_h = crop_canvas_element.height;

  if (aspect_ratio_video > aspect_ratio_crop) {
    src_h = 1.0 * src_w * dst_h / dst_w;
    src_y = (video_height - src_h) * 0.5;
  } else {
    src_w = 1.0 * src_h * dst_w / dst_h;
    src_x = (video_width - src_w) * 0.5;
  }
  crop_canvas_ctx.save();
  canvas_ctx.clearRect(dst_x, dst_y, dst_w, dst_h);
  crop_canvas_ctx.drawImage(video_element, src_x, src_y, src_w, src_h,
    dst_x, dst_y, dst_w, dst_h);
  crop_canvas_ctx.restore();
}

function createCamera(facing_mode, pose) {
  pose.setOptions({
    // selfieMode = true when use front camera (flip image horizontally)
    selfieMode: facing_mode == 'user' ? true : false,
    // full model
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  return new CameraUtils.Camera(video_element, {
    onFrame: async () => {
      cropImage();
      await pose.send({image: crop_canvas_element});
    },
    facingMode: facing_mode,
    width: 320,
    height: 240
  });
}

function app() {
  const pose = new Pose.Pose({locateFile: (file) => {
    return `@mediapipe/pose/${file}`;
  }});

  pose.onResults(onResults);

  var facing_mode = 'user';
  var camera = null;

  const toggle_cam_func = function () {
    if (camera) {
      camera.stop();
    }
    if (facing_mode == 'user') {
      facing_mode = "environment";
    } else {
      facing_mode = 'user';
    }
    camera = createCamera(facing_mode, pose);
    camera.start();
  };

  toggle_btn.onclick = toggle_cam_func;

  toggle_cam_func();
}

app();
