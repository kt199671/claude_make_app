// ゲーム設定
const WORLD_SIZE = 32;
const CHUNK_SIZE = 16;
const BLOCK_SIZE = 1;
const GRAVITY = -30;
const JUMP_VELOCITY = 10;
const PLAYER_HEIGHT = 1.6;
const PLAYER_SPEED = 10;
const MOUSE_SENSITIVITY = 0.002;

// テクスチャローダー
const textureLoader = new THREE.TextureLoader();

// ブロックタイプ
const BLOCK_TYPES = {
    air: { textured: false },
    grass: { 
        textured: true,
        textures: {
            top: 'grass_top.png',
            bottom: 'dirt.png',
            sides: 'grass_side.png'
        }
    },
    dirt: { 
        textured: true,
        textures: {
            all: 'dirt.png'
        }
    },
    stone: { 
        textured: true,
        textures: {
            all: 'stone.png'
        }
    },
    wood: { 
        textured: true,
        textures: {
            top: 'log_top.png',
            bottom: 'log_top.png',
            sides: 'log_side.png'
        }
    },
    sand: { 
        textured: true,
        textures: {
            all: 'sand.png'
        }
    },
    water: {
        textured: true,
        textures: {
            all: 'water.png'
        },
        transparent: true,
        opacity: 0.8
    },
    leaves: {
        textured: true,
        textures: {
            all: 'leaves.png'
        },
        transparent: true
    },
    glass: {
        textured: true,
        textures: {
            all: 'glass.png'
        },
        transparent: true
    }
};

// テクスチャキャッシュ
const textureCache = {};

// テクスチャURL
function getTextureUrl(textureName) {
    return `https://raw.githubusercontent.com/kennethmuy/minecraft-textures/main/${textureName}`;
}

// テクスチャ読み込み
function loadTexture(textureName) {
    if (!textureCache[textureName]) {
        textureCache[textureName] = textureLoader.load(getTextureUrl(textureName));
        textureCache[textureName].magFilter = THREE.NearestFilter;
        textureCache[textureName].minFilter = THREE.NearestFilter;
    }
    return textureCache[textureName];
}

// Three.js初期化
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// スカイボックス
const skyTexturePaths = [
    'sky_right.png',   // 右
    'sky_left.png',    // 左
    'sky_top.png',     // 上
    'sky_bottom.png',  // 下
    'sky_front.png',   // 前
    'sky_back.png'     // 後
];

const skyboxMaterials = skyTexturePaths.map(path => {
    const texture = textureLoader.load(getTextureUrl(path));
    return new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide
    });
});

const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
scene.add(skybox);

// 霧を設定
scene.fog = new THREE.Fog(0xadd8e6, 10, 500);

// ライト
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// 太陽光
const sunLight = new THREE.DirectionalLight(0xffffaa, 0.8);
sunLight.position.set(WORLD_SIZE/2, 100, WORLD_SIZE/2);
sunLight.castShadow = true;

// 影の設定
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 500;
sunLight.shadow.camera.left = -100;
sunLight.shadow.camera.right = 100;
sunLight.shadow.camera.top = 100;
sunLight.shadow.camera.bottom = -100;

scene.add(sunLight);

// 両面マテリアル対応
THREE.Material.prototype.shadowSide = THREE.DoubleSide;

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
    const blockType = BLOCK_TYPES[type];
    const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    let materials;

    if (blockType.textured) {
        // テクスチャ設定
        if (blockType.textures.all) {
            // 全面同じテクスチャ
            const texture = loadTexture(blockType.textures.all);
            const material = new THREE.MeshLambertMaterial({ 
                map: texture,
                transparent: !!blockType.transparent,
                opacity: blockType.opacity || 1.0
            });
            materials = [material, material, material, material, material, material];
        } else {
            // 異なるテクスチャ（上・下・側面）
            const topTexture = loadTexture(blockType.textures.top);
            const bottomTexture = loadTexture(blockType.textures.bottom);
            const sideTexture = loadTexture(blockType.textures.sides);
            
            materials = [
                new THREE.MeshLambertMaterial({ map: sideTexture }), // 右
                new THREE.MeshLambertMaterial({ map: sideTexture }), // 左
                new THREE.MeshLambertMaterial({ map: topTexture }),  // 上
                new THREE.MeshLambertMaterial({ map: bottomTexture }), // 下
                new THREE.MeshLambertMaterial({ map: sideTexture }), // 前
                new THREE.MeshLambertMaterial({ map: sideTexture })  // 後
            ];
        }
    } else {
        // ブロックタイプが無効または「air」の場合
        return null;
    }

    const block = new THREE.Mesh(geometry, materials);
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

