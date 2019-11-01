"use strict";

var gulp = require("gulp");
var scss = require("gulp-sass");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var csso = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var postcss = require("gulp-postcss");
var del = require("del");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();

gulp.task("css", function() {
  return gulp
    .src("source/scss/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(scss())
    .pipe(postcss([autoprefixer()]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"));
  // .pipe(server.stream());
});

gulp.task("images", function() {
  return gulp
    .src("source/img/**/*.{png,jpg,svg}")
    .pipe(
      imagemin([
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.svgo()
      ])
    )
    .pipe(gulp.dest("source/img"));
});

gulp.task("webp", function() {
  return gulp
    .src("source/img/**/*.{png,jpg}")
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("source/img"));
});

gulp.task("sprite", function() {
  return (
    gulp
      .src("source/img/icon-*.svg")
      .pipe(
        svgstore({
          inlineSvg: true
        })
      )
      .pipe(rename("sprite.svg"))
      // .pipe(gulp.dest("source/img"));
      .pipe(gulp.dest("build/img"))
  );
});

gulp.task("html", function() {
  return (
    gulp
      .src("source/*.html")
      .pipe(posthtml([include()]))
      // .pipe(gulp.dest("source"));
      .pipe(gulp.dest("build"))
  );
});

gulp.task("copy", function() {
  return gulp
    .src(
      [
        "source/fonts/**/*.{woff,woff2}",
        "source/img/**",
        "source/js/**"
        // "source/css/style.css"
      ],
      {
        base: "source"
      }
    )
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("server", function() {
  server.init({
    server: "build/"

    // server: "source/",
    // notify: false,
    // open: true,
    // cors: true,
    // ui: false
  });

  // gulp.watch("source/scss/**/*.scss", gulp.series("css"));
  // gulp.watch("source/*.html").on("change", server.reload);

  gulp.watch("source/less/**/*.less", gulp.series("css"));
  gulp.watch("source/img/icon-*.svg", gulp.series("sprite", "html", "refresh"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
});

gulp.task("refresh", function(done) {
  server.reload();
  done();
});

gulp.task("build", gulp.series("clean", "copy", "css", "sprite", "html"));
// gulp.task("build", gulp.series("css", "sprite", "html")); //1. таск алиасы- мета таски которые запускают другие таски

// gulp.task("start", gulp.series("css", "server"));
gulp.task("start", gulp.series("build", "server"));
