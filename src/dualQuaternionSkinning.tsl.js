import * as THREE from 'three/webgpu';
import {
    positionLocal,
    int,
    attribute,
    Loop,
    If,
    dot,
    vec4,
    mat4,
    mul,
    uniformArray,
    Fn,
    cameraProjectionMatrix,
    modelViewMatrix,
    array,
    reciprocal,
    normalize,
    vec3,
    varying,
    transformNormalToView,
    positionWorld
} from 'three/tsl';

const SKINNED_MESH_LIST = [];

export function enableDQS(skinnedMesh, log) {
    if (skinnedMesh.material.type.split('Node').length == 1) {
        console.error("Please use Node materials on your Dual quaternion skinned mesh: " + skinnedMesh.name, skinnedMesh.material.name)
        return;
    };
    if (log) console.log("Enabling Dual quaternion skinning on: " + skinnedMesh.name, skinnedMesh.material.name);

    const u_aq0 = uniformArray([], 'vec4');
    const u_aq1 = uniformArray([], 'vec4');
    const u_aqScale = uniformArray([], 'vec3');

    const transformedNormals = varying(vec3());

    const dqsShader = Fn(() => {
        const dq0 = array([vec4(), vec4(), vec4(), vec4()]);
        const dq1 = array([vec4(), vec4(), vec4(), vec4()]);

        const skinIndex = attribute('skinIndex');
        const skinWeight = attribute('skinWeight');

        //dq[i] -> i = bone ; each vert is affected by 4 bones
        dq0.element(0).assign(u_aq0.element(int(skinIndex.x)));
        dq1.element(0).assign(u_aq1.element(int(skinIndex.x)));
        dq0.element(1).assign(u_aq0.element(int(skinIndex.y)));
        dq1.element(1).assign(u_aq1.element(int(skinIndex.y)));
        dq0.element(2).assign(u_aq0.element(int(skinIndex.z)));
        dq1.element(2).assign(u_aq1.element(int(skinIndex.z)));
        dq0.element(3).assign(u_aq0.element(int(skinIndex.w)));
        dq1.element(3).assign(u_aq1.element(int(skinIndex.w)));

        Loop({
            start: 1,
            end: 4
        }, ({
            i
        }) => {
            If(dot(dq0.element(0), dq0.element(i)).lessThan(0.0), () => {
                dq0.element(i).mulAssign(-1.0);
                dq1.element(i).mulAssign(-1.0);
            });
        });

        const blend_q0 = vec4().toVar();
        const blend_q1 = vec4().toVar();

        blend_q0.assign(
            dq0.element(0).mul(skinWeight.x)
            .add(dq0.element(1).mul(skinWeight.y))
            .add(dq0.element(2).mul(skinWeight.z))
            .add(dq0.element(3).mul(skinWeight.w))
        );

        blend_q1.assign(
            dq1.element(0).mul(skinWeight.x)
            .add(dq1.element(1).mul(skinWeight.y))
            .add(dq1.element(2).mul(skinWeight.z))
            .add(dq1.element(3).mul(skinWeight.w))
        );

        const skinMat = DQToMatrix(blend_q0, blend_q1);
        const blendedScale = computeBlendedScale(skinIndex, skinWeight);

        const posScaled = positionLocal.mul(blendedScale);
        const skinned = skinMat.mul(vec4(posScaled, 1.0)).xyz;

        //transmission shader and such base their computation on world position, it needs to be updated
        positionWorld.assign(skinMat.mul(vec4(positionWorld.mul(blendedScale), 1.0)).xyz);

        const normals = skinMat.mul(vec4(attribute('normal'), 0.0)).xyz;
        transformedNormals.assign(transformNormalToView(normalize(normals)));

        return cameraProjectionMatrix.mul(modelViewMatrix).mul(skinned);
    });

    const DQToMatrix = Fn(([Qn, Qd]) => {
        const M = mat4().toVar();
        const len2 = dot(Qn, Qn);
        const w = Qn.w,
            x = Qn.x,
            y = Qn.y,
            z = Qn.z;
        const t0 = Qd.w,
            t1 = Qd.x,
            t2 = Qd.y,
            t3 = Qd.z;

        M.element(0).element(0).assign(
            w.mul(w)
            .add(x.mul(x)
                .sub(y.mul(y))
                .sub(z.mul(z)))
        );
        M.element(1).element(0).assign(
            mul(2.0, x)
            .mul(y)
            .sub(mul(2.0, w)
                .mul(z))
        );
        M.element(2).element(0).assign(
            mul(2.0, x)
            .mul(z)
            .add(mul(2.0, w).mul(y))
        );
        M.element(0).element(1).assign(
            mul(2.0, x)
            .mul(y)
            .add(mul(2.0, w)
                .mul(z))
        );
        M.element(1).element(1).assign(
            w.mul(w)
            .add(y.mul(y)
                .sub(x.mul(x))
                .sub(z.mul(z)))
        );
        M.element(2).element(1).assign(
            mul(2.0, y)
            .mul(z)
            .sub(mul(2.0, w)
                .mul(x))
        );
        M.element(0).element(2).assign(
            mul(2.0, x)
            .mul(z)
            .sub(mul(2.0, w)
                .mul(y))
        );
        M.element(1).element(2).assign(
            mul(2.0, y)
            .mul(z)
            .add(mul(2.0, w)
                .mul(x))
        );
        M.element(2).element(2).assign(
            w.mul(w)
            .add(z.mul(z)
                .sub(x.mul(x))
                .sub(y.mul(y)))
        );

        M.element(3).element(0).assign(
            mul(-2.0, t0)
            .mul(x)
            .add(mul(2.0, w)
                .mul(t1)
                .sub(mul(2.0, t2)
                    .mul(z)))
            .add(mul(2.0, y).mul(t3))
        );
        M.element(3).element(1).assign(
            mul(-2.0, t0)
            .mul(y)
            .add(mul(2.0, t1)
                .mul(z)
                .sub(mul(2.0, x)
                    .mul(t3))).add(mul(2.0, w).mul(t2))
        );
        M.element(3).element(2).assign(
            mul(-2.0, t0)
            .mul(z)
            .add(mul(2.0, x)
                .mul(t2))
            .add(mul(2.0, w)
                .mul(t3).sub(mul(2.0, t1).mul(y)))
        );

        M.mulAssign(reciprocal(len2));
        M.element(3).element(3).assign(1.0);

        return M;
    });

    const computeBlendedScale = Fn(([index, weight]) => {
        return u_aqScale.element(int(index.x)).mul(weight.x)
            .add(u_aqScale.element(int(index.y)).mul(weight.y))
            .add(u_aqScale.element(int(index.z)).mul(weight.z))
            .add(u_aqScale.element(int(index.w)).mul(weight.w));
    });

    //DQS shader
    skinnedMesh.material.vertexNode = dqsShader();
    //apply transformed normals
    if (skinnedMesh.material.normalNode) normalize(transformedNormals.mul(skinnedMesh.material.normalNode));
    else skinnedMesh.material.normalNode = transformedNormals;

    //hack with isSkinnedMesh boolean to disable default skinning ; material.skinning = false is not supported with nodeMaterials
    skinnedMesh.isSkinnedMesh = false;

    skinnedMesh.frustumCulled = false;

    skinnedMesh.userData.dqsUniforms = {
        aq0: u_aq0,
        aq1: u_aq1,
        aqScale: u_aqScale
    };
    skinnedMesh.userData.ready = true;

    SKINNED_MESH_LIST.push(skinnedMesh);
}

export function updateDQS() {
    SKINNED_MESH_LIST.forEach((mesh) => {
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

            mesh.userData.dqsUniforms.aq0.array[i] = new THREE.Vector4(q.x, q.y, q.z, q.w);
            mesh.userData.dqsUniforms.aq1.array[i] = new THREE.Vector4(d.x, d.y, d.z, d.w);
            mesh.userData.dqsUniforms.aqScale.array[i] = new THREE.Vector3(s.x, s.y, s.z); //internally still aligns as vec4 and w = 0
        }
    });
}