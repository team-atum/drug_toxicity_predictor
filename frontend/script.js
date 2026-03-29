const API_URL = 'http://localhost:5000';

let lastPredictionData = null;
let lastPubchemData = null;
let bulkResultsData = [];
let bulkParsedSmiles = [];

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

function setupCursorHovers() {
    document.querySelectorAll('a, button, input, .example-btn, .predict-btn, .nav-link, .drop-zone, .action-btn').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            follower.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
        });
    });
}
setupCursorHovers();

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
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    moleculeGroup.add(ring1);

    const ring2Geo = new THREE.RingGeometry(3.2, 3.25, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xe8720c, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 6;
    moleculeGroup.add(ring2);

    const ring3Geo = new THREE.RingGeometry(3.5, 3.55, 64);
    const ring3Mat = new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.07, side: THREE.DoubleSide });
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
let shapChartInstance = null;
let mol3dViewer = null;

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
        lastPredictionData = data;
        hideLoading();
        displayResults(data);
        fetchPubchemData(smiles);

    } catch (error) {
        showError(error.message || 'Failed to connect to the server. Make sure the Flask backend is running.');
    } finally {
        predictBtn.disabled = false;
        btnContent.style.display = 'flex';
        btnLoading.style.display = 'none';
    }
}

// ==================== PUBCHEM FETCH ====================
async function fetchPubchemData(smiles) {
    try {
        const response = await fetch(`${API_URL}/pubchem?smiles=${encodeURIComponent(smiles)}`);
        if (response.ok) {
            const data = await response.json();
            lastPubchemData = data;
            if (data.compound_name) {
                const resultSmiles = document.getElementById('resultSmiles');
                resultSmiles.textContent = `${data.compound_name} (${smiles})`;
            }
        }
    } catch (e) {
        console.log('PubChem lookup failed:', e);
        lastPubchemData = null;
    }
}

// ==================== DISPLAY RESULTS ====================
function displayResults(data) {
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';

    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    document.getElementById('resultSmiles').textContent = data.smiles;

    const verdictCard = document.getElementById('verdictCard');
    const verdictIcon = document.getElementById('verdictIcon');
    const verdictText = document.getElementById('verdictText');

    verdictCard.className = 'verdict-card ' + (data.is_toxic ? 'toxic' : 'safe');
    verdictIcon.innerHTML = data.is_toxic
        ? '<i class="fas fa-skull-crossbones"></i>'
        : '<i class="fas fa-shield-alt"></i>';
    verdictText.textContent = data.prediction;

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

    renderAssays(data.assay_results);
    renderProperties(data.molecular_properties);
    renderImportanceChart(data.feature_importances);
    renderAssayChart(data.assay_results);
    renderOrganToxicity(data.organ_toxicity);
    renderSafetyPanel(data);
    renderShapChart(data.shap_explanation, data.shap_base_value, data.is_toxic);
    renderMol3D(data.mol_3d, data.is_toxic);


    if (data.model_info) {
        const statEl = document.getElementById('statAccuracy');
        if (statEl && data.model_info.accuracy) {
            statEl.textContent = data.model_info.accuracy + '%';
        }
    }

    setupCursorHovers();
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
        { key: 'MolWt', label: 'Mol. Weight', unit: 'g/mol' },
        { key: 'LogP', label: 'LogP', unit: '' },
        { key: 'NumHDonors', label: 'H-Bond Donors', unit: '' },
        { key: 'NumHAcceptors', label: 'H-Bond Acceptors', unit: '' },
        { key: 'TPSA', label: 'TPSA', unit: 'A\u00b2' },
        { key: 'NumRotatableBonds', label: 'Rotatable Bonds', unit: '' },
        { key: 'NumAromaticRings', label: 'Aromatic Rings', unit: '' }
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

// ==================== ORGAN TOXICITY ====================
function renderOrganToxicity(organData) {
    const grid = document.getElementById('organGrid');
    const badge = document.getElementById('organBadge');
    grid.innerHTML = '';

    if (!organData || Object.keys(organData).length === 0) {
        grid.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">No organ toxicity data available.</p>';
        return;
    }

    const primaryOrgans = [
        { key: 'liver', icon: 'fas fa-disease', displayName: 'Liver' },
        { key: 'kidney', icon: 'fas fa-lungs', displayName: 'Kidney' },
        { key: 'heart', icon: 'fas fa-heartbeat', displayName: 'Heart' },
        { key: 'brain', icon: 'fas fa-brain', displayName: 'Brain' },
        { key: 'hormone', icon: 'fas fa-dna', displayName: 'Hormones' },
        { key: 'genome', icon: 'fas fa-radiation', displayName: 'Genome' },
        { key: 'reproductive', icon: 'fas fa-venus-mars', displayName: 'Reproductive' },
        { key: 'immune', icon: 'fas fa-shield-virus', displayName: 'Immune' },
        { key: 'cancer', icon: 'fas fa-biohazard', displayName: 'Cancer Risk' },
        { key: 'metabolism', icon: 'fas fa-fire', displayName: 'Metabolic' },
        { key: 'systemic', icon: 'fas fa-exclamation-triangle', displayName: 'Systemic' }
    ];

    let highCount = 0;
    let mediumCount = 0;

    primaryOrgans.forEach((organ, index) => {
        const data = organData[organ.key];
        if (!data) return;

        const riskLevel = data.risk_level || 'none';
        if (riskLevel === 'high') highCount++;
        if (riskLevel === 'medium') mediumCount++;

        const card = document.createElement('div');
        card.className = `organ-card risk-${riskLevel}`;
        card.style.animation = `fadeInUp 0.4s ease ${index * 0.06}s both`;

        let assaysHtml = '';
        if (data.active_assays && data.active_assays.length > 0) {
            assaysHtml = data.active_assays.map(a =>
                `<span class="organ-assay-tag active">${a.assay}</span>`
            ).join('');
        } else {
            assaysHtml = '<span class="organ-assay-tag inactive">No active assays</span>';
        }

        const riskLabel = riskLevel === 'none' ? 'None' : riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);

        card.innerHTML = `
            <div class="organ-icon">
                <i class="${organ.icon}"></i>
            </div>
            <div class="organ-name">${organ.displayName}</div>
            <span class="organ-risk-badge">${riskLabel} Risk</span>
            <div class="organ-risk-pct">${data.risk_percentage || 0}% risk score</div>
            <div class="organ-assays">${assaysHtml}</div>
        `;
        grid.appendChild(card);
    });

    if (highCount > 0) {
        badge.textContent = `${highCount} High Risk`;
        badge.style.background = 'rgba(239, 68, 68, 0.1)';
        badge.style.color = '#ef4444';
        badge.style.borderColor = 'rgba(239, 68, 68, 0.2)';
    } else if (mediumCount > 0) {
        badge.textContent = `${mediumCount} Medium Risk`;
        badge.style.background = 'rgba(245, 158, 11, 0.1)';
        badge.style.color = '#f59e0b';
        badge.style.borderColor = 'rgba(245, 158, 11, 0.2)';
    } else {
        badge.textContent = 'Low Risk';
        badge.style.background = 'rgba(34, 197, 94, 0.1)';
        badge.style.color = '#22c55e';
        badge.style.borderColor = 'rgba(34, 197, 94, 0.2)';
    }
}

