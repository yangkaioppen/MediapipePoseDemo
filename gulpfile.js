var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require("tsify");
var paths = {
  pages: ["src/*.html"],
};

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

const pose_files = [
  "./node_modules/@mediapipe/pose/pose_landmark*",
  "./node_modules/@mediapipe/pose/pose_solution*",
  "./node_modules/@mediapipe/pose/pose_web.binarypb"
]

gulp.task("copy-pose-data", function() {
  return gulp.src(pose_files, {base: "./node_modules"})
    .pipe(gulp.dest("dist"));
})

gulp.task(
  "default",
  gulp.series(gulp.parallel("copy-html", "copy-pose-data"), function () {
    return browserify({
      basedir: ".",
      debug: true,
      entries: ["src/main.ts"],
      cache: {},
      packageCache: {},
    })
      .plugin(tsify)
      .bundle()
      .pipe(source("main.js"))
      .pipe(gulp.dest("dist"));
  })
);
