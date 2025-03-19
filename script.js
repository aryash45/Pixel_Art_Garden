const canvas = document.getElementById('garden-canvas');
const ctx = canvas.getContext('2d');
const GRID_SIZE = 16; // Size of each pixel/grid cell
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 480;

// Set canvas size and scaling
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
ctx.imageSmoothingEnabled = false; // Keep the pixel art crisp

// Garden state
let isNightMode = false;
let selectedItem = 'tree';
let isDragging = false;
let gardenItems = [];
let bees = [];

// Button elements
const treeBtnEl = document.getElementById('tree-btn');
const flowerBtnEl = document.getElementById('flower-btn');
const pondBtnEl = document.getElementById('pond-btn');
const rockBtnEl = document.getElementById('rock-btn');
const clearBtnEl = document.getElementById('clear-btn');
const timeBtnEl = document.getElementById('time-btn');

// Item color palettes (day and night versions)
const colors = {
    tree: {
        day: {
            trunk: '#8B4513',
            leaves: ['#228B22', '#32CD32', '#3CB371']
        },
        night: {
            trunk: '#5D2E0C',
            leaves: ['#193E19', '#1E4620', '#254B38']
        }
    },
    flower: {
        day: {
            stem: '#228B22',
            petals: ['#FF69B4', '#FF1493', '#FFD700', '#FF4500', '#9370DB', '#BA55D3']
        },
        night: {
            stem: '#193E19',
            petals: ['#A34A77', '#8A1650', '#A38A00', '#A35000', '#614783', '#7A3B8C']
        }
    },
    pond: {
        day: {
            water: ['#1E90FF', '#4169E1', '#00BFFF']
        },
        night: {
            water: ['#104E8B', '#24427A', '#00688B']
        }
    },
    rock: {
        day: {
            stone: ['#808080', '#A9A9A9', '#696969', '#778899']
        },
        night: {
            stone: ['#4D4D4D', '#666666', '#3D3D3D', '#475F77']
        }
    }
};

// Setup event listeners
function setupEventListeners() {
    // Item selection
    treeBtnEl.addEventListener('click', () => setSelectedItem('tree'));
    flowerBtnEl.addEventListener('click', () => setSelectedItem('flower'));
    pondBtnEl.addEventListener('click', () => setSelectedItem('pond'));
    rockBtnEl.addEventListener('click', () => setSelectedItem('rock'));
    
    // Canvas interactions
    canvas.addEventListener('mousedown', startDragging);
    canvas.addEventListener('mousemove', dragItem);
    canvas.addEventListener('mouseup', stopDragging);
    canvas.addEventListener('mouseleave', stopDragging);
    
    // Other controls
    clearBtnEl.addEventListener('click', clearGarden);
    timeBtnEl.addEventListener('click', toggleDayNight);
}

