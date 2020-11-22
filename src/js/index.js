import * as THREE from "three";
import * as dat from "dat.gui";

import fragment from "./shaders/fragment.glsl";
import vertex from "./shaders/vertex.glsl";

// import { TimelineMax } from "gsap";

const OrbitControls = require("three-orbit-controls")(THREE);

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width / 2, this.height / 2);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.dom);
    this.time = 0;

    this.isPlaying = true;
    this.init.bind(this);
  }

  init() {
    this.addObjects();
    this.resize();
    this.renderer();
    this.setupResize();
  }

  settings() {
    const that = this;
    this.settings = {
      progress: 0
    };
    this.gui = new dat.GUI();
    this.gui.add(that.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.setupResize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix(); // Figure out what this does
  }

  addObjects() {
    const materialConfig = {
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        }
      },
      vertexShader: vertex,
      fragmentShader: fragment
    };

    this.material = new THREE.ShaderMaterial(materialConfig);
    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  stop() {
    this.playing = false;
  }

  play() {
    if (!this.playing) {
      this.renderer();
      this.isPlaying = true;
    }
  }

  renderer() {
    if (!this.isPlaying) return;

    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.renderer.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById("app")
});
