
// Global variables
const modelPath   = "./saved/tfjsmodel/model.json"; //path.join(__dirname, 'tfjsmodel', 'model.json');
const saveButton  = document.querySelector("#predict-button");
const canvas      = document.querySelector("#first-canvas");
const ctx         = canvas.getContext("2d");
const width       = 400;
const height      = 400;
const labels      = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const fg          = "#FFFFFF";
const fg_dec      = 255;
const bg          = "#000000";
const bg_dec      = 0;

// Load Model
let model;
(async function() {
  model = undefined;
  model = await tf.loadLayersModel(modelPath);
  console.log('Model loaded from storage');

  // Compile model
  model.compile({
    optimizer: 'adam', //'tf.keras.optimizers.Adam()',
    loss: 'sparseCategoricalCrossentropy',
    metrics: ['accuracy']
  });

  // Establish save on click functionality
  saveButton.onclick = () => {
    centerContent();
    predict();
  };
})();

async function centerContent() {
    const imgData = ctx.getImageData(0, 0, width, height);
    var   min_x = width+1, max_x = -1;
    var   min_y = height+1, max_y = -1;

    // Find min and max x and y values to center and scale contents.

    // console.log(imgData.data);
    //
    // for (var x = 0; x < width; x++) {
    //     for (var y = 0; y < height; y++) {
    //         if (imgData.data[(y * width + x) * 3] === fg_dec) {
    //             min_x = (x < min_x) ? x : min_x;
    //             max_x = (x > max_x) ? x : max_x;
    //             min_y = (y < min_y) ? y : min_y;
    //             max_y = (y > max_y) ? y : max_y;
    //         }
    //     }
    // }
    //
    // console.log(`${min_x}, ${max_x} and ${min_y}, ${max_y}`);
}

async function predict() {
    console.log("Predicting...");

    var preprocessed = tf.browser.fromPixels(canvas)
                                 .resizeNearestNeighbor([28, 28])
                                 .mean(2)
                                 .expandDims(2)
                                 .expandDims()
                                 .toFloat()
                                 .div(255.0);

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
