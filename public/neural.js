
// Global variables
const modelPath         = "./saved/tfjsmodel/model.json"; //path.join(__dirname, 'tfjsmodel', 'model.json');
const saveButton        = document.querySelector("#save-button");
const inputCanvas       = document.querySelector("#first-canvas");
const ctx               = inputCanvas.getContext("2d");
const inputCanvasWidth  = 1200;
const inputCanvasHeight = 400;
const targetWidth       = 400;
const targetHeight      = 400;
const labels            = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const fg                = "#FFFFFF";
const fgRedDecimal      = 255;
const fgGreenDecimal    = 255;
const fgBlueDecimal     = 255;
const bg                = "#000000";
const bgRedDecimal      = 0;
const bgGreenDecimal    = 0;
const bgBlueDecimal     = 0;

// On script load...
let model;
(async function() {
  model = undefined;
  model = await tf.loadLayersModel(modelPath);
  console.log('Model loaded from storage');

  // Compile model
  model.compile({
    optimizer:  'adam', //'tf.keras.optimizers.Adam()',
    loss:       'sparseCategoricalCrossentropy',
    metrics:    ['accuracy']
  });

  // Establish save on click functionality
  saveButton.onclick = () => {
    isolateDigitsOnCanvas().then((isolatedDigits) => {
      // console.log(isolatedDigits);
      isolatedDigits.forEach((digit) => {
        // clearCanvas(inputCanvas);
        // ctx.putImageData(digit.data,0,0);
          centerAndScaleDigit(digit).then((scaledCanvas) => {
              predict(scaledCanvas);
          });
      });
    });
  };
})();

async function isolateDigitsOnCanvas() {
    // Variables
    var listOfDigits = [];
    var imgData = ctx.getImageData(0, 0, inputCanvasWidth, inputCanvasHeight);

    var inDigit = false;
    var currMin = -1;

    // Loop through to get vertical slices
    for (var x = 0; x < inputCanvasWidth + 1; x++) {
        if(inDigit == false
              && !verticalSliceContainsOnlyBG(imgData, x,
                                          inputCanvasWidth,
                                          inputCanvasHeight)) {
            // Now in digit
            inDigit = true;
            currMin = x;
        } else if((x == inputCanvasWidth)
                  || (inDigit == true && verticalSliceContainsOnlyBG(imgData, x,
                                                         inputCanvasWidth,
                                                         inputCanvasHeight))) {
            // Now out of digit

            // If no pixels were detected
            if (x == inputCanvasWidth && currMin == -1) {
                currMin = x - 1;
            }

            // Get vertical slice of canvas containing digit
            listOfDigits.push({data: ctx.getImageData(currMin, 0, x - currMin, inputCanvasHeight), width: x - currMin, height: inputCanvasHeight, ctxMinX: currMin});

            // Reset variables
            inDigit = false;
            currMin = -1;
        }
    }

    // Isolate height for each digit in list of digits
    listOfDigits.forEach((digit) => {
        // Reset Variables
        inDigit = false;
        currMin = -1;

        for (var y = 0; y < digit.height + 1; y++) {
            if(inDigit == false
                  && !horizontalSliceContainsOnlyBG(digit.data, y,
                                                digit.width,
                                                digit.height)) {
                // Now in digit
                inDigit = true;
                currMin = y;
            } else if((y == digit.height)
                      || (inDigit == true && horizontalSliceContainsOnlyBG(digit.data, y,
                                                                       digit.width,
                                                                       digit.height))) {
                // Now out of digit

                // If no pixels were detected
                if (y == digit.height && currMin == -1) {
                    currMin = y - 1;
                }

                // Get horizontal slice of canvas containing digit
                digit.data = ctx.getImageData(digit.ctxMinX, currMin, digit.width, y - currMin);
                digit.height = y - currMin;

                // Reset variables
                inDigit = false;
                currMin = -1;
            }
        }
    });

    return listOfDigits;
}

function verticalSliceContainsOnlyBG(imgData, x, imgDataWidth, imgDataHeight) {
    for (var y = 0; y < imgDataHeight; y++) {
        if(    imgData.data[(y * imgDataWidth + x) * 4]     != bgRedDecimal
            && imgData.data[(y * imgDataWidth + x) * 4 + 1] != bgGreenDecimal
            && imgData.data[(y * imgDataWidth + x) * 4 + 2] != bgBlueDecimal) {
            return false;
        }
    }
    return true;
}

function horizontalSliceContainsOnlyBG(imgData, y, imgDataWidth, imgDataHeight) {
    for (var x = 0; x < imgDataWidth; x++) {
        if(    imgData.data[(y * imgDataWidth + x) * 4]     != bgRedDecimal
            && imgData.data[(y * imgDataWidth + x) * 4 + 1] != bgGreenDecimal
            && imgData.data[(y * imgDataWidth + x) * 4 + 2] != bgBlueDecimal) {
            return false;
        }
    }
    return true;
}

async function centerAndScaleDigit(isolatedDigit) {
    var imgWidth = isolatedDigit.width;
    var imgHeight = isolatedDigit.height;

    // Get image data from area with content
    var isolatedImgData = isolatedDigit.data;

    // Determine scale
    var targetScale = .5;
    var largerDimProportion = (imgWidth > imgHeight) ? (imgWidth / targetWidth) : (imgHeight / targetHeight);
    var scale = targetScale / largerDimProportion;

    // Calculate top-left corner when centered and scaled
    var centeredX = (targetWidth  / scale - (imgWidth)) / 2;
    var centeredY = (targetHeight / scale - (imgHeight)) / 2;

    // Add image data to temp canvas
    var newCanvas = document.createElement('canvas');
    newCanvas.width = targetWidth;
    newCanvas.height = targetHeight;
    newCanvas.getContext("2d").putImageData(isolatedImgData, 0, 0);

    // Add scaled, centered content to scaled internal canvas
    var scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = targetWidth;
    scaledCanvas.height = targetHeight;
    clearCanvas(scaledCanvas);
    scaledCanvas.getContext("2d").scale(scale, scale);
    scaledCanvas.getContext("2d").drawImage(newCanvas, centeredX, centeredY, targetWidth, targetHeight);

    // Un-scale actual canvas
    scaledCanvas.getContext("2d").scale(1 / scale, 1 / scale);

    return scaledCanvas;
}

async function predict(canvas) {
    console.log("Predicting...");

    var preprocessed = tf.browser.fromPixels(canvas)
                                 .resizeNearestNeighbor([28, 28])
                                 .mean(2)
                                 .expandDims(2)
                                 .expandDims()
                                 .toFloat();
                                 // .div(255.0);

    let predictions = await model.predict(preprocessed).data();
    let top5 = Array.from(predictions).map(function(p, i) {
            return {
                probability: p,
                className: labels[i]
            };
        }).sort(function(a, b) {
            return b.probability - a.probability;
        }).slice(0, 5);

    top5.forEach(function(item) {
        console.log(item.className + "  =>  " + item.probability);
    });

    let result = await tf.argMax(predictions).data();
    console.log("Most likely  =>  " + labels[result]);
    console.log("------------------------>");
}

function clearCanvas(canvas) {
    let context = canvas.getContext('2d');
    // Store the current transformation matrix
    context.save();

    // Use the identity matrix while clearing the canvas
    canvas.getContext('2d').strokeStyle = bg;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillRect(0, 0, inputCanvas.width, inputCanvas.height);

    // Restore the transform
    context.restore();
}
