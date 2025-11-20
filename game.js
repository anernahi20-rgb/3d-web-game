let scene, camera, renderer;
let player, obstacles = [];
let gameStarted = false;
let gameOver = false;
let score = 0;
let speed = 0.1;
let obstacleSpeed = 0.15;
let keys = {};

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000033, 1, 100);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000033);
    document.body.appendChild(renderer.domElement);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);
    
    // Player (spaceship)
    const playerGeometry = new THREE.ConeGeometry(0.5, 2, 4);
    const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.3 });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.rotation.x = Math.PI;
    player.position.set(0, 0, 5);
    scene.add(player);
    
    // Ground grid
    const gridHelper = new THREE.GridHelper(100, 50, 0x00ffff, 0x004444);
    gridHelper.position.y = -2;
    scene.add(gridHelper);
    
    // Stars
    createStars();
    
    // Event listeners
    document.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
    document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
    window.addEventListener('resize', onWindowResize);
    
    animate();
}

function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 200;
        const y = (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 200;
        starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

function createObstacle() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.5 });
    const obstacle = new THREE.Mesh(geometry, material);
    
    obstacle.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5,
        -50
    );
    
    scene.add(obstacle);
    obstacles.push(obstacle);
}

function updatePlayer() {
    if (!gameStarted || gameOver) return;
    
    // Movement controls
    if (keys['arrowleft'] || keys['a']) {
        player.position.x -= speed;
    }
    if (keys['arrowright'] || keys['d']) {
        player.position.x += speed;
    }
    if (keys['arrowup'] || keys['w']) {
        player.position.y += speed;
    }
    if (keys['arrowdown'] || keys['s']) {
        player.position.y -= speed;
    }
    
    // Boundaries
    player.position.x = Math.max(-8, Math.min(8, player.position.x));
    player.position.y = Math.max(-3, Math.min(5, player.position.y));
    
    // Rotation effect
    player.rotation.z = -player.position.x * 0.1;
}

function updateObstacles() {
    if (!gameStarted || gameOver) return;
    
    obstacles.forEach((obstacle, index) => {
        obstacle.position.z += obstacleSpeed;
        obstacle.rotation.x += 0.02;
        obstacle.rotation.y += 0.02;
        
        // Remove obstacles that passed the player
        if (obstacle.position.z > 10) {
            scene.remove(obstacle);
            obstacles.splice(index, 1);
            score += 10;
            document.getElementById('score').textContent = `Score: ${score}`;
            
            // Increase difficulty
            if (score % 100 === 0) {
                obstacleSpeed += 0.02;
            }
        }
        
        // Collision detection
        const distance = player.position.distanceTo(obstacle.position);
        if (distance < 1.5) {
            endGame();
        }
    });
}

function startGame() {
    gameStarted = true;
    document.getElementById('instructions').style.display = 'none';
    setInterval(() => {
        if (gameStarted && !gameOver) {
            createObstacle();
        }
    }, 1500);
}

function endGame() {
    gameOver = true;
    document.getElementById('finalScore').textContent = `Your Score: ${score}`;
    document.getElementById('gameOver').style.display = 'block';
}

function animate() {
    requestAnimationFrame(animate);
    
    updatePlayer();
    updateObstacles();
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();