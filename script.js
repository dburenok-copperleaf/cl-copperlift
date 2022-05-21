import { defaultParams } from './constants.js';

const {
  HEIGHT,
  WIDTH,
  NUM_FLOORS,
  FLOOR_SIZE,
  ELEVATOR_X_POSITION,
  FLOOR_POSITION,
  TICK_SPEED,
  STARTING_FLOOR,
} = defaultParams;


// setup app state
const appState = {
  mode: 'Interactive Mode',
};

// setting up HTML Canvas
const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");

// listen for button presses
['call1', 'call2', 'call3', 'call4',
  // 'floor1', 'floor2', 'floor3', 'floor4'
]
  .map((id) => document.getElementById(id).addEventListener('click', handleCallClick));

document.getElementById('modeToggle').addEventListener('change', function() {
  if (this.checked) {
    appState.mode = 'Simulation Mode';
  } else {
    appState.mode = 'Interactive Mode';
  }
  document.getElementById('modeText').innerText = appState.mode;
  updateHTMLElements();
});


// setup drawing preferences
ctx.lineWidth = 1;


// setup initial elevator state
const elevatorState = {
  yPos: floorToYCoordinate(STARTING_FLOOR),
  goalYPos: floorToYCoordinate(STARTING_FLOOR),
  status: 'idle', // idle / pickingUp / delivering
  currentRequest: undefined,
  distanceTravelled: 0,
  customersServed: 0,
};

let requestQueue = [
  {
    startFloor: 0,
    targetFloor: 1,
  },
  {
    startFloor: 0,
    targetFloor: 2,
  },
  {
    startFloor: 3,
    targetFloor: 1,
  },
  {
    startFloor: 2,
    targetFloor: 0,
  },
];

document.getElementById('generate').addEventListener('click', () => {
  console.log('Generating requests...');
  requestQueue = [...requestQueue, ...Array(5)].map(() => {
    return {
      startFloor: Math.round(Math.random() * (NUM_FLOORS - 1)),
      targetFloor: Math.round(Math.random() * (NUM_FLOORS - 1)),
    }
  });
});

// run the app
mainLoop();


function mainLoop() {
  window.setTimeout(mainLoop, TICK_SPEED);
  draw();
}


function draw() {
  drawBackground();
  updateElevatorState();
  updateHTMLStats();
  drawElevator();
};


// Do the logic of where the elevator is/should move to
function updateElevatorState() {
  if (appState.mode === 'Interactive Mode') {
    // interactive mode logic
    if (elevatorState.yPos === elevatorState.goalYPos) {
      console.log("Arrived!");
    } else if (elevatorState.yPos < elevatorState.goalYPos) {
      elevatorState.yPos++;
      elevatorState.distanceTravelled++;
    } else {
      elevatorState.yPos--;
      elevatorState.distanceTravelled++;
    }
  } else {
    console.log('status:', elevatorState.status);

    // simulation mode logic
    if (elevatorState.status === 'delivering') {

      // console.log('currentRequest:', elevatorState.currentRequest);

      // keep moving current customer to goal 
      const yPos = floorToYCoordinate(elevatorState.currentRequest.targetFloor);
      elevatorState.goalYPos = yPos;
      if (elevatorState.yPos === elevatorState.goalYPos) {
        console.log("Dropped off customer!");
        elevatorState.status = 'idle';
        elevatorState.currentRequest = undefined;
        elevatorState.customersServed++;
      } else if (elevatorState.yPos < elevatorState.goalYPos) {
        elevatorState.yPos++;
        elevatorState.distanceTravelled++;
      } else {
        elevatorState.yPos--;
        elevatorState.distanceTravelled++;
      }

    } else if (elevatorState.status === 'pickingUp') {

      // pick up customer
      const yPos = floorToYCoordinate(elevatorState.currentRequest.startFloor);
      elevatorState.goalYPos = yPos;
      if (elevatorState.yPos === elevatorState.goalYPos) {
        console.log("Picked up customer!");
        elevatorState.status = 'delivering';
      } else if (elevatorState.yPos < elevatorState.goalYPos) {
        elevatorState.yPos++;
        elevatorState.distanceTravelled++;
      } else {
        elevatorState.yPos--;
        elevatorState.distanceTravelled++;
      }

    } else {

      if (requestQueue.length) {
        elevatorState.currentRequest = requestQueue.shift();
        elevatorState.status = 'pickingUp';
      }

    }
  }
}

