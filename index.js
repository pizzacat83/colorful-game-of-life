const ctx = document.getElementById('canvas').getContext('2d');

const [width, height] = [64, 48];
const cellSize = 10;

let cells = JSON.parse(JSON.stringify(Array(width).fill(Array(height).fill(Array(4).fill()))));

const drawCell = (x, y, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
};

const drawCells = () => {
  ctx.fillStyle = '#888888';
  ctx.fillRect(0, 0, width*cellSize, height*cellSize);
  for (let x=0; x<width; ++x) {
    for (let y=0; y<height; ++y) {
      drawCell(x, y, `rgba(${cells[x][y].slice(0,3).map(t => t*255).join(',')}, ${cells[x][y][3]})`);
    }
  }
  document.getElementById('generation').innerText = generation;
};

let generation = 0;
let history = [];

const init = () => {
  generation = 0;
  history = [];
  for (let x=0; x<width; ++x) {
    for (let y=0; y<height; ++y) {
      cells[x][y] = cells[x][y].map(() => Math.floor(Math.random()*2));
    }
  }
  drawCells();
};

const choose = l => l[Math.floor(Math.random()*l.length)];

const deepcopy = x => JSON.parse(JSON.stringify(x));

const get = (l, i) => l[(i%l.length+l.length)%l.length];

const step = () => {
  generation += 1;
  const next = deepcopy(cells);
  const count = new Array(8).fill(0);
  for (let x=0; x<width; ++x) {
    for (let y=0; y<height; ++y) {
      if (cells[x][y][3]) {
        count[cells[x][y].slice(0,3).reduce((x, y) => x*2+y)] += 1;
      }
      const alive = [];
      for (let dx=-1; dx<=1; ++dx) {
        for (let dy=-1; dy<=1; ++dy) {
          if (get(get(cells, x+dx), y+dy)[3]) {
            alive.push([dx, dy]);
          }
        }
      }
      const sum = alive.length - cells[x][y][3];
      if (sum == 3) {
        // alive
        const [dx, dy] = choose(alive);
        next[x][y] = get(get(cells, x+dx), y+dy);
      } else if (sum == 2 && cells[x][y][3]) {
        // alive
        const [dx, dy] = choose(alive);
        next[x][y] = get(get(cells, x+dx), y+dy);
      } else {
        // dead
        next[x][y] = [0, 0, 0, 0];
      }
    }
  }
  cells = next;
  history.push(count);
};

let interval = null;

const start = () => {
  if (!interval) {
    interval = setInterval(() => {
      step();
      drawCells();
    }, 20);
  }
};

const pause = () => {
  clearInterval(interval);
  interval = null;
};

const download = () => {
  const objectURL = window.URL.createObjectURL(new Blob([JSON.stringify(history)]));
  const button = document.getElementById('download');
  button.download = 'gol.json';
  button.href = objectURL;
};

init();