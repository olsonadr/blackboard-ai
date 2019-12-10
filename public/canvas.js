const inputCanvas         = document.querySelector("#first-canvas");
const neuralCanvas        = document.querySelector("#neural-canvas");
const inputCTX            = inputCanvas.getContext("2d");
const neuralCTX           = neuralCanvas.getContext("2d");
var inputRect             = inputCanvas.getBoundingClientRect();
var neuralRect            = neuralCanvas.getBoundingClientRect();
const scale               = 1;
var inputCanvasWidth      = Math.round(window.innerWidth - 112);
var inputCanvasHeight     = Math.round(window.innerHeight - 72);
var neuralCanvasWidth     = Math.round(window.innerWidth - 112);
var neuralCanvasHeight    = Math.round(window.innerHeight - 72);
const bg                  = "#000000";
const fg                  = "#FFFFFF";
var currTool              = "draw";
let firstCursor           = true;
let firstSelect           = true;
let selectCleared         = false;
let currSelect            = { x1: 0, y1: 0,
                              x2: inputCanvasWidth,
                              y2: inputCanvasHeight };
let prevSelect            = { x1: 0, y1: 0,
                              x2: inputCanvasWidth,
                              y2: inputCanvasHeight };

let selectLineWidth       = 6;
var resetting             = false;
let prevEvent;
let prevBrushUnderData;
let prevSelectUnderData;

inputCanvas.style.width = (inputCanvas.width * scale) + "px";
inputCanvas.style.height = (inputCanvas.height * scale) + "px";

