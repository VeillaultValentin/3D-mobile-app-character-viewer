import * as THREE from 'three';

export function enableDQS(skinnedMeshList) {
    skinnedMeshList.forEach((mesh) => {
        if (mesh.userData.ready) return;

        console.log("enabling DQS on: " + mesh.name);

        const maxBones = mesh.skeleton.bones.length;
        const aq0 = new Float32Array(4 * maxBones);
        const aq1 = new Float32Array(4 * maxBones);
        const aqScale = new Float32Array(3 * maxBones);

        mesh.material.onBeforeCompile = (shader) => {
            shader.uniforms.aq0 = {
                value: aq0
            };
            shader.uniforms.aq1 = {
                value: aq1
            };
            shader.uniforms.aqScale = {
                value: aqScale
            };

            shader.vertexShader = shader.vertexShader
                .replace(
                    `#include <common>`,
                    `#include <common>
                    uniform vec4 aq0[${maxBones}];
                    uniform vec4 aq1[${maxBones}];
                    uniform vec3 aqScale[${maxBones}];`
                )
                .replace(
                    '#include <skinning_vertex>',
                    `
                    vec4 dq0[4], dq1[4];
                    dq0[0] = aq0[int(skinIndex.x)];
                    dq1[0] = aq1[int(skinIndex.x)];
                    dq0[1] = aq0[int(skinIndex.y)];
                    dq1[1] = aq1[int(skinIndex.y)];
                    dq0[2] = aq0[int(skinIndex.z)];
                    dq1[2] = aq1[int(skinIndex.z)];
                    dq0[3] = aq0[int(skinIndex.w)];
                    dq1[3] = aq1[int(skinIndex.w)];

                    for (int i = 1; i < 4; ++i) {
                    if (dot(dq0[0], dq0[i]) < 0.0) {
                        dq0[i] *= -1.0;
                        dq1[i] *= -1.0;
                    }
                    }

                    vec4 blend_q0 = dq0[0]*skinWeight.x + dq0[1]*skinWeight.y + dq0[2]*skinWeight.z + dq0[3]*skinWeight.w;
                    vec4 blend_q1 = dq1[0]*skinWeight.x + dq1[1]*skinWeight.y + dq1[2]*skinWeight.z + dq1[3]*skinWeight.w;

                    mat4 skinMat = DQToMatrix(blend_q0, blend_q1);

                    vec3 blendedScale =
                    aqScale[int(skinIndex.x)] * skinWeight.x +
                    aqScale[int(skinIndex.y)] * skinWeight.y +
                    aqScale[int(skinIndex.z)] * skinWeight.z +
                    aqScale[int(skinIndex.w)] * skinWeight.w;

                    vec3 pos = (skinMat * vec4(transformed, 1.0)).xyz;
                    transformed = blendedScale * pos;

                    vec3 norm = (skinMat * vec4(objectNormal, 0.0)).xyz;
                    objectNormal = normalize(norm / blendedScale);
                `
                )
                .replace(
                    'void main() {',
                    `
                    mat4 DQToMatrix(vec4 Qn, vec4 Qd) {
                        mat4 M = mat4(0.0);
                        float len2 = dot(Qn, Qn);
                        float w = Qn.w, x = Qn.x, y = Qn.y, z = Qn.z;
                        float t0 = Qd.w, t1 = Qd.x, t2 = Qd.y, t3 = Qd.z;

                        M[0][0] = w*w + x*x - y*y - z*z;
                        M[1][0] = 2.0*x*y - 2.0*w*z;
                        M[2][0] = 2.0*x*z + 2.0*w*y;
                        M[0][1] = 2.0*x*y + 2.0*w*z;
                        M[1][1] = w*w + y*y - x*x - z*z;
                        M[2][1] = 2.0*y*z - 2.0*w*x;
                        M[0][2] = 2.0*x*z - 2.0*w*y;
                        M[1][2] = 2.0*y*z + 2.0*w*x;
                        M[2][2] = w*w + z*z - x*x - y*y;

                        M[3][0] = -2.0*t0*x + 2.0*w*t1 - 2.0*t2*z + 2.0*y*t3;
                        M[3][1] = -2.0*t0*y + 2.0*t1*z - 2.0*x*t3 + 2.0*w*t2;
                        M[3][2] = -2.0*t0*z + 2.0*x*t2 + 2.0*w*t3 - 2.0*t1*y;

                        M /= len2;
                        M[3][3] = 1.0;

                        return M;
                    }

                    void main() {
                    `
                );
        };

        mesh.userData.dqsUniforms = {
            aq0: aq0,
            aq1: aq1,
            aqScale: aqScale
        };
        mesh.userData.ready = true;

        mesh.material.skinning = false;
        mesh.material.morphTargets = true;
        mesh.material.needsUpdate = true;
    });
}
export function updateDQS(skinnedMeshList) {
    skinnedMeshList.forEach((mesh) => {
        if (!mesh.userData.ready) return;
        for (let i = 0; i < mesh.skeleton.bones.length; i++) {
            const bone = mesh.skeleton.bones[i];

            const boneMatrix = new THREE.Matrix4().multiplyMatrices(
                bone.matrixWorld,
                mesh.skeleton.boneInverses[i]
            );

            const t = new THREE.Vector3();
            const q = new THREE.Quaternion();
            const s = new THREE.Vector3();

            boneMatrix.decompose(t, q, s);

            const tQuat = new THREE.Quaternion(t.x, t.y, t.z, 0);
            const d = tQuat.clone().multiply(q);
            d.x *= 0.5;
            d.y *= 0.5;
            d.z *= 0.5;
            d.w *= 0.5;

            mesh.userData.dqsUniforms.aq0.set([q.x, q.y, q.z, q.w], i * 4);
            mesh.userData.dqsUniforms.aq1.set([d.x, d.y, d.z, d.w], i * 4);
            mesh.userData.dqsUniforms.aqScale.set([s.x, s.y, s.z], i * 3);
        }
    });
}