/// <reference lib="webworker" />

import * as tf from '@tensorflow/tfjs';

let model: tf.GraphModel | undefined;


async function loadModel() {
  model = await tf.loadGraphModel('assets/model.json');
  postMessage({type:"loadSuccess"})
}

async function predict(img: any) {
  try{
    if (!model) return false
    const imgModel = tf.tidy(() => {
      const imgTensor = tf.tensor(img.values,[640,640,3]) as tf.Tensor3D
      return imgTensor.expandDims().toFloat().div(tf.scalar(255))
    })
    const prediction =  model.predict(imgModel) as tf.Tensor[]
    imgModel.dispose()
    const box = await getBestBoxes(prediction[0])
    prediction.forEach(x => x.dispose())
    postMessage({type:"predictionSuccess", data:box})
    return true
  }catch{
    postMessage({type:"predictionError"})
    return false
  }
}

async function getBestBoxes(predictionTensor: tf.Tensor): Promise<number[][]> {
  return tf.tidy(() => {
    const classPrediction = predictionTensor.squeeze([0]) //shape(68,8400)
    const boxes = classPrediction.slice([0, 0], [4, -1]) as tf.Tensor2D //4,8400

    let predictions: tf.Tensor2D | null = null

    for (let i of Array(32).keys()) {
      const scores = classPrediction.slice([4 + i, 0], [1, -1]).squeeze([0]) as tf.Tensor1D
      const max_index = scores.argMax().arraySync() as number
      const max_value = scores.bufferSync().get(max_index)

      if (max_value > 0.5) {
        const max_box = boxes.slice([0, max_index], [-1, 1]) as tf.Tensor2D // 4,1
        const max_box_index = max_box.concat([tf.tensor2d([i], [1, 1])], 0)// 1,5
        if (predictions !== null) {
          predictions = predictions.concat([max_box_index], 1) // +1,5
        }
        else {
          predictions = max_box_index
        }
      }
    }
    if (predictions != undefined) {
      const predictionsT = predictions.transpose() as tf.Tensor2D
      return predictionsT.arraySync()
    }
    return [[]]
  })
}

addEventListener('message', ({ data }) => {
  if (data.type === "loadModel") {
    loadModel()
  }

  if (data.type == "predict") {
    if (data.data){
      if (!predict(data.data)){
        console.log("model not loaded")
      }
    }
  }
});