window.addEventListener("load", () => {
    setSize();

    let drawing = false;

    inputCanvas.addEventListener("mousedown",  startDraw);
    inputCanvas.addEventListener("mousemove",  draw);
    inputCanvas.addEventListener("mouseup",    endDraw);
    inputCanvas.addEventListener("mouseout",   removeCursor);

    const clearButton      = document.querySelector("#clear-button");
    const predictButton    = document.querySelector("#predict-button");
    const drawToolButton   = document.querySelector("#draw-button");
    const eraseToolButton  = document.querySelector("#erase-button");
    const selectToolButton = document.querySelector("#select-button");

    clearButton.onclick = function () {
        // Set that we are resetting
        resetting = true;

        // Store the current transformation matrix
        inputCTX.save();

        // Use the identity matrix while clearing the inputCanvas
        inputCTX.strokeStyle = bg;
        inputCTX.setTransform(1, 0, 0, 1, 0, 0);
        inputCTX.fillRect(0, 0, inputCanvas.width, inputCanvas.height);

        // Restore the transform
        inputCTX.restore();

        // Reset select box
        currSelect = { x1: 0, y1: 0,
                       x2: inputCanvasWidth,
                       y2: inputCanvasHeight };
        prevSelect = { x1: 0, y1: 0,
                       x2: inputCanvasWidth,
                       y2: inputCanvasHeight };
        prevSelectUnderData = inputCTX.getImageData(0, 0, inputCanvasWidth, inputCanvasHeight);
        firstSelect = true;

        removeSelectBox();

        endDraw();

        // Set that we are no longer resetting
        resetting = false;
    };

    clearButton.click();

    let white = "#FFFFFF";
    let grey = "#d3d3d3";
    let black = "#000000";

    function setColorOfButtons() {
        if (currTool == "draw") {
            drawToolButton.style.backgroundColor = grey;
            eraseToolButton.style.backgroundColor = white;
            selectToolButton.style.backgroundColor = white;
            drawToolButton.style.color = white;
            eraseToolButton.style.color = black;
            selectToolButton.style.color = black;
        } else if (currTool == "erase"){
            drawToolButton.style.backgroundColor = white;
            eraseToolButton.style.backgroundColor = grey;
            selectToolButton.style.backgroundColor = white;
            drawToolButton.style.color = black;
            eraseToolButton.style.color = white;
            selectToolButton.style.color = black;
        } else if (currTool == "select") {
            drawToolButton.style.backgroundColor = white;
            eraseToolButton.style.backgroundColor = white;
            selectToolButton.style.backgroundColor = grey;
            drawToolButton.style.color = black;
            eraseToolButton.style.color = black;
            selectToolButton.style.color = white;
        }
    }

    drawToolButton.onclick = function () {
        currTool = 'draw';
        inputCTX.lineWidth = 20;
        inputCTX.lineCap = "round";
        inputCTX.strokeStyle = fg;
        setColorOfButtons();
    };

    drawToolButton.onmouseenter = function () {
        drawToolButton.style.backgroundColor = grey;
        drawToolButton.style.color = white;
    };

    drawToolButton.onmouseleave = function () {
        if (currTool != "draw") {
            drawToolButton.style.backgroundColor = white;
            drawToolButton.style.color = black;
        }
    };

    eraseToolButton.onclick = function () {
        currTool = 'erase';
        inputCTX.lineWidth = 40;
        inputCTX.lineCap = "round";
        inputCTX.strokeStyle = bg;
        setColorOfButtons();
    };

    eraseToolButton.onmouseenter = function () {
        eraseToolButton.style.backgroundColor = grey;
        eraseToolButton.style.color = white;
    };

    eraseToolButton.onmouseleave = function () {
        if (currTool != "erase") {
            eraseToolButton.style.backgroundColor = white;
            eraseToolButton.style.color = black;
        }
    };

    selectToolButton.onclick = function () {
        currTool = 'select';
        inputCTX.lineWidth = selectLineWidth;
        inputCTX.lineCap = "round";
        inputCTX.strokeStyle = fg;
        setColorOfButtons();
    };

    selectToolButton.onmouseenter = function () {
        selectToolButton.style.backgroundColor = grey;
        selectToolButton.style.color = white;
    };

    selectToolButton.onmouseleave = function () {
        if (currTool != "select") {
            selectToolButton.style.backgroundColor = white;
            selectToolButton.style.color = black;
        }
    };

    drawToolButton.click();

    // Load initial data
    if (document.querySelector("#init-data").textContent != "") {
        var initImage = new Image;
        initImage.src = document.querySelector("#init-data").textContent;
        initImage.onload = function() {
            inputCTX.drawImage(initImage, 0, 0);
        }
    }

    // Show initial message modal
    if (document.querySelector("#init-message").textContent != "") {
        document.querySelector("#init-message-modal").style.display = "block";
    }

    // Save and load modals
    document.querySelector("#save-button").onclick = openSaveModal;
    document.querySelector("#load-button").onclick = openLoadModal;
    document.querySelector("#save-modal-close-button").onclick = closeSaveModal;
    document.querySelector("#load-modal-close-button").onclick = closeLoadModal;
    document.querySelector("#init-message-modal-close-button").onclick = closeInitMessageModal;
    document.querySelector("#predict-message-modal-close-button").onclick = closePredictMessageModal;
    document.querySelector("#predict-message-modal-accept-button").onclick = closePredictMessageModal;

    document.querySelectorAll(".modal-backdrop").forEach((item) => {
        item.addEventListener("click", () => {
            closeLoadModal();
            closeSaveModal();
            closeInitMessageModal();
            closePredictMessageModal();
        });
    });

    document.querySelectorAll(".modal-container").forEach((item) => {
        item.addEventListener("click", (ev) => { ev.stopPropagation(); }, false);
    });

    function openSaveModal() {
        document.querySelector("#save-modal").style.display = "block";
    }
    function closeSaveModal() {
        document.querySelector("#save-modal").style.display = "";
        document.querySelector("#save-modal-text-input").value = "";
    }

    function openLoadModal() {
        document.querySelector("#load-modal").style.display = "block";
    }
    function closeLoadModal() {
        document.querySelector("#load-modal").style.display = "";
        document.querySelector("#load-modal-text-input").value = "";
    }

    function closeInitMessageModal() {
        document.querySelector("#init-message-modal").style.display = "";
    }

    function closePredictMessageModal() {
        document.querySelector("#predict-message-modal").style.display = "";
    }

    function startDraw(e) {
        let mouseX = (e.clientX - inputRect.left + scrollX) / scale;
        let mouseY = (e.clientY - inputRect.top + scrollY)  / scale;

        drawing = true;
        inputCTX.beginPath();
        if (currTool == 'draw') {
            inputCTX.lineWidth = 20;
            inputCTX.lineCap = "round";
            inputCTX.strokeStyle = fg;
            inputCTX.beginPath();
            inputCTX.moveTo(mouseX - inputCTX.lineWidth / 4, mouseY);
            drawBrush(e);
        } else if (currTool == 'erase') {
            inputCTX.lineWidth = 40;
            inputCTX.lineCap = "round";
            inputCTX.strokeStyle = bg;
            inputCTX.beginPath();
            inputCTX.moveTo(mouseX - inputCTX.lineWidth / 4, mouseY);
            drawBrush(e);
        } else if (currTool == 'select') {
            // select stuff
            prevSelect.x1 = currSelect.x1;
            prevSelect.y1 = currSelect.y1;
            prevSelect.x2 = currSelect.x2;
            prevSelect.y2 = currSelect.y2;
            currSelect.x1 = (e.clientX - inputRect.left + scrollX) / scale;
            currSelect.y1 = (e.clientY - inputRect.top + scrollY)  / scale;
            currSelect.x2 = (e.clientX - inputRect.left + scrollX) / scale;
            currSelect.y2 = (e.clientY - inputRect.top + scrollY)  / scale;
            firstSelect = true;
            inputCTX.lineWidth = selectLineWidth;
            inputCTX.lineCap = "round";
            inputCTX.strokeStyle = fg;
            drawSelect(e);
        }
    }

    function draw(e) {
        switch(currTool) {
            case 'draw':
            case 'erase':
                drawBrush(e);
                break;
            case 'select':
                drawSelect(e);
                break;
            default:
                break;
        }
    }

    function drawBrush(e) {
        let mouseX = (e.clientX - inputRect.left + scrollX) / scale;
        let mouseY = (e.clientY - inputRect.top + scrollY)  / scale;

        if (drawing) {
            // Get content underneath cursor
            prevBrushUnderData = inputCTX.getImageData(mouseX - inputCTX.lineWidth, mouseY - inputCTX.lineWidth, inputCTX.lineWidth * 2, inputCTX.lineWidth * 2);

            inputCTX.lineTo(mouseX - inputCTX.lineWidth / 4, mouseY);
            inputCTX.stroke();
            inputCTX.beginPath();
            inputCTX.moveTo(mouseX - inputCTX.lineWidth / 4, mouseY);
        } else {
            removeCursor(e);

            // Get content underneath cursor
            prevBrushUnderData = inputCTX.getImageData(mouseX - inputCTX.lineWidth, mouseY - inputCTX.lineWidth, inputCTX.lineWidth * 2, inputCTX.lineWidth * 2);

            // Draw circle
            inputCTX.beginPath();
            inputCTX.arc(mouseX - inputCTX.lineWidth / 4, mouseY, inputCTX.lineWidth / 2 - 2, Math.PI/3, true);
            var previous = inputCTX.lineWidth;
            inputCTX.lineWidth = 1;
            inputCTX.strokeStyle = "#FFFFFF";
            inputCTX.stroke();
            inputCTX.lineWidth = previous;
        }

        // Store this event
        prevEvent = e;
    }

    function removeCursor(e) {
      // Replace stuff underneath previous event
      if (firstCursor || prevEvent == undefined) {
          inputCTX.fillStyle = "#000000";
          inputCTX.fillRect((e.clientX - inputRect.left + scrollX) / scale - inputCTX.lineWidth, (e.clientY - inputRect.top + scrollY) / scale - inputCTX.lineWidth, inputCTX.lineWidth, inputCTX.lineWidth)
          firstCursor = false;
      }
      else {
        inputCTX.putImageData(prevBrushUnderData, (prevEvent.clientX - inputRect.left + scrollX) / scale - inputCTX.lineWidth, (prevEvent.clientY - inputRect.top + scrollY)  / scale - inputCTX.lineWidth);
      }
    }

    function drawSelect(e) {
      let mouseX = (e.clientX - inputRect.left + scrollX) / scale;
      let mouseY = (e.clientY - inputRect.top + scrollY)  / scale;

      // Clear previous rectangle
      removeSelectBox();

      if (drawing && currTool == 'select') {
          currSelect.x2 = mouseX;
          currSelect.y2 = mouseY;
      }

      // Establish dims
      var topLeftX = (currSelect.x1 < currSelect.x2) ? (currSelect.x1) : (currSelect.x2);
      var topLeftY = (currSelect.y1 < currSelect.y2) ? (currSelect.y1) : (currSelect.y2);
      var width = Math.abs(currSelect.x1 - currSelect.x2);
      var height = Math.abs(currSelect.y1 - currSelect.y2);

      // Get content underneath selection
      prevSelectUnderData = inputCTX.getImageData(topLeftX - selectLineWidth * 2, topLeftY - selectLineWidth * 2,
                                                  width + selectLineWidth * 4, height + selectLineWidth * 4);

      // Draw current selection
      inputCTX.beginPath();
      inputCTX.rect(topLeftX, topLeftY, width, height)
      inputCTX.stroke();
    }

    function removeSelectBox() {
      // Replace stuff underneath previous event
      let topLeftX, topLeftY;
      if(firstSelect == true) {
          topLeftX = (prevSelect.x1 < prevSelect.x2) ? (prevSelect.x1) : (prevSelect.x2);
          topLeftY = (prevSelect.y1 < prevSelect.y2) ? (prevSelect.y1) : (prevSelect.y2);
          firstSelect = false;
      } else {
          topLeftX = (currSelect.x1 < currSelect.x2) ? (currSelect.x1) : (currSelect.x2);
          topLeftY = (currSelect.y1 < currSelect.y2) ? (currSelect.y1) : (currSelect.y2);
      }

      inputCTX.putImageData(prevSelectUnderData, topLeftX - selectLineWidth * 2, topLeftY - selectLineWidth * 2);
    }

    function endDraw() {
        drawing = false;
        inputCTX.beginPath();

        let topLeftX = ((currSelect.x1 < currSelect.x2) ? (currSelect.x1) : (currSelect.x2));
        let topLeftY = ((currSelect.y1 < currSelect.y2) ? (currSelect.y1) : (currSelect.y2));
        var width = Math.abs(currSelect.x1 - currSelect.x2);
        var height = Math.abs(currSelect.y1 - currSelect.y2);

        if(currTool == "select" || resetting == true) {
          neuralCanvasWidth   = Math.abs(currSelect.x1 - currSelect.x2);
          neuralCanvasHeight  = Math.abs(currSelect.y1 - currSelect.y2);

          neuralCanvas.width = neuralCanvasWidth;
          neuralCanvas.height = neuralCanvasHeight;

          neuralCanvas.style.width = (neuralCanvasWidth * scale) + "px";
          neuralCanvas.style.height = (neuralCanvasHeight * scale) + "px";

          neuralRect = neuralCanvas.getBoundingClientRect();

          neuralCTX.strokeStyle = bg;
          neuralCTX.setTransform(1, 0, 0, 1, 0, 0);
          neuralCTX.fillRect(0, 0, neuralCanvas.width, neuralCanvas.height);
        }
        else {
          prevSelectUnderData = inputCTX.getImageData(topLeftX - selectLineWidth * 2, topLeftY - selectLineWidth * 2,
                                                      width + selectLineWidth * 4, height + selectLineWidth * 4);
        }

        neuralCTX.strokeStyle = fg;
        neuralCTX.putImageData(inputCTX.getImageData(topLeftX + selectLineWidth,
                                                     topLeftY + selectLineWidth,
                                                     width - selectLineWidth * 2,
                                                     height - selectLineWidth * 2), 0, 0);

        inputCTX.beginPath(); // maybe delete
        storeSaveData(); // maybe delete
    }

    function storeSaveData() {
        // Store backup of whole canvas
        let backup = inputCTX.getImageData(0, 0, inputCanvasWidth, inputCanvasHeight);

        // Remove select box when saving
        removeSelectBox();

        // Store data url of canvas without select box in outbound element
        document.querySelector("#save-modal-image-data").value = inputCanvas.toDataURL();

        // Restore backup of canvas
        inputCTX.putImageData(backup, 0, 0);
    }
});

