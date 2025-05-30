/// <reference lib="webworker" />

import {GraphModel, loadGraphModel, tensor, Tensor3D, Tensor,tidy,Tensor1D,Tensor2D,scalar,tensor2d} from '@tensorflow/tfjs';

let model: GraphModel;

async function loadModel() {
  try {
    model = await loadGraphModel('lazy/model.json');
    postMessage({ type: 'loadSuccess' });
  } catch (error: any) {
    postMessage({ type: 'loadError', error: error?.message || 'Model load failed' });
  }
}

async function predict(buffer: any) {
  if (!model) {
    postMessage({ type: 'predictionError', error: 'Model not loaded' });
    return;
  }
  try {
    const values = buffer.values as Float32Array;
    const shape = buffer.shape as [number, number, number];
    const input = tensor(values, shape) as Tensor3D;
    const normalized = tidy(() => input.toFloat().div(scalar(255)));
    input.dispose();
    const batched = normalized.expandDims(0);
    const output = model.execute(batched) as Tensor | Tensor[];
    normalized.dispose();
    batched.dispose();
    const preds = Array.isArray(output) ? output : [output];
    const boxes = getBestBoxes(preds[0]);
    preds.forEach((t) => t.dispose());
    postMessage({ type: 'predictionSuccess', data: boxes });
  } catch (error: any) {
    postMessage({ type: 'predictionError', error: error?.message || 'Prediction failed' });
  }
}


 function getBestBoxes(predictionTensor: Tensor): {box: number[],name: string, value: number}[] {
  return tidy(() => {
    const classPrediction = predictionTensor.squeeze([0]); //shape(68,8400)
    const boxes = classPrediction.slice([0, 0], [4, -1]) as Tensor2D; //4,8400

    let predictions: Tensor2D | null = null;

    for (let i of Array(32).keys()) {
      const scores = classPrediction
        .slice([4 + i, 0], [1, -1])
        .squeeze([0]) as Tensor1D;
      const max_index = scores.argMax().arraySync() as number;
      const max_value = scores.bufferSync().get(max_index);

      if (max_value > 0.5) {
        const max_box = boxes.slice([0, max_index], [-1, 1]) as Tensor2D; // 4,1
        const max_box_index = max_box.concat([tensor2d([i], [1, 1])], 0); // 1,5
        if (predictions !== null) {
          predictions = predictions.concat([max_box_index], 1); // +1,5
        } else {
          predictions = max_box_index;
        }
      }
    }
    if (predictions != undefined) {
      const predictionsT = predictions.transpose() as Tensor2D;
      const predicionArray = predictionsT.arraySync();
      console.log(predicionArray)
      return predicionArray.map(classivy)
    }
    return [];
  });
}


function classivy(idx: number[]): {box: number[],name: string, value: number}{
  const farbe = Math.floor(idx[4] / 8);
  const symbol = idx[4] % 8;
  let name = '';
  let score = 0;
  switch (farbe) {
    case 0:
      name = 'e';
      break;
    case 1:
      name = 'g';
      break;
    case 2:
      name = 'h';
      break;
    case 3:
      name = 's';
      break;
  }
  switch (symbol) {
    case 0:
      name += 'a';
      score = 11;
      break;
    case 1:
      name += '10';
      score = 10;
      break;
    case 2:
      name += 'k';
      score = 4;
      break;
    case 3:
      name += 'o';
      score = 3;
      break;
    case 4:
      name += 'u';
      score = 2;
      break;
    case 5:
      name += '9';
      score = 0;
      break;
    case 6:
      name += '8';
      score = 0;
      break;
    case 7:
      name += '7';
      score = 0;
      break;
  }
  console.log(idx.slice(0,4))
  return {box: idx.slice(0,4),name: name, value: score}
}

addEventListener('message', ({ data }) => {
  const { type, data: payload } = data;
  switch (type) {
    case 'loadModel':
      loadModel();
      break;
    case 'predict':
      predict(payload);
      break;
    default:
      break;
  }
});

