import * as THREE from 'three/webgpu';
import { texture, attribute, vec2, uv, normalMap, pmremTexture, mx_noise_float, positionGeometry, mix, color } from 'three/tsl';
import {
    HDRLoader
} from 'three/examples/jsm/Addons.js';

const HDR_EQUIRECT = new HDRLoader().load(
    '/goegap_4k.hdr',
    function () {
        HDR_EQUIRECT.mapping = THREE.EquirectangularReflectionMapping;
    }
);

//toggle for all materials using hdri
const hdri = true;

export const defaultMaterial = new THREE.MeshPhysicalMaterial({
    metalness: 0,
    roughness: 1,
    transmission: 0,
    specularIntensity: 1,
    specularColor: 0xffffff,
    opacity: 1,
    side: THREE.DoubleSide,
    transparent: false,
    vertexColors: false,

    name: 'defaultMaterial(Custom)'
});

export const goldMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xeec325,
    metalness: 1,
    roughness: 0.2,
    ior: 0.47,
    envMap: hdri ? HDR_EQUIRECT : null,
    envMapIntensity: hdri ? 1 : 0,
    transmission: 0,
    specularIntensity: 1,
    specularColor: 0xffffff,
    opacity: 1,
    side: THREE.CullFaceFront,
    transparent: false,

    name: 'goldMaterial(Custom)'
});

export const metalAccents = new THREE.MeshPhysicalMaterial({
    color: 0xeeeeee,
    metalness: 1,
    roughness: 0.7,
    ior: 2.95,
    envMap: hdri ? HDR_EQUIRECT : null,
    envMapIntensity: hdri ? 1 : 0,
    transmission: 0,
    specularIntensity: 1,
    specularColor: 0xffffff,
    opacity: 1,
    side: THREE.CullFaceFront,
    transparent: false,

    name: 'metalAccents(Custom)'
});

export const vertexColorMaterial = new THREE.MeshPhysicalMaterial({
    roughness: 1,
    metalness: 0,
    specularIntensity: 1,
    specularColor: 0xffffff,
    opacity: 1,
    side: THREE.CullFaceFront,
    vertexColors: true,

    name: 'vertexColorMaterial(Custom)'
});

export const scleraMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.02,
    ior: 1.41,
    envMap: hdri ? HDR_EQUIRECT : null,
    envMapIntensity: hdri ? 1 : 0,
    //transmission: 1,
    specularIntensity: 1,
    specularColor: 0xffffff,
    opacity: 0.05,
    side: THREE.CullFaceFront,
    transparent: true,

    name: 'scleraMaterial(Custom)'
});

export const greenGlass = new THREE.MeshPhysicalMaterial({
    color: 0x87ECA6,
    metalness: 0,
    roughness: 0.25,
    ior: 1.45,
    envMap: hdri ? HDR_EQUIRECT : null,
    envMapIntensity: hdri ? 1 : 0,
    transmission: 1,
    specularIntensity: 1,
    specularColor: 0xffffff,
    opacity: 1,
    side: THREE.CullFaceFront,
    transparent: false,

    name: 'greenGlassMaterial(Custom)'
});

export const gizmoMaterial = new THREE.MeshMatcapMaterial({
    color: 0xffffff,
    clipShadows: false,
    clipIntersection: false,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    opacity: 0.75,

    name: 'gizmoMaterial(Custom)'
});

export const plasticToy = new THREE.MeshPhysicalNodeMaterial({
    colorNode: mix(color(0xff6565), color(0xff8888), mx_noise_float(positionGeometry.mul(100))),
    roughnessNode: 0.35
});

export function convertMaterialToNodes(material) {
    if (material instanceof THREE.NodeMaterial) return material;

    let newNodeMaterial;
    switch (material.type) {
        case 'MeshStandardMaterial':
            newNodeMaterial = new THREE.MeshStandardNodeMaterial();
            break;
        case 'MeshPhysicalMaterial':
            newNodeMaterial = new THREE.MeshPhysicalNodeMaterial();
            newNodeMaterial.ior = material.ior;
            if (material.transmission) {
                newNodeMaterial.transmissionNode = material.transmission;
                newNodeMaterial.thicknessNode = material.thickness;
            }
            break;
        default:
            newNodeMaterial = new THREE.NodeMaterial();
            break;
    }
    if (material.map) {
        newNodeMaterial.colorNode = texture(material.map, uv(material.map.channel));
    } else {
        if (material.vertexColors) {
            newNodeMaterial.colorNode = attribute('color');
        } else {
            newNodeMaterial.color = material.color;
        }
    }
    if (material.normalMap) newNodeMaterial.normalNode = normalMap(texture(material.normalMap, uv(material.normalMap.channel).mul(material.normalMap.repeat)), vec2(material.normalScale));
    
    if (material.roughnessMap) newNodeMaterial.roughnessNode = texture(material.roughnessMap, uv(material.roughnessMap.channel).mul(material.roughnessMap.repeat)).mul(material.roughness);
    else newNodeMaterial.roughnessNode = material.roughness;
    
    if (material.envMap) newNodeMaterial.envNode = pmremTexture(material.envMap).mul(material.envMapIntensity);
    else newNodeMaterial.envNode = pmremTexture(HDR_EQUIRECT).mul(0.15);

    if (material.emissiveMap) newNodeMaterial.emissiveNode = texture(material.emissiveMap).mul(material.emissiveIntensity);

    newNodeMaterial.metalness = material.metalness;
    newNodeMaterial.specularNode = material.specular;
    newNodeMaterial.opacity = material.opacity;
    newNodeMaterial.transparent = material.transparent;
    newNodeMaterial.side = material.side;
    newNodeMaterial.name = material.name + '(Node)';

    material.dispose();

    return newNodeMaterial;
};