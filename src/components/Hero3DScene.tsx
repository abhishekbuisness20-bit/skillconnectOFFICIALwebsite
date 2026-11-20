import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BRAND_CONFIG } from '../data/websiteContent';
import { Pause, Play, RotateCcw, Sparkles } from 'lucide-react';

// Pre-allocated scratch helpers — zero per-frame heap allocations inside useFrame
const _scratchObj = new THREE.Object3D();
const _scratchVec = new THREE.Vector3();

function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };
    setPrefersReduced(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced;
}

function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '')
      : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(renderer);
  } catch {
    return false;
  }
}

function checkWebGLSupport(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function createBrushedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#909090';
    ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 2) {
      const lum = 122 + Math.floor(Math.sin(y * 0.45) * 18 + ((y * 37) % 24));
      ctx.fillStyle = `rgb(${lum},${lum},${lum})`;
      ctx.fillRect(0, y, 256, 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Soft luminous white radial halo glow placed behind the central medallion
 * inside the pearlescent white 3D studio environment.
 */
function createWhiteHaloTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
    grad.addColorStop(0.42, 'rgba(218, 246, 255, 0.55)');
    grad.addColorStop(0.72, 'rgba(215, 250, 236, 0.22)');
    grad.addColorStop(1, 'rgba(244, 250, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Grounding radial contact reflection shadow tinted with subtle cyan & green studio bounce
 * for the pearlescent white space floor.
 */
function createWhiteSpaceShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 122);
    grad.addColorStop(0, 'rgba(7, 20, 38, 0.22)');
    grad.addColorStop(0.45, 'rgba(8, 200, 240, 0.14)');
    grad.addColorStop(0.75, 'rgba(39, 216, 121, 0.07)');
    grad.addColorStop(1, 'rgba(244, 250, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Renders the original SkillConnect JPEG cleanly centered on a high-DPI 1024x1024 canvas
 * with seamless #041024 navy margin blending so the circular bevel never clips
 * the figures or the "SkillConnect" wordmark edges.
 */
function createFramedOriginalLogoTexture(
  img: HTMLImageElement,
  maxAniso: number
): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Seamless deep navy backdrop matching the original logo canvas
    ctx.fillStyle = '#041024';
    ctx.fillRect(0, 0, size, size);

    // Draw the original square logo slightly inset so both figures & full wordmark fit comfortably
    const inset = 68;
    ctx.drawImage(img, inset, inset, size - inset * 2, size - inset * 2);

    // Soft circular edge vignette blend so the rectangular edge bands dissolve smoothly
    const edgeMask = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.36,
      size / 2,
      size / 2,
      size * 0.49
    );
    edgeMask.addColorStop(0, 'rgba(4, 16, 36, 0)');
    edgeMask.addColorStop(1, 'rgba(4, 16, 36, 0.88)');
    ctx.fillStyle = edgeMask;
    ctx.fillRect(0, 0, size, size);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

const StudioEnvironment: React.FC = () => {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);

    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.72;

    return () => {
      scene.environment = null;
      envTarget.dispose();
      roomEnv.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
};

interface SkillConnectMedallionProps {
  animate: boolean;
  resetSignal: number;
  isSoftwareRenderer: boolean;
}

const PARTICLE_COUNT = 36;

const SkillConnectMedallion: React.FC<SkillConnectMedallionProps> = ({
  animate,
  resetSignal,
  isSoftwareRenderer,
}) => {
  const { gl, invalidate } = useThree();
  const spinGroupRef = useRef<THREE.Group>(null);
  const floatGroupRef = useRef<THREE.Group>(null);
  const ringOneRef = useRef<THREE.Mesh>(null);
  const ringTwoRef = useRef<THREE.Mesh>(null);
  const instancedParticlesRef = useRef<THREE.InstancedMesh>(null);

  const spinAngleRef = useRef<number>(0);
  const clockAccumRef = useRef<number>(0);

  const [logoTexture, setLogoTexture] = useState<THREE.Texture | null>(null);
  const logoTextureRef = useRef<THREE.Texture | null>(null);

  const brushedMap = useMemo(() => createBrushedMetalTexture(), []);
  const whiteHaloMap = useMemo(() => createWhiteHaloTexture(), []);
  const groundShadowMap = useMemo(() => createWhiteSpaceShadowTexture(), []);

  // Load original crisp SkillConnect brand asset & bake into clean centered medallion texture
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const maxAniso = Math.min(8, gl.capabilities.getMaxAnisotropy() || 4);

    img.onload = () => {
      if (cancelled) return;
      const tex = createFramedOriginalLogoTexture(img, maxAniso);
      logoTextureRef.current = tex;
      setLogoTexture(tex);
      invalidate();
    };

    img.onerror = () => {
      // Fallback safely preserves sculpted navy core without crashing
    };

    img.src = BRAND_CONFIG.logoPath;

    return () => {
      cancelled = true;
      if (logoTextureRef.current) {
        logoTextureRef.current.dispose();
        logoTextureRef.current = null;
      }
    };
  }, [gl, invalidate]);

  useEffect(() => {
    return () => {
      brushedMap.dispose();
      whiteHaloMap.dispose();
      groundShadowMap.dispose();
    };
  }, [brushedMap, whiteHaloMap, groundShadowMap]);

  // Outer-band floating particles & subtle stars kept STRICTLY outside r = 2.15
  // so the centered SkillConnect figures and wordmark remain 100% unobstructed.
  const particleSeeds = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const goldenAngle = i * 2.39996323;
      const radius = 2.25 + (i % 6) * 0.22;
      const elevation = Math.sin(i * 1.37) * 1.35;
      const speed = 0.12 + (i % 4) * 0.04;
      const scale = 0.022 + (i % 3) * 0.012;
      const tone = i % 3; // 0: cyan, 1: green, 2: soft pearl-white sparkle
      return { angle: goldenAngle, radius, elevation, speed, scale, tone };
    });
  }, []);

  // Initialize particle colors/positions and reset orientation cleanly on resetSignal
  useEffect(() => {
    const mesh = instancedParticlesRef.current;
    if (mesh) {
      const cyanColor = new THREE.Color('#08C8F0');
      const greenColor = new THREE.Color('#27D879');
      const pearlColor = new THREE.Color('#9EDEF6');

      particleSeeds.forEach((seed, idx) => {
        _scratchObj.position.set(
          Math.cos(seed.angle) * seed.radius,
          seed.elevation,
          Math.sin(seed.angle) * seed.radius
        );
        _scratchObj.scale.setScalar(seed.scale);
        _scratchObj.updateMatrix();
        mesh.setMatrixAt(idx, _scratchObj.matrix);
        mesh.setColorAt(
          idx,
          seed.tone === 0 ? cyanColor : seed.tone === 1 ? greenColor : pearlColor
        );
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }

    spinAngleRef.current = 0;
    clockAccumRef.current = 0;

    if (spinGroupRef.current) {
      spinGroupRef.current.rotation.set(0.06, -0.18, 0);
    }
    if (floatGroupRef.current) {
      floatGroupRef.current.position.set(0, 0.06, 0);
    }
    if (ringOneRef.current) {
      ringOneRef.current.rotation.set(0.86, 0.34, 0);
    }
    if (ringTwoRef.current) {
      ringTwoRef.current.rotation.set(-0.74, -0.46, 0.25);
    }

    invalidate();
  }, [particleSeeds, resetSignal, invalidate]);

  useFrame((state, delta) => {
    if (!animate) return;

    const dt = Math.min(delta, 0.05);
    clockAccumRef.current += dt;
    const t = clockAccumRef.current;

    // Gentle floating levitation (~0.09 unit amplitude)
    if (floatGroupRef.current) {
      const targetY = 0.06 + Math.sin(t * 1.25) * 0.09;
      floatGroupRef.current.position.y = THREE.MathUtils.damp(
        floatGroupRef.current.position.y,
        targetY,
        5,
        dt
      );
    }

    // Slow continuous 360-degree vertical-axis (Y) rotation (~16s per revolution) + smooth mouse parallax
    if (spinGroupRef.current) {
      spinAngleRef.current = (spinAngleRef.current + dt * 0.39) % (Math.PI * 2);

      const parallaxTiltX = 0.06 - state.pointer.y * 0.16;
      const parallaxTiltY = state.pointer.x * 0.22;
      const targetRotY = spinAngleRef.current + parallaxTiltY;

      spinGroupRef.current.rotation.x = THREE.MathUtils.damp(
        spinGroupRef.current.rotation.x,
        parallaxTiltX,
        5,
        dt
      );
      spinGroupRef.current.rotation.y = targetRotY;
    }

    // Glass-like Cyan & Green Orbital Rings
    if (ringOneRef.current) {
      ringOneRef.current.rotation.z += dt * 0.26;
      ringOneRef.current.rotation.x = 0.86 + Math.sin(t * 0.55) * 0.06;
    }
    if (ringTwoRef.current) {
      ringTwoRef.current.rotation.z -= dt * 0.2;
      ringTwoRef.current.rotation.y = -0.46 + Math.cos(t * 0.5) * 0.06;
    }

    // Gentle outer particle & star drift
    const instMesh = instancedParticlesRef.current;
    if (instMesh) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const seed = particleSeeds[i];
        const angle = seed.angle + t * seed.speed;
        _scratchVec.set(
          Math.cos(angle) * seed.radius,
          seed.elevation + Math.sin(t * 1.1 + i) * 0.08,
          Math.sin(angle) * seed.radius
        );
        _scratchObj.position.copy(_scratchVec);
        _scratchObj.scale.setScalar(seed.scale * (0.85 + 0.22 * Math.sin(t * 1.8 + i)));
        _scratchObj.updateMatrix();
        instMesh.setMatrixAt(i, _scratchObj.matrix);
      }
      instMesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Soft Luminous White Aura Backdrop Behind Central Medallion */}
      <mesh position={[0, 0.06, -1.2]}>
        <planeGeometry args={[5.4, 5.4]} />
        <meshBasicMaterial map={whiteHaloMap} transparent opacity={0.95} depthWrite={false} />
      </mesh>

      <group ref={floatGroupRef} position={[0, 0.06, 0]}>
        {/* Main Floating 3D Brand Object (Slow 360° Vertical-Axis Rotation + Mouse Parallax) */}
        <group ref={spinGroupRef} rotation={[0.06, -0.18, 0]}>
          {/* Part 1: Precision Machined Outer Titanium/Navy Chassis */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.38, 1.42, 0.13, 64]} />
            <meshStandardMaterial
              color="#0a203e"
              metalness={0.85}
              roughness={0.26}
              roughnessMap={brushedMap}
              bumpMap={brushedMap}
              bumpScale={0.01}
            />
          </mesh>

          {/* Part 2: Deep Navy Sealing Core Supporting Original Logo Faces */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.28, 1.28, 0.155, 64]} />
            <meshStandardMaterial color="#041024" metalness={0.35} roughness={0.48} />
          </mesh>

          {/* Part 3: Electric Cyan Chamfered Outer Studio Bezel */}
          <mesh position={[0, 0, 0.055]}>
            <torusGeometry args={[1.36, 0.032, 16, 72]} />
            <meshStandardMaterial
              color="#00B4E6"
              emissive="#08C8F0"
              emissiveIntensity={0.28}
              metalness={0.62}
              roughness={0.18}
            />
          </mesh>

          {/* Part 4: SkillConnect Green Rear Chamfered Studio Bezel */}
          <mesh position={[0, 0, -0.055]}>
            <torusGeometry args={[1.36, 0.032, 16, 72]} />
            <meshStandardMaterial
              color="#1BC56D"
              emissive="#27D879"
              emissiveIntensity={0.26}
              metalness={0.62}
              roughness={0.18}
            />
          </mesh>

          {/* Part 5: Front Original SkillConnect Logo Face (Figures + Wordmark) */}
          <mesh position={[0, 0, 0.082]}>
            <circleGeometry args={[1.25, 64]} />
            <meshStandardMaterial
              key={logoTexture ? 'front-logo-ready' : 'front-logo-wait'}
              map={logoTexture}
              color={logoTexture ? '#ffffff' : '#041024'}
              emissive={logoTexture ? '#ffffff' : '#041024'}
              emissiveMap={logoTexture || undefined}
              emissiveIntensity={logoTexture ? 0.24 : 0}
              metalness={0.04}
              roughness={0.32}
            />
          </mesh>

          {/* Part 6: Rear Original SkillConnect Logo Face (Sharp During 360° Spin) */}
          <mesh position={[0, 0, -0.082]} rotation={[0, Math.PI, 0]}>
            <circleGeometry args={[1.25, 64]} />
            <meshStandardMaterial
              key={logoTexture ? 'back-logo-ready' : 'back-logo-wait'}
              map={logoTexture}
              color={logoTexture ? '#ffffff' : '#041024'}
              emissive={logoTexture ? '#ffffff' : '#041024'}
              emissiveMap={logoTexture || undefined}
              emissiveIntensity={logoTexture ? 0.24 : 0}
              metalness={0.04}
              roughness={0.32}
            />
          </mesh>

          {/* Part 7: Subtle Protective Clear Optical Lens Highlight Over Medallion */}
          <mesh position={[0, 0, 0.087]}>
            <ringGeometry args={[1.21, 1.29, 64]} />
            <meshStandardMaterial
              color="#EAF5FF"
              transparent
              opacity={0.45}
              metalness={0.8}
              roughness={0.1}
            />
          </mesh>

          {/* Part 8: Cardinal Cyan/Green Precision Studs Along Rim */}
          {[
            { pos: [1.41, 0, 0] as [number, number, number], color: '#08C8F0' },
            { pos: [-1.41, 0, 0] as [number, number, number], color: '#08C8F0' },
            { pos: [0, 1.41, 0] as [number, number, number], color: '#27D879' },
            { pos: [0, -1.41, 0] as [number, number, number], color: '#27D879' },
          ].map((node, idx) => (
            <mesh key={idx} position={node.pos}>
              <octahedronGeometry args={[0.055, 0]} />
              <meshStandardMaterial
                color={node.color}
                emissive={node.color}
                emissiveIntensity={0.4}
                metalness={0.5}
                roughness={0.2}
              />
            </mesh>
          ))}
        </group>

        {/* Glass-Like Cyan Orbital Ring */}
        <mesh ref={ringOneRef} rotation={[0.86, 0.34, 0]}>
          <torusGeometry args={[1.82, 0.024, 18, 96]} />
          <meshPhysicalMaterial
            color="#00B8EB"
            emissive="#08C8F0"
            emissiveIntensity={0.18}
            metalness={0.15}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.08}
            transmission={isSoftwareRenderer ? 0 : 0.45}
            transparent
            opacity={isSoftwareRenderer ? 0.72 : 0.88}
            ior={1.45}
            thickness={0.4}
          />
        </mesh>

        {/* Glass-Like SkillConnect Green Counter-Tilted Orbital Ring */}
        <mesh ref={ringTwoRef} rotation={[-0.74, -0.46, 0.25]}>
          <torusGeometry args={[2.05, 0.02, 18, 96]} />
          <meshPhysicalMaterial
            color="#18C76A"
            emissive="#27D879"
            emissiveIntensity={0.16}
            metalness={0.15}
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transmission={isSoftwareRenderer ? 0 : 0.45}
            transparent
            opacity={isSoftwareRenderer ? 0.68 : 0.85}
            ior={1.45}
            thickness={0.35}
          />
        </mesh>
      </group>

      {/* Outer Ambient Micro-Particles & Subtle Stars (Clear Center Zone Guaranteed) */}
      <instancedMesh
        ref={instancedParticlesRef}
        args={[undefined, undefined, PARTICLE_COUNT]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          metalness={0.3}
          roughness={0.2}
          emissive="#08C8F0"
          emissiveIntensity={0.22}
        />
      </instancedMesh>

      {/* Subtle White-Space Grounding Reflection & Contact Shadow */}
      <mesh position={[0, -1.96, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.8, 4.8]} />
        <meshBasicMaterial map={groundShadowMap} transparent opacity={0.9} depthWrite={false} />
      </mesh>
    </group>
  );
};

class WebGLErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const HeroLogoStaticFallback: React.FC = () => (
  <div className="w-full h-[310px] sm:h-[360px] rounded-2xl bg-gradient-to-b from-[#FFFFFF] via-[#F2F8FF] to-[#E6F4FE] border border-[#08C8F0]/40 flex flex-col items-center justify-center relative overflow-hidden p-6 shadow-inner">
    <div className="relative p-3 rounded-full bg-[#041024] border-2 border-[#08C8F0]/70 shadow-[0_14px_40px_rgba(8,200,240,0.28)]">
      <img
        src={BRAND_CONFIG.logoPath}
        alt="SkillConnect Official Logo - Two connected figures in cyan and green above the SkillConnect wordmark"
        className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-full"
        width="176"
        height="176"
        loading="eager"
        fetchPriority="high"
        decoding="sync"
        referrerPolicy="no-referrer"
      />
    </div>
    <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-[#071426]/75 text-center">
      SkillConnect Original Brand Emblem
    </p>
  </div>
);

export const Hero3DScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [userPaused, setUserPaused] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(() =>
    typeof document === 'undefined' ? true : !document.hidden
  );
  const [resetSignal, setResetSignal] = useState(0);

  const webglSupported = useMemo(() => checkWebGLSupport(), []);
  const isSoftwareRenderer = useMemo(() => detectSoftwareWebGL(), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const shouldAnimate = !prefersReducedMotion && !userPaused && isInViewport && isTabVisible;

  const handleReset = () => {
    setResetSignal((s) => s + 1);
  };

  if (!webglSupported) {
    return <HeroLogoStaticFallback />;
  }

  return (
    <WebGLErrorBoundary fallback={<HeroLogoStaticFallback />}>
      <div className="space-y-4">
        {/* Pearlescent White 3D Floating Space Frame */}
        <div
          ref={containerRef}
          className="relative w-full h-[300px] sm:h-[340px] rounded-2xl overflow-hidden border border-[#08C8F0]/35 bg-[#F4FAFF] shadow-[inset_0_0_40px_rgba(8,200,240,0.14)]"
          role="region"
          aria-label="Interactive 3D SkillConnect Original Logo Showcase"
        >
          <Canvas
            frameloop={shouldAnimate ? 'always' : 'demand'}
            dpr={isSoftwareRenderer ? 1 : [1, 1.75]}
            camera={{ position: [0, 0.16, 5.15], fov: 40, near: 0.1, far: 40 }}
            gl={{
              antialias: !isSoftwareRenderer,
              powerPreference: 'high-performance',
              alpha: false,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.02,
              outputColorSpace: THREE.SRGBColorSpace,
            }}
          >
            {/* Luminous Pearlescent White 3D Floating Space */}
            <color attach="background" args={['#F4FAFF']} />
            <fog attach="fog" args={['#F4FAFF', 7.5, 16]} />

            <StudioEnvironment />

            {/* Crisp Studio Key, Fill & Brand-Colored Cyan/Green Reflections */}
            <hemisphereLight args={['#FFFFFF', '#D8F1FF', 1.1]} />
            <directionalLight position={[4.5, 5.5, 5.2]} intensity={1.35} color="#FFFFFF" />
            <directionalLight position={[-4.5, 1.5, 3.5]} intensity={0.95} color="#08C8F0" />
            <pointLight position={[3.2, -1.6, 3.0]} intensity={1.6} color="#27D879" distance={10} />
            <pointLight position={[-2.8, 2.0, -2.5]} intensity={1.2} color="#08C8F0" distance={10} />

            <SkillConnectMedallion
              animate={shouldAnimate}
              resetSignal={resetSignal}
              isSoftwareRenderer={isSoftwareRenderer}
            />
          </Canvas>
        </div>

        {/* Exact Brand Statement Lockup + Touch-Friendly Interactive Controls (Zero Backdrop-Blur Over WebGL) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
          <div className="text-center sm:text-left">
            <div className="text-base sm:text-lg font-extrabold tracking-widest text-white">
              SKILLCONNECT
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#08C8F0]">
              Connecting Skills. Creating Opportunities.
            </p>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-2">
            {prefersReducedMotion ? (
              <span className="px-3 py-2 rounded-xl bg-[#071426] border border-[#08C8F0]/30 text-[11px] font-medium text-[#EAF5FF] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#27D879] shrink-0" aria-hidden="true" />
                <span>Reduced Motion</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                aria-label={userPaused ? 'Resume 3D logo animation' : 'Pause 3D logo animation'}
                aria-pressed={userPaused}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#071426] border border-[#08C8F0]/35 hover:border-[#08C8F0] text-[#EAF5FF] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {userPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 text-[#27D879]" aria-hidden="true" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[#08C8F0]" aria-hidden="true" />
                    <span>Pause</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset 3D logo animation angle"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#071426] border border-[#27D879]/35 hover:border-[#27D879] text-[#EAF5FF] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#27D879]" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </WebGLErrorBoundary>
  );
};