// ==================== SAFETY PANEL ====================
function renderSafetyPanel(data) {
    renderPhysicalState(data.physical_state_warning);
    renderDosageContext(data.dosage_context);
    renderSuggestions(data.toxicity_suggestions);
}

function renderPhysicalState(physState) {
    const body = document.getElementById('physicalStateBody');
    body.innerHTML = '';

    if (!physState) {
        body.innerHTML = '<p>No physical state data available.</p>';
        return;
    }

    const vaporClass = `vapor-${physState.vapor_risk_level || 'low'}`;
    let html = `
        <div class="physical-state-badge ${vaporClass}">
            <i class="fas fa-thermometer-half"></i>
            State: ${physState.estimated_physical_state || 'Unknown'} | Vapor Risk: ${(physState.vapor_risk_level || 'low').toUpperCase()}
        </div>
    `;

    if (physState.warnings && physState.warnings.length > 0) {
        physState.warnings.forEach(w => {
            html += `
                <div class="safety-warning-item">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>${w}</span>
                </div>
            `;
        });
    } else {
        html += '<p>No specific physical state warnings.</p>';
    }

    body.innerHTML = html;
}

function renderDosageContext(dosage) {
    const body = document.getElementById('dosageBody');
    body.innerHTML = '';

    if (!dosage) {
        body.innerHTML = '<p>No dosage context available.</p>';
        return;
    }

    let windowClass = 'wide';
    if (dosage.therapeutic_window === 'narrow') windowClass = 'narrow';
    else if (dosage.therapeutic_window === 'moderate') windowClass = 'moderate';

    let html = `
        <div style="margin-bottom: 16px;">
            <span class="dosage-badge ${windowClass}">
                <i class="fas fa-ruler-horizontal"></i>
                Therapeutic Window: ${(dosage.therapeutic_window || 'unknown').toUpperCase()}
            </span>
            &nbsp;
            <span class="dosage-badge ${dosage.overdose_risk === 'high' ? 'narrow' : dosage.overdose_risk === 'moderate' ? 'moderate' : 'wide'}">
                <i class="fas fa-arrow-up"></i>
                Overdose Risk: ${(dosage.overdose_risk || 'unknown').toUpperCase()}
            </span>
        </div>
        <div class="dosage-grid">
            <div class="dosage-item">
                <div class="dosage-item-label">Absorption</div>
                <div class="dosage-item-value">${dosage.absorption_profile || 'N/A'}</div>
            </div>
            <div class="dosage-item">
                <div class="dosage-item-label">Distribution</div>
                <div class="dosage-item-value">${dosage.distribution_notes || 'N/A'}</div>
            </div>
            <div class="dosage-item">
                <div class="dosage-item-label">Metabolism Risk</div>
                <div class="dosage-item-value">${dosage.metabolism_risk || 'N/A'}</div>
            </div>
            <div class="dosage-item">
                <div class="dosage-item-label">Excretion</div>
                <div class="dosage-item-value">${dosage.excretion_notes || 'N/A'}</div>
            </div>
        </div>
    `;

    if (dosage.general_guidance) {
        html += `<p style="margin-top:12px;"><strong>General Guidance:</strong> ${dosage.general_guidance}</p>`;
    }

    if (dosage.warnings && dosage.warnings.length > 0) {
        html += '<div class="dosage-warnings">';
        dosage.warnings.forEach(w => {
            html += `
                <div class="dosage-warning-item">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${w}</span>
                </div>
            `;
        });
        html += '</div>';
    }

    body.innerHTML = html;
}

function renderSuggestions(suggestions) {
    const body = document.getElementById('suggestionsBody');
    body.innerHTML = '';

    if (!suggestions || suggestions.length === 0) {
        body.innerHTML = '<p>No specific toxicity reduction suggestions available.</p>';
        return;
    }

    let html = '';
    suggestions.forEach((s, i) => {
        let assayTags = '';
        if (s.affected_assays && s.affected_assays.length > 0) {
            assayTags = '<div class="suggestion-assays">' +
                s.affected_assays.map(a => `<span class="suggestion-assay-tag">${a}</span>`).join('') +
                '</div>';
        }

        html += `
            <div class="suggestion-card priority-${s.priority || 'low'}" style="animation: fadeInUp 0.4s ease ${i * 0.1}s both;">
                <div class="suggestion-header">
                    <span class="suggestion-title">${s.title}</span>
                    <span class="suggestion-priority">${(s.priority || 'low').toUpperCase()}</span>
                </div>
                <div class="suggestion-detail">${s.detail}</div>
                ${assayTags}
            </div>
        `;
    });

    body.innerHTML = html;
}

