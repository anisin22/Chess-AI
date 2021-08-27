var board = null
var game = new Chess()
var $status = $('#status')
var depth = 3;
function UpdatedDifficulty(){
  var dept = document.getElementById('search-depth')
  depth = dept.options[dept.selectedIndex].value; 
  var result = dept.options[dept.selectedIndex].text;
  let output = 'Current Difficulty: ' + result
  document.getElementById("result").innerHTML = output
}


function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over.
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

var evaluateBoard = function(board, color) {
  // Sets the value for each piece using standard piece value
  var pieceValue = {
    'p': 100,
    'n': 350,
    'b': 350,
    'r': 525,
    'q': 1000,
    'k': 10000
  };

  // Loop through all pieces on the board and sum up total
  var value = 0;
  board.forEach(function(row) {
    row.forEach(function(piece) {
      if (piece) {
        // Subtract piece value if it is opponent's piece
        value += pieceValue[piece['type']]
                 * (piece['color'] === color ? 1 : -1);
      }
    });
  });

  return value;
};

var calcBestMove = function(depth, game, playerColor,
  alpha=Number.NEGATIVE_INFINITY,
  beta=Number.POSITIVE_INFINITY,
  isMaximizingPlayer=true) {
// Base case: evaluate board
if (depth === 0) {
value = evaluateBoard(game.board(), playerColor);
return [value, null]
}

// Recursive case: search possible moves
var bestMove = null; // best move not set yet
var possibleMoves = game.moves();
// Set random order for possible moves
possibleMoves.sort(function(a, b){return 0.5 - Math.random()});
// Set a default best move value
var bestMoveValue = isMaximizingPlayer ? Number.NEGATIVE_INFINITY
               : Number.POSITIVE_INFINITY;
// Search through all possible moves
for (var i = 0; i < possibleMoves.length; i++) {
var move = possibleMoves[i];
// Make the move, but undo before exiting loop
game.move(move);
// Recursively get the value from this move
value = calcBestMove(depth-1, game, playerColor, alpha, beta, !isMaximizingPlayer)[0];
// Log the value of this move
console.log(isMaximizingPlayer ? 'Max: ' : 'Min: ', depth, move, value,
bestMove, bestMoveValue);

if (isMaximizingPlayer) {
// Look for moves that maximize position
if (value > bestMoveValue) {
bestMoveValue = value;
bestMove = move;
}
alpha = Math.max(alpha, value);
} else {
// Look for moves that minimize position
if (value < bestMoveValue) {
bestMoveValue = value;
bestMove = move;
}
beta = Math.min(beta, value);
}
// Undo previous move
game.undo();
// Check for alpha beta pruning
if (beta <= alpha) {
console.log('Prune', alpha, beta);
break;
}
}
// Log the best move at the current depth
console.log('Depth: ' + depth + ' | Best Move: ' + bestMove + ' | ' + bestMoveValue + ' | A: ' + alpha + ' | B: ' + beta);
// Return the best move, or the only move
return [bestMoveValue, bestMove || possibleMoves[0]];
}

var makeMove = function(skill) {
  // exit if the game is over
  if (game.game_over() === true) {
    console.log('game over');
    return;
  }
  // Calculate the best move, using chosen algorithm
   
    var move = calcBestMove(skill, game, game.turn())[1];
  
  // Make the calculated move
  game.move(move);
  // Update board positions
  board.position(game.fen());
  updateStatus()
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback';

  window.setTimeout(function() {
    makeMove(depth);
    console.log(depth)
  }, 250);

  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $status.html(status)
 
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}

board = Chessboard('board1', config)

updateStatus()




