let carScene, carCamera, carRenderer;
let car, carObstacles = [];
let carGameStarted = false;
let carGameOver = false;
let carScore = 0;
let carSpeed = 0.2;
let carObsSpeed = 0.22;
let carKeys = {};

function carInit() {
    carScene = new THREE.Scene();
    carScene.fog = new THREE.Fog(0x333333, 5, 80);

    carCamera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    carCamera.position.set(0, 8, 15);
    carCamera.lookAt(0,0,0);

    carRenderer = new THREE.WebGLRenderer({ antialias: true });
    carRenderer.setSize(window.innerWidth, window.innerHeight);
    carRenderer.setClearColor(0x222222);
    document.body.appendChild(carRenderer.domElement);

    let l = new THREE.AmbientLight(0xffffff, 1); carScene.add(l);
    let dl = new THREE.DirectionalLight(0xffffff, 2); dl.position.set(0,20,20); carScene.add(dl);

    // Car: simple box body + cylinders for wheels
    let carGeom = new THREE.BoxGeometry(1.5, 0.5, 3);
    let carMat = new THREE.MeshPhongMaterial({color: 0x00d9ff});
    car = new THREE.Mesh(carGeom, carMat);
    car.position.set(0,0,7);
    carScene.add(car);

    let wheelGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
    let wheelMat = new THREE.MeshPhongMaterial({color: 0x111111});
    for(let i=0;i<4;i++){
        let wheel = new THREE.Mesh(wheelGeom, wheelMat);
        wheel.rotation.z = Math.PI/2;
        wheel.position.set(i<2?0.6:-0.6,-0.3,i%2?1.1:-1.1);
        car.add(wheel);
    }

    // Road (long thin box)
    let roadGeom = new THREE.BoxGeometry(6,0.05,50);
    let roadMat = new THREE.MeshPhongMaterial({color:0x444444});
    let road = new THREE.Mesh(roadGeom,roadMat);
    road.position.set(0,-0.28,-20);
    carScene.add(road);

    document.addEventListener('keydown',e=>{carKeys[e.key.toLowerCase()]=true;});
    document.addEventListener('keyup',e=>{carKeys[e.key.toLowerCase()]=false;});
    window.addEventListener('resize', onCarResize);

    carAnimate();
}

function carObstacle(){
    let og = new THREE.BoxGeometry(1.2,0.7,1.2);
    let om = new THREE.MeshPhongMaterial({color:0xff4136});
    let obs = new THREE.Mesh(og,om);
    obs.position.set((Math.random()-0.5)*5,0,-45);
    carScene.add(obs); carObstacles.push(obs);
}

function updateCar(){
    if(!carGameStarted||carGameOver) return;
    if(carKeys['arrowleft']||carKeys['a']) car.position.x -= carSpeed;
    if(carKeys['arrowright']||carKeys['d']) car.position.x += carSpeed;
    car.position.x = Math.max(-2.1,Math.min(2.1,car.position.x));
}

function updateCarObs(){
    if(!carGameStarted||carGameOver) return;
    carObstacles.forEach((obs,idx)=>{
        obs.position.z += carObsSpeed;
        obs.rotation.x += 0.02;
        if(obs.position.z>10){carScene.remove(obs);carObstacles.splice(idx,1);carScore += 10;
            document.getElementById('score').textContent=`Score: ${carScore}`;
            if(carScore%100==0)carObsSpeed+=0.025;
        }
        if(car.position.distanceTo(obs.position)<1.25){endCarGame();}
    });
}

function startCarGame(){
    carGameStarted = true;
    document.getElementById('instructions').style.display='none';
    setInterval(()=>{if(carGameStarted&&!carGameOver)carObstacle();},1400);
}

function endCarGame(){
    carGameOver=true;
    document.getElementById('carFinalScore').textContent=`Your Score: ${carScore}`;
    document.getElementById('gameOver').style.display='block';
}

function carAnimate(){
    requestAnimationFrame(carAnimate);
    updateCar(); updateCarObs();
    carRenderer.render(carScene,carCamera);
}

function onCarResize(){
    carCamera.aspect=window.innerWidth/window.innerHeight;
    carCamera.updateProjectionMatrix();
    carRenderer.setSize(window.innerWidth,window.innerHeight);
}

carInit();