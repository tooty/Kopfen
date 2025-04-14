import { CommonModule, NgFor } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { Color } from 'chart.js';
import { count } from 'rxjs';

@Component({
  selector: 'app-vision',
  imports: [CommonModule, NgFor],
  templateUrl: './vision.component.html',
  styleUrl: './vision.component.css'
})

export class VisionComponent {
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  videoDevices: MediaDeviceInfo[] = []
  video: HTMLVideoElement = document.createElement("video")
  canvasVideo = true
  worker: Worker | undefined
  imgTensor: tf.Tensor3D | false | undefined
  animation = new Image()
  currentFrame = 0

  ngOnInit() {
    this.animation.src = "assets/spritesheet.png"

    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('./tfjs-worker.worker', import.meta.url))
      this.worker.postMessage({ type: "loadModel" })
      console.log("loadModel...")
      this.worker.onmessage = ({ data }) => {
        if (data.type == "predictionError") {
          alert("Worker: Model prediction canceled")
          if (this.imgTensor instanceof tf.Tensor)  {
            this.imgTensor.dispose()
          }
          this.imgTensor = false
        }
        if (data.type == "predictionSuccess") {
          this.drawPredicionFrame(data.data)
        } else if (data.type === "loadSuccess") {
          console.log("model loaded in worker")
        } else {
          console.log(data)
        }
      }
    } else {
      alert("no Worker support")
    }
    this.requestCameraAccess()
  }

  async requestCameraAccess() {
    navigator.mediaDevices.enumerateDevices().then(devs => this.videoDevices = devs.filter(x => {
      return x.kind == 'videoinput'
    }))
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 640 }, }).then(stream => {
      this.video.srcObject = stream;
      this.video.play()
      requestAnimationFrame(this.drawFrame);
    }).catch(error => console.error(error));
  }

  drawFrame = () => {
    const canvas = this.canvasElement.nativeElement
    const canvasCtx = canvas.getContext("2d") || false
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA && this.canvasVideo) {
      canvas.width = this.video.videoWidth
      canvas.height = this.video.videoHeight
      if (canvasCtx) {
        canvasCtx.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight)
        canvasCtx.font = "40px sans-serif"
        const text = "Tap to predict"
        const metrics = canvasCtx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        const centerX = 320;
        const centerY = 320;
        const paddingX = 20; // Extra padding around text
        const paddingY = 15;
        const boxWidth = textWidth + paddingX * 2;
        const boxHeight = textHeight + paddingY * 2;
        this.drawRoundedRect(centerX - boxWidth / 2, centerY - boxHeight / 2, boxWidth, boxHeight, 10, "rgb(225 225 225 / 80%)", canvasCtx)
        canvasCtx.strokeText(text, centerX - textWidth / 2, centerY + textHeight / 2)
      }
    } else if (canvasCtx && this.imgTensor) {
      tf.browser.toPixels(this.imgTensor, canvas).then(() => {
        let [x, y] = [canvas.width / 2 - 75, canvas.height / 2 - 75]
        this.drawRoundedRect(x, y, 150, 150, 10, "rgb(225 225 225 / 50%)", canvasCtx)
        canvasCtx.drawImage(this.animation, this.currentFrame * 300, 0, 300, 300, canvas.width / 2 - 75, canvas.height / 2 - 75, 150, 150)
        this.currentFrame = (this.currentFrame + 1) % 31
      })
    }
    requestAnimationFrame(this.drawFrame)
  }

  drawRoundedRect(x: number, y: number, w: number, h: number, r: number, color: string, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  changeInput(device: MediaDeviceInfo) {
    navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: {
          exact: device.deviceId
        },
        width: 640,
        height: 640,
      }
    }).then(stream => {
      this.video.srcObject = stream;
      this.video.play()
    }).catch(error => console.error(error));
  }

  async applyModel() {
    if (!this.worker) return
    this.canvasVideo = !this.canvasVideo
    if (this.canvasVideo) return
    this.imgTensor = tf.tidy(() => {
      return tf.browser.fromPixels(this.video).resizeNearestNeighbor([640, 640]) as tf.Tensor3D;
    })
    const buffer = await this.imgTensor.buffer()
    this.worker.postMessage({ type: "predict", data: buffer })
  }


  drawPredicionFrame(boxes_list: number[][] | undefined) {
    const canvas = this.canvasElement.nativeElement;
    const canvasCtx = canvas.getContext("2d") || false

    if (!this.imgTensor) return

    tf.browser.toPixels(this.imgTensor, canvas).then(() => {
      if (boxes_list !== undefined) {
        if (!canvasCtx) return
        let summ = 0
        let count
        if (boxes_list[0].length === 0) {
          count = 0
        } else {
          count = boxes_list.length
        }
        boxes_list.forEach(box => {
          let [x, y, w, h] = box

          x = Math.abs(x - w / 2)
          y = Math.abs(y - h / 2)
          let [cardName, score] = this.className(box[4])
          summ += score
          canvasCtx.strokeStyle = "red"
          canvasCtx.lineWidth = 2
          canvasCtx.strokeRect(x, y, w, h)
          canvasCtx.font = "30pt serif"
          canvasCtx.fillText(cardName, x, y)
        })
        canvasCtx.fillText("∑ " + String(summ) + "(" + String(count) + ")", 50, 50)
      }
      if (this.imgTensor) {
        this.imgTensor.dispose()
        this.imgTensor = false
      }
    })

  }

  className(idx: number): [string, number] {
    const farbe = Math.floor(idx / 8)
    const symbol = idx % 8
    let name = ""
    let score = 0
    switch (farbe) {
      case 0:
        name = "e"
        break
      case 1:
        name = "g"
        break
      case 2:
        name = "h"
        break
      case 3:
        name = "s"
        break
    }
    switch (symbol) {
      case 0:
        name += "a"
        score = 11
        break
      case 1:
        name += "10"
        score = 10
        break
      case 2:
        name += "k"
        score = 4
        break
      case 3:
        name += "o"
        score = 3
        break
      case 4:
        name += "u"
        score = 2
        break
      case 5:
        name += "9"
        score = 0
        break
      case 6:
        name += "8"
        score = 0
        break
      case 7:
        name += "7"
        score = 0
        break

    }
    return [name, score]
  }
}
