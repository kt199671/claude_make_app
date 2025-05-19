// ゲーム設定
const WORLD_SIZE = 32;
const CHUNK_SIZE = 16;
const BLOCK_SIZE = 1;
const GRAVITY = -30;
const JUMP_VELOCITY = 10;
const PLAYER_HEIGHT = 1.6;
const PLAYER_SPEED = 10;
const MOUSE_SENSITIVITY = 0.002;

// ブロックタイプ
const BLOCK_TYPES = {
    air: { color: null },
    grass: { color: 0x7cfc00 },
    dirt: { color: 0x8b4513 },
    stone: { color: 0x808080 },
    wood: { color: 0x8b4513 },
    sand: { color: 0xffd700 }
};

// Three.js初期化
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// 背景
scene.background = new THREE.Color(0x87ceeb); // 空色
scene.fog = new THREE.Fog(0x87ceeb, 10, 500);

// ライト
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
scene.add(directionalLight);

// プレイヤー
const player = {
    position: new THREE.Vector3(WORLD_SIZE / 2, 20, WORLD_SIZE / 2),
    velocity: new THREE.Vector3(0, 0, 0),
    rotation: { x: 0, y: 0 },
    isGrounded: false,
    selectedBlockType: 'grass'
};

// カメラの初期位置
camera.position.copy(player.position);
camera.position.y += PLAYER_HEIGHT;

// ワールドデータ
const world = {};

// ブロック作成
function createBlock(x, y, z, type) {
    const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    const material = new THREE.MeshLambertMaterial({ color: BLOCK_TYPES[type].color });
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x, y, z);
    block.castShadow = true;
    block.receiveShadow = true;
    block.userData = { type, x, y, z };
    return block;
}

