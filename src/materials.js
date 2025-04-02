import * as THREE from 'three';
import {
    RGBELoader
} from 'three/examples/jsm/Addons.js';

const hdrEquirect = new RGBELoader().load(
    '/goegap_4k.hdr',
    function () {
        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
    }
);

export const defaultMaterial = new THREE.MeshPhysicalMaterial({
    metalness: 0,
    roughness: 1,
    transmission: 0,
    specularIntensity: 1,
    specularColor: 0xffffff,
    opacity: 1,
    side: THREE.DoubleSide,
    transparent: false,
    vertexColors: false
});

export const goldMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xeec325,
    metalness: 1,
    roughness: 0.2,
    ior: 0.47,
    envMap: hdrEquirect,
    envMapIntensity: 1,
    transmission: 0,
    specularIntensity: 1,
    specularColor: 0xffffff,
    opacity: 1,
    side: THREE.CullFaceFront,
    transparent: false
});

export const metalAccents = new THREE.MeshPhysicalMaterial({
    color: 0xeeeeee,
    metalness: 1,
    roughness: 0.5,
    ior: 2.95,
    envMap: hdrEquirect,
    envMapIntensity: 1,
    transmission: 0,
    specularIntensity: 1,
    specularColor: 0xffffff,
    opacity: 1,
    side: THREE.CullFaceFront,
    transparent: false
});

export const vertexColorMaterial = new THREE.MeshPhysicalMaterial({
    roughness: 1,
    metalness: 0,
    specularIntensity: 1,
    specularColor: 0xffffff,
    opacity: 1,
    side: THREE.CullFaceFront,
    vertexColors: true
});

export const scleraMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.02,
    ior: 1.41,
    envMap: hdrEquirect,
    envMapIntensity: 1,
    transmission: 1,
    specularIntensity: 1,
    specularColor: 0xffffff,
    opacity: 1,
    side: THREE.CullFaceFront,
    transparent: true
});

export const glassesGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x87ECA6,
    metalness: 0,
    roughness: 0.1,
    ior: 1.45,
    envMap: hdrEquirect,
    envMapIntensity: 1,
    transmission: 1,
    specularIntensity: 1,
    specularColor: 0xffffff,
    opacity: 1,
    side: THREE.CullFaceFront,
    transparent: true
});

export const gizmoMaterial = new THREE.MeshMatcapMaterial({
    color: 0xffffff,
    clipShadows: false,
    clipIntersection: false,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    opacity: 0.75
});