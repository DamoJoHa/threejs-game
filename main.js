import * as THREE from 'three';
import GUI from 'lil-gui'


function main() {
  // SETUP


  const canvas = document.querySelector("#c")
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas})


  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 60;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 50, 0);
  camera.up.set(0, 0, 1);
  camera.lookAt(0, 0, 0)

  const scene = new THREE.Scene();


  // SCENE CONTENTS

  const objects = [];

  // scene default sphere
  const sphereRad  = 1;
  const sphereWSegs = 6;
  const sphereHSegs = 6;
  const sphereGeometry = new THREE.SphereGeometry(sphereRad, sphereWSegs, sphereHSegs)

  //solar system
  const solarSystem = new THREE.Object3D();
  objects.push(solarSystem);
  scene.add(solarSystem);

  const earthOrbit = new THREE.Object3D();
  earthOrbit.position.x = 10;
  objects.push(earthOrbit);
  solarSystem.add(earthOrbit);

  const moonOrbit = new THREE.Object3D();
  moonOrbit.position.x = 2;
  objects.push(moonOrbit)
  earthOrbit.add(moonOrbit)


  //sun
  const sunMat = new THREE.MeshPhongMaterial({emissive: 0xFFFF00});
  const sunMesh = new THREE.Mesh(sphereGeometry, sunMat);
  sunMesh.scale.set(5, 5, 5);
  solarSystem.add(sunMesh);
  objects.push(sunMesh);


  //earth
  const earthMat = new THREE.MeshStandardMaterial({color: 0x2233FF, metalness: 0.5, roughness: 0.6});
  const earthMesh = new THREE.Mesh(sphereGeometry, earthMat);
  earthOrbit.add(earthMesh)
  objects.push(earthMesh)

  //moon
  const moonMat = new THREE.MeshStandardMaterial({color: 0x888888, emissive: 0x222222, metalness: 0.8, roughness: 0.3});
  const moonMesh = new THREE.Mesh(sphereGeometry, moonMat);
  moonMesh.scale.set(.3, .3, .3);
  moonOrbit.add(moonMesh);
  objects.push(moonMesh);

  //light in sun
  const color = 0xFFFFFF;
  const intensity = 30;
  const light = new THREE.PointLight(color, intensity);
  scene.add(light);

  // fill light
  const sceneLight = new THREE.AmbientLight(0x404040)
  scene.add(sceneLight)


  // Helpers
  const gui = new GUI();

  class AxisGridHelper {
    constructor(node, units = 10) {
      const axes = new THREE.AxesHelper();
      axes.material.depthTest = false;
      axes.renderOrder = 2;  // after the grid
      node.add(axes);

      const grid = new THREE.GridHelper(units, units);
      grid.material.depthTest = false;
      grid.renderOrder = 1;
      node.add(grid);

      this.grid = grid;
      this.axes = axes;
      this.visible = false;
    }
    get visible() {
      return this._visible;
    }
    set visible(v) {
      this._visible = v;
      this.grid.visible = v;
      this.axes.visible = v;
    }
  }

  function makeAxisGrid(node, label, units) {
    const helper = new AxisGridHelper(node, units);
    gui.add(helper, 'visible').name(label);
  }
  makeAxisGrid(solarSystem, 'solarSystem', 25);
  makeAxisGrid(sunMesh, 'sunMesh');
  makeAxisGrid(earthOrbit, 'earthOrbit');
  makeAxisGrid(earthMesh, 'earthMesh');
  makeAxisGrid(moonOrbit, 'moonOrbit');
  makeAxisGrid(moonMesh, 'moonMesh');




  // RENDER LOGIC

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  // Animation function that rotates cube
  function render(time) {
    const seconds = time / 1000;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    objects.forEach(object => {
      object.rotation.y = seconds
    })

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

}

main();