// ==================== CHARTS ====================
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
                    ticks: { color: '#94a3b8', font: { size: 11, family: "'JetBrains Mono', monospace" } }
                }
            },
            animation: { duration: 1200, easing: 'easeOutQuart' }
        }
    });
}
function renderShapChart(shapData, baseVal, isToxic) {
    const canvas = document.getElementById('shapChart');
    if (!canvas || !shapData || shapData.length === 0) {
        document.getElementById('shapDesc').textContent = 'SHAP explanation not available for this compound.';
        return;
    }

    if (shapChartInstance) {
        shapChartInstance.destroy();
    }

    const labels = shapData.map(d => d.label);
    const values = shapData.map(d => d.shap_value);

    const colors = values.map(v =>
        v > 0
        ? `rgba(239, 68, 68, ${Math.min(0.4 + Math.abs(v) * 8, 0.92)})`
        : `rgba(34, 197, 94, ${Math.min(0.4 + Math.abs(v) * 8, 0.92)})`
    );

    const ctx = canvas.getContext('2d');
    shapChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'SHAP Value',
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace(/[\d.]+\)$/, '1)')),
                borderWidth: 1,
                borderRadius: 4,
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
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const item = shapData[context.dataIndex];
                            const direction = context.raw > 0 ? '▲ pushes TOXIC' : '▼ pushes SAFE';
                            return [
                                `SHAP: ${context.raw.toFixed(4)}  ${direction}`,
                                `Actual value: ${item.feature_value}`,
                                `Type: ${item.type}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '← safer   |   SHAP value   |   more toxic →',
                        color: '#64748b',
                        font: { size: 11 }
                    },
                    grid: { color: 'rgba(30, 41, 59, 0.5)' },
                    ticks: { color: '#64748b', font: { size: 11 } }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { size: 11 } }
                }
            },
            animation: { duration: 1200, easing: 'easeOutQuart' }
        }
    });

    // Update the description text below the header
    const topFeature = shapData[0];
    const direction = topFeature.shap_value > 0 ? 'increases' : 'decreases';
    document.getElementById('shapDesc').textContent =
        `Strongest driver: "${topFeature.label}" ${direction} toxicity probability. ` +
        `Red bars = push toward toxic. Green bars = push toward safe. ` +
        `Base model score: ${(baseVal || 0).toFixed(3)}.`;
}
function renderMol3D(molblock, isToxic) {
    const block = document.getElementById('mol3dBlock');
    const container = document.getElementById('mol3d-viewer');

    if (!molblock || !window.$3Dmol) {
        if (block) block.style.display = 'none';
        return;
    }

    block.style.display = 'block';
    container.innerHTML = '';   // clear previous

    // Small delay to let the block become visible before sizing
    setTimeout(() => {
        const viewer = $3Dmol.createViewer(container, {
            backgroundColor: '0x111827'
        });

        viewer.addModel(molblock, 'sdf');

        // Ball and stick — Jmol coloring (industry standard)
        viewer.setStyle({}, {
            stick: {
                radius: 0.15,
                colorscheme: 'Jmol'
            },
            sphere: {
                scale: 0.28,
                colorscheme: 'Jmol'
            }
        });

        // If toxic — highlight nitrogen & oxygen atoms in vivid colors
        if (isToxic) {
            viewer.setStyle({ elem: 'N' }, {
                sphere: { color: '#4488ff', scale: 0.35 },
                stick: { radius: 0.17, color: '#4488ff' }
            });
            viewer.setStyle({ elem: 'O' }, {
                sphere: { color: '#ff4444', scale: 0.35 },
                stick: { radius: 0.17, color: '#ff4444' }
            });
        }

        viewer.zoomTo();
        viewer.spin('y', 1);    // auto-rotate on Y axis
        viewer.render();

        mol3dViewer = viewer;
    }, 150);
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
                    ticks: { color: '#94a3b8', font: { size: 9, family: "'JetBrains Mono', monospace" }, maxRotation: 45, minRotation: 45 }
                },
                y: {
                    grid: { color: 'rgba(30, 41, 59, 0.5)', drawBorder: false },
                    ticks: { color: '#64748b', font: { size: 11 } },
                    max: 100,
                    beginAtZero: true
                }
            },
            animation: { duration: 1200, easing: 'easeOutQuart', delay: (context) => context.dataIndex * 80 }
        }
    });
}

// ==================== BULK CSV UPLOAD ====================
const dropZone = document.getElementById('dropZone');
const csvFileInput = document.getElementById('csvFileInput');
const bulkFileInfo = document.getElementById('bulkFileInfo');
const bulkFileName = document.getElementById('bulkFileName');
const bulkFileCompounds = document.getElementById('bulkFileCompounds');
const bulkRemoveFile = document.getElementById('bulkRemoveFile');
const bulkPredictBtn = document.getElementById('bulkPredictBtn');
const downloadSampleCsv = document.getElementById('downloadSampleCsv');
const downloadBulkResults = document.getElementById('downloadBulkResults');

dropZone.addEventListener('click', () => csvFileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith('.csv')) {
        handleCsvFile(files[0]);
    } else {
        showBulkError('Please upload a valid CSV file.');
    }
});

csvFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleCsvFile(e.target.files[0]);
    }
});

bulkRemoveFile.addEventListener('click', () => {
    resetBulkUpload();
});

function handleCsvFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const parsed = parseCSV(text);

        if (parsed.length === 0) {
            showBulkError('No valid SMILES found in CSV. Make sure the file has a "smiles" column.');
            return;
        }

        bulkParsedSmiles = parsed;
        bulkFileName.textContent = file.name;
        bulkFileCompounds.textContent = `${parsed.length} compounds`;
        bulkFileInfo.style.display = 'block';
        dropZone.style.display = 'none';
        bulkPredictBtn.disabled = false;
        document.getElementById('bulkError').style.display = 'none';
    };
    reader.readAsText(file);
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const smilesIdx = headers.indexOf('smiles');
    const nameIdx = headers.indexOf('name');

    if (smilesIdx === -1) return [];

    const results = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length > smilesIdx && cols[smilesIdx].trim()) {
            results.push({
                smiles: cols[smilesIdx].trim(),
                name: nameIdx >= 0 && cols.length > nameIdx ? cols[nameIdx].trim() : `Compound ${i}`
            });
        }
    }
    return results;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

function resetBulkUpload() {
    bulkParsedSmiles = [];
    bulkFileInfo.style.display = 'none';
    dropZone.style.display = 'block';
    bulkPredictBtn.disabled = true;
    csvFileInput.value = '';
    document.getElementById('bulkResults').style.display = 'none';
    document.getElementById('bulkProgress').style.display = 'none';
    document.getElementById('bulkError').style.display = 'none';
}

function showBulkError(message) {
    const el = document.getElementById('bulkError');
    document.getElementById('bulkErrorText').textContent = message;
    el.style.display = 'flex';
}

// ==================== SAMPLE CSV DOWNLOAD ====================
downloadSampleCsv.addEventListener('click', () => {
    const csvContent = `name,smiles
Aspirin,CC(=O)Oc1ccccc1C(=O)O
Caffeine,Cn1c(=O)c2c(ncn2C)n(C)c1=O
Warfarin,CC(=O)CC(c1ccccc1)c1c(O)c2ccccc2oc1=O
Benzene,c1ccccc1
Ethanol,CCO`;

    downloadFile('sample_smiles.csv', csvContent, 'text/csv');
});

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==================== BULK PREDICTION ====================
bulkPredictBtn.addEventListener('click', handleBulkPredict);

async function handleBulkPredict() {
    if (bulkParsedSmiles.length === 0) return;

    const btnContent = bulkPredictBtn.querySelector('.predict-btn-content');
    const btnLoading = bulkPredictBtn.querySelector('.predict-btn-loading');
    bulkPredictBtn.disabled = true;
    btnContent.style.display = 'none';
    btnLoading.style.display = 'flex';

    const progress = document.getElementById('bulkProgress');
    const progressFill = document.getElementById('bulkProgressFill');
    const progressText = document.getElementById('bulkProgressText');
    progress.style.display = 'flex';
    progressFill.style.width = '0%';
    progressText.textContent = '0%';

    document.getElementById('bulkError').style.display = 'none';
    document.getElementById('bulkResults').style.display = 'none';

    bulkResultsData = [];
    const smilesList = bulkParsedSmiles.map(p => p.smiles);

    try {
        const response = await fetch(`${API_URL}/predict-bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ smiles_list: smilesList })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Bulk prediction failed');
        }

        const data = await response.json();

        let pct = 0;
        const animInterval = setInterval(() => {
            pct += 5;
            if (pct > 100) pct = 100;
            progressFill.style.width = pct + '%';
            progressText.textContent = pct + '%';
            if (pct >= 100) clearInterval(animInterval);
        }, 50);

        setTimeout(() => {
            displayBulkResults(data);
        }, 1200);

    } catch (error) {
        showBulkError(error.message || 'Failed to run bulk prediction.');
    } finally {
        setTimeout(() => {
            bulkPredictBtn.disabled = false;
            btnContent.style.display = 'flex';
            btnLoading.style.display = 'none';
        }, 1300);
    }
}

