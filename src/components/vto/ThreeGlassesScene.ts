import * as THREE from 'three';

export interface Glasses3DConfig {
  type: string;
  colorHex: string;
  scale: number;
  verticalOffset: number;
  pitch: number;
  yaw: number;
  roll: number;
  lensTint?: string;
}

export class ThreeGlassesScene {
  public isSupported: boolean = true;
  private container: HTMLElement;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private glassesGroup?: THREE.Group;
  private animId: number | null = null;
  private isInspecting360: boolean = false;
  private inspectRotationSpeed: number = 0.01;

  constructor(container: HTMLElement) {
    this.container = container;
    try {
      const width = container.clientWidth || 640;
      const height = container.clientHeight || 480;

      // 1. Scene
      this.scene = new THREE.Scene();

      // 2. Camera
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      this.camera.position.set(0, 0, 180);

      // 3. Renderer with transparent background to overlay on camera/photo
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.2;

      this.container.appendChild(this.renderer.domElement);
      this.renderer.domElement.style.position = 'absolute';
      this.renderer.domElement.style.top = '0';
      this.renderer.domElement.style.left = '0';
      this.renderer.domElement.style.width = '100%';
      this.renderer.domElement.style.height = '100%';
      this.renderer.domElement.style.pointerEvents = 'none';

      // 4. Studio Lighting for metallic sheen & realistic reflections
      this.setupLighting();

      // 5. Glasses Container Group
      this.glassesGroup = new THREE.Group();
      this.scene.add(this.glassesGroup);

      this.animate();
    } catch (err) {
      console.warn("[ThreeGlassesScene] WebGL initialization failed or unsupported:", err);
      this.isSupported = false;
    }
  }

  private setupLighting() {
    if (!this.scene) return;
    // Soft Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambientLight);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xfff7e6, 2.2);
    keyLight.position.set(50, 80, 100);
    this.scene.add(keyLight);

    // Rim / Fill Light for gold & acetate highlights
    const rimLight = new THREE.DirectionalLight(0xd4af37, 1.5);
    rimLight.position.set(-60, 40, -40);
    this.scene.add(rimLight);

    // Front soft fill
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
    fillLight.position.set(0, -30, 80);
    this.scene.add(fillLight);
  }

  public updateGlasses(config: Glasses3DConfig) {
    if (!this.isSupported || !this.glassesGroup) return;

    try {
      // Clear existing meshes
      while (this.glassesGroup.children.length > 0) {
        const obj = this.glassesGroup.children[0];
        this.glassesGroup.remove(obj);
        if ((obj as any).geometry) (obj as any).geometry.dispose();
        if ((obj as any).material) {
          if (Array.isArray((obj as any).material)) {
            (obj as any).material.forEach((m: any) => m.dispose());
          } else {
            (obj as any).material.dispose();
          }
        }
      }

      // Build the 3D glasses model
      const glasses = this.buildGlassesMesh(config.type, config.colorHex || '#121215', config.lensTint);
      this.glassesGroup.add(glasses);

      // Apply 3D Transformations
      const baseScale = (config.scale || 1.0) * 1.05;
      this.glassesGroup.scale.set(baseScale, baseScale, baseScale);

      if (!this.isInspecting360) {
        this.glassesGroup.position.set(0, (config.verticalOffset || 0) * 1.5, 0);
        this.glassesGroup.rotation.set(
          config.pitch || 0,
          config.yaw || 0,
          config.roll || 0
        );
      }
    } catch (err) {
      console.warn("[ThreeGlassesScene] updateGlasses error:", err);
    }
  }

  public setPose(x: number, y: number, pitch: number, yaw: number, roll: number, scaleMultiplier: number) {
    if (!this.isSupported || !this.glassesGroup || this.isInspecting360) return;

    try {
      // Convert 2D pixel coordinates to 3D scene space
      const width = this.container.clientWidth || 640;
      const height = this.container.clientHeight || 480;

      // Normalized Device Coordinates (-1 to +1)
      const ndcX = ((x / width) * 2 - 1) * (width / height) * 45;
      const ndcY = -((y / height) * 2 - 1) * 45;

      this.glassesGroup.position.x = ndcX;
      this.glassesGroup.position.y = ndcY;
      this.glassesGroup.rotation.x = pitch;
      this.glassesGroup.rotation.y = yaw;
      this.glassesGroup.rotation.z = roll;

      const s = (scaleMultiplier || 1.0) * 1.1;
      this.glassesGroup.scale.set(s, s, s);
    } catch (err) {
      console.warn("[ThreeGlassesScene] setPose error:", err);
    }
  }

