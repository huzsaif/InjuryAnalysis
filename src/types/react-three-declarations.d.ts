import * as THREE from 'three';
import { Object3DNode, LightNode, BufferGeometryNode, MaterialNode } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: Object3DNode<THREE.Group, typeof THREE.Group>;
      mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
      ambientLight: LightNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
      pointLight: LightNode<THREE.PointLight, typeof THREE.PointLight>;
      spotLight: LightNode<THREE.SpotLight, typeof THREE.SpotLight>;
      directionalLight: LightNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>;
      hemisphereLight: LightNode<THREE.HemisphereLight, typeof THREE.HemisphereLight>;
      rectAreaLight: LightNode<THREE.RectAreaLight, typeof THREE.RectAreaLight>;
      boxGeometry: BufferGeometryNode<THREE.BoxGeometry, typeof THREE.BoxGeometry>;
      sphereGeometry: BufferGeometryNode<THREE.SphereGeometry, typeof THREE.SphereGeometry>;
      planeGeometry: BufferGeometryNode<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>;
      meshStandardMaterial: MaterialNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>;
      meshBasicMaterial: MaterialNode<THREE.MeshBasicMaterial, typeof THREE.MeshBasicMaterial>;
      primitive: Object3DNode<THREE.Object3D, typeof THREE.Object3D>;
      orbitControls: Object3DNode<OrbitControls, typeof OrbitControls>;
    }
  }
}

declare module '*.gltf' {
  const content: string;
  export default content;
}

declare module '*.glb' {
  const content: string;
  export default content;
}

// Extend ThreeElements interface
declare module '@react-three/fiber' {
  interface ThreeElements {
    orbitControls: Object3DNode<OrbitControls, typeof OrbitControls>;
  }
}

export {}; 