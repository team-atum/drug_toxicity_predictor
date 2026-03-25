const API_URL = 'http://localhost:5000';

// ==================== CUSTOM CURSOR ====================
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
});

function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';
    requestAnimationFrame(animateFollower);
}
animateFollower();

document.querySelectorAll('a, button, input, .example-btn, .predict-btn, .nav-link').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        follower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        follower.classList.remove('hover');
    });
});

// ==================== NAVBAR ====================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
const sections = document.querySelectorAll('section');
const navLinkElements = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinkElements.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

navLinkElements.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
    });
});

// ==================== HERO PARTICLES ====================
function createParticles() {
    const container = document.getElementById('heroBgParticles');
    const count = 60;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 3 + 1;
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(201, 168, 76, ${Math.random() * 0.3 + 0.05});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleFloat ${Math.random() * 20 + 10}s linear infinite;
            animation-delay: ${Math.random() * -20}s;
        `;
        container.appendChild(particle);
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFloat {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}
createParticles();

// ==================== THREE.JS MOLECULE ====================
function initMolecule() {
    const canvas = document.getElementById('moleculeCanvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);

    const atomColors = [0xc9a84c, 0xe8720c, 0x22c55e, 0x3b82f6, 0xef4444, 0xa855f7, 0xf59e0b];

    const atomPositions = [
        { pos: [0, 0, 0], color: 0xc9a84c, size: 0.5 },
        { pos: [1.5, 0.8, 0.3], color: 0xef4444, size: 0.4 },
        { pos: [-1.2, 0.6, -0.5], color: 0x3b82f6, size: 0.45 },
        { pos: [0.5, -1.4, 0.6], color: 0x22c55e, size: 0.35 },
        { pos: [-0.8, -0.9, 1.2], color: 0xe8720c, size: 0.4 },
        { pos: [1.0, 1.5, -1.0], color: 0xa855f7, size: 0.38 },
        { pos: [-1.5, -0.3, -1.3], color: 0xf59e0b, size: 0.42 },
        { pos: [0.3, 1.2, 1.5], color: 0xc9a84c, size: 0.36 },
        { pos: [-0.5, 1.8, 0.2], color: 0xef4444, size: 0.33 },
        { pos: [1.8, -0.5, -0.8], color: 0x22c55e, size: 0.4 },
        { pos: [-1.8, 1.2, 0.8], color: 0x3b82f6, size: 0.37 },
        { pos: [0.8, -1.0, -1.5], color: 0xa855f7, size: 0.35 },
    ];

    const atoms = [];
    atomPositions.forEach(atom => {
        const geo = new THREE.SphereGeometry(atom.size, 32, 32);
        const mat = new THREE.MeshPhongMaterial({
            color: atom.color,
            emissive: atom.color,
            emissiveIntensity: 0.3,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...atom.pos);
        moleculeGroup.add(mesh);
        atoms.push(mesh);

        const glowGeo = new THREE.SphereGeometry(atom.size * 1.4, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: atom.color,
            transparent: true,
            opacity: 0.08
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.set(...atom.pos);
        moleculeGroup.add(glow);
    });

    const bonds = [
        [0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 6],
        [3, 7], [4, 8], [5, 9], [6, 10], [7, 11], [1, 9],
        [2, 10], [3, 4], [8, 11]
    ];

    bonds.forEach(([a, b]) => {
        const start = new THREE.Vector3(...atomPositions[a].pos);
        const end = new THREE.Vector3(...atomPositions[b].pos);
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const length = start.distanceTo(end);

        const geo = new THREE.CylinderGeometry(0.06, 0.06, length, 8);
        const mat = new THREE.MeshPhongMaterial({
            color: 0x475569,
            emissive: 0x1e293b,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.6
        });
        const bond = new THREE.Mesh(geo, mat);
        bond.position.copy(mid);

        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const axis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);
        bond.setRotationFromQuaternion(quaternion);

        moleculeGroup.add(bond);
    });

    const ring1Geo = new THREE.RingGeometry(2.8, 2.85, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
        color: 0xc9a84c,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    moleculeGroup.add(ring1);

    const ring2Geo = new THREE.RingGeometry(3.2, 3.25, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
        color: 0xe8720c,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 6;
    moleculeGroup.add(ring2);

    const ring3Geo = new THREE.RingGeometry(3.5, 3.55, 64);
    const ring3Mat = new THREE.MeshBasicMaterial({
        color: 0xc9a84c,
        transparent: true,
        opacity: 0.07,
        side: THREE.DoubleSide
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = -Math.PI / 4;
    ring3.rotation.z = Math.PI / 5;
    moleculeGroup.add(ring3);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xc9a84c, 1.5, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xe8720c, 1, 20);
    pointLight2.position.set(-5, -3, 3);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x3b82f6, 0.6, 20);
    pointLight3.position.set(0, 5, -5);
    scene.add(pointLight3);

    camera.position.z = 6;

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.008;

        moleculeGroup.rotation.y = time * 0.5;
        moleculeGroup.rotation.x = Math.sin(time * 0.3) * 0.15;

        atoms.forEach((atom, i) => {
            atom.position.y = atomPositions[i].pos[1] + Math.sin(time * 2 + i) * 0.05;
        });

        ring1.rotation.z = time * 0.2;
        ring2.rotation.z = -time * 0.15;
        ring3.rotation.y = time * 0.1;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
}

initMolecule();

// ==================== HEALTH CHECK ====================
async function checkHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        if (data.model_loaded) {
            const statEl = document.getElementById('statAccuracy');
            if (statEl) statEl.textContent = '~95%';
        }
    } catch (e) {
        console.log('Backend not available yet');
        const statEl = document.getElementById('statAccuracy');
        if (statEl) statEl.textContent = '~95%';
    }
}
checkHealth();

// ==================== EXAMPLE BUTTONS ====================
const exampleBtns = document.querySelectorAll('.example-btn');
const smilesInput = document.getElementById('smilesInput');
const clearBtn = document.getElementById('clearInput');

exampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        exampleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        smilesInput.value = btn.dataset.smiles;
        smilesInput.focus();
    });
});

clearBtn.addEventListener('click', () => {
    smilesInput.value = '';
    exampleBtns.forEach(b => b.classList.remove('active'));
    smilesInput.focus();
});

// ==================== LOADING ANIMATION ====================
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    const errorMsg = document.getElementById('errorMessage');
    const resultsSection = document.getElementById('results');

    overlay.style.display = 'block';
    errorMsg.style.display = 'none';

    const steps = ['step1', 'step2', 'step3', 'step4'];
    steps.forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('active', 'done');
    });

    return new Promise((resolve) => {
        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep > 0) {
                document.getElementById(steps[currentStep - 1]).classList.remove('active');
                document.getElementById(steps[currentStep - 1]).classList.add('done');
            }
            if (currentStep < steps.length) {
                document.getElementById(steps[currentStep]).classList.add('active');
                currentStep++;
            } else {
                clearInterval(interval);
                setTimeout(resolve, 400);
            }
        }, 600);
    });
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showError(message) {
    hideLoading();
    const errorMsg = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    errorText.textContent = message;
    errorMsg.style.display = 'flex';
    errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ==================== PREDICTION ====================
const predictBtn = document.getElementById('predictBtn');
let importanceChartInstance = null;
let assayChartInstance = null;

predictBtn.addEventListener('click', handlePredict);
smilesInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handlePredict();
});

async function handlePredict() {
    const smiles = smilesInput.value.trim();
    if (!smiles) {
        showError('Please enter a SMILES string to analyze.');
        return;
    }

    const btnContent = predictBtn.querySelector('.predict-btn-content');
    const btnLoading = predictBtn.querySelector('.predict-btn-loading');
    predictBtn.disabled = true;
    btnContent.style.display = 'none';
    btnLoading.style.display = 'flex';

    document.getElementById('errorMessage').style.display = 'none';

    const loadingPromise = showLoading();

    try {
        const fetchPromise = fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ smiles })
        });

        const [_, response] = await Promise.all([loadingPromise, fetchPromise]);

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Server error');
        }

        const data = await response.json();
        hideLoading();
        displayResults(data);

    } catch (error) {
        showError(error.message || 'Failed to connect to the server. Make sure the Flask backend is running.');
    } finally {
        predictBtn.disabled = false;
        btnContent.style.display = 'flex';
        btnLoading.style.display = 'none';
    }
}

// ==================== DISPLAY RESULTS ====================
function displayResults(data) {
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';

    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    // SMILES display
    document.getElementById('resultSmiles').textContent = data.smiles;

    // Verdict
    const verdictCard = document.getElementById('verdictCard');
    const verdictIcon = document.getElementById('verdictIcon');
    const verdictText = document.getElementById('verdictText');

    verdictCard.className = 'verdict-card ' + (data.is_toxic ? 'toxic' : 'safe');
    verdictIcon.innerHTML = data.is_toxic
        ? '<i class="fas fa-skull-crossbones"></i>'
        : '<i class="fas fa-shield-alt"></i>';
    verdictText.textContent = data.prediction;

    // Confidence
    const confidenceValue = document.getElementById('confidenceValue');
    const confidenceArc = document.getElementById('confidenceArc');
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (data.confidence / 100) * circumference;

    confidenceArc.style.stroke = data.is_toxic ? '#ef4444' : '#22c55e';
    confidenceArc.style.strokeDasharray = circumference;
    confidenceArc.style.strokeDashoffset = circumference;

    setTimeout(() => {
        confidenceArc.style.strokeDashoffset = offset;
    }, 200);

    animateCounter(confidenceValue, 0, Math.round(data.confidence), 1500);

    // Assay results
    renderAssays(data.assay_results);

    // Molecular properties
    renderProperties(data.molecular_properties);

    // Feature importance chart
    renderImportanceChart(data.feature_importances);

    // Assay chart
    renderAssayChart(data.assay_results);

    // Update model accuracy stat
    if (data.model_info) {
        const statEl = document.getElementById('statAccuracy');
        if (statEl && data.model_info.accuracy) {
            statEl.textContent = data.model_info.accuracy + '%';
        }
    }
}

function animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(start + (end - start) * eased);
        element.textContent = value;
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

function renderAssays(assayResults) {
    const grid = document.getElementById('assayGrid');
    const badge = document.getElementById('assayBadge');
    grid.innerHTML = '';

    let activeCount = 0;
    const entries = Object.entries(assayResults);

    entries.forEach(([name, result], index) => {
        if (result.toxic) activeCount++;
        const item = document.createElement('div');
        item.className = `assay-item ${result.toxic ? 'active-toxic' : 'inactive'}`;
        item.style.animation = `fadeInUp 0.4s ease ${index * 0.05}s both`;
        item.innerHTML = `
            <div class="assay-name">${name}</div>
            <div class="assay-status">
                <span class="assay-badge">${result.prediction}</span>
                <span class="assay-prob">${result.probability}%</span>
            </div>
        `;
        grid.appendChild(item);
    });

    badge.textContent = `${activeCount}/12 Active`;
    if (activeCount >= 3) {
        badge.style.background = 'rgba(239, 68, 68, 0.1)';
        badge.style.color = '#ef4444';
        badge.style.borderColor = 'rgba(239, 68, 68, 0.2)';
    } else {
        badge.style.background = 'rgba(34, 197, 94, 0.1)';
        badge.style.color = '#22c55e';
        badge.style.borderColor = 'rgba(34, 197, 94, 0.2)';
    }
}

function renderProperties(props) {
    const grid = document.getElementById('propertiesGrid');
    grid.innerHTML = '';

    const propertyConfig = [
        { key: 'MolWt', label: 'Mol. Weight', unit: 'g/mol', icon: 'fas fa-weight-hanging' },
        { key: 'LogP', label: 'LogP', unit: '', icon: 'fas fa-tint' },
        { key: 'NumHDonors', label: 'H-Bond Donors', unit: '', icon: 'fas fa-hand-holding-water' },
        { key: 'NumHAcceptors', label: 'H-Bond Acceptors', unit: '', icon: 'fas fa-magnet' },
        { key: 'TPSA', label: 'TPSA', unit: 'Å²', icon: 'fas fa-expand' },
        { key: 'NumRotatableBonds', label: 'Rotatable Bonds', unit: '', icon: 'fas fa-sync-alt' },
        { key: 'NumAromaticRings', label: 'Aromatic Rings', unit: '', icon: 'fas fa-ring' }
    ];

    propertyConfig.forEach((prop, index) => {
        if (props[prop.key] !== undefined) {
            const card = document.createElement('div');
            card.className = 'property-card';
            card.style.animation = `fadeInUp 0.4s ease ${index * 0.08}s both`;
            card.innerHTML = `
                <div class="property-label">${prop.label}</div>
                <div class="property-value">${props[prop.key]}${prop.unit ? ' <small style="font-size:0.6em;color:#64748b;">' + prop.unit + '</small>' : ''}</div>
            `;
            grid.appendChild(card);
        }
    });
}

function renderImportanceChart(importances) {
    const ctx = document.getElementById('importanceChart').getContext('2d');

    if (importanceChartInstance) {
        importanceChartInstance.destroy();
    }

    const labels = importances.map(f => f.feature);
    const values = importances.map(f => f.importance);

    const gradientColors = labels.map((_, i) => {
        const ratio = i / (labels.length - 1 || 1);
        const r = Math.round(201 + (232 - 201) * ratio);
        const g = Math.round(168 + (114 - 168) * ratio);
        const b = Math.round(76 + (12 - 76) * ratio);
        return `rgb(${r}, ${g}, ${b})`;
    });

    importanceChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Importance',
                data: values,
                backgroundColor: gradientColors.map(c => c.replace('rgb', 'rgba').replace(')', ', 0.7)')),
                borderColor: gradientColors,
                borderWidth: 2,
                borderRadius: 6,
                barPercentage: 0.6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#111827',
                    titleColor: '#c9a84c',
                    bodyColor: '#f0f0f0',
                    borderColor: '#1e293b',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(30, 41, 59, 0.5)', drawBorder: false },
                    ticks: { color: '#64748b', font: { size: 11 } }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 11, family: "'JetBrains Mono', monospace" }
                    }
                }
            },
            animation: {
                duration: 1200,
                easing: 'easeOutQuart'
            }
        }
    });
}

function renderAssayChart(assayResults) {
    const ctx = document.getElementById('assayChart').getContext('2d');

    if (assayChartInstance) {
        assayChartInstance.destroy();
    }

    const labels = Object.keys(assayResults);
    const values = Object.values(assayResults).map(r => r.probability);
    const colors = Object.values(assayResults).map(r =>
        r.toxic ? 'rgba(239, 68, 68, 0.7)' : 'rgba(34, 197, 94, 0.7)'
    );
    const borderColors = Object.values(assayResults).map(r =>
        r.toxic ? '#ef4444' : '#22c55e'
    );

    assayChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Toxicity Probability (%)',
                data: values,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 2,
                borderRadius: 4,
                barPercentage: 0.7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#111827',
                    titleColor: '#c9a84c',
                    bodyColor: '#f0f0f0',
                    borderColor: '#1e293b',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: (ctx) => `Probability: ${ctx.parsed.y}%`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 9, family: "'JetBrains Mono', monospace" },
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    grid: { color: 'rgba(30, 41, 59, 0.5)', drawBorder: false },
                    ticks: { color: '#64748b', font: { size: 11 } },
                    max: 100,
                    beginAtZero: true
                }
            },
            animation: {
                duration: 1200,
                easing: 'easeOutQuart',
                delay: (context) => context.dataIndex * 80
            }
        }
    });
}

// ==================== SCROLL ANIMATIONS ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

document.querySelectorAll('.predict-card, .result-block, .about-card, .team-card').forEach(el => {
    observer.observe(el);
});

// ==================== SMOOTH SCROLL FOR ANCHOR LINKS ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== SCROLL INDICATOR HIDE ====================
const scrollIndicator = document.getElementById('scrollIndicator');
window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
    } else {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.pointerEvents = 'auto';
    }
});