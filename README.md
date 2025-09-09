The source code doesn't contain a model file and `characterConfig.json` configuration file and any file from the `/public/` asset folder.

I am building the app using [Vite](https://vite.dev/) although it can be built using other methods.
I'm currently compiling this app for Android using [Capacitor.js](https://capacitorjs.com/).

Below is the breakdown of the `charaterConfig.json` structure. Most elements are optional, the app sends warnings when it fails reading some settings to help debugging.
```
{
    "filePath": "/file.glb",
    "matApplication": {
        "diffuseMaterial": [
            "MeshName",
            ...
        ],
        "otherMaterial": [...],
        ...
    },
    "skinnedMeshNames": [
        "MeshName",
        ...
    ],
    "boneCtrlExclusions": [
        "IK",
        "Control",
        "PT",
        ...
    ],
    "hiddenMeshes": [
        "MeshName",
        ...
    ],
    "defaultPose": "Pose or Animation name",
    "morphMeshList": [
        "MeshName",
        ...
    ],
    "breatheKey": "Inhale",
    "blinkKeys": [
        "Blink.L",
        "Blink.R"
    ],
    "poseExtraSettings": {
        "morphClearDefault": [
            "MorphTargetName",
            ...
        ],
        "Targetted animation or pose name for extra settings": {
            "morphs": {
                "MorphTargetToForceStaticValueOf": 0,
                ...
            },
            "dynamicMorphsOverride": [
                "breatheKey",
                "blinkKeys"
            ],
            "meshes": {
                "MeshNameToToggle": true,
                "OtherMeshNameToToggle": false,
                ...
            }
        },
        ...
    },
    "IK": {
        "armL": {"target": "ArmIKL", "chain": ["HandL", "ForearmL", "ArmL"]},
        "armR": {"target": "ArmIKR", "chain": ["HandR", "ForearmR", "ArmR"]},
        "legL": {"target": "LegIKL", "chain": ["ToesL", "FootL", "LowerLegL", "UpperLegL"]},
        "legR": {"target": "LegIKR", "chain": ["ToesR", "FootR", "LowerLegR", "UpperLegR"]},
        ...
    }
}
```
