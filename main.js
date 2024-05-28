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
  camera.position.set(0, 10, 0)
  camera.up.set(1, 0, 0)
  camera.lookAt(0, 0, 0)

  const scene = new THREE.Scene();


  // SCENE CONTENTS

  const objects = [];
  let currentPosition = new THREE.Vector3(0, 0, 0);

  // player default sphere
  const sphereRad  = 1;
  const sphereWSegs = 6;
  const sphereHSegs = 6;
  const sphereGeometry = new THREE.SphereGeometry(sphereRad, sphereWSegs, sphereHSegs)

  // terrain cubes
  const cubeLength = 1;
  const cubeGeometry = new THREE.BoxGeometry(cubeLength, cubeLength, cubeLength)
  const cubeMaterial = new THREE.MeshPhongMaterial({color: "rgb(104, 60, 3)"})

  // starting cube
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  objects.push(cube)

  cube.position.set(...currentPosition.toArray())
  scene.add(cube)
  console.log(cube.position)

  // main light
  const light = new THREE.PointLight(0x404040, 40, 0, 0)
  light.position.set(0, 10, 0)
  scene.add(light)


  // movement logic using wasd input
  canvas.addEventListener("keydown", (e) =>{
    console.log(e.keyCode)
    switch(e.keyCode) {
      case 87:
        console.log("moving forward")
        moveForwards()
        break
    }
  })

  function moveForwards() {
    const forewardsVector = new THREE.Vector3(1, 0, 0)
    currentPosition.add(forewardsVector)
    console.log(currentPosition)

    // new cube
    let newCube = new THREE.Mesh(cubeGeometry, cubeMaterial)
    newCube.position.set(...currentPosition.toArray())
    scene.add(newCube)

  }


  // Helpers
  // const gui = new GUI();

  // class AxisGridHelper {
  //   constructor(node, units = 10) {
  //     const axes = new THREE.AxesHelper();
  //     axes.material.depthTest = false;
  //     axes.renderOrder = 2;  // after the grid
  //     node.add(axes);

  //     const grid = new THREE.GridHelper(units, units);
  //     grid.material.depthTest = false;
  //     grid.renderOrder = 1;
  //     node.add(grid);

  //     this.grid = grid;
  //     this.axes = axes;
  //     this.visible = false;
  //   }
  //   get visible() {
  //     return this._visible;
  //   }
  //   set visible(v) {
  //     this._visible = v;
  //     this.grid.visible = v;
  //     this.axes.visible = v;
  //   }
  // }

  // function makeAxisGrid(node, label, units) {
  //   const helper = new AxisGridHelper(node, units);
  //   gui.add(helper, 'visible').name(label);
  // }
  // makeAxisGrid(solarSystem, 'solarSystem', 25);
  // makeAxisGrid(sunMesh, 'sunMesh');
  // makeAxisGrid(earthOrbit, 'earthOrbit');
  // makeAxisGrid(earthMesh, 'earthMesh');
  // makeAxisGrid(moonOrbit, 'moonOrbit');
  // makeAxisGrid(moonMesh, 'moonMesh');




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

  // Resize and animate function
  function render(time) {
    const seconds = time / 1000;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

}

main();