function updateHTMLStats() {
  if (appState.mode === 'Simulation Mode') {
    document.getElementById('currentRequest').innerText = elevatorState.currentRequest
      ? `Person at ${elevatorState.currentRequest.startFloor} wants to go to ${elevatorState.currentRequest.targetFloor}`
      : 'No work left!';

    document.getElementById('currentRequests').innerHTML = requestQueue.map((request) => {
      return `<li>Person at ${request.startFloor} wants to go to ${request.targetFloor}</li>`
    }).join('');
  }

  document.getElementById('distanceTravelled').innerText = Math.round(elevatorState.distanceTravelled / 30 * 100) / 100;

  document.getElementById('customersServed').innerText = elevatorState.customersServed;
  
  // document.getElementById('distancePerSmile').innerText = elevatorState.distanceTravelled / elevatorState.customersServed / 30;
}

// Draw the elevator using its state for position
function drawElevator() {
  ctx.beginPath();
  ctx.arc(
    ELEVATOR_X_POSITION,
    elevatorState.yPos,
    FLOOR_SIZE / 2,
    0,
    2 * Math.PI,
  );
  ctx.stroke();
}


function floorToYCoordinate(floor) {
  const flippedFloor = (NUM_FLOORS - 1) - floor;
  const offset = FLOOR_SIZE / 2;
  return offset + flippedFloor * FLOOR_SIZE;
}


function drawBackground() {
  eraseCanvas();
  setupFloors();
  makeWindows();
  // createSimon();
}

function createSimon() {
  ctx.beginPath();
  ctx.arc(
    FLOOR_POSITION - 100, FLOOR_SIZE + 45,
    FLOOR_SIZE / 5,
    0,
    2 * Math.PI,
  );
  ctx.moveTo(FLOOR_POSITION - 100, FLOOR_SIZE + 45 + FLOOR_SIZE / 2);
  ctx.lineTo(FLOOR_POSITION - 100, FLOOR_SIZE + 45 + FLOOR_SIZE / 5);

  ctx.moveTo(0, FLOOR_SIZE + 45 + FLOOR_SIZE / 5);
  ctx.moveTo(FLOOR_POSITION, FLOOR_SIZE + 45 + FLOOR_SIZE / 2);
  ctx.stroke();
}


function setupFloors() {
  for (let i = 0; i < NUM_FLOORS; i++) {
    // 3 steps to draw with Canvas:

    // (1) begin drawing
    ctx.beginPath();
    // (2) tell canvas which shape you wanna draw (rect, circle, etc)
    ctx.rect(FLOOR_POSITION, i * FLOOR_SIZE, FLOOR_SIZE, FLOOR_SIZE);
    // (3) "show the shape"
    ctx.stroke();
  }
}

function makeWindows() {
  for (let i = 0; i < NUM_FLOORS; i++) {
    ctx.beginPath();
    ctx.moveTo(FLOOR_POSITION, i * FLOOR_SIZE);
    ctx.lineTo(0, i * FLOOR_SIZE)
    ctx.moveTo(FLOOR_POSITION / 2, i * FLOOR_SIZE + 30);
    ctx.fillStyle = "#add8e6";
    ctx.fillRect(FLOOR_POSITION / 2, i * FLOOR_SIZE + 30, FLOOR_SIZE / 2, FLOOR_SIZE / 2);
    ctx.moveTo(FLOOR_POSITION / 2, i * FLOOR_SIZE + 30);
    ctx.fillRect(FLOOR_POSITION / 7, i * FLOOR_SIZE + 30, FLOOR_SIZE / 2, FLOOR_SIZE / 2);
    ctx.stroke();
  }
}



// util functions
function eraseCanvas() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}


function handleCallClick(e) {
  const callFloor = parseInt(e.target.id.slice(4)) - 1;
  elevatorState.goalYPos = floorToYCoordinate(callFloor);
}

function updateHTMLElements() {
  if (appState.mode === 'Simulation Mode') {
    return;
  } else {
    return;
  }
}