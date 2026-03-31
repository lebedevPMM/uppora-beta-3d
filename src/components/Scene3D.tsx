import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Scene3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Fog
    scene.fog = new THREE.FogExp2(0x050505, 0.025);

    // Teal color
    const TEAL = 0x3D9B7A;
    const GOLD = 0xE8B44C;

    // Path curve
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(5, -1, -20),
      new THREE.Vector3(-10, -1, -50),
      new THREE.Vector3(10, -1, -100),
      new THREE.Vector3(0, -1, -150),
      new THREE.Vector3(-5, -1, -200),
      new THREE.Vector3(0, -1, -300),
    ]);

    // Path line
    const points = curve.getPoints(200);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.6 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);

    // Markers + lights
    const markerGeo = new THREE.SphereGeometry(0.4, 16, 16);
    for (let i = 1; i < 7; i++) {
      const color = i % 2 === 0 ? GOLD : TEAL;
      const markerMat = new THREE.MeshBasicMaterial({ color });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      const pos = curve.getPointAt(i / 7);
      marker.position.copy(pos);
      scene.add(marker);

      const light = new THREE.PointLight(color, 1.5, 25);
      light.position.copy(pos);
      scene.add(light);
    }

    // Floating particles
    const particleCount = 300;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = Math.random() * -300;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: TEAL,
      size: 0.15,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight.position.set(0, 10, 0);
    scene.add(dirLight);

    camera.position.set(0, 2, 5);

    // Scroll tracking
    let scrollT = 0;
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollT = Math.min(window.scrollY / maxScroll, 1) * 0.95;

      // Update progress bar
      const fill = document.getElementById('p-fill');
      if (fill) fill.style.height = `${(scrollT / 0.95) * 100}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Animate
    let animId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Camera follows path
      const safeT = Math.max(0.001, Math.min(scrollT, 0.94));
      const pos = curve.getPointAt(safeT);
      const lookAtPos = curve.getPointAt(Math.min(safeT + 0.04, 1));
      camera.position.set(pos.x, pos.y + 2.5, pos.z);
      camera.lookAt(lookAtPos.x, lookAtPos.y + 1, lookAtPos.z);

      // Gentle particle movement
      const posArr = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 1] += Math.sin(t + i) * 0.002;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div id="canvas-container" ref={containerRef} />;
}
