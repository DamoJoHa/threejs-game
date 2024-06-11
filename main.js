import * as THREE from 'three';
import GUI from 'lil-gui'
import { sin } from 'three/examples/jsm/nodes/Nodes.js';


function main() {
  // SETUP
  const canvas = document.querySelector("#c")
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas})


  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 60;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(-10, 10, 0)
  camera.up.set(1, 0, 0)
  camera.lookAt(0, 0, 0)

  const scene = new THREE.Scene();


  // SCENE CONTENTS

  // gamestate (declared here, assigned values in newGame method
  let goalCoordinates;
  let gamePlayState;
  let coordinates;
  let currentPosition;


  // player default sphere
  const sphereRad  = .25;
  const sphereWSegs = 12;
  const sphereHSegs = 12;
  const sphereGeometry = new THREE.SphereGeometry(sphereRad, sphereWSegs, sphereHSegs)
  const playerMaterial = new THREE.MeshPhongMaterial({color: "rgb(0, 20, 144)", emissive: "rgb(100, 12, 12)"})

  const player = new THREE.Mesh(sphereGeometry, playerMaterial)
  scene.add(player)

  // terrain cubes
  // note: consider batched mesh if performance becomes a concern
  const cubeLength = 1;
  const cubeGeometry = new THREE.BoxGeometry(cubeLength, cubeLength, cubeLength)

  // ***consider replacing cubeMaterial with a series of mats corresponding to distance from goal?)
  const cubeMaterial = new THREE.MeshPhongMaterial({color: "rgb(104, 60, 3)"})
  const winMaterial = new THREE.MeshPhongMaterial({color: "rgb(255,191,0)}"})
  const startMaterial = new THREE.MeshPhongMaterial({color: "rgb(0, 150, 30)"})

  // starting cube & group for extra cubes
  const cube = new THREE.Mesh(cubeGeometry, startMaterial)
  scene.add(cube)
  let cubes = new THREE.Group();
  scene.add(cubes)


  // main light
  const light = new THREE.PointLight(0x404040, 40, 0, 0)
  light.position.set(0, 10, 0)
  scene.add(light)

  // fill light
  const fill = new THREE.AmbientLight(0x404040, 20)
  scene.add(fill)

  // movement logic using wasd input
  canvas.addEventListener("keydown", (e) =>{
    console.log(e.keyCode)
    if (!gamePlayState) {
      //insert logic to reset game !!!
      newGame()
      return
    }
    switch(e.keyCode) {
      case 87:
        console.log("moving forward")
        moveForwards()
        break
      case 65:
        console.log("moving left")
        moveLeft()
        break
      case 68:
        console.log("moving right")
        moveRight()
        break
      case 83:
        console.log("moving back")
        moveBack()
        break
    }
    movePlayer()
  })


  // Movement functions can be collapes into above code later, maybe

  function moveForwards() {
    const forewardsVector = new THREE.Vector3(1, 0, 0)
    currentPosition.add(forewardsVector)
    newCube()
  }

  function moveLeft() {
    const leftVector = new THREE.Vector3(0, 0, -1)
    currentPosition.add(leftVector)
    newCube()
  }

  function moveRight() {
    const rightVector = new THREE.Vector3(0, 0, 1)
    currentPosition.add(rightVector)
    newCube()
  }

  function moveBack() {
    const backVector = new THREE.Vector3(-1, 0 , 0)
    currentPosition.add(backVector)
    newCube()
  }

  // creates a new position cube based on the
  function newCube() {
    let coordString = currentPosition.toArray().toString()
    if (coordinates.includes(coordString)) {
      // avoid duplicate cubes
      console.log("not placing")
      return
    } else if (coordString == goalCoordinates) {
      // game is won
      let winCube = new THREE.Mesh(cubeGeometry, winMaterial)
      winCube.position.set(...currentPosition.toArray())
      cubes.add(winCube)
      coordinates.push(coordString)
      gamePlayState = false
    } else {
      // move and create cube
      let newCube = new THREE.Mesh(cubeGeometry, cubeMaterial)
      newCube.position.set(...currentPosition.toArray())
      cubes.add(newCube)
      coordinates.push(coordString)
    }
  }

  // must always occur AFTER newCube (or something else that sets currentPosition) is called
  function movePlayer() {
    player.position.setX(currentPosition.x)
    player.position.setZ(currentPosition.z)
  }

  function resetPlayer() {
    currentPosition = new THREE.Vector3(0, 0, 0);
    movePlayer()
  }

  // returns number between -10 and 10
  function randNum() {
    return Math.ceil((Math.random() -0.5) * 20)
  }

  function newGame() {
    resetPlayer()
    coordinates = []
    coordinates.push(currentPosition.toArray().toString())

    // reset cubes
    cubes.clear()


    // setup goal coords
    let x = randNum()
    let z = randNum()
    goalCoordinates = `${x},0,${z}`
    console.log(goalCoordinates)

    // TODO generate traps
    gamePlayState = true
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

  // Resize and animate function + game logic
  function render(time) {
    const seconds = time / 1000;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    // player float
    player.position.setY(.25 * Math.sin(seconds) + 1)

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  newGame()
  requestAnimationFrame(render);

}

main();