window.onresize = setSize;

function setSize() {
    var preResizeInputData  = inputCTX.getImageData(0, 0, inputCanvasWidth, inputCanvasHeight);
    var preResizeNeuralData = neuralCTX.getImageData(0, 0, neuralCanvasWidth, neuralCanvasHeight);

    if (neuralCanvasWidth == inputCanvasWidth
                && neuralCanvasHeight == inputCanvasHeight) {
        neuralCanvasWidth   = Math.round(window.innerWidth - 112);
        neuralCanvasHeight  = Math.round(window.innerHeight - 72);
    }

    inputCanvasWidth   = Math.round(window.innerWidth - 112);
    inputCanvasHeight  = Math.round(window.innerHeight - 72);

    inputCanvas.width = inputCanvasWidth;
    inputCanvas.height = inputCanvasHeight;
    neuralCanvas.width = neuralCanvasWidth;
    neuralCanvas.height = neuralCanvasHeight;

    inputCanvas.style.width = (inputCanvasWidth * scale) + "px";
    inputCanvas.style.height = (inputCanvasHeight * scale) + "px";
    neuralCanvas.style.width = (neuralCanvasWidth * scale) + "px";
    neuralCanvas.style.height = (neuralCanvasHeight * scale) + "px";

    inputRect = inputCanvas.getBoundingClientRect();
    neuralRect = neuralCanvas.getBoundingClientRect();

    inputCTX.strokeStyle = bg;
    inputCTX.setTransform(1, 0, 0, 1, 0, 0);
    inputCTX.fillRect(0, 0, inputCanvas.width, inputCanvas.height);

    neuralCTX.strokeStyle = bg;
    neuralCTX.setTransform(1, 0, 0, 1, 0, 0);
    neuralCTX.fillRect(0, 0, neuralCanvas.width, neuralCanvas.height);

    inputCTX.putImageData(preResizeInputData, 0, 0);
    neuralCTX.putImageData(preResizeNeuralData, 0, 0);
}

console.log('inputCanvas is up and running!');
