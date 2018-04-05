$('document').ready(function() {
    renderExistingBoards();

    $('#addboardbutton').on('click', function() {
        var boardName = prompt('New  board name');
        if (boardName == null) {
            return null;
        }

        var id = getNewId();
        drawBoard(id, boardName);
        saveBoard({ id: id, name: boardName });
    });
});

var newBoard;

function renderExistingBoards() {
    $.ajax({
            method: "GET",
            url: "http://localhost:8080/boards",

        })
        .done(function(boards) {
            console.log(boards);

            for (var i = 0; i < boards.length; i++) {
                var board = boards[i];
                drawBoard(board.id, board.name);
            }
        });
}

function getNewId() {
    var date = new Date();
    var id = date.getTime();

    console.log(id);

    return id;
}

function drawBoard(id, name) {
    newBoard = $('<div id="' + id + '" class="board"></div>');

    moveBoards(id, name, newBoard);


    var boardHeader = $('<div class="boardHeader">' + name + '</div>');
    newBoard.append(boardHeader);

    var buttons = $('<div class="buttonshomepage"><i class="fas fa-trash-alt icons"></i><i class="fas fa-pencil-alt icons"></i></div>');
    newBoard.append(buttons);

    buttons.on('click', '.fa-trash-alt', function() {
        var deleteBoard = confirm('Are you sure you want to delete this board it may contain swimlanes and cards?');

        if (deleteBoard == false) {
            return null;
        }
        $(this).closest('.board').remove();
    });

    buttons.on('click', '.fa-pencil-alt', function() {
        var newName = prompt('New board name');
        if (newName == null) {
            return null;
        }
        boardHeader.text(newName);
        updateBoard(id, newName);
    });

    $('#boards').append(newBoard);


}


function moveBoards(id, name, newBoard) {

    newBoard.draggable({
        start: function() {
            $(this).css("zIndex", 100);
        }
    });
    newBoard.droppable({
        drop: function(event, ui) {
            var otherBoard = ui.draggable;
            var thisBoard = $(this);

            otherBoard.detach().css({ top: 0, left: 0 });
            otherBoard.insertBefore(thisBoard);
            otherBoard.css("zIndex", 0).appendTo("#boards");
        }
    });

}

function saveBoard(board) {
    $.ajax({
            method: "POST",
            url: "http://localhost:8080/boards",
            data: board
        })
        .done(function(board) {
            alert("Board Saved: " + board);
        });
}

function updateBoard(id, name) {
    $.ajax({
            method: "POST",
            url: "http://localhost:8080/boards/" + id,
            data: { name: name }
        })
        .done(function(board) {
            alert("Board Updated: " + board);
        });
}