const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
ctx.lineWidth = 2;

ctx.scale(20, 20);

const lineClear = () => {
    outer: for(let y = board.length - 1; y > 0; y--) {
        for(let x = 0; x < board[y].length; x++){
            if(board[y][x] === 0) continue outer;

        }
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        y++;
        player.score += player.combo * 10;
        console.log('player score:', player.score, 'player.combo', player.combo);
    }
};

const collision = (board, player) => {
    const [m, o] = [player.matrix, player.pos];
    for(let y = 0; y < m.length; y++){
        for(let x = 0; x < m[y].length; x++){
            if(m[y][x] !== 0 && 
                (board[y + o.y] && board[y + o.y][x + o.x]) !== 0){
                return true;
            }
        }
    }
    return false;
};

const createMatrix = (w, h) => {
    return Array.from(Array(h), () => Array(w).fill(0));
};

const createPiece = (type) => {
    if (type === 'T') {
        return [
            [1, 1, 1],
            [0, 1, 0],
            [0, 0, 0]
        ];
    } else if (type === 'O'){
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L'){
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J'){
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I'){
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ];
    } else if (type === 'S'){
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z'){
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
};

const draw = () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    drawMatrix(board, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
};

const drawMatrix = (matrix, offset) => {
    matrix.forEach((row, y) => {
        row.forEach((val, x) => {
            if(val !== 0){
                ctx.fillStyle = colors[val];
                ctx.fillRect(x + offset.x, y + offset.y, .93, .93   );
            }
        })
    });
};


let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

const merge = (board, player) => {
    player.matrix.forEach((row, y) => {
        row.forEach((val, x) => {
            if(val !== 0) {
                board[y + player.pos.y][x + player.pos.x] = val;
            }
        })
    });
};

const playerHardDrop = () => {
    while(!collision(board, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    playerDrop();
}

const playerDrop = () => {
    player.pos.y++;
    if(collision(board, player)) {
        player.pos.y--;
        merge(board, player);
        playerReset();
        lineClear();
        updateScore();
    }
    dropCounter = 0;
};

const playerMove = (dir) => {
    player.pos.x += dir;
    if (collision(board, player)) {
        player.pos.x -= dir;
    }
};

const playerReset = () => {
    const pieces = "TOLJISZ";
    player.matrix = createPiece(pieces[Math.floor(pieces.length * Math.random())]);
    player.pos.y = 0;
    player.pos.x = 5;

    console.log('creating new piece');
    //game over
    if (collision(board, player)){
        pause = true;
        resetGame();
        console.log('game over');
    }
};

const playerRotate = (dir) => {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while(collision(board, player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if(offset > player.matrix[0].length){
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

const rotate = (matrix, dir) => {
    for(let y = 0; y < matrix.length; y++){
        for(let x = 0; x < y; x++){
            [ 
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ]
        }
    }

    if(dir >= 1){
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
};

let pause = false;
const update = (t = 0) => {
    const dT = t - lastTime;
    lastTime = t;
    dropCounter += dT;
    if(dropCounter > dropInterval){
        playerDrop();
    }
    if(pause) return; 
    draw();
    requestAnimationFrame(update);
};

const updateScore = () => {
    let score = document.getElementById('score');
    if(score.innerText != player.score) {
        console.log('score !== player.score');
        console.log(score, player.score);
        if (player.combo === 1) {
            player.combo++;
        } else {
            player.combo *= 2;
        }
    }else {
        player.combo = 1;
    }
    score.innerText = player.score;
    if(pause) {
        score.style.color = 'red';
    }else {
        score.style.color = 'white';
    }
};

const colors = [
    null,
    'purple',
    'yellow',
    'sienna',
    'deeppink',
    'deepskyblue',
    'red',
    'green',
];

const board = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
    combo: 1,
};

document.addEventListener('keydown', e => {
    if(pause) return;

    if(e.key === 'ArrowRight'){
        playerMove(1);
    } else if (e.key === 'ArrowLeft'){
        playerMove(-1);
    } else if (e.key === 'ArrowDown'){
        playerDrop();
    } else if (e.key ==='ArrowUp'){
        playerHardDrop();
    } else if (e.key === 'q' || e.key === 'Q'){
        playerRotate(-1);
    } else if (e.key === 'w' || e.key === 'W'){
        playerRotate(1);
    }
});

const resetGame = () => {
    board.forEach(row => row.fill(0));
    document.getElementById('play').style.display = '';
    updateScore();
}

const play = () => {
    pause = false;
    player.score = 0;
    updateScore();
    document.getElementById('play').style.display = 'none';
    update();
}
playerReset();
draw();
updateScore();