  public set360Inspect(enable: boolean) {
    this.isInspecting360 = enable;
    if (this.glassesGroup) {
      if (enable) {
        this.glassesGroup.position.set(0, 0, 0);
        this.glassesGroup.rotation.set(0.1, 0, 0);
      }
    }
  }

  private buildGlassesMesh(type: string, colorHex: string, lensTint?: string): THREE.Group {
    const group = new THREE.Group();

    const isMetallic = type === 'aviator' || type === 'rimless' || type === 'octagon';
    const frameColor = new THREE.Color(colorHex);

    // Frame Material with realistic reflections
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: frameColor,
      metalness: isMetallic ? 0.85 : 0.2,
      roughness: isMetallic ? 0.25 : 0.15,
      envMapIntensity: 1.5
    });

    // Premium translucent optical lens material
    const lensMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(lensTint || (type === 'aviator' ? '#18243b' : '#eef2f6')),
      transparent: true,
      opacity: type === 'aviator' ? 0.75 : 0.35,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.8,
      ior: 1.52,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });

    const templeMaterial = new THREE.MeshStandardMaterial({
      color: frameColor,
      metalness: isMetallic ? 0.8 : 0.3,
      roughness: 0.2
    });

    const bridgeSpacing = 16;
    const rimWidth = 46;
    const rimHeight = type === 'aviator' ? 44 : 36;
    const depth = 3.5;

    // 1. Build Left & Right Rims and Lenses based on frame shape
    switch (type) {
      case 'aviator': {
        // Teardrop shape
        this.createTeardropRim(group, -bridgeSpacing / 2 - rimWidth / 2, 0, rimWidth, rimHeight, depth, frameMaterial, lensMaterial);
        this.createTeardropRim(group, bridgeSpacing / 2 + rimWidth / 2, 0, rimWidth, rimHeight, depth, frameMaterial, lensMaterial);

        // Double Bridge
        const topBarGeo = new THREE.CylinderGeometry(1.0, 1.0, rimWidth * 1.8, 16);
        const topBar = new THREE.Mesh(topBarGeo, frameMaterial);
        topBar.rotation.z = Math.PI / 2;
        topBar.position.set(0, rimHeight * 0.44, 0);
        group.add(topBar);

        const lowerBridgeGeo = new THREE.CylinderGeometry(1.0, 1.0, bridgeSpacing, 16);
        const lowerBridge = new THREE.Mesh(lowerBridgeGeo, frameMaterial);
        lowerBridge.rotation.z = Math.PI / 2;
        lowerBridge.position.set(0, rimHeight * 0.1, 0);
        group.add(lowerBridge);
        break;
      }

      case 'round': {
        const radius = 22;
        this.createCircleRim(group, -bridgeSpacing / 2 - radius, 0, radius, depth, frameMaterial, lensMaterial);
        this.createCircleRim(group, bridgeSpacing / 2 + radius, 0, radius, depth, frameMaterial, lensMaterial);

        // Arched keyhole bridge
        const bridgeGeo = new THREE.TorusGeometry(bridgeSpacing * 0.65, 1.2, 12, 24, Math.PI);
        const bridge = new THREE.Mesh(bridgeGeo, frameMaterial);
        bridge.position.set(0, 4, 0);
        group.add(bridge);
        break;
      }

      case 'cateye': {
        this.createCatEyeRim(group, -bridgeSpacing / 2 - rimWidth / 2, 0, rimWidth, rimHeight, depth, frameMaterial, lensMaterial, false);
        this.createCatEyeRim(group, bridgeSpacing / 2 + rimWidth / 2, 0, rimWidth, rimHeight, depth, frameMaterial, lensMaterial, true);

        const bridgeGeo = new THREE.CylinderGeometry(1.4, 1.4, bridgeSpacing, 16);
        const bridge = new THREE.Mesh(bridgeGeo, frameMaterial);
        bridge.rotation.z = Math.PI / 2;
        bridge.position.set(0, 2, 0);
        group.add(bridge);
        break;
      }

      case 'rimless': {
        // Ultra-fine rimless lenses with titanium mount pegs
        this.createRectangleRim(group, -bridgeSpacing / 2 - rimWidth / 2, 0, rimWidth, rimHeight, depth * 0.6, frameMaterial, lensMaterial, true);
        this.createRectangleRim(group, bridgeSpacing / 2 + rimWidth / 2, 0, rimWidth, rimHeight, depth * 0.6, frameMaterial, lensMaterial, true);

        // Minimalist curved bridge
        const bridgeCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(-bridgeSpacing / 2, 0, 0),
          new THREE.Vector3(0, 5, 2),
          new THREE.Vector3(bridgeSpacing / 2, 0, 0)
        );
        const bridgeGeo = new THREE.TubeGeometry(bridgeCurve, 16, 0.9, 8, false);
        const bridge = new THREE.Mesh(bridgeGeo, frameMaterial);
        group.add(bridge);
        break;
      }

      case 'octagon': {
        this.createOctagonRim(group, -bridgeSpacing / 2 - rimWidth / 2, 0, 21, depth, frameMaterial, lensMaterial);
        this.createOctagonRim(group, bridgeSpacing / 2 + rimWidth / 2, 0, 21, depth, frameMaterial, lensMaterial);

        const bridgeGeo = new THREE.CylinderGeometry(1.1, 1.1, bridgeSpacing, 16);
        const bridge = new THREE.Mesh(bridgeGeo, frameMaterial);
        bridge.rotation.z = Math.PI / 2;
        bridge.position.set(0, 2, 0);
        group.add(bridge);
        break;
      }

      case 'square_acetate':
      default: {
        this.createRectangleRim(group, -bridgeSpacing / 2 - rimWidth / 2, 0, rimWidth, rimHeight, depth, frameMaterial, lensMaterial, false);
        this.createRectangleRim(group, bridgeSpacing / 2 + rimWidth / 2, 0, rimWidth, rimHeight, depth, frameMaterial, lensMaterial, false);

        // Acetate Bridge
        const bridgeGeo = new THREE.BoxGeometry(bridgeSpacing + 2, 5, depth);
        const bridge = new THREE.Mesh(bridgeGeo, frameMaterial);
        bridge.position.set(0, 4, 0);
        group.add(bridge);
        break;
      }
    }

    // 2. Build 3D Temples extending into -Z space
    const templeLength = 75;
    const templeStartX = rimWidth + bridgeSpacing / 2;

    // Left Temple
    const leftTemple = this.createTempleMesh(templeLength, templeMaterial);
    leftTemple.position.set(-templeStartX, 5, 0);
    leftTemple.rotation.y = -Math.PI / 2 - 0.05;
    group.add(leftTemple);

    // Right Temple
    const rightTemple = this.createTempleMesh(templeLength, templeMaterial);
    rightTemple.position.set(templeStartX, 5, 0);
    rightTemple.rotation.y = Math.PI / 2 + 0.05;
    group.add(rightTemple);

    // 3. Delicate Nose Pads
    const padMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      roughness: 0.3
    });
    const padGeo = new THREE.SphereGeometry(2.5, 12, 12);
    padGeo.scale(0.8, 1.4, 0.6);

    const leftPad = new THREE.Mesh(padGeo, padMaterial);
    leftPad.position.set(-bridgeSpacing * 0.45, -4, -4);
    group.add(leftPad);

    const rightPad = new THREE.Mesh(padGeo, padMaterial);
    rightPad.position.set(bridgeSpacing * 0.45, -4, -4);
    group.add(rightPad);

    return group;
  }

  // Helper for Rectangle / Acetate Rims
  private createRectangleRim(group: THREE.Group, x: number, y: number, w: number, h: number, depth: number, frameMat: THREE.Material, lensMat: THREE.Material, rimless: boolean) {
    // Outer shape
    const shape = new THREE.Shape();
    const r = 6;
    shape.moveTo(-w / 2 + r, -h / 2);
    shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

    if (!rimless) {
      // Cut hole for lens
      const hole = new THREE.Path();
      const holeInset = 3.2;
      const hw = w - holeInset * 2;
      const hh = h - holeInset * 2;
      const hr = 4;
      hole.moveTo(-hw / 2 + hr, -hh / 2);
      hole.lineTo(hw / 2 - hr, -hh / 2);
      hole.quadraticCurveTo(hw / 2, -hh / 2, hw / 2, -hh / 2 + hr);
      hole.lineTo(hw / 2, hh / 2 - hr);
      hole.quadraticCurveTo(hw / 2, hh / 2, hw / 2 - hr, hh / 2);
      hole.lineTo(-hw / 2 + hr, hh / 2);
      hole.quadraticCurveTo(-hw / 2, hh / 2, -hw / 2, hh / 2 - hr);
      hole.lineTo(-hw / 2, -hh / 2 + hr);
      hole.quadraticCurveTo(-hw / 2, -hh / 2, -hw / 2 + hr, -hh / 2);
      shape.holes.push(hole);

      const extrudeSettings = { depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.6, bevelThickness: 0.6 };
      const frameGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      frameGeo.center();
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.set(x, y, 0);
      group.add(frameMesh);
    }

    // Lens
    const lensShape = new THREE.Shape();
    const lr = 5;
    const lw = rimless ? w : w - 4;
    const lh = rimless ? h : h - 4;
    lensShape.moveTo(-lw / 2 + lr, -lh / 2);
    lensShape.lineTo(lw / 2 - lr, -lh / 2);
    lensShape.quadraticCurveTo(lw / 2, -lh / 2, lw / 2, -lh / 2 + lr);
    lensShape.lineTo(lw / 2, lh / 2 - lr);
    lensShape.quadraticCurveTo(lw / 2, lh / 2, lw / 2 - lr, lh / 2);
    lensShape.lineTo(-lw / 2 + lr, lh / 2);
    lensShape.quadraticCurveTo(-lw / 2, lh / 2, -lw / 2, lh / 2 - lr);
    lensShape.lineTo(-lw / 2, -lh / 2 + lr);
    lensShape.quadraticCurveTo(-lw / 2, -lh / 2, -lw / 2 + lr, -lh / 2);

    const lensGeo = new THREE.ExtrudeGeometry(lensShape, { depth: 1.2, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.4, bevelThickness: 0.4 });
    lensGeo.center();
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.set(x, y, 0);
    group.add(lensMesh);
  }

  // Helper for Teardrop / Aviator Rims
  private createTeardropRim(group: THREE.Group, x: number, y: number, w: number, h: number, depth: number, frameMat: THREE.Material, lensMat: THREE.Material) {
    const rx = w / 2;
    const ry = h / 2;

    const shape = new THREE.Shape();
    shape.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);

    const hole = new THREE.Path();
    hole.absellipse(0, 0, rx - 1.8, ry - 1.8, 0, Math.PI * 2, true, 0);
    shape.holes.push(hole);

    const frameGeo = new THREE.ExtrudeGeometry(shape, { depth: 2.2, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.3, bevelThickness: 0.3 });
    frameGeo.center();
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(x, y, 0);
    group.add(frameMesh);

    // Lens
    const lensShape = new THREE.Shape();
    lensShape.absellipse(0, 0, rx - 1.0, ry - 1.0, 0, Math.PI * 2, false, 0);
    const lensGeo = new THREE.ExtrudeGeometry(lensShape, { depth: 0.8, bevelEnabled: false });
    lensGeo.center();
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.set(x, y, 0);
    group.add(lensMesh);
  }

  // Helper for Round Rims
  private createCircleRim(group: THREE.Group, x: number, y: number, radius: number, depth: number, frameMat: THREE.Material, lensMat: THREE.Material) {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false);

    const hole = new THREE.Path();
    hole.absarc(0, 0, radius - 2.8, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const frameGeo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.5, bevelThickness: 0.5 });
    frameGeo.center();
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(x, y, 0);
    group.add(frameMesh);

    const lensShape = new THREE.Shape();
    lensShape.absarc(0, 0, radius - 2.0, 0, Math.PI * 2, false);
    const lensGeo = new THREE.ExtrudeGeometry(lensShape, { depth: 1.2, bevelEnabled: false });
    lensGeo.center();
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.set(x, y, 0);
    group.add(lensMesh);
  }

  // Helper for Cat-Eye Rims
  private createCatEyeRim(group: THREE.Group, x: number, y: number, w: number, h: number, depth: number, frameMat: THREE.Material, lensMat: THREE.Material, isRight: boolean) {
    const shape = new THREE.Shape();
    const mult = isRight ? 1 : -1;

    shape.moveTo(-w / 2, -h / 2);
    shape.lineTo(w / 2, -h / 2);
    // Dramatic uplifted corner
    if (isRight) {
      shape.lineTo(w / 2 + 6, h / 2 + 5);
      shape.lineTo(-w / 2, h / 2 - 2);
    } else {
      shape.lineTo(w / 2, h / 2 - 2);
      shape.lineTo(-w / 2 - 6, h / 2 + 5);
    }
    shape.closePath();

    const hole = new THREE.Path();
    hole.absellipse(0, 0, w / 2 - 3, h / 2 - 3, 0, Math.PI * 2, true, 0);
    shape.holes.push(hole);

    const frameGeo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.6, bevelThickness: 0.6 });
    frameGeo.center();
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(x, y, 0);
    group.add(frameMesh);

    const lensShape = new THREE.Shape();
    lensShape.absellipse(0, 0, w / 2 - 2, h / 2 - 2, 0, Math.PI * 2, false, 0);
    const lensGeo = new THREE.ExtrudeGeometry(lensShape, { depth: 1.0, bevelEnabled: false });
    lensGeo.center();
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.set(x, y, 0);
    group.add(lensMesh);
  }

  // Helper for Octagon Rims
  private createOctagonRim(group: THREE.Group, x: number, y: number, radius: number, depth: number, frameMat: THREE.Material, lensMat: THREE.Material) {
    const shape = new THREE.Shape();
    for (let i = 0; i < 8; i++) {
      const angle = (i * 2 * Math.PI) / 8 - Math.PI / 8;
      const px = radius * Math.cos(angle);
      const py = radius * Math.sin(angle);
      if (i === 0) shape.moveTo(px, py);
      else shape.lineTo(px, py);
    }
    shape.closePath();

    const hole = new THREE.Path();
    for (let i = 0; i < 8; i++) {
      const angle = (i * 2 * Math.PI) / 8 - Math.PI / 8;
      const px = (radius - 1.8) * Math.cos(angle);
      const py = (radius - 1.8) * Math.sin(angle);
      if (i === 0) hole.moveTo(px, py);
      else hole.lineTo(px, py);
    }
    hole.closePath();
    shape.holes.push(hole);

    const frameGeo = new THREE.ExtrudeGeometry(shape, { depth: 2.0, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.3, bevelThickness: 0.3 });
    frameGeo.center();
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(x, y, 0);
    group.add(frameMesh);

    const lensShape = new THREE.Shape();
    lensShape.absarc(0, 0, radius - 1.4, 0, Math.PI * 2, false);
    const lensGeo = new THREE.ExtrudeGeometry(lensShape, { depth: 0.8, bevelEnabled: false });
    lensGeo.center();
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.set(x, y, 0);
    group.add(lensMesh);
  }

  // Curved 3D Temple / Earpiece
  private createTempleMesh(length: number, mat: THREE.Material): THREE.Mesh {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -length * 0.75),
      new THREE.Vector3(0, -14, -length)
    );
    const geo = new THREE.TubeGeometry(curve, 20, 1.4, 8, false);
    return new THREE.Mesh(geo, mat);
  }

  private animate = () => {
    if (!this.isSupported || !this.renderer || !this.scene || !this.camera) return;

    this.animId = requestAnimationFrame(this.animate);

    if (this.isInspecting360 && this.glassesGroup) {
      this.glassesGroup.rotation.y += this.inspectRotationSpeed;
    }

    try {
      this.renderer.render(this.scene, this.camera);
    } catch (e) {
      // Silently catch context loss or render glitches
    }
  };

  public resize(width: number, height: number) {
    if (!this.isSupported || !this.renderer || !this.camera) return;
    try {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    } catch (e) {}
  }

  public captureSnapshot(): string {
    if (!this.isSupported || !this.renderer) return '';
    try {
      return this.renderer.domElement.toDataURL('image/png');
    } catch (e) {
      return '';
    }
  }

  public destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.renderer) {
      try {
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
        this.renderer.dispose();
      } catch (e) {}
    }
  }
}