function displayBulkResults(data) {
    const resultsDiv = document.getElementById('bulkResults');
    resultsDiv.style.display = 'block';

    document.getElementById('bulkTotalCount').textContent = data.summary.total_submitted;
    document.getElementById('bulkSafeCount').textContent = data.summary.safe_count;
    document.getElementById('bulkToxicCount').textContent = data.summary.toxic_count;
    document.getElementById('bulkErrorCount').textContent = data.summary.failed;

    const tbody = document.getElementById('bulkTableBody');
    tbody.innerHTML = '';

    bulkResultsData = data.results;

    data.results.forEach((result, i) => {
        const compoundName = bulkParsedSmiles[result.index] ? bulkParsedSmiles[result.index].name : `Compound ${result.index + 1}`;
        const toxicAssays = Object.entries(result.assay_results || {})
            .filter(([_, v]) => v.toxic)
            .map(([k, _]) => k);

        const assayTags = toxicAssays.length > 0
            ? toxicAssays.map(a => `<span class="assay-tag active">${a}</span>`).join('')
            : '<span class="assay-tag none">None</span>';

        const row = document.createElement('tr');
        row.className = result.is_toxic ? 'row-toxic' : 'row-safe';
        row.style.animation = `fadeInUp 0.3s ease ${i * 0.03}s both`;
        row.innerHTML = `
            <td>${i + 1}</td>
            <td class="compound-name">${compoundName}</td>
            <td class="smiles-cell" title="${result.smiles}">${result.smiles}</td>
            <td><span class="prediction-badge ${result.is_toxic ? 'toxic' : 'safe'}">
                <i class="fas fa-${result.is_toxic ? 'skull-crossbones' : 'shield-alt'}"></i>
                ${result.prediction}
            </span></td>
            <td class="confidence-cell">${result.confidence}%</td>
            <td class="toxic-assays-cell">${assayTags}</td>
            <td><button class="action-btn" onclick="viewBulkDetail(${i})">
                <i class="fas fa-eye"></i> View
            </button></td>
        `;
        tbody.appendChild(row);
    });

    if (data.errors && data.errors.length > 0) {
        data.errors.forEach((err) => {
            const row = document.createElement('tr');
            row.style.opacity = '0.5';
            row.innerHTML = `
                <td>${err.index + 1}</td>
                <td class="compound-name">${bulkParsedSmiles[err.index] ? bulkParsedSmiles[err.index].name : 'Unknown'}</td>
                <td class="smiles-cell" title="${err.smiles}">${err.smiles}</td>
                <td colspan="4" style="color: var(--danger);"><i class="fas fa-exclamation-triangle"></i> ${err.error}</td>
            `;
            tbody.appendChild(row);
        });
    }

    setupCursorHovers();
}

function viewBulkDetail(index) {
    if (bulkResultsData[index]) {
        lastPredictionData = bulkResultsData[index];
        displayResults(bulkResultsData[index]);
        fetchPubchemData(bulkResultsData[index].smiles);
    }
}

// ==================== DOWNLOAD BULK RESULTS CSV ====================
// ==================== DOWNLOAD BULK RESULTS PDF ====================
downloadBulkResults.addEventListener('click', () => {
    if (bulkResultsData.length === 0) return;
    generateBulkPDFReport();
});

function generateBulkPDFReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let y = 20;

    function addPage() {
        // Gold footer on every page
        doc.setFillColor(201, 168, 76);
        doc.rect(0, 285, 210, 12, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('ATUM — Drug Toxicity Prediction | Bulk Analysis Report', pageWidth / 2, 291, { align: 'center' });
        doc.addPage();
        doc.setFillColor(5, 7, 10);
        doc.rect(0, 0, 210, 297, 'F');
        y = 20;
    }

    function checkPageBreak(needed) {
        if (y + needed > 278) addPage();
    }

    function sectionTitle(title) {
        checkPageBreak(18);
        doc.setTextColor(201, 168, 76);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, y);
        y += 6;
        doc.setDrawColor(201, 168, 76);
        doc.setLineWidth(0.4);
        doc.line(margin, y, pageWidth - margin, y);
        y += 7;
    }

    // ── PAGE 1 BACKGROUND ───────────────────────────────────
    doc.setFillColor(5, 7, 10);
    doc.rect(0, 0, 210, 297, 'F');

    // ── HEADER BAR ──────────────────────────────────────────
    doc.setFillColor(201, 168, 76);
    doc.rect(0, 0, 210, 42, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ATUM', margin, y + 8);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Bulk Drug Toxicity Analysis Report', margin, y + 16);

    doc.setFontSize(7);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, y + 8, { align: 'right' });
    doc.text(`Total compounds analysed: ${bulkResultsData.length}`, pageWidth - margin, y + 14, { align: 'right' });
    y = 52;

    // ── SUMMARY BOX ─────────────────────────────────────────
    const toxicCount  = bulkResultsData.filter(r => r.is_toxic).length;
    const safeCount   = bulkResultsData.filter(r => !r.is_toxic).length;
    const toxicPct    = ((toxicCount / bulkResultsData.length) * 100).toFixed(1);

    doc.setFillColor(17, 24, 39);
    doc.roundedRect(margin, y, contentWidth, 28, 4, 4, 'F');

    // Toxic pill
    doc.setFillColor(60, 20, 20);
    doc.roundedRect(margin + 4, y + 5, 48, 18, 3, 3, 'F');
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${toxicCount}`, margin + 28, y + 16, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('TOXIC', margin + 28, y + 21, { align: 'center' });

    // Safe pill
    doc.setFillColor(20, 60, 30);
    doc.roundedRect(margin + 58, y + 5, 48, 18, 3, 3, 'F');
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${safeCount}`, margin + 82, y + 16, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('SAFE', margin + 82, y + 21, { align: 'center' });

    // Toxic % text
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${toxicPct}% of compounds flagged as toxic`, margin + 115, y + 14);

    y += 36;

    // ── RESULTS TABLE ────────────────────────────────────────
    // ── RESULTS TABLE ────────────────────────────────────────
    sectionTitle('Compound Results');

    // Table header
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'F');
    doc.setTextColor(201, 168, 76);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('#',          margin + 2,   y + 5.5);
    doc.text('Compound',   margin + 10,  y + 5.5);
    doc.text('SMILES',     margin + 55,  y + 5.5);
    doc.text('Result',     margin + 112, y + 5.5);
    doc.text('Conf%',      margin + 133, y + 5.5);
    doc.text('Tox Prob%',  margin + 151, y + 5.5);
    y += 10;

    bulkResultsData.forEach((result, i) => {
        checkPageBreak(9);

        const compoundName = (bulkParsedSmiles[result.index] && bulkParsedSmiles[result.index].name)
            ? bulkParsedSmiles[result.index].name.substring(0, 22)
            : `Compound ${result.index + 1}`;

        const smilesTrunc = result.smiles.length > 32
            ? result.smiles.substring(0, 29) + '...'
            : result.smiles;

        if (i % 2 === 0) {
            doc.setFillColor(15, 21, 32);
            doc.rect(margin, y - 2, contentWidth, 8, 'F');
        }

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');

        // Row number
        doc.setTextColor(100, 116, 139);
        doc.text(`${i + 1}`, margin + 2, y + 3.5);

        // Compound name — coloured by result
        if (result.is_toxic) doc.setTextColor(239, 100, 100);
        else doc.setTextColor(100, 200, 120);
        doc.text(compoundName, margin + 10, y + 3.5);

        // SMILES
        doc.setTextColor(148, 163, 184);
        doc.text(smilesTrunc, margin + 55, y + 3.5);

        // Result badge
        if (result.is_toxic) {
            doc.setTextColor(239, 68, 68);
        } else {
            doc.setTextColor(34, 197, 94);
        }
        doc.setFont('helvetica', 'bold');
        doc.text(result.prediction.toUpperCase(), margin + 112, y + 3.5);

        // Numbers
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 180, 180);
        doc.text(`${result.confidence}%`,       margin + 133, y + 3.5);
        doc.text(`${result.toxic_probability}%`, margin + 151, y + 3.5);

        y += 8;
    });
    y += 8;

    // ── ACTIVE ASSAYS DETAIL ─────────────────────────────────
    sectionTitle('Active Assay Details Per Compound');

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.text('Only compounds with at least one active toxic assay are listed below.', margin, y);
    y += 8;

    const toxicResults = bulkResultsData.filter(result => {
        const activeAssays = Object.entries(result.assay_results || {})
            .filter(([_, v]) => v.toxic);
        return activeAssays.length > 0;
    });

    if (toxicResults.length === 0) {
        doc.setTextColor(34, 197, 94);
        doc.setFontSize(8);
        doc.text('No compounds had active toxic assays.', margin, y);
        y += 10;
    } else {
        toxicResults.forEach((result, i) => {
            const compoundName = (bulkParsedSmiles[result.index] && bulkParsedSmiles[result.index].name)
                ? bulkParsedSmiles[result.index].name
                : `Compound ${result.index + 1}`;

            const activeAssays = Object.entries(result.assay_results || {})
                .filter(([_, v]) => v.toxic);

            // Estimate height: name row (8) + ceil(assays/4) rows of tags (7 each) + gap (4)
            const tagRows = Math.ceil(activeAssays.length / 4);
            const blockH = 8 + tagRows * 7 + 6;
            checkPageBreak(blockH);

            // Compound name row
            doc.setFillColor(17, 24, 39);
            doc.roundedRect(margin, y, contentWidth, 7, 2, 2, 'F');
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(239, 68, 68);
            doc.text(`${i + 1}. ${compoundName}`, margin + 3, y + 5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(148, 163, 184);
            doc.text(`${activeAssays.length} active assay${activeAssays.length > 1 ? 's' : ''}`, pageWidth - margin - 2, y + 5, { align: 'right' });
            y += 9;

            // Assay tags — 4 per row
            const tagW = (contentWidth - 6) / 4;
            activeAssays.forEach(([assayName, assayData], j) => {
                const col = j % 4;
                const xTag = margin + 3 + col * (tagW + 2);

                if (col === 0 && j > 0) y += 7;

                // Tag background
                doc.setFillColor(60, 20, 20);
                doc.roundedRect(xTag, y - 1, tagW, 6, 1, 1, 'F');

                // Assay name
                doc.setFontSize(6.5);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(239, 100, 100);
                const tagLabel = assayName.length > 14 ? assayName.substring(0, 13) + '…' : assayName;
                doc.text(tagLabel, xTag + tagW / 2, y + 3, { align: 'center' });

                // Probability
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(200, 140, 140);
                doc.text(`${assayData.probability}%`, xTag + tagW - 1, y + 3, { align: 'right' });
            });

            y += 10;
        });
    }
    y += 4;
    
    // ── MOLECULAR PROPERTIES TABLE ───────────────────────────
    sectionTitle('Molecular Properties Summary');

    // Header
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'F');
    doc.setTextColor(201, 168, 76);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Compound',  margin + 2,  y + 5.5);
    doc.text('MolWt',     margin + 48, y + 5.5);
    doc.text('LogP',      margin + 68, y + 5.5);
    doc.text('HDon',      margin + 84, y + 5.5);
    doc.text('HAcc',      margin + 100, y + 5.5);
    doc.text('TPSA',      margin + 116, y + 5.5);
    doc.text('RotBonds',  margin + 134, y + 5.5);
    doc.text('AromRings', margin + 154, y + 5.5);
    y += 10;

    bulkResultsData.forEach((result, i) => {
        checkPageBreak(9);
        const compoundName = (bulkParsedSmiles[result.index] && bulkParsedSmiles[result.index].name)
            ? bulkParsedSmiles[result.index].name.substring(0, 18)
            : `Compound ${result.index + 1}`;
        const p = result.molecular_properties || {};

        if (i % 2 === 0) {
            doc.setFillColor(15, 21, 32);
            doc.rect(margin, y - 2, contentWidth, 8, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);

        if (result.is_toxic) doc.setTextColor(239, 100, 100);
        else doc.setTextColor(100, 200, 120);
        doc.text(compoundName,          margin + 2,   y + 3.5);

        doc.setTextColor(180, 180, 180);
        doc.text(`${p.MolWt || '-'}`,           margin + 48,  y + 3.5);
        doc.text(`${p.LogP || '-'}`,            margin + 68,  y + 3.5);
        doc.text(`${p.NumHDonors || '-'}`,      margin + 84,  y + 3.5);
        doc.text(`${p.NumHAcceptors || '-'}`,   margin + 100, y + 3.5);
        doc.text(`${p.TPSA || '-'}`,            margin + 116, y + 3.5);
        doc.text(`${p.NumRotatableBonds || '-'}`, margin + 134, y + 3.5);
        doc.text(`${p.NumAromaticRings || '-'}`,  margin + 154, y + 3.5);
        y += 8;
    });
    y += 6;

    // ── ORGAN TOXICITY RISK SUMMARY ──────────────────────────
    sectionTitle('Organ Toxicity Risk — Across All Compounds');

    const organCounts = {};
    bulkResultsData.forEach(result => {
        if (!result.organ_toxicity) return;
        Object.entries(result.organ_toxicity).forEach(([organ, data]) => {
            if (data.risk_level === 'high' || data.risk_level === 'medium') {
                organCounts[organ] = (organCounts[organ] || 0) + 1;
            }
        });
    });

    if (Object.keys(organCounts).length === 0) {
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.text('No significant organ toxicity detected across compounds.', margin, y);
        y += 10;
    } else {
        const sortedOrgans = Object.entries(organCounts).sort((a, b) => b[1] - a[1]);
        const maxCount = sortedOrgans[0][1];

        sortedOrgans.forEach(([organ, count]) => {
            checkPageBreak(8);
            const barW = Math.max((count / maxCount) * (contentWidth * 0.55), 4);
            const pct = ((count / bulkResultsData.length) * 100).toFixed(0);
            const label = organ.charAt(0).toUpperCase() + organ.slice(1);

            doc.setTextColor(180, 180, 180);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.text(label, margin + 2, y + 3.5);

            const intensity = Math.min(count / maxCount, 1);
            const r = Math.round(239 * intensity + 148 * (1 - intensity));
            const g = Math.round(68  * intensity + 163 * (1 - intensity));
            const b = Math.round(68  * intensity + 184 * (1 - intensity));
            doc.setFillColor(r, g, b);
            doc.roundedRect(margin + 40, y, barW, 6, 1, 1, 'F');

            doc.setTextColor(148, 163, 184);
            doc.text(`${count} compounds (${pct}%)`, margin + 44 + barW, y + 4.5);
            y += 9;
        });
        y += 4;
    }

    // ── FOOTER ON LAST PAGE ──────────────────────────────────
    checkPageBreak(20);
    y += 4;
    doc.setFillColor(201, 168, 76);
    doc.rect(0, y, 210, 16, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ATUM — Drug Toxicity Prediction', pageWidth / 2, y + 7, { align: 'center' });
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Powered by XGBoost, RDKit & Tox21 Dataset | Hackathon 2024', pageWidth / 2, y + 12, { align: 'center' });

    doc.save(`ATUM_Bulk_Report_${bulkResultsData.length}_compounds.pdf`);
}
// ==================== PDF REPORT GENERATION ====================
document.getElementById('downloadPdfBtn').addEventListener('click', generatePDFReport);

async function generatePDFReport() {
    if (!lastPredictionData) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const data = lastPredictionData;
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let y = 20;

    function addPage() {
        doc.addPage();
        y = 20;
    }

    function checkPageBreak(needed) {
        if (y + needed > 275) {
            addPage();
        }
    }

    doc.setFillColor(5, 7, 10);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setFillColor(201, 168, 76);
    doc.rect(0, 0, 210, 45, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ATUM', margin, y + 10);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Drug Toxicity Prediction Report', margin, y + 18);

    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, y + 10, { align: 'right' });
    doc.text('Powered by XGBoost & Tox21', pageWidth - margin, y + 16, { align: 'right' });

    y = 55;

    doc.setTextColor(201, 168, 76);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Compound Information', margin, y);
    y += 8;

    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`SMILES: ${data.smiles}`, margin, y);
    y += 7;

    if (lastPubchemData && lastPubchemData.compound_name) {
        doc.text(`Compound Name: ${lastPubchemData.compound_name}`, margin, y);
        y += 7;
        if (lastPubchemData.molecular_formula) {
            doc.text(`Molecular Formula: ${lastPubchemData.molecular_formula}`, margin, y);
            y += 7;
        }
        if (lastPubchemData.iupac_name) {
            const iupacLines = doc.splitTextToSize(`IUPAC: ${lastPubchemData.iupac_name}`, contentWidth);
            doc.text(iupacLines, margin, y);
            y += iupacLines.length * 5 + 2;
        }
    }
    y += 5;

    checkPageBreak(30);
    doc.setTextColor(201, 168, 76);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Prediction Verdict', margin, y);
    y += 8;
    doc.setDrawColor(201, 168, 76);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    if (data.is_toxic) {
        doc.setFillColor(60, 20, 20);
        doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
        doc.setTextColor(239, 68, 68);
    } else {
        doc.setFillColor(20, 60, 30);
        doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
        doc.setTextColor(34, 197, 94);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(data.prediction.toUpperCase(), margin + 10, y + 13);

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(11);
    doc.text(`Confidence: ${data.confidence}%`, pageWidth - margin - 10, y + 13, { align: 'right' });
    y += 28;

    checkPageBreak(60);
    doc.setTextColor(201, 168, 76);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Molecular Properties', margin, y);
    y += 8;
    doc.setDrawColor(201, 168, 76);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const props = data.molecular_properties || {};
    const propList = [
        ['Molecular Weight', `${props.MolWt || 'N/A'} g/mol`],
        ['LogP', `${props.LogP || 'N/A'}`],
        ['H-Bond Donors', `${props.NumHDonors || 'N/A'}`],
        ['H-Bond Acceptors', `${props.NumHAcceptors || 'N/A'}`],
        ['TPSA', `${props.TPSA || 'N/A'} A\u00b2`],
        ['Rotatable Bonds', `${props.NumRotatableBonds || 'N/A'}`],
        ['Aromatic Rings', `${props.NumAromaticRings || 'N/A'}`]
    ];

    const colWidth = contentWidth / 2;
    propList.forEach((prop, i) => {
        const col = i % 2;
        const xPos = margin + col * colWidth;
        if (col === 0 && i > 0) y += 6;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(148, 163, 184);
        doc.text(prop[0] + ':', xPos, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(201, 168, 76);
        doc.text(prop[1], xPos + 45, y);
    });
    y += 12;

    checkPageBreak(80);
    doc.setTextColor(201, 168, 76);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Tox21 Assay Results', margin, y);
    y += 8;
    doc.setDrawColor(201, 168, 76);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(8);
    const assayEntries = Object.entries(data.assay_results || {});

    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin, y, contentWidth, 7, 1, 1, 'F');
    doc.setTextColor(201, 168, 76);
    doc.setFont('helvetica', 'bold');
    doc.text('Assay', margin + 3, y + 5);
    doc.text('Status', margin + 65, y + 5);
    doc.text('Probability', margin + 100, y + 5);
    y += 9;

    assayEntries.forEach(([name, result], i) => {
        checkPageBreak(8);
        if (i % 2 === 0) {
            doc.setFillColor(15, 21, 32);
            doc.rect(margin, y - 3, contentWidth, 7, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(200, 200, 200);
        doc.text(name, margin + 3, y + 2);

        if (result.toxic) {
            doc.setTextColor(239, 68, 68);
            doc.text('ACTIVE', margin + 65, y + 2);
        } else {
            doc.setTextColor(34, 197, 94);
            doc.text('INACTIVE', margin + 65, y + 2);
        }

        doc.setTextColor(148, 163, 184);
        doc.text(`${result.probability}%`, margin + 100, y + 2);
        y += 7;
    });
    y += 5;

    if (data.organ_toxicity) {
        checkPageBreak(50);
        doc.setTextColor(201, 168, 76);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Organ Toxicity Summary', margin, y);
        y += 8;
        doc.setDrawColor(201, 168, 76);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        doc.setFontSize(9);
        Object.entries(data.organ_toxicity).forEach(([key, organ]) => {
            checkPageBreak(10);
            doc.setFont('helvetica', 'bold');

            if (organ.risk_level === 'high') doc.setTextColor(239, 68, 68);
            else if (organ.risk_level === 'medium') doc.setTextColor(245, 158, 11);
            else doc.setTextColor(34, 197, 94);

            const riskLabel = organ.risk_level === 'none' ? 'None' : organ.risk_level.charAt(0).toUpperCase() + organ.risk_level.slice(1);
            doc.text(`${organ.name}: ${riskLabel} Risk (${organ.risk_percentage || 0}%)`, margin, y);
            y += 6;

            if (organ.active_assays && organ.active_assays.length > 0) {
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(148, 163, 184);
                doc.setFontSize(8);
                const assayNames = organ.active_assays.map(a => a.assay).join(', ');
                doc.text(`  Active: ${assayNames}`, margin + 5, y);
                y += 5;
                doc.setFontSize(9);
            }
        });
        y += 5;
    }

    if (data.feature_importances) {
        checkPageBreak(50);
        doc.setTextColor(201, 168, 76);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Top Feature Importances', margin, y);
        y += 8;
        doc.setDrawColor(201, 168, 76);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        doc.setFontSize(9);
        data.feature_importances.forEach(f => {
            checkPageBreak(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(200, 200, 200);
            doc.text(f.feature, margin + 3, y);

            const barWidth = Math.min(f.importance * 800, contentWidth * 0.5);
            doc.setFillColor(201, 168, 76);
            doc.roundedRect(margin + 55, y - 3, barWidth, 5, 1, 1, 'F');

            doc.setTextColor(148, 163, 184);
            doc.text(`${f.importance}`, margin + 58 + barWidth, y);
            y += 7;
        });
        y += 5;
    }

    if (data.toxicity_suggestions && data.toxicity_suggestions.length > 0) {
        checkPageBreak(30);
        doc.setTextColor(201, 168, 76);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Safety Recommendations', margin, y);
        y += 8;
        doc.setDrawColor(201, 168, 76);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        doc.setFontSize(9);
        data.toxicity_suggestions.forEach(s => {
            checkPageBreak(20);
            doc.setFont('helvetica', 'bold');
            if (s.priority === 'high') doc.setTextColor(239, 68, 68);
            else if (s.priority === 'medium') doc.setTextColor(245, 158, 11);
            else doc.setTextColor(34, 197, 94);

            doc.text(`[${(s.priority || 'low').toUpperCase()}] ${s.title}`, margin, y);
            y += 5;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(180, 180, 180);
            doc.setFontSize(8);
            const detailLines = doc.splitTextToSize(s.detail, contentWidth - 5);
            doc.text(detailLines, margin + 3, y);
            y += detailLines.length * 4 + 4;
            doc.setFontSize(9);
        });
    }
    // ── SHAP EXPLANATION SECTION ──────────────────────────────
    if (data.shap_explanation && data.shap_explanation.length > 0) {
        checkPageBreak(90);
        doc.setTextColor(201, 168, 76);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SHAP Explanation — Why This Prediction?', margin, y);
        y += 8;
        doc.setDrawColor(201, 168, 76);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;

        // Description line
        const topFeature = data.shap_explanation[0];
        const direction = topFeature.shap_value > 0 ? 'increases' : 'decreases';
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        const shapDesc = `Strongest driver: "${topFeature.label}" ${direction} toxicity. Red = pushes toxic, Green = pushes safe. Base score: ${(data.shap_base_value || 0).toFixed(3)}`;
        const shapDescLines = doc.splitTextToSize(shapDesc, contentWidth);
        doc.text(shapDescLines, margin, y);
        y += shapDescLines.length * 4 + 4;

        // Embed SHAP chart as image if available
        if (shapChartInstance) {
            try {
                const shapImgData = shapChartInstance.toBase64Image('image/png', 1.0);
                const imgH = 65;
                checkPageBreak(imgH + 5);
                doc.addImage(shapImgData, 'PNG', margin, y, contentWidth, imgH);
                y += imgH + 4;
            } catch(e) {
                // Fallback: draw SHAP as text bars if image fails
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                data.shap_explanation.forEach(item => {
                    checkPageBreak(8);
                    const label = item.label.substring(0, 28);
                    doc.setTextColor(200, 200, 200);
                    doc.text(label, margin + 3, y);

                    const maxBarW = contentWidth * 0.45;
                    const barW = Math.min(Math.abs(item.shap_value) * 80, maxBarW);
                    if (item.shap_value > 0) {
                        doc.setFillColor(239, 68, 68);
                    } else {
                        doc.setFillColor(34, 197, 94);
                    }
                    doc.roundedRect(margin + 75, y - 3, barW, 5, 1, 1, 'F');

                    doc.setTextColor(148, 163, 184);
                    doc.text(`${item.shap_value > 0 ? '+' : ''}${item.shap_value.toFixed(4)}`, margin + 78 + barW, y);
                    y += 7;
                });
            }
        }
        y += 5;
    }

    // ── 3D MOLECULAR STRUCTURE SNAPSHOT ──────────────────────
    if (mol3dViewer) {
        try {
            // Stop rotation temporarily for a clean snapshot
            mol3dViewer.spin(false);

            const mol3dImgData = await new Promise((resolve, reject) => {
                try {
                    // pngURI returns the canvas as base64 PNG
                    const uri = mol3dViewer.pngURI(3);
                    resolve(uri);
                } catch(e) {
                    reject(e);
                }
            });

            checkPageBreak(110);
            doc.setTextColor(201, 168, 76);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('3D Molecular Structure', margin, y);
            y += 8;
            doc.setDrawColor(201, 168, 76);
            doc.line(margin, y, pageWidth - margin, y);
            y += 6;

            doc.setTextColor(148, 163, 184);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text('Ball & stick model — Jmol coloring (C=grey, O=red, N=blue, S=yellow)', margin, y);
            y += 6;

            // Center the 3D image on the page
            // Full width, tall image — no compression
            const imgW = contentWidth;       // full page width
            const imgH = 120;                // taller
            const imgX = margin;

            // Dark background box
            doc.setFillColor(17, 24, 39);
            doc.roundedRect(imgX - 2, y - 2, imgW + 4, imgH + 4, 4, 4, 'F');

            doc.addImage(mol3dImgData, 'PNG', imgX, y, imgW, imgH, '', 'FAST');
            y += imgH + 10;
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'italic');
            doc.text('For interactive 3D rotation, open this compound in the ATUM web application.', margin, y - 4, { align: 'left' });

            // Restart rotation after snapshot
            mol3dViewer.spin('y', 1);

        } catch(e) {
            // If 3D snapshot fails, just note it
            doc.setTextColor(148, 163, 184);
            doc.setFontSize(8);
            doc.text('3D structure snapshot unavailable for this compound.', margin, y);
            y += 8;
        }
    }
    // ──────────────────────────────────────────────────────────
    checkPageBreak(25);
    y += 5;
    doc.setFillColor(201, 168, 76);
    doc.rect(0, y, 210, 20, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ATUM - Drug Toxicity Prediction', pageWidth / 2, y + 8, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Powered by XGBoost, RDKit & Tox21 Dataset | Hackathon 2024', pageWidth / 2, y + 14, { align: 'center' });

    const compoundName = (lastPubchemData && lastPubchemData.compound_name) ? lastPubchemData.compound_name : 'compound';
    const safeName = compoundName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    doc.save(`ATUM_Toxicity_Report_${safeName}.pdf`);
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

document.querySelectorAll('.predict-card, .result-block, .about-card, .team-card, .bulk-card').forEach(el => {
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