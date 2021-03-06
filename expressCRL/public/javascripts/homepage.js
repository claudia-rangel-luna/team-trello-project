var userId;
// var username;
$('document').ready(function() {
    userId = getUrlVars()['id'];
    // username = getUrlVars()['nickname'];
    console.log(userId);

    renderExistingBoards(userId);
    // renderUsername(username);

    $('#addboardbutton').on('click', function() {
        console.log('Button clicked');
        var boardName = prompt('New  board name');
            if (boardName == null) {
                return null;
            }

            var trimmedBoardTitle = boardName.trim();
            if(trimmedBoardTitle === ""){
                return;
            }
            
        var id = getNewId();
        drawBoard(id, boardName);
        saveBoard(userId, { id: id, name: boardName });
    });
        
});

var newBoard;
// function renderUsername(username){
//     $('.homepagetitlebox').append('<h2 class="homepagetitle">'+ username +', Welcome to your Home Page!</h2>');
// }

function renderExistingBoards(userId, username) {
    $.ajax({
            method: "GET",
            url: "http://localhost:8080/users/" + userId + "/boards",

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
    var newBoard = $('<div id="' + id + '" class="board"></div>');

    moveBoards(id, name, newBoard);


    var boardHeader = $('<div class="boardHeader">' + name + '</div>');
    newBoard.append(boardHeader);

    var buttons = $('<div class="buttonshomepage"><i class="fas fa-trash-alt icons hpbtn"></i><i class="fas fa-pencil-alt icons hpbtn"></i></div>');
    newBoard.append(buttons);

    buttons.on('click', '.fa-trash-alt', function(e) {
        e.stopPropagation();

        var deleteBoard = confirm('Are you sure you want to delete this board it may contain swimlanes and cards?');

        if (deleteBoard == false) {
            return null;
        }
        $(this).closest('.board').remove();
        removeBoard(id);
    });

    buttons.on('click', '.fa-pencil-alt', function(e) {
        e.stopPropagation();

        var newName = prompt('New board name');
        if (newName == null) {
            return null;
        }

        var trimmedBoardName = newName.trim();
            if(trimmedBoardName === ""){
                return;
            }

        boardHeader.text(newName);
        updateBoard(id, newName);
    });

    newBoard.on('click', function(){
        window.location.href='/swimlanes?id=' + id;
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

function removeBoard(id){
    $.ajax({
            method: "DELETE",
            url: "http://localhost:8080/users/boards/" + id
        })
        .done(function(board) {
            alert("Board deleted: " + board);
        });
}

function saveBoard(userId, board) {
    $.ajax({
            method: "POST",
            url: "http://localhost:8080/users/" + userId + "/boards" ,
            data: board
        })
        .done(function(board) {
            alert("Board Saved: " + board);
        });
}

function updateBoard(id, name) {
    $.ajax({
            method: "POST",
            url: "http://localhost:8080/users/boards/" + id,
            data: { name: name }
        })
        .done(function(board) {
            alert("Board Updated: " + board);
        });
}

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}