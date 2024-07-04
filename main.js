import * as THREE from 'three';
import * as TWEEN from "@tweenjs/tween.js"
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import newQuestion from './js/quiz.js'


function main() {
  // SETUP
  const canvas = document.querySelector("#c")
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas})
  const originCoordinates = new THREE.Vector3(0, 0, 0)
  const form = document.getElementById("question-form")
  const formLayer = document.getElementById("question-layer")


  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 60;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(-5, 10, 0)
  camera.up.set(1, 0, 0)
  camera.lookAt(0, 0, 0)

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.update()

  const playerSpeed = 500
  const scene = new THREE.Scene();


  // SCENE CONTENTS

  // gamestate (declared here, assigned values in resetMap method

  let goalCoordinates;
  // keeps track of how keyboard inputs should be handled
  let gamePlayState;
  // tracks if the player & board need to be reset
  let gameReset;
  // tracks where the player has been
  let coordinates;
  let currentPosition = new THREE.Vector3(0, 0,0 );
  let targetPosition = new THREE.Vector3(0, 0,0 );
  let trapCoordinates;
  let trappedTextVisible = false;
  let trapped = false;
  // tracks most recently added cube for animations
  let newCube;

  // tracks answer for trivia
  let correctAnswer;

  // score tracking
  let score = 0;
  let scoreSpan = document.getElementById("score")



  // 3D fonts
  const redTextMat = new THREE.MeshPhysicalMaterial({color: "#ff0000", transparent: true, opacity: 1})
  const fontLoader = new FontLoader();
  let trappedText
  fontLoader.load('fonts/optimer_regular.typeface.json', function (font) {
    const trapGeometry = new TextGeometry("Trapped!", {
      font: font,
      size: 20,
      depth: 2,
      curveSegments: 12,
      bevelEnabled: false,
    })
    trapGeometry.center()
    trapGeometry.scale(0.1, 0.1, 0.1)
    trappedText = new THREE.Mesh(trapGeometry, redTextMat)
    trappedText.rotateY(-1.55)
    trappedText.visible = false
    scene.add(trappedText)
  })



  // player default sphere
  const sphereRad  = .25;
  const sphereWSegs = 12;
  const sphereHSegs = 12;
  const sphereGeometry = new THREE.SphereGeometry(sphereRad, sphereWSegs, sphereHSegs)
  const playerMaterial = new THREE.MeshPhongMaterial({color: "rgb(0, 20, 144)", emissive: "rgb(100, 12, 12)"})

  const player = new THREE.Mesh(sphereGeometry, playerMaterial)
  player.position.set(0, 1, 0)
  scene.add(player)

  // terrain cubes
  // note: consider batched mesh if performance becomes a concern
  const cubeLength = 1;
  const cubeGeometry = new THREE.BoxGeometry(cubeLength, cubeLength, cubeLength)

  // Cube materials
  const defaultMaterial = new THREE.MeshPhongMaterial({color: "rgb(237, 242, 251)"})
  const firstRingMaterial = new THREE.MeshPhongMaterial({color: "rgb(171, 196, 255)"})
  const secondRingMaterial = new THREE.MeshPhongMaterial({color: "rgb(193, 211, 254)"})
  const thirdRingMaterial = new THREE.MeshPhongMaterial({color: "rgb(215, 227, 252)"})
  const goalMaterial = new THREE.MeshPhongMaterial({color: "rgb(255,191,0)}"})
  const startMaterial = new THREE.MeshPhongMaterial({color: "rgb(0, 150, 30)"})
  const trapMaterial = new THREE.MeshPhongMaterial({color: "red"})

  // starting cube & group for extra cubes
  const startCube = new THREE.Mesh(cubeGeometry, startMaterial)
  scene.add(startCube)

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
    if (gameReset) {
      // reset game if game is in reset state
      resetMap()
      return
    } else if (gamePlayState & !trapped) {
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
    }
  })


  // Movement functions can be collapes into above code later, maybe
  function moveForwards() {
    const forewardsVector = new THREE.Vector3(1, 0, 0)
    targetPosition.add(forewardsVector)
    createCube()
  }

  function moveLeft() {
    const leftVector = new THREE.Vector3(0, 0, -1)
    targetPosition.add(leftVector)
    createCube()
  }

  function moveRight() {
    const rightVector = new THREE.Vector3(0, 0, 1)
    targetPosition.add(rightVector)
    createCube()
  }

  function moveBack() {
    const backVector = new THREE.Vector3(-1, 0 , 0)
    targetPosition.add(backVector)
    createCube()
  }

  // creates a new position cube based on the position
  async function createCube() {
    let coordString = targetPosition.toArray().toString()
    if (coordinates.includes(coordString)) {
      // avoid duplicate cubes
      // console.log("not placing")
      return
    } else {
      const onTrap = trapCoordinates.includes(coordString)
      const goalDistance = findDistance(goalCoordinates, targetPosition)
      const newCubeMaterial = onTrap ? trapMaterial : selectMaterial(goalDistance)
      newCube = new THREE.Mesh(cubeGeometry, newCubeMaterial)
      newCube.position.set(targetPosition.x, -0.75, targetPosition.z)
      cubes.add(newCube)
      blockRise.start()
      coordinates.push(coordString)
      // switches play state if goal or trap is reached
      if (goalDistance === 0) {
        gameReset = true
        score += 1
        updateScore()
      } else if (onTrap) {
        trapped = true
        flashTrap()
        correctAnswer = await newQuestion(formLayer)
      }
    }
  }


  // Returns cube material based on distance from goal
  function selectMaterial(distance) {
    switch(Math.floor(distance)) {
      case 0:
        return goalMaterial
      case 1:
        return firstRingMaterial
      case 2:
        return secondRingMaterial
      case 3:
        return thirdRingMaterial
      default:
        return defaultMaterial
    }
  }

  // must always occur AFTER newCube (or something else that sets targetPosition) is called
  function movePlayer() {

    // TWEEN for movement must be here because of the way these values are stored and updated
    const playerMovement = new TWEEN.Tween({x: currentPosition.x, z: currentPosition.z})
    .to({x: targetPosition.x, z: targetPosition.z}, playerSpeed)
    .onUpdate((coords) => {
      player.position.setX(coords.x)
      player.position.z = coords.z
    })
    playerMovement.start()

    // scuffed input buffer
    gamePlayState = false
    setTimeout(() => {
      currentPosition.set(...targetPosition.toArray())
      gamePlayState = true
    }, playerSpeed);
  }

  function resetPlayer() {
    targetPosition = new THREE.Vector3(0, 0, 0)
    currentPosition = new THREE.Vector3(0, 0,0 )
  }

  function updateScore() {
    scoreSpan.innerText = `${score} Point${score === 1 ? "" : "s"}`
  }

  // returns number between -10 and 10
  function randNum() {
    return Math.ceil((Math.random() -0.5) * 20)
  }

  //find distance between two points (takes two vector3's)
  function findDistance(locA, locB) {
    return Math.sqrt((locA.x - locB.x)**2 + (locA.z - locB.z)**2)
  }

  function resetMap() {
    resetPlayer()
    coordinates = []
    coordinates.push(currentPosition.toArray().toString())

    // reset cubes
    cubes.clear()


    // setup goal coords at least a few blocks away
    let distance = 0
    while (distance < 3) {
      console.log("generating coords for goal")
      let x = randNum()
      let z = randNum()
      goalCoordinates = new THREE.Vector3(x, 0 , z)
      distance = findDistance(goalCoordinates, originCoordinates)
    }

    // setup for n traps, measure against both origin and goal
    trapCoordinates = []
    while (trapCoordinates.length < 5) {
      let distanceOrigin = 0
      let distanceGoal = 0
      let newTrapCoordinates
      while ((distanceOrigin < 3) & (distanceGoal < 3)) {
        console.log("generating coords for trap")
        let x = randNum()
        let z = randNum()
        newTrapCoordinates = new THREE.Vector3(x, 0 , z)
        distanceOrigin = findDistance(originCoordinates, trapCoordinates)
        distanceGoal = findDistance(goalCoordinates, originCoordinates)
      }
      const newTrapString = newTrapCoordinates.toArray().toString()
      if (!trapCoordinates.includes(newTrapString)) {
        trapCoordinates.push(newTrapString)
      }
    }
    console.log(trapCoordinates)

    gamePlayState = true
    gameReset = false
  }



  // trapped message
  function flashTrap() {
    trappedText.position.set(targetPosition.x, 3, targetPosition.z)
    redTextMat.opacity = 1
    trappedText.visible = true
    trappedTextVisible = true
    setTimeout(() => {
      trappedText.visible = false
      trappedTextVisible = false
    }, 3000);
  }


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
    TWEEN.update(time)
    const seconds = time / 1000;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    // camera
    controls.target.set(player.position.x, 0, player.position.z)
    controls.update()

    // rising "Trapped!" message
    if (trappedTextVisible) {
      redTextMat.opacity -= 0.01
      trappedText.position.y += 0.01
    }




    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  // Reused TWEEN Animations
  // player float
  const floatUp = new TWEEN.Tween({y: 1})
    .to({y: 1.5}, 1500)
    .onUpdate((coords) => {
      player.position.y = coords.y
    })
    .easing(TWEEN.Easing.Sinusoidal.InOut)

  const floatDown = new TWEEN.Tween({y: 1.5})
    .to({y: 1}, 1500)
    .onUpdate((coords) => {
      player.position.y = coords.y
    })
    .easing(TWEEN.Easing.Sinusoidal.InOut)
    .chain(floatUp)

  floatUp.chain(floatDown)

  floatUp.start()



  // block appearance
  const blockRise = new TWEEN.Tween({y:-0.75})
    // duration must be lower than playerSpeed, or animations may not complete
    // this could be fixed by moving this into a narrower scope? (see playerMovement)
    .to({y: 0}, playerSpeed - 50)
    .onUpdate((opts) => {
      // newCube is updated every time a cube is created
      newCube.position.y = opts.y
    })




   // handle submission of form
   form.addEventListener("submit", event => {
    event.preventDefault();
    formLayer.style.display = "none"
    const data = new FormData(form)
    const obj = Object.fromEntries(data)
    if (parseInt(obj.answer) === correctAnswer) {
      console.log("correct")
      score += 1
      trapped = false
    } else {
      console.log("incorrect")
      // Lose lives?  Reset Score?
      gameReset = true
      trapped = false
    }
    canvas.focus()
  })

  resetMap()
  requestAnimationFrame(render);

}

main()
