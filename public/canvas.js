window.addEventListener("load", () => {
    const inputCanvas  = document.querySelector("#first-canvas");
    const ctx     = inputCanvas.getContext("2d");
    const rect    = inputCanvas.getBoundingClientRect();
    const scale   = 1;
    const width   = 400;
    const height  = 400;
    const inputCTX     = inputCanvas.getContext("2d");
    var inputCanvasWidth = 400;
    var inputCanvasHeight = 400;
    const bg      = "#000000";
    const fg      = "#FFFFFF";

    inputCanvas.width = width;
    inputCanvas.height = height;

    inputCanvas.style.width = (inputCanvas.width * scale) + "px";
    inputCanvas.style.height = (inputCanvas.height * scale) + "px";

    let drawing = false;

    inputCanvas.addEventListener("mousedown",  startDraw);
    inputCanvas.addEventListener("mousemove",  draw);
    inputCanvas.addEventListener("mouseup",    endDraw);

    const clear = document.querySelector("#clear-button");
    const predict  = document.querySelector("#predict-button");

    ctx.strokeStyle = bg;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillRect(0, 0, inputCanvas.width, inputCanvas.height);

    clear.onclick = function () {
        // Store the current transformation matrix
        ctx.save();

        // Use the identity matrix while clearing the inputCanvas
        ctx.strokeStyle = bg;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillRect(0, 0, inputCanvas.width, inputCanvas.height);

        // Restore the transform
        ctx.restore();
    };

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

    function openSaveModal() {
        document.querySelector("#save-modal").style.display = "block";
    }
    function closeSaveModal() {
        document.querySelector("#save-modal").style.display = "";
    }
    function openLoadModal() {
        document.querySelector("#load-modal").style.display = "block";
    }
    function closeLoadModal() {
        document.querySelector("#load-modal").style.display = "";
    }
    function closeInitMessageModal() {
        document.querySelector("#init-message-modal").style.display = "";
    }

    function startDraw (e) {
        drawing = true;
        draw(e);
    }

    function draw(e) {
        if (!drawing) return;

        ctx.lineWidth = 20;
        ctx.lineCap = "round";
        ctx.strokeStyle = fg;

        let mouseX = (e.clientX - rect.left + scrollX) / scale;
        let mouseY = (e.clientY - rect.top + scrollY) / scale;

        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX, mouseY);
    }

    function endDraw() {
        drawing = false;
        ctx.beginPath();
        storeSaveData();
    }

    function storeSaveData() {
        document.querySelector("#save-modal-image-data").value = inputCanvas.toDataURL();
    }
});

console.log('Canvas is up and running!');
