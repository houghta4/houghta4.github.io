// import init, { greet, pass_params, return_value_arraytype } from "./wasm-bindgen-test/pkg/wasm_bindgen_test.js";
import init, { is_solved, shuffle } from "./wasm-slide-puzzle/pkg/wasm_slide_puzzle.js";

let ROWS = 1;
let COLS = 1;

let targetTile = {
    id: 'tile-0-0'
}; // blank

let turns = 0;

let imgVec = [];
/*
 TODO: 
    Puzzle solver. Maybe rust wasm?
*/
window.onload = async () => {
    await init();
    const file = document.getElementById("file-select");
    const size = document.getElementById("num");
    const minus = document.getElementById("minus");
    const plus = document.getElementById("plus");
    document.querySelector("#game-board").style.setProperty('--size', ROWS);
    let image = new Image();
    image.onload = () => cutUpImage(image);
    file.addEventListener("change", (e) => onFileSelect(e, image));
    minus.addEventListener("click", () => onSizeChange(--size.value, image));
    plus.addEventListener("click", () => onSizeChange(++size.value, image));
    size.addEventListener("change", (e) => onSizeChange(e.target.value, image));
}

const invalidSize = () => {
    document.getElementById("num").value = ROWS;
    document.getElementById("size-container").classList.add("shake");
    setTimeout(function () {
        document.getElementById("size-container").classList.remove("shake");
    }, 1000);
}

const onSizeChange = (value, image) => {
    if (value > 0) {
        ROWS = value;
        COLS = value;
        let gameBoard = document.querySelector("#game-board");
        gameBoard.style.setProperty('--size', ROWS);
        gameBoard.style.borderColor = "black";
        if (image.src !== "") {
            reset();
            cutUpImage(image);
        }
    } else {
        invalidSize();
    }
}

const onTileClick = async (e) => {
    e.preventDefault();
    if (validateMove(e.target.id)) {
        let childB = e.target;
        let childA = targetTile;
        const finalChildAStyle = {
            x: null,
            y: null,
        };
        const finalChildBStyle = {
            x: null,
            y: null,
        };

        // Not sure if I like the delay or not
        // let swapDone = false;
        // if (swapDone === false) {
        finalChildAStyle.x = childB.getBoundingClientRect().left - childA.getBoundingClientRect().left;
        finalChildAStyle.y = childB.getBoundingClientRect().top - childA.getBoundingClientRect().top;
        finalChildBStyle.x = childA.getBoundingClientRect().left - childB.getBoundingClientRect().left;
        finalChildBStyle.y = childA.getBoundingClientRect().top - childB.getBoundingClientRect().top;
        childA.style.transform = `translate(${finalChildAStyle.x}px, ${finalChildAStyle.y}px)`;
        childB.style.transform = `translate(${finalChildBStyle.x}px, ${finalChildBStyle.y}px)`;

        setTimeout(() => {
            childA.classList.add("no-transition");
            childB.classList.add("no-transition");
            childA.removeAttribute('style');
            childB.removeAttribute('style');

            // swap src
            // console.log("swapping " + targetTile.getAttribute("data-id") + " with " + e.target.getAttribute("data-id"))
            targetTile.src = e.target.getAttribute("src");
            let targetId = targetTile.getAttribute("data-id");
            let eTargetId = e.target.getAttribute("data-id");
            let t1 = imgVec.indexOf(targetId);
            let t2 = imgVec.indexOf(eTargetId);
            [imgVec[t1], imgVec[t2]] = [imgVec[t2], imgVec[t1]];

            targetTile.setAttribute("data-id", eTargetId);
            e.target.setAttribute("data-id", targetId);

            e.target.src = "";
            targetTile = e.target;
            incTurns();

            if (isSolved()) {
                let gameBoard = document.getElementById("game-board");
                gameBoard.classList.add("spin");
                setTimeout(function () {
                    gameBoard.classList.remove("spin");
                }, 500);
                gameBoard.style.borderColor = "#228B22";
            }
            else {
                document.getElementById("game-board").style.borderColor = "black";
            }
        }, 100);
        // }
        // swapDone = true;
        childA.classList.remove("no-transition");
        childB.classList.remove("no-transition");





    } else {
        document.getElementById("game-board").classList.add("shake");
        setTimeout(function () {
            document.getElementById("game-board").classList.remove("shake");
        }, 500);

    }
}

const isSolved = () => {
    return !imgVec.some((el, i) => +el !== i);
}

const validateMove = (tileId) => {
    let [, tileX, tileY] = tileId.split("-").map(Number);
    let [, targetX, targetY] = targetTile.id.split("-").map(Number);

    let xValid = tileX === targetX - 1 || tileX === targetX + 1;
    let yValid = tileY === targetY - 1 || tileY === targetY + 1;

    return (tileX === targetX || tileY === targetY) && (xValid || yValid);
}

const incTurns = () => {
    document.getElementById("turns").innerText = ++turns;
}


/*
    TODO: Speed up. very slow on mobile
*/
const cutUpImage = (image) => {
    let tiles = [];
    // console.log(ROWS, COLS);
    let widthOfOnePiece = image.width / COLS;
    let heightOfOnePiece = image.height / ROWS;

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            let i = y * ROWS + x;
            let canvas = document.createElement('canvas');
            canvas.width = widthOfOnePiece;
            canvas.height = heightOfOnePiece;
            let context = canvas.getContext('2d');
            context.drawImage(image, x * widthOfOnePiece, y * heightOfOnePiece, widthOfOnePiece, heightOfOnePiece, 0, 0, canvas.width, canvas.height);
            let t = document.createElement("img");
            if ( i !== ROWS * COLS - 1|| (ROWS === 1 && COLS === 1)) {
                t.src = canvas.toDataURL();
            } else {
                targetTile = t;
            }
            t.setAttribute("data-id", i);
            t.setAttribute("draggable", false);
            t.addEventListener("click", onTileClick);
            tiles.push(t);
        }
    }
    // This could be one line if wasm assumed index always = value
    imgVec = [...Array(tiles.length).keys()]
    imgVec = shuffle(imgVec, ROWS);
    // console.log("after shuffle");
    let gameBoard = document.getElementById("game-board");
    for (let i = 0, k = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++, k++) {
            let tile = tiles[imgVec[k]];
            // let tile = tiles[k];
            imgVec[k] = tile.getAttribute("data-id");
            tile.id = "tile-" + i.toString() + "-" + j.toString();
            gameBoard.append(tile);
        }
    }
}

const onFileSelect = (e, image) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file === null || file === undefined) {
        return;
    }
    document.getElementById("game-board").style.borderColor = "black";
    const instr = document.getElementsByClassName("instructions");
    if (instr.length > 0) {
        instr[0].style.display = "none";
    }

    reset();

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = readerEvent => {
        const content = readerEvent.target.result;
        image.src = content;
    };
}

const reset = () => {
    const board = document.getElementById("game-board");
    board.style.display = "flex"
    board.innerHTML = "";
    board.borderColor = "black";
    const turnContainer = document.getElementById("turn-container");
    turnContainer.style.display = "block";
    targetTile.id = "tile-0-0";
    turns = 0;
    document.getElementById("turns").innerText = turns;
}


// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
Array.prototype.shuffle = function () {
    let m = this.length, i;
    while (m) {
        i = (Math.random() * m--) >>> 0;
        [this[m], this[i]] = [this[i], this[m]]
    }
    return this;
}
