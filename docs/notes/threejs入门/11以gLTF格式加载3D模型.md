# 以 gLTF 格式加载 3D 模型

> 此笔记记录于[DISCOVER three.js](https://discoverthreejs.com/)，大多数为其中的摘要，少数为笔者自己的理解
## 基本介绍

在过去三十年左右的时间里， 人们在创建标准 3D**资源交换格式**方面进行了许多尝试。直到最近， [FBX](https://threejs.org/examples/webgl_loader_fbx.html)、 [OBJ (Wavefront)](https://threejs.org/examples/#webgl_loader_obj_mtl)和 [DAE (Collada)](https://threejs.org/examples/?q=collada#webgl_loader_collada_skinning)格式仍然是其中最受欢迎的格式，尽管它们都存在阻碍其广泛采用的问题。比如 OBJ 不支持动画，FBX 是属于 Autodesk 的封闭格式，Collada 规范过于复杂，导致大文件难以加载。

然而，最近，一个名为**glTF**的新成员已成为在网络上交换 3D 资源的事实上的标准格式。 [glTF](https://www.khronos.org/gltf/)（**GL 传输格式**），有时被称为 _3D 中的 JPEG_，由 [Kronos Group](https://www.khronos.org/)创建，他们负责 WebGL、OpenGL 和一大堆其他图形 API。glTF 最初于 2017 年发布，现在是在网络和许多其他领域交换 3D 资源的最佳格式。**在本书中，我们将始终使用 glTF，如果可能，您也应该这样做**。它专为在网络上共享模型而设计，因此文件大小尽可能小，并且您的模型将快速加载。

但是，由于 glTF 相对较新，您最喜欢的应用程序可能还没有导出器。在这种情况下，您可以在使用模型之前将它们转换为 glTF，或者使用其他加载器，例如`FBXLoaderor`或者`OBJLoader`。所有 three.js 加载器的工作方式相同，因此如果您确实需要使用另一个加载器，本章中的所有内容仍然适用，只有细微差别。

glTF 文件以标准和二进制形式出现。这些有不同的扩展名：

- **标准 _.gltf_ 文件未压缩，可能附带一个额外的 _.bin_ 数据文件。**
- **二进制 _.glb_ 文件将所有数据包含在一个文件中。**

标准和二进制 glTF 文件都可能包含嵌入在文件中的纹理或可能引用外部纹理。由于二进制 _**.glb**_ 文件要小得多，因此最好使用这种类型。另一方面，未压缩的 _**.gltf**_ 在文本编辑器中很容易阅读，因此它们可能对调试有用。

> [three.js 存储库中有许多免费的 glTF 模型](https://github.com/mrdoob/three.js/tree/master/examples/models/gltf)

## 目录

![](https://oss.justin3go.com/blogs/Pasted%20image%2020231218154541.png)

## birds.js

```js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { setupModel } from './setupModel.js';

async function loadBirds() {
  const loader = new GLTFLoader();

  const [parrotData, flamingoData, storkData] = await Promise.all([
    loader.loadAsync('/assets/models/Parrot.glb'),
    loader.loadAsync('/assets/models/Flamingo.glb'),
    loader.loadAsync('/assets/models/Stork.glb'),
  ]);

  console.log('Squaaawk!', parrotData);

  const parrot = setupModel(parrotData);
  parrot.position.set(0, 0, 2.5);

  const flamingo = setupModel(flamingoData);
  flamingo.position.set(7.5, 0, -10);

  const stork = setupModel(storkData);
  stork.position.set(0, -2.5, -10);

  return {
    parrot,
    flamingo,
    stork,
  };
}

export { loadBirds };

```

## setupModel.js

```js
function setupModel(data) {
  const model = data.scene.children[0];

  return model;
}

export { setupModel };
```

## World.js

```js
import { loadBirds } from './components/birds/birds.js'; // [!code ++]
import { createCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { createScene } from './components/scene.js';

import { createControls } from './systems/controls.js';
import { createRenderer } from './systems/renderer.js';
import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';

let camera;
let controls;
let renderer;
let scene;
let loop;

class World {
  constructor(container) {
    camera = createCamera();
    renderer = createRenderer();
    scene = createScene();
    loop = new Loop(camera, scene, renderer);
    container.append(renderer.domElement);
    controls = createControls(camera, renderer.domElement);

    const { ambientLight, mainLight } = createLights();

    loop.updatables.push(controls);
    scene.add(ambientLight, mainLight);

    const resizer = new Resizer(container, camera, renderer);
  }

  async init() { // [!code ++]
    const { parrot, flamingo, stork } = await loadBirds(); // [!code ++]
    // [!code ++]
    // move the target to the center of the front bird // [!code ++]
    controls.target.copy(parrot.position); // [!code ++]
    // [!code ++]
    scene.add(parrot, flamingo, stork); // [!code ++]
  } // [!code ++]

  render() {
    renderer.render(scene, camera);
  }

  start() {
    loop.start();
  }

  stop() {
    loop.stop();
  }
}

export { World };
```

## GLTFLoader 返回的数据

```json
{
animations: [AnimationClip]
asset: {generator: "Khronos Blender glTF 2.0 I/O", version: "2.0"}
cameras: []
parser: GLTFParser {json: {…}, extensions: {…}, options: {…}, cache: {…}, primitiveCache: {…}, …}
scene: Scene {uuid: "1CF93318-696B-4411-B672-4C12C46DF7E1", name: "Scene", type: "Scene", parent: null, children: Array(0), …}
scenes: [Scene]
userData: {}
**proto**: Object
}
```

- **`gltfData.animations`** 是一个动画剪辑数组。在这里，有一个飞行动画。我们将在 [下一章中](https://discoverthreejs.com/zh/book/first-steps/animation-system/ "下一章中")使用它。
- **`gltfData.assets`** 包含显示此 glTF 文件的元数据 — 使用 [Blender](https://www.blender.org/)导出器创建。
- **`gltfData.cameras`** 是一组相机。该文件不包含任何摄像机，因此数组为空。
- **`gltfData.parser`** 包含关于`GLTFLoader`的技术细节。
- **`gltfData.scene`** 是一个包含文件中的任何网格的 [`Group`](https://discoverthreejs.com/zh/book/first-steps/organizing-with-group/#hello-group "`Group`")。**这是我们将找到鹦鹉模型的地方。**
- **`gltfData.scenes`**: glTF 格式支持将多个场景存储在一个文件中。在实践中，很少使用此功能。
- **`gltfData.userData`** 可能包含额外的非标准数据。

_ `__proto__`是每个 JavaScript 对象都有的标准属性，你可以忽略它。_

通常，您只需要**`.animations`**、**`.cameras`**和**`.scene`**（而不是`.scenes`！），您可以放心地忽略其他所有内容。

