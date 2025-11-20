let bikeScene, bikeCamera, bikeRenderer;
let bike, bikeObstacles = [], bikeBoosts = [];
let bikeGameStarted = false, bikeGameOver = false;
let bikeScore = 0, bikeSpeed = 0.23, obstacleSpeed = 0.24, boostSpeed = 0.26;
let bikeKeys = {};

function bikeInit() {
    bikeScene = new THREE.Scene();
    bikeScene.fog = new THREE.Fog(0x22234e, 7, 90);

    bikeCamera = new THREE.PerspectiveCamera(82, window.innerWidth/window.innerHeight, 0.1, 1000);
    bikeCamera.position.set(0, 7, 18);
    bikeCamera.lookAt(0,0,0);

    bikeRenderer = new THREE.WebGLRenderer({ antialias: true });
    bikeRenderer.setSize(window.innerWidth, window.innerHeight);
    bikeRenderer.setPixelRatio(window.devicePixelRatio);
    bikeRenderer.setClearColor(0x1f2040);
    document.body.appendChild(bikeRenderer.domElement);

    let l = new THREE.AmbientLight(0xffffff, 1.65); bikeScene.add(l);
    let dl = new THREE.DirectionalLight(0xfafafa, 2.4); dl.position.set(0,20,20); bikeScene.add(dl);

    // Road: illuminated path
    let roadGeom = new THREE.BoxGeometry(8,0.08,60);
    let roadMat = new THREE.MeshPhongMaterial({color:0x2c3e50,emissive:0x191970,emissiveIntensity:0.28});
    let road = new THREE.Mesh(roadGeom,roadMat);
    road.position.set(0, -0.32, -22);
    bikeScene.add(road);

    // Bike: cylinder body, two torus wheels, handlebar (higher detail)
    let bikeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.34, 2.1, 20), new THREE.MeshPhongMaterial({color:0x18c741,emissive:0x18c741,emissiveIntensity:0.27}));
    bikeBody.rotation.z = Math.PI/2;
    bikeBody.position.set(0,0,9);
    
    let handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 14), new THREE.MeshPhongMaterial({color:0xffd700}));
    handlebar.position.set(0,0.27,9.75);
    handlebar.rotation.x = Math.PI/2;
    bikeBody.add(handlebar);

    for(let i=0;i<2;i++){ // front and back wheels
        let wheel = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.08, 11, 17), new THREE.MeshPhongMaterial({color:0x212121,emissive:0x333333,emissiveIntensity:0.07}));
        wheel.position.set(i==0?0.93:-0.93, -0.35, i==0?0.75:-0.76);
        bikeBody.add(wheel);
    }
    bike = bikeBody;
    bikeScene.add(bike);

    document.addEventListener('keydown',e=>{bikeKeys[e.key.toLowerCase()]=true;});
    document.addEventListener('keyup',e=>{bikeKeys[e.key.toLowerCase()]=false;});
    window.addEventListener('resize', onBikeResize);

    bikeAnimate();
}

function bikeObstacle() {
    let og = new THREE.DodecahedronGeometry(0.7+Math.random()*0.6);
    let om = new THREE.MeshPhongMaterial({color:0xed1c24,emissive:0xad1616,emissiveIntensity:0.42});
    let obs = new THREE.Mesh(og,om);
    obs.position.set((Math.random()-0.5)*7,0,-58);
    bikeScene.add(obs); bikeObstacles.push(obs);
}

function bikeBoost() {
    let geom = new THREE.SphereGeometry(0.25,12,8);
    let mat = new THREE.MeshPhongMaterial({color:0x19e5ff,emissive:0x69F0FF,emissiveIntensity:0.47});
    let boost = new THREE.Mesh(geom,mat);
    boost.position.set((Math.random()-0.5)*7,0,-58-(Math.random()*12));
    bikeScene.add(boost); bikeBoosts.push(boost);
}

function updateBike(){
    if(!bikeGameStarted||bikeGameOver)return;
    if(bikeKeys['arrowleft']||bikeKeys['a']) bike.position.x -= bikeSpeed;
    if(bikeKeys['arrowright']||bikeKeys['d']) bike.position.x += bikeSpeed;
    bike.position.x=Math.max(-3.3,Math.min(3.3,bike.position.x));
}

function updateBikeObs(){
    if(!bikeGameStarted||bikeGameOver)return;
    bikeObstacles.forEach((obs,idx)=>{
        obs.position.z += obstacleSpeed;
        obs.rotation.x += 0.012;
        if(obs.position.z>12){bikeScene.remove(obs);bikeObstacles.splice(idx,1);bikeScore+=14;
            document.getElementById('score').textContent=`Score: ${bikeScore}`;
            if(bikeScore%140==0)obstacleSpeed+=0.02;
        }
        if(bike.position.distanceTo(obs.position)<0.72){endBikeGame();}
    });
}

function updateBikeBoosts(){
    if(!bikeGameStarted||bikeGameOver)return;
    bikeBoosts.forEach((b,idx)=>{
        b.position.z += boostSpeed;
        if(b.position.z>12){bikeScene.remove(b);bikeBoosts.splice(idx,1);}
        if(bike.position.distanceTo(b.position)<0.53){
            bikeScore+=16; document.getElementById('score').textContent = `Score: ${bikeScore}`;
            boostSpeed+=0.0025;
            bikeScene.remove(b); bikeBoosts.splice(idx,1);
        }
    });
}

function startBikeGame(){
    bikeGameStarted=true;
    document.getElementById('instructions').style.display='none';
    setInterval(()=>{if(bikeGameStarted&&!bikeGameOver)bikeObstacle();},1100);
    setInterval(()=>{if(bikeGameStarted&&!bikeGameOver)bikeBoost();},1800);
}

function endBikeGame(){
    bikeGameOver=true;
    document.getElementById('bikeFinalScore').textContent=`Your Score: ${bikeScore}`;
    document.getElementById('gameOver').style.display='block';
}

function bikeAnimate(){
    requestAnimationFrame(bikeAnimate);
    updateBike(); updateBikeObs(); updateBikeBoosts();
    bikeRenderer.render(bikeScene,bikeCamera);
}

function onBikeResize(){
    bikeCamera.aspect=window.innerWidth/window.innerHeight;
    bikeCamera.updateProjectionMatrix();
    bikeRenderer.setSize(window.innerWidth,window.innerHeight);
}

bikeInit();