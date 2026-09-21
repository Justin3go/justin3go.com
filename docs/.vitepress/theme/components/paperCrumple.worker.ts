import { createCrumpleMesh, createPaperPath } from './paperCrumplePath'

// The constraint solver runs once, off the main thread. All scroll frames then
// interpolate the same path, including when the user reverses direction.
const { original, uvs, indices } = createCrumpleMesh()
const samples = createPaperPath(original, indices, 1, 6, .6, .65, 7)
self.postMessage({ uvs, indices, samples }, [uvs.buffer, ...samples.map(frame => frame.buffer)])
