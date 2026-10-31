/**
 * LushLens Studio - Interactive 3D DSLR Camera Showcase
 * Features:
 * - Full 3D camera model: body, textured grip, multi-stage prime lens with glass optics,
 *   top pentaprism with gold LushLens typography, mode dials, shutter button, red video dot.
 * - Back Feature Display: Luminous LCD screen with simulated live DSLR viewfinder telemetry,
 *   EVF rubber eyepiece, D-pad, and pro control buttons.
 * - Automatic turntable rotation with smooth pause/resume on user drag.
 * - Cursor grab & rotate in 3D (Mouse, Touch, Stylus) with inertia momentum.
 * - HUD controls: Auto-Rotate Toggle, Reset Hero View, Front View, Back Display View.
 */

(function init3DCameraShowcase() {
    const container = document.getElementById('camera3DContainer');
    if (!container) return;

    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded yet for 3D Camera Showcase');
        return;
    }

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 540;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    // Adjusted distance so the entire camera model has plenty of breathing room at all angles
    camera.position.set(0, 0.35, 9.8);

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.cursor = 'grab';

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Warm Gold Key Light (Front-Right-Top)
    const keyLight = new THREE.DirectionalLight(0xfff5a0, 1.4);
    keyLight.position.set(5, 6, 6);
    scene.add(keyLight);

    // Cool Cyan/Blue Rim Light (Back-Left-Top) - Illuminates back display & pentaprism
    const rimLight = new THREE.DirectionalLight(0x99ddff, 1.2);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    // Soft Gold Underfill Light
    const fillLight = new THREE.DirectionalLight(0xfff278, 0.5);
    fillLight.position.set(0, -4, 4);
    scene.add(fillLight);

    // Soft Top Studio Spotlight
    const spotLight = new THREE.SpotLight(0xffffff, 1.0, 15, Math.PI / 4, 0.3);
    spotLight.position.set(0, 7, 2);
    scene.add(spotLight);

    // --- Dynamic Textures ---

    // 1. Grip Leather Texture (Bump map)
    function createGripTexture() {
        const c = document.createElement('canvas');
        c.width = 128;
        c.height = 128;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#888888';
        ctx.fillRect(0, 0, 128, 128);
        for (let i = 0; i < 900; i++) {
            const x = Math.random() * 128;
            const y = Math.random() * 128;
            const r = Math.random() * 1.8 + 0.5;
            ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#222222';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 4);
        return tex;
    }

    // 2. Back LCD Feature Display Texture
    function createScreenTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 360;
        const ctx = c.getContext('2d');

        // Dark viewfinder background with subtle gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 360);
        bgGrad.addColorStop(0, '#090d14');
        bgGrad.addColorStop(1, '#05070a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 512, 360);

        // Grid lines (Rule of Thirds)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(170, 0); ctx.lineTo(170, 360);
        ctx.moveTo(342, 0); ctx.lineTo(342, 360);
        ctx.moveTo(0, 120); ctx.lineTo(512, 120);
        ctx.moveTo(0, 240); ctx.lineTo(512, 240);
        ctx.stroke();

        // Top Status Bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 0, 512, 38);

        // [M] Mode Box
        ctx.fillStyle = '#fff278';
        ctx.fillRect(16, 8, 26, 22);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('M', 23, 24);

        // RAW+F & 4K 60FPS
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.fillText('RAW+JPG', 52, 23);

        ctx.fillStyle = '#00e5ff';
        ctx.fillText('4K • 60p', 125, 23);

        // AF-C Tracking & Audio Status
        ctx.fillStyle = '#76ff03';
        ctx.fillText('AF-C [TRACK]', 200, 23);

        // Battery Icon & Percentage
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(440, 11, 28, 15);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(468, 15, 3, 7);
        ctx.fillStyle = '#76ff03';
        ctx.fillRect(442, 13, 20, 11);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('94%', 408, 23);

        // Center Autofocus Reticle Brackets (Neon Green)
        ctx.strokeStyle = '#76ff03';
        ctx.lineWidth = 2.5;
        // Left bracket
        ctx.beginPath();
        ctx.moveTo(230, 160); ctx.lineTo(220, 160); ctx.lineTo(220, 200); ctx.lineTo(230, 200);
        ctx.stroke();
        // Right bracket
        ctx.beginPath();
        ctx.moveTo(282, 160); ctx.lineTo(292, 160); ctx.lineTo(292, 200); ctx.lineTo(282, 200);
        ctx.stroke();
        // Center crosshair
        ctx.beginPath();
        ctx.moveTo(251, 175); ctx.lineTo(261, 175);
        ctx.moveTo(256, 170); ctx.lineTo(256, 180);
        ctx.stroke();

        // Level Horizon Indicator (Green horizontal line)
        ctx.strokeStyle = 'rgba(118, 255, 3, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(70, 180); ctx.lineTo(130, 180);
        ctx.moveTo(382, 180); ctx.lineTo(442, 180);
        ctx.stroke();

        // Recording Dot & Timecode
        ctx.fillStyle = '#ff1744';
        ctx.beginPath();
        ctx.arc(32, 60, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px monospace';
        ctx.fillText('STBY  00:14:28:10', 46, 65);

        // Bottom Telemetry Bar (The Pro Camera HUD)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 308, 512, 52);

        // Shutter Speed
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('1/500', 24, 342);

        // Aperture (Bold Gold Highlight)
        ctx.fillStyle = '#fff278';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('F1.2', 120, 342);

        // ISO Value
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('ISO 100', 200, 342);

        // Exposure Compensation
        ctx.fillStyle = '#cccccc';
        ctx.font = '16px monospace';
        ctx.fillText('MM ±0.0', 310, 340);

        // Audio Level Meters
        ctx.fillStyle = '#76ff03';
        ctx.fillRect(420, 320, 65, 5);
        ctx.fillRect(420, 330, 52, 5);
        ctx.fillStyle = '#fff278';
        ctx.fillRect(485, 320, 8, 5);
        ctx.fillRect(472, 330, 8, 5);

        const tex = new THREE.CanvasTexture(c);
        return tex;
    }

    // 3. Pentaprism LushLens Gold Logo Texture
    function createPentaprismTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 64;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#18181a';
        ctx.fillRect(0, 0, 256, 64);

        ctx.fillStyle = '#fff278';
        ctx.font = '900 24px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LUSHLENS', 128, 32);

        const tex = new THREE.CanvasTexture(c);
        return tex;
    }

    // 4. Front Lens Ring Markings Texture
    function createLensBezelTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 64;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#111112';
        ctx.fillRect(0, 0, 512, 64);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LUSHLENS FE 50mm F/1.2 GM  •  Ø 72mm  •  NANO AR COATING', 256, 32);

        const tex = new THREE.CanvasTexture(c);
        return tex;
    }

    // --- Materials Palette ---
    const gripBumpTex = createGripTexture();
    const screenTex = createScreenTexture();
    const logoTex = createPentaprismTexture();
    const lensBezelTex = createLensBezelTexture();

    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1d,
        roughness: 0.45,
        metalness: 0.65
    });

    const gripMat = new THREE.MeshStandardMaterial({
        color: 0x121214,
        roughness: 0.85,
        metalness: 0.2,
        bumpMap: gripBumpTex,
        bumpScale: 0.05
    });

    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xfff278,
        metalness: 0.92,
        roughness: 0.22
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
        color: 0x242428,
        metalness: 0.85,
        roughness: 0.35
    });

    const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        metalness: 0.95,
        roughness: 0.15
    });

    const redButtonMat = new THREE.MeshStandardMaterial({
        color: 0xdd1122,
        roughness: 0.3,
        metalness: 0.5
    });

    const glassLensMat = new THREE.MeshStandardMaterial({
        color: 0x071526,
        roughness: 0.05,
        metalness: 0.35,
        transparent: true,
        opacity: 0.85
    });

    const screenMat = new THREE.MeshBasicMaterial({
        map: screenTex
    });

    // --- Build Complete 3D DSLR Camera Model ---
    const cameraGroup = new THREE.Group();

    // 1. Main Camera Body Chassis
    const bodyGeo = new THREE.BoxGeometry(3.2, 2.2, 1.4);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    cameraGroup.add(bodyMesh);

    // 2. Right Ergonomic Handgrip (Protrudes forward)
    const gripGeo = new THREE.BoxGeometry(0.85, 2.16, 1.6);
    const gripMesh = new THREE.Mesh(gripGeo, gripMat);
    gripMesh.position.set(1.22, -0.02, 0.42);
    cameraGroup.add(gripMesh);

    // Smooth rounded grip curve
    const gripCurveGeo = new THREE.CylinderGeometry(0.42, 0.42, 2.16, 24);
    const gripCurveMesh = new THREE.Mesh(gripCurveGeo, gripMat);
    gripCurveMesh.position.set(1.58, -0.02, 1.15);
    cameraGroup.add(gripCurveMesh);

    // 3. Top Pentaprism / Viewfinder Housing
    const prismGeo = new THREE.CylinderGeometry(0.75, 0.95, 0.65, 4);
    prismGeo.rotateY(Math.PI / 4);
    const prismMesh = new THREE.Mesh(prismGeo, bodyMat);
    prismMesh.position.set(0, 1.35, -0.05);
    cameraGroup.add(prismMesh);

    // LushLens Gold Brand Plate on Pentaprism front
    const logoGeo = new THREE.PlaneGeometry(1.0, 0.28);
    const logoMat = new THREE.MeshBasicMaterial({ map: logoTex, transparent: true });
    const logoMesh = new THREE.Mesh(logoGeo, logoMat);
    logoMesh.position.set(0, 1.38, 0.58);
    cameraGroup.add(logoMesh);

    // Flash Hot Shoe Bracket on top of pentaprism
    const hotShoeGeo = new THREE.BoxGeometry(0.46, 0.08, 0.46);
    const hotShoeMesh = new THREE.Mesh(hotShoeGeo, chromeMat);
    hotShoeMesh.position.set(0, 1.71, -0.05);
    cameraGroup.add(hotShoeMesh);

    // 4. Multi-Stage G-Master Prime Lens (Front, z > 0)
    const lensGroup = new THREE.Group();
    lensGroup.position.set(0, 0, 0.7);

    // Chrome Lens Mount Base
    const mountGeo = new THREE.CylinderGeometry(1.08, 1.15, 0.22, 36);
    mountGeo.rotateX(Math.PI / 2);
    const mountMesh = new THREE.Mesh(mountGeo, chromeMat);
    mountMesh.position.set(0, 0, 0.11);
    lensGroup.add(mountMesh);

    // Lens Barrel Section 1 (Dark Anodized Metal)
    const barrel1Geo = new THREE.CylinderGeometry(1.04, 1.06, 0.65, 36);
    barrel1Geo.rotateX(Math.PI / 2);
    const barrel1Mesh = new THREE.Mesh(barrel1Geo, darkMetalMat);
    barrel1Mesh.position.set(0, 0, 0.54);
    lensGroup.add(barrel1Mesh);

    // Gold Luxury Accent Ring
    const goldRingGeo = new THREE.CylinderGeometry(1.055, 1.055, 0.07, 36);
    goldRingGeo.rotateX(Math.PI / 2);
    const goldRingMesh = new THREE.Mesh(goldRingGeo, goldMat);
    goldRingMesh.position.set(0, 0, 0.9);
    lensGroup.add(goldRingMesh);

    // Focus / Zoom Ring with tactile ridges
    const focusRingGeo = new THREE.CylinderGeometry(1.07, 1.07, 0.75, 48);
    focusRingGeo.rotateX(Math.PI / 2);
    const focusRingMesh = new THREE.Mesh(focusRingGeo, gripMat);
    focusRingMesh.position.set(0, 0, 1.31);
    lensGroup.add(focusRingMesh);

    // Front Barrel & Lens Bezel
    const frontBarrelGeo = new THREE.CylinderGeometry(1.12, 1.07, 0.35, 36);
    frontBarrelGeo.rotateX(Math.PI / 2);
    const frontBarrelMesh = new THREE.Mesh(frontBarrelGeo, darkMetalMat);
    frontBarrelMesh.position.set(0, 0, 1.86);
    lensGroup.add(frontBarrelMesh);

    // Front Bezel Text Ring
    const bezelRingGeo = new THREE.RingGeometry(0.72, 1.1, 36);
    const bezelMat = new THREE.MeshBasicMaterial({ map: lensBezelTex, side: THREE.DoubleSide });
    const bezelMesh = new THREE.Mesh(bezelRingGeo, bezelMat);
    bezelMesh.position.set(0, 0, 2.04);
    lensGroup.add(bezelMesh);

    // Curved Convex Front Glass Element (Reflective multi-coat)
    const glassGeo = new THREE.SphereGeometry(0.74, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const glassMesh = new THREE.Mesh(glassGeo, glassLensMat);
    glassMesh.scale.set(1, 1, 0.35);
    glassMesh.position.set(0, 0, 1.96);
    lensGroup.add(glassMesh);

    // Red G-Master Badge on Lens Side
    const gBadgeGeo = new THREE.BoxGeometry(0.04, 0.22, 0.22);
    const gBadgeMat = new THREE.MeshStandardMaterial({ color: 0xdd1122, roughness: 0.3 });
    const gBadgeMesh = new THREE.Mesh(gBadgeGeo, gBadgeMat);
    gBadgeMesh.position.set(-1.06, 0, 0.8);
    lensGroup.add(gBadgeMesh);

    cameraGroup.add(lensGroup);

    // 5. Top Controls (Dials, Shutter Button, Video Button)
    // Left Mode Dial
    const modeDialGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.26, 28);
    const modeDialMesh = new THREE.Mesh(modeDialGeo, darkMetalMat);
    modeDialMesh.position.set(-1.08, 1.23, -0.05);
    cameraGroup.add(modeDialMesh);

    // Shutter Button Assembly (Angled on grip)
    const shutterBaseGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.18, 24);
    const shutterBaseMesh = new THREE.Mesh(shutterBaseGeo, chromeMat);
    shutterBaseMesh.position.set(1.28, 1.16, 0.85);
    shutterBaseMesh.rotation.x = 0.2;
    cameraGroup.add(shutterBaseMesh);

    const shutterBtnGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 24);
    const shutterBtnMesh = new THREE.Mesh(shutterBtnGeo, darkMetalMat);
    shutterBtnMesh.position.set(1.28, 1.23, 0.84);
    shutterBtnMesh.rotation.x = 0.2;
    cameraGroup.add(shutterBtnMesh);

    // Right Exposure Dial
    const expDialGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 28);
    const expDialMesh = new THREE.Mesh(expDialGeo, darkMetalMat);
    expDialMesh.position.set(0.85, 1.21, -0.25);
    cameraGroup.add(expDialMesh);

    // Red Video Record Button
    const recBtnGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 20);
    const recBtnMesh = new THREE.Mesh(recBtnGeo, redButtonMat);
    recBtnMesh.position.set(0.55, 1.16, 0.25);
    cameraGroup.add(recBtnMesh);

    // 6. Back Feature Display & Controls (z < 0)
    const backGroup = new THREE.Group();
    backGroup.position.set(0, 0, -0.71);

    // LCD Screen Bezel Frame
    const screenFrameGeo = new THREE.BoxGeometry(2.14, 1.54, 0.06);
    const screenFrameMesh = new THREE.Mesh(screenFrameGeo, darkMetalMat);
    screenFrameMesh.position.set(-0.42, -0.15, -0.02);
    backGroup.add(screenFrameMesh);

    // Active Luminous LCD Display Panel
    const screenGeo = new THREE.PlaneGeometry(2.0, 1.4);
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.rotation.y = Math.PI; // Face towards back
    screenMesh.position.set(-0.42, -0.15, -0.06);
    backGroup.add(screenMesh);

    // Electronic Viewfinder (EVF) Eyepiece (Top center back)
    const evfEyecupGeo = new THREE.TorusGeometry(0.3, 0.1, 16, 28);
    const evfEyecupMesh = new THREE.Mesh(evfEyecupGeo, gripMat);
    evfEyecupMesh.position.set(0, 1.35, -0.18);
    backGroup.add(evfEyecupMesh);

    const evfGlassGeo = new THREE.CircleGeometry(0.25, 24);
    const evfGlassMesh = new THREE.Mesh(evfGlassGeo, glassLensMat);
    evfGlassMesh.rotation.y = Math.PI;
    evfGlassMesh.position.set(0, 1.35, -0.18);
    backGroup.add(evfGlassMesh);

    // Directional D-Pad Navigation Wheel (Back Right)
    const dpadGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.08, 24);
    dpadGeo.rotateX(Math.PI / 2);
    const dpadMesh = new THREE.Mesh(dpadGeo, darkMetalMat);
    dpadMesh.position.set(1.08, -0.32, -0.04);
    backGroup.add(dpadMesh);

    // D-Pad Central OK Button
    const okBtnGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 20);
    okBtnGeo.rotateX(Math.PI / 2);
    const okBtnMesh = new THREE.Mesh(okBtnGeo, chromeMat);
    okBtnMesh.position.set(1.08, -0.32, -0.06);
    backGroup.add(okBtnMesh);

    // Micro Pro Buttons: MENU, FN, PLAY, DEL
    const buttonPositions = [
        { x: 0.92, y: 0.45, label: 'MENU' },
        { x: 1.25, y: 0.45, label: 'FN' },
        { x: 0.92, y: -0.75, label: 'PLAY' },
        { x: 1.25, y: -0.75, label: 'DEL' }
    ];
    buttonPositions.forEach((pos) => {
        const btnGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.08, 16);
        btnGeo.rotateX(Math.PI / 2);
        const btnMesh = new THREE.Mesh(btnGeo, darkMetalMat);
        btnMesh.position.set(pos.x, pos.y, -0.04);
        backGroup.add(btnMesh);
    });

    cameraGroup.add(backGroup);

    // 7. Metal Strap Lugs on Left & Right
    [-1.65, 1.65].forEach((x) => {
        const lugGeo = new THREE.TorusGeometry(0.14, 0.04, 12, 20);
        lugGeo.rotateY(Math.PI / 2);
        const lugMesh = new THREE.Mesh(lugGeo, chromeMat);
        lugMesh.position.set(x, 0.65, 0.1);
        cameraGroup.add(lugMesh);
    });

    // 8. Ground Turntable Shadow Disc
    const shadowGeo = new THREE.PlaneGeometry(4.8, 4.8);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    const radGrad = sCtx.createRadialGradient(64, 64, 5, 64, 64, 60);
    radGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    radGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = radGrad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.85
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -1.18, 0);
    shadowMesh.scale.set(0.88, 0.88, 0.88);
    scene.add(shadowMesh);

    // Center, scale and orient the camera group (0.85 scale ensures zero clipping at 360 rotation)
    cameraGroup.scale.set(0.85, 0.85, 0.85);
    cameraGroup.position.set(0, 0.08, 0);
    // Initial Resting 3/4 Hero Showcase Angle
    const DEFAULT_ROT_X = 0.12;
    const DEFAULT_ROT_Y = -0.45;
    cameraGroup.rotation.set(DEFAULT_ROT_X, DEFAULT_ROT_Y, 0);

    scene.add(cameraGroup);

    // --- Interaction & Turntable Controller ---
    let autoRotate = true;
    let autoRotateSpeed = 0.007;
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let velX = 0;
    let velY = 0;
    let resumeTimeout = null;

    function pauseAutoRotateTemporarily() {
        autoRotate = false;
        if (resumeTimeout) clearTimeout(resumeTimeout);
        // Smoothly resume auto-rotation after 2 seconds of inactivity
        resumeTimeout = setTimeout(() => {
            autoRotate = true;
            updateHudStatus();
        }, 2200);
    }

    canvas.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        isDragging = true;
        canvas.style.cursor = 'grabbing';
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        velX = 0;
        velY = 0;
        pauseAutoRotateTemporarily();
        try {
            canvas.setPointerCapture(e.pointerId);
        } catch (err) {}
        e.preventDefault();
    });

    window.addEventListener('pointermove', (e) => {
        if (!isDragging) return;

        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;

        velX = dx * 0.006;
        velY = dy * 0.005;

        cameraGroup.rotation.y += velX;
        cameraGroup.rotation.x += velY;

        // Clamp pitch to prevent inverted upside down view
        cameraGroup.rotation.x = Math.max(-0.6, Math.min(0.65, cameraGroup.rotation.x));

        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        pauseAutoRotateTemporarily();
    });

    function stopDragging(e) {
        if (!isDragging) return;
        isDragging = false;
        canvas.style.cursor = 'grab';
        if (e && e.pointerId) {
            try {
                canvas.releasePointerCapture(e.pointerId);
            } catch (err) {}
        }
    }

    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);

    // --- HUD Controls & Buttons ---
    const toggleAutoBtn = document.getElementById('toggleCameraAutoRotate');
    const resetBtn = document.getElementById('resetCameraAngle');
    const viewFrontBtn = document.getElementById('viewCameraFront');
    const viewBackBtn = document.getElementById('viewCameraBack');
    const autoStatusBadge = document.getElementById('cameraAutoStatus');

    function updateHudStatus() {
        if (toggleAutoBtn) {
            if (autoRotate) {
                toggleAutoBtn.innerHTML = '<i class="fas fa-pause text-[10px]"></i><span>Pause</span>';
                toggleAutoBtn.classList.add('border-third/40', 'text-third');
            } else {
                toggleAutoBtn.innerHTML = '<i class="fas fa-play text-[10px]"></i><span>Auto-Rotate</span>';
                toggleAutoBtn.classList.remove('border-third/40', 'text-third');
            }
        }
        if (autoStatusBadge) {
            autoStatusBadge.textContent = autoRotate ? 'Auto-Rotating' : 'Manual View';
        }
    }

    if (toggleAutoBtn) {
        toggleAutoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            autoRotate = !autoRotate;
            if (!autoRotate && resumeTimeout) clearTimeout(resumeTimeout);
            updateHudStatus();
        });
    }

    function smoothAnimateTo(targetX, targetY) {
        autoRotate = false;
        if (resumeTimeout) clearTimeout(resumeTimeout);
        velX = 0;
        velY = 0;

        const startX = cameraGroup.rotation.x;
        const startY = cameraGroup.rotation.y;
        const startTime = performance.now();
        const duration = 650;

        function animateStep(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            cameraGroup.rotation.x = startX + (targetX - startX) * ease;
            cameraGroup.rotation.y = startY + (targetY - startY) * ease;

            if (progress < 1) {
                requestAnimationFrame(animateStep);
            } else {
                updateHudStatus();
                // Resume auto-rotation after 3s
                resumeTimeout = setTimeout(() => {
                    autoRotate = true;
                    updateHudStatus();
                }, 3000);
            }
        }
        requestAnimationFrame(animateStep);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            smoothAnimateTo(DEFAULT_ROT_X, DEFAULT_ROT_Y);
        });
    }

    if (viewFrontBtn) {
        viewFrontBtn.addEventListener('click', (e) => {
            e.preventDefault();
            smoothAnimateTo(0.05, 0.0);
        });
    }

    if (viewBackBtn) {
        viewBackBtn.addEventListener('click', (e) => {
            e.preventDefault();
            smoothAnimateTo(0.05, Math.PI); // Rotate 180 deg to show back display
        });
    }

    // --- Responsive Resize & Auto Framing ---
    function onResize() {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        camera.aspect = w / h;
        // Dynamically adjust distance if viewport is narrower than square to guarantee zero clipping
        if (camera.aspect < 1.0) {
            camera.position.z = 9.8 + (1.0 - camera.aspect) * 3.8;
        } else {
            camera.position.z = 9.8;
        }
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(onResize);
        ro.observe(container);
    }

    // --- Render Loop ---
    function animate() {
        requestAnimationFrame(animate);

        // Auto-rotation logic
        if (autoRotate && !isDragging) {
            cameraGroup.rotation.y += autoRotateSpeed;
            // Gentle subtle floating breathing pitch
            cameraGroup.rotation.x = THREE.MathUtils.lerp(
                cameraGroup.rotation.x,
                0.12 + Math.sin(performance.now() * 0.0015) * 0.04,
                0.03
            );
        } else if (!isDragging) {
            // Apply inertia momentum damping
            velX *= 0.92;
            velY *= 0.92;
            cameraGroup.rotation.y += velX;
            cameraGroup.rotation.x += velY;
            cameraGroup.rotation.x = Math.max(-0.6, Math.min(0.65, cameraGroup.rotation.x));
        }

        renderer.render(scene, camera);
    }

    animate();
    updateHudStatus();
})();
