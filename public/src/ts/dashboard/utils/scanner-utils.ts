import { BrowserMultiFormatReader } from "@zxing/browser";
import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import { BarcodeFormat,DecodeHintType } from "@zxing/library";

export async function scanBarcodeAndMatch(barcode: object): Promise<boolean> {
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  alert("Your browser does not support camera access.");
  
}
    const codeReader = new BrowserMultiFormatReader();
    const formats = [BarcodeFormat.CODE_128,BarcodeFormat.EAN_13,BarcodeFormat.UPC_A];
    codeReader.hints.set(DecodeHintType.POSSIBLE_FORMATS,formats);
    const video = document.createElement("video");
    return new Promise(async (resolve) => {
        let controls: any;
        const modal = createScannerModal(video, () => {
            if (controls) controls.stop();
            resolve(false);

        })
        document.body.appendChild(modal);
        controls = await codeReader.decodeFromVideoDevice(undefined, video, (result, err) => {
            if (result) {
                const scannedCode = result.getText();
                
                if (scannedCode === barcode) {
                    controls.stop()
                    modal.remove();
                    resolve(true);
                } else {
                    alert(`❌ Scanned barcode does not match expected item.`);
                    controls.stop();
                    modal.remove();
                    resolve(false);
                }
            }

        });

    });



}


export async function scanPhotoAndMatch(expectedName: string): Promise<boolean> {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    return new Promise((resolve) => {
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return resolve(false);

            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.onload = async () => {
                const model = await mobilenetModule.load();
                const predictions = await model.classify(img);
                const predictedLabel = predictions[0]?.className.toLowerCase();

                resolve(predictedLabel.includes(expectedName.toLowerCase()));
            };
        };

        input.click();
    });

}

function createScannerModal(videoElement: HTMLVideoElement, onClose: () => void): HTMLElement {


    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    modal.style.display = "flex";
    modal.style.flexDirection = "column";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "❌ Close";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "20px";
    closeBtn.style.right = "20px";
    closeBtn.style.padding = "0.5rem 1rem";
    closeBtn.style.background = "white";
    closeBtn.style.border = "none";
    closeBtn.style.borderRadius = "5px";
    closeBtn.style.cursor = "pointer";

    closeBtn.onclick = () => {
        onClose();
        modal.remove();
    };

    videoElement.style.maxWidth = "90vw";
    videoElement.style.maxHeight = "80vh";
    videoElement.setAttribute("autoplay", "true");

    modal.appendChild(videoElement);
    modal.appendChild(closeBtn);
    return modal;
}