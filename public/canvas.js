console.log('Canvas is up and running!');

window.addEventListener("load", () => {
    const canvas = document.querySelector("#first-canvas");
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const scale = 10;
    const width = 28;
    const height = 28;

    canvas.width = width;
    canvas.height = height;

    canvas.style.width = (canvas.width * scale) + "px";
    canvas.style.height = (canvas.height * scale) + "px";

    let drawing = false;

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endDraw);

    function startDraw (e) {
        drawing = true;
        draw(e);
    }

    function draw(e) {
        if (!drawing) return;

        ctx.lineWidth = 2;
        ctx.lineCap = "round";

        let mouseX = (e.clientX - rect.left) / scale;
        let mouseY = (e.clientY - rect.top) / scale;

        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX, mouseY);
    }

    function endDraw() {
        drawing = false;
        ctx.beginPath();
    }
});