// Set currently selected item
function setSelectedItem(item) {
    selectedItem = item;
    
    // Update active button
    [treeBtnEl, flowerBtnEl, pondBtnEl, rockBtnEl].forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${item}-btn`).classList.add('active');
}

// Start dragging/placing items
function startDragging(event) {
    isDragging = true;
    placeItem(event);
}

// Place item while dragging
function dragItem(event) {
    if (isDragging) {
        placeItem(event);
    }
}

// Stop dragging
function stopDragging() {
    isDragging = false;
}

// Place item at mouse position
function placeItem(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / GRID_SIZE) * GRID_SIZE;
    const y = Math.floor((event.clientY - rect.top) / GRID_SIZE) * GRID_SIZE;
    
    // Don't place items too close to each other (except flowers)
    if (selectedItem !== 'flower') {
        for (const item of gardenItems) {
            const distance = Math.sqrt(Math.pow(item.x - x, 2) + Math.pow(item.y - y, 2));
            if (distance < GRID_SIZE * 3 && item.type === selectedItem) {
                return; // Too close to an item of the same type
            }
        }
    }
    
    // Create new item
    const newItem = { 
        type: selectedItem, 
        x: x, 
        y: y,
        variant: Math.floor(Math.random() * 3), // Random variant for visual diversity
        size: getItemSize(selectedItem)
    };
    
    gardenItems.push(newItem);
    draw();
}

// Get size based on item type
function getItemSize(type) {
    switch(type) {
        case 'tree': return { width: 5, height: 7 };
        case 'flower': return { width: 3, height: 4 };
        case 'pond': return { width: 6, height: 4 };
        case 'rock': return { width: 4, height: 3 };
        default: return { width: 1, height: 1 };
    }
}

// Toggle day/night mode
function toggleDayNight() {
    isNightMode = !isNightMode;
    
    if (isNightMode) {
        document.body.classList.add('night-mode');
        timeBtnEl.textContent = '☀️ Toggle Day/Night';
    } else {
        document.body.classList.remove('night-mode');
        timeBtnEl.textContent = '🌙 Toggle Day/Night';
    }
    
    draw();
}

// Clear the garden
function clearGarden() {
    gardenItems = [];
    draw();
}

// Draw functions for each item type
function drawTree(x, y, variant) {
    const palette = isNightMode ? colors.tree.night : colors.tree.day;
    
    // Draw trunk
    ctx.fillStyle = palette.trunk;
    ctx.fillRect(x + GRID_SIZE * 2, y + GRID_SIZE * 3, GRID_SIZE, GRID_SIZE * 4);
    
    // Draw leaves based on variant
    ctx.fillStyle = palette.leaves[variant % palette.leaves.length];
    
    if (variant === 0) {
        // Pine tree style
        ctx.fillRect(x + GRID_SIZE * 2, y, GRID_SIZE, GRID_SIZE);
        ctx.fillRect(x + GRID_SIZE, y + GRID_SIZE, GRID_SIZE * 3, GRID_SIZE);
        ctx.fillRect(x, y + GRID_SIZE * 2, GRID_SIZE * 5, GRID_SIZE);
    } else if (variant === 1) {
        // Round tree style
        ctx.fillRect(x + GRID_SIZE, y + GRID_SIZE, GRID_SIZE * 3, GRID_SIZE);
        ctx.fillRect(x, y + GRID_SIZE * 2, GRID_SIZE * 5, GRID_SIZE);
        ctx.fillRect(x + GRID_SIZE, y + GRID_SIZE * 3, GRID_SIZE * 3, GRID_SIZE);
    } else {
        // Bushy tree style
        ctx.fillRect(x + GRID_SIZE, y, GRID_SIZE * 3, GRID_SIZE);
        ctx.fillRect(x, y + GRID_SIZE, GRID_SIZE * 5, GRID_SIZE * 2);
    }
}

function drawFlower(x, y, variant) {
    const palette = isNightMode ? colors.flower.night : colors.flower.day;
    
    // Draw stem
    ctx.fillStyle = palette.stem;
    ctx.fillRect(x + GRID_SIZE, y + GRID_SIZE * 2, GRID_SIZE, GRID_SIZE * 2);
    
    // Random petal color
    const petalColor = palette.petals[Math.floor(Math.random() * palette.petals.length)];
    ctx.fillStyle = petalColor;
    
    if (variant === 0) {
        // Cross shape flower
        ctx.fillRect(x + GRID_SIZE, y, GRID_SIZE, GRID_SIZE);
        ctx.fillRect(x, y + GRID_SIZE, GRID_SIZE * 3, GRID_SIZE);
    } else if (variant === 1) {
        // Round flower
        ctx.fillRect(x, y + GRID_SIZE, GRID_SIZE, GRID_SIZE);
        ctx.fillRect(x + GRID_SIZE, y, GRID_SIZE, GRID_SIZE * 2);
        ctx.fillRect(x + GRID_SIZE * 2, y + GRID_SIZE, GRID_SIZE, GRID_SIZE);
    } else {
        // Tulip style
        ctx.fillRect(x, y + GRID_SIZE, GRID_SIZE, GRID_SIZE);
        ctx.fillRect(x + GRID_SIZE, y, GRID_SIZE, GRID_SIZE * 2);
        ctx.fillRect(x + GRID_SIZE * 2, y + GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
}

function drawPond(x, y, variant) {
    const palette = isNightMode ? colors.pond.night : colors.pond.day;
    
    // Draw water (different shapes based on variant)
    ctx.fillStyle = palette.water[variant % palette.water.length];
    
    if (variant === 0) {
        // Round pond
        ctx.fillRect(x + GRID_SIZE, y, GRID_SIZE * 4, GRID_SIZE);
        ctx.fillRect(x, y + GRID_SIZE, GRID_SIZE * 6, GRID_SIZE * 2);
        ctx.fillRect(x + GRID_SIZE, y + GRID_SIZE * 3, GRID_SIZE * 4, GRID_SIZE);
    } else if (variant === 1) {
        // Oval pond
        ctx.fillRect(x + GRID_SIZE, y, GRID_SIZE * 4, GRID_SIZE);
        ctx.fillRect(x, y + GRID_SIZE, GRID_SIZE * 6, GRID_SIZE);
        ctx.fillRect(x, y + GRID_SIZE * 2, GRID_SIZE * 6, GRID_SIZE);
        ctx.fillRect(x + GRID_SIZE, y + GRID_SIZE * 3, GRID_SIZE * 4, GRID_SIZE);
    } else {
        // Irregular pond
        ctx.fillRect(x + GRID_SIZE, y, GRID_SIZE * 3, GRID_SIZE);
        ctx.fillRect(x, y + GRID_SIZE, GRID_SIZE * 5, GRID_SIZE);
        ctx.fillRect(x + GRID_SIZE, y + GRID_SIZE * 2, GRID_SIZE * 4, GRID_SIZE);
        ctx.fillRect(x + GRID_SIZE * 2, y + GRID_SIZE * 3, GRID_SIZE * 2, GRID_SIZE);
    }
    
    // Add highlight
    ctx.fillStyle = isNightMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x + GRID_SIZE * 2, y + GRID_SIZE, GRID_SIZE, GRID_SIZE);
}

function drawRock(x, y, variant) {
    const palette = isNightMode ? colors.rock.night : colors.rock.day;
    
    // Draw rock based on variant
    ctx.fillStyle = palette.stone[variant % palette.stone.length];
    
    if (variant === 0) {
        // Small rock
        ctx.fillRect(x + GRID_SIZE, y + GRID_SIZE, GRID_SIZE * 2, GRID_SIZE * 2);
    } else if (variant === 1) {
        // Medium rock
        ctx.fillRect(x, y + GRID_SIZE, GRID_SIZE * 4, GRID_SIZE * 2);
    } else {
        // Large rock
        ctx.fillRect(x + GRID_SIZE, y, GRID_SIZE * 2, GRID_SIZE);
        ctx.fillRect(x, y + GRID_SIZE, GRID_SIZE * 4, GRID_SIZE);
        ctx.fillRect(x + GRID_SIZE, y + GRID_SIZE * 2, GRID_SIZE * 2, GRID_SIZE);
    }
}

// Create and manage flying bees
function createBees(count) {
    for (let i = 0; i < count; i++) {
        bees.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * (CANVAS_HEIGHT / 2), // Stay in upper half
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 1.5,
            size: GRID_SIZE,
            wingOffset: Math.random() * Math.PI * 2 // For wing flapping animation
        });
    }
}

// Update bee positions
function updateBees() {
    bees.forEach(bee => {
        // Update position
        bee.x += bee.speedX;
        bee.y += bee.speedY;
        
        // Change direction randomly
        if (Math.random() < 0.02) {
            bee.speedX = (Math.random() - 0.5) * 2;
            bee.speedY = (Math.random() - 0.5) * 1.5;
        }
        
        // Update wing flapping animation
        bee.wingOffset += 0.2;
        
        // Boundary check
        if (bee.x < 0) bee.x = 0;
        if (bee.x > CANVAS_WIDTH) bee.x = CANVAS_WIDTH;
        if (bee.y < 0) bee.y = 0;
        if (bee.y > CANVAS_HEIGHT / 2) bee.y = CANVAS_HEIGHT / 2;
    });
}

// Draw a bee
function drawBee(bee) {
    // Draw body
    ctx.fillStyle = isNightMode ? '#D8BE60' : '#FFD700';
    ctx.fillRect(bee.x, bee.y, bee.size, bee.size);
    
    // Draw stripes
    ctx.fillStyle = '#000000';
    ctx.fillRect(bee.x, bee.y + bee.size * 0.3, bee.size, bee.size * 0.15);
    ctx.fillRect(bee.x, bee.y + bee.size * 0.6, bee.size, bee.size * 0.15);
    
    // Draw wings (flapping)
    ctx.fillStyle = isNightMode ? 'rgba(220, 220, 255, 0.5)' : 'rgba(255, 255, 255, 0.7)';
    
    // Left wing
    const leftWingHeight = Math.abs(Math.sin(bee.wingOffset) * bee.size * 0.7) + bee.size * 0.3;
    ctx.fillRect(bee.x - bee.size * 0.5, bee.y - leftWingHeight / 2, bee.size * 0.5, leftWingHeight);
    
    // Right wing
    const rightWingHeight = Math.abs(Math.sin(bee.wingOffset + Math.PI) * bee.size * 0.7) + bee.size * 0.3;
    ctx.fillRect(bee.x + bee.size, bee.y - rightWingHeight / 2, bee.size * 0.5, rightWingHeight);
}

// Draw the entire scene
function draw() {
    // Clear canvas
    ctx.fillStyle = isNightMode ? '#1e4620' : '#7ec850';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Sort items by y position for proper overlapping
    gardenItems.sort((a, b) => a.y - b.y);
    
    // Draw all garden items
    for (const item of gardenItems) {
        switch (item.type) {
            case 'tree': drawTree(item.x, item.y, item.variant); break;
            case 'flower': drawFlower(item.x, item.y, item.variant); break;
            case 'pond': drawPond(item.x, item.y, item.variant); break;
            case 'rock': drawRock(item.x, item.y, item.variant); break;
        }
    }
    
    // Draw bees
    bees.forEach(bee => drawBee(bee));
}

// Animation loop
function animate() {
    updateBees();
    draw();
    requestAnimationFrame(animate);
}

// Initialize the garden
function init() {
    setupEventListeners();
    createBees(5); // Start with 5 bees
    animate();
}

// Start the application
init();