// パーリンノイズ
function noise(x, z) {
    return 0.5 * Math.sin(x * 0.1) + 0.5 * Math.cos(z * 0.1) +
           0.3 * Math.sin(x * 0.05 + z * 0.05) + 0.7 * Math.cos(x * 0.15 - z * 0.1);
}

// 地形生成
function generateTerrain() {
    const WATER_LEVEL = 8;
    
    // 地形生成
    for (let x = 0; x < WORLD_SIZE; x++) {
        for (let z = 0; z < WORLD_SIZE; z++) {
            // 高さマップ生成
            const baseHeight = noise(x, z) * 10 + 8; // 基本高さ
            const mountainFactor = noise(x / 3, z / 3); // 山の起伏
            let height = Math.floor(baseHeight + mountainFactor * 8);
            
            // 高さの範囲制限
            height = Math.max(1, Math.min(WORLD_SIZE - 1, height));
            
            // 地中ブロック配置
            for (let y = 0; y <= height; y++) {
                let type = 'stone';
                
                // 地形タイプ決定
                if (y === height) {
                    if (y < WATER_LEVEL + 1) { // 水辺
                        type = 'sand';
                    } else if (mountainFactor > 0.7) { // 山
                        type = 'stone';
                    } else { // 通常
                        type = 'grass';
                    }
                } else if (y >= height - 3) {
                    if (y < WATER_LEVEL + 1) { // 水辺
                        type = 'sand';
                    } else {
                        type = 'dirt';
                    }
                }
                
                placeBlock(x, y, z, type);
            }
            
            // 水面生成
            if (height < WATER_LEVEL) {
                for (let y = height + 1; y <= WATER_LEVEL; y++) {
                    placeBlock(x, y, z, 'water');
                }
            }
        }
    }
    
    // 木を生成
    for (let i = 0; i < 20; i++) {
        const x = Math.floor(Math.random() * WORLD_SIZE);
        const z = Math.floor(Math.random() * WORLD_SIZE);
        const groundY = getTerrainHeight(x, z);
        
        // 水中には木を生成しない
        if (groundY <= WATER_LEVEL) continue;
        
        // 幹
        const treeHeight = 4 + Math.floor(Math.random() * 3);
        for (let h = 0; h < treeHeight; h++) {
            placeBlock(x, groundY + 1 + h, z, 'wood');
        }
        
        // 葉
        const leafSize = 2;
        for (let dx = -leafSize; dx <= leafSize; dx++) {
            for (let dz = -leafSize; dz <= leafSize; dz++) {
                for (let dy = Math.floor(treeHeight * 0.6); dy <= treeHeight + 1; dy++) {
                    if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy - treeHeight) <= leafSize + 1) {
                        if (Math.random() > 0.1) { // 少しランダム感を出す
                            placeBlock(x + dx, groundY + 1 + dy, z + dz, 'leaves');
                        }
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

// スクロールでインベントリ選択
document.addEventListener('wheel', (e) => {
    if (!isPointerLocked) return;
    
    const slots = document.querySelectorAll('.inventory-slot');
    const currentIndex = Array.from(slots).findIndex(slot => slot.classList.contains('selected'));
    let newIndex;
    
    if (e.deltaY > 0) {
        // 下にスクロール - 次のスロット
        newIndex = (currentIndex + 1) % slots.length;
    } else {
        // 上にスクロール - 前のスロット
        newIndex = (currentIndex - 1 + slots.length) % slots.length;
    }
    
    slots.forEach(s => s.classList.remove('selected'));
    slots[newIndex].classList.add('selected');
    player.selectedBlockType = slots[newIndex].dataset.block;
    document.getElementById('selectedBlock').textContent = slots[newIndex].textContent + 'ブロック';
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

// FPS表示
let frameCount = 0;
let lastFpsUpdateTime = 0;
const fpsElement = document.getElementById('fps');

// ゲームループ
let lastTime = 0;
function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // FPS更新
    frameCount++;
    if (currentTime - lastFpsUpdateTime >= 1000) {
        fpsElement.textContent = frameCount;
        frameCount = 0;
        lastFpsUpdateTime = currentTime;
    }
    
    // 通常のアップデート
    if (deltaTime < 0.1) {
        update(deltaTime);
    }
    
    // スカイボックスをカメラと共に移動
    skybox.position.copy(camera.position);
    
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