// ワールド座標キー
function getBlockKey(x, y, z) {
    return `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
}

// ブロック配置
function placeBlock(x, y, z, type) {
    const key = getBlockKey(x, y, z);
    if (world[key]) {
        scene.remove(world[key]);
    }
    
    if (type !== 'air') {
        const block = createBlock(x, y, z, type);
        scene.add(block);
        world[key] = block;
    } else {
        delete world[key];
    }
}

// ブロック取得
function getBlock(x, y, z) {
    const key = getBlockKey(x, y, z);
    return world[key];
}

// 地形生成
function generateTerrain() {
    for (let x = 0; x < WORLD_SIZE; x++) {
        for (let z = 0; z < WORLD_SIZE; z++) {
            const height = Math.floor(Math.sin(x * 0.1) * 3 + Math.cos(z * 0.1) * 3 + 10);
            
            for (let y = 0; y <= height; y++) {
                let type = 'stone';
                if (y === height) type = 'grass';
                else if (y >= height - 3) type = 'dirt';
                
                placeBlock(x, y, z, type);
            }
        }
    }
    
    // 木を生成
    for (let i = 0; i < 10; i++) {
        const x = Math.floor(Math.random() * WORLD_SIZE);
        const z = Math.floor(Math.random() * WORLD_SIZE);
        const y = getTerrainHeight(x, z) + 1;
        
        // 幹
        for (let h = 0; h < 5; h++) {
            placeBlock(x, y + h, z, 'wood');
        }
        
        // 葉
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = 3; dy <= 5; dy++) {
                    if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy - 4) <= 3) {
                        placeBlock(x + dx, y + dy, z + dz, 'grass');
                    }
                }
            }
        }
    }
}

// 地形高さ取得
function getTerrainHeight(x, z) {
    for (let y = WORLD_SIZE; y >= 0; y--) {
        if (getBlock(x, y, z)) {
            return y;
        }
    }
    return 0;
}

// レイキャスト
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// 入力管理
const keys = {};
let isPointerLocked = false;

// イベントリスナー
document.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// マウスポインターロック
document.body.addEventListener('click', () => {
    if (!isPointerLocked) {
        document.body.requestPointerLock();
    }
});

document.addEventListener('pointerlockchange', () => {
    isPointerLocked = !!document.pointerLockElement;
});

// マウス操作
document.addEventListener('mousemove', (e) => {
    if (!isPointerLocked) return;
    
    player.rotation.y -= e.movementX * MOUSE_SENSITIVITY;
    player.rotation.x -= e.movementY * MOUSE_SENSITIVITY;
    player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, player.rotation.x));
});

// クリック操作
document.addEventListener('mousedown', (e) => {
    if (!isPointerLocked) return;
    
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);
    
    raycaster.set(camera.position, direction);
    const intersects = raycaster.intersectObjects(Object.values(world));
    
    if (intersects.length > 0) {
        const hit = intersects[0];
        const block = hit.object;
        
        if (e.button === 0) {
            // 左クリック - ブロック破壊
            const { x, y, z } = block.userData;
            placeBlock(x, y, z, 'air');
        } else if (e.button === 2) {
            // 右クリック - ブロック設置
            const normal = hit.face.normal;
            const { x, y, z } = block.userData;
            const newX = x + normal.x;
            const newY = y + normal.y;
            const newZ = z + normal.z;
            
            placeBlock(newX, newY, newZ, player.selectedBlockType);
        }
    }
});

// 右クリック防止
document.addEventListener('contextmenu', (e) => e.preventDefault());

// インベントリ選択
document.querySelectorAll('.inventory-slot').forEach(slot => {
    slot.addEventListener('click', () => {
        document.querySelectorAll('.inventory-slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        player.selectedBlockType = slot.dataset.block;
        document.getElementById('selectedBlock').textContent = slot.textContent + 'ブロック';
    });
});

// 衝突判定
function checkCollision(position) {
    const margin = 0.25;
    const positions = [
        [position.x - margin, position.y, position.z - margin],
        [position.x + margin, position.y, position.z - margin],
        [position.x - margin, position.y, position.z + margin],
        [position.x + margin, position.y, position.z + margin],
        [position.x - margin, position.y + PLAYER_HEIGHT, position.z - margin],
        [position.x + margin, position.y + PLAYER_HEIGHT, position.z - margin],
        [position.x - margin, position.y + PLAYER_HEIGHT, position.z + margin],
        [position.x + margin, position.y + PLAYER_HEIGHT, position.z + margin]
    ];
    
    for (const [x, y, z] of positions) {
        if (getBlock(Math.floor(x), Math.floor(y), Math.floor(z))) {
            return true;
        }
    }
    
    return false;
}

// アップデート
function update(deltaTime) {
    // 移動方向
    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    
    forward.applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, player.rotation.y, 0)));
    right.applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, player.rotation.y, 0)));
    
    // 移動
    const moveVector = new THREE.Vector3();
    if (keys['w']) moveVector.add(forward);
    if (keys['s']) moveVector.sub(forward);
    if (keys['a']) moveVector.sub(right);
    if (keys['d']) moveVector.add(right);
    
    if (moveVector.length() > 0) {
        moveVector.normalize();
        moveVector.multiplyScalar(PLAYER_SPEED * deltaTime);
        
        const newPosition = player.position.clone().add(moveVector);
        if (!checkCollision(newPosition)) {
            player.position.copy(newPosition);
        }
    }
    
    // ジャンプ
    if (keys[' '] && player.isGrounded) {
        player.velocity.y = JUMP_VELOCITY;
    }
    
    // 重力
    player.velocity.y += GRAVITY * deltaTime;
    
    // 垂直移動
    const verticalMove = player.velocity.y * deltaTime;
    const newYPosition = player.position.clone();
    newYPosition.y += verticalMove;
    
    if (!checkCollision(newYPosition)) {
        player.position.y += verticalMove;
        player.isGrounded = false;
    } else {
        if (player.velocity.y < 0) {
            player.isGrounded = true;
        }
        player.velocity.y = 0;
    }
    
    // カメラ更新
    camera.position.copy(player.position);
    camera.position.y += PLAYER_HEIGHT;
    camera.rotation.order = 'YXZ';
    camera.rotation.y = player.rotation.y;
    camera.rotation.x = player.rotation.x;
    
    // UI更新
    document.getElementById('position').textContent = 
        `${Math.floor(player.position.x)}, ${Math.floor(player.position.y)}, ${Math.floor(player.position.z)}`;
}

// ゲームループ
let lastTime = 0;
function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    if (deltaTime < 0.1) {
        update(deltaTime);
    }
    
    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);
}

// ウィンドウリサイズ
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ゲーム開始
generateTerrain();
gameLoop(0);