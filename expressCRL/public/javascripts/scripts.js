$('document').ready(function() {
    renderExistingSwimlanes();

    $('button').on('click', function() {
        var swimlaneName = prompt('New swimlane name');
            if(swimlaneName == null){
                return null;
            } 
           

        var id = getNewId();
        drawSwimlane(id, swimlaneName);
        saveSwimlane({id: id, name: swimlaneName});   
    });
});

var newSwimlane;


function renderExistingSwimlanes() {
    $.ajax({
            method: "GET",
            url: "http://localhost:8080/swimlanes",

        })
        .done(function(swimlanes) {
            console.log(swimlanes);

            for (var i = 0; i < swimlanes.length; i++) {
                var swimlane = swimlanes[i];
                drawSwimlane(swimlane.id, swimlane.name);
                
                // Get cards for swimlane by swimlaneID
                renderExistingCards(swimlane.id);
            }
        });
}

function renderExistingCards(swimlaneId) {
    $.ajax({
            method: "GET",
            url: 'http://localhost:8080/swimlanes/' + swimlaneId + '/cards',

        })
        .done(function(cards) {
            console.log(cards);

            for (var i = 0; i < cards.length; i++) {
                drawCard(cards[i].id, swimlaneId, cards[i].name, cards[i].cardDescription);
            }
        });
}

function getNewId(){
    var date = new Date();
    var id = date.getTime();

    console.log(id);

    return id;
}

function drawSwimlane(id, name) {
	newSwimlane = $('<div id="' + id +'" class="swimlane"></div>');

    moveSwimlanes(id, name, newSwimlane);

   
    var swimlaneHeader = $('<div class="swimlaneHeader">' + name + '</div>');
    newSwimlane.append(swimlaneHeader);

    var buttons = $('<div class="buttons"><i class="fas fa-trash-alt icons"></i><i class="fas fa-pencil-alt icons"></i><i class="fas fa-plus icons"></i></div>');
    newSwimlane.append(buttons);

    buttons.on('click', '.fa-trash-alt', function() {
        $(this).closest('.swimlane').remove();

    });    

    buttons.on('click', '.fa-pencil-alt', function() {
        var newName = prompt('New swimlane name');
        swimlaneHeader.text(newName);
        updateSwimlane(id, newName);
    });

    buttons.on('click', '.fa-plus', function() {
        var cardHeader = prompt('New card name');
            if(cardHeader == null){
                return null;
            } 
        var cardDescription = prompt('Card description required');
            if(cardDescription == null){
                return null;
            } 
        
        var cardId = getNewId();
        drawCard(cardId, id, cardHeader, cardDescription, newSwimlane);       
        saveCard({id: cardId, swimlane_id: id, name: cardHeader, cardDescription: cardDescription});
    })

    $('#swimlanes').append(newSwimlane);
}

function moveSwimlanes(id, name, newSwimlane){

     newSwimlane.draggable({
        start: function() {
            $(this).css("zIndex", 100);
        }
    });
    newSwimlane.droppable({
        drop: function(event, ui) {
            var otherSwimlane = ui.draggable;
            var thisSwimlane = $(this);

            otherSwimlane.detach().css({top: 0,left: 0});
            otherSwimlane.insertBefore(thisSwimlane);
            otherSwimlane.css("zIndex", 0).appendTo("#swimlanes");
        }
    });

}

function drawCard(cardId, swimlaneId, name, cardDescription, newSwimlane) {
	
    	var card = $('<div id="' + cardId +'" class="card"></div>');

        
        card.draggable({
             start: function() {
            $(this).css("zIndex", 100);
            }
        });
        card.droppable({
            drop: function(event, ui) {
                var otherCard = ui.draggable;
                var thisCard = $(this);

                otherCard.detach().css({top: 0, left: 0});
                
                otherCard.insertAfter(thisCard).appendTo("#" + swimlaneId);
                otherCard.css("zIndex", 0);
            }
        });

        var cardHeader = $('<div class="cardHeader">' + name + '</div>');
        card.append(cardHeader);

        var cardButtons = card.append('<div class="buttons"><i class="fas fa-trash-alt icons"></i><i class="fas fa-pencil-alt pencil_card icons"></i></div>');
        
        var cardDescription = $('<div class="cardDescription">' + cardDescription +'</div>');
        card.append(cardDescription);

        $("#"+ swimlaneId).append(card);

        cardButtons.on('click', '.fa-trash-alt', function() {
            $(this).closest('.card').remove();
        });

        cardButtons.on('click', '.pencil_card', function() {
             var newCardName = prompt('New card name');
            cardHeader.text(newCardName);

              updateCard(cardId, newCardName);
        });

        cardDescription.on('click', function(){
            var newCardDescription = prompt("New card description");
            cardDescription.text(newCardDescription);

            updateCardDescription(cardId, newCardDescription);

        })
    }

function saveSwimlane(swimlane) {
    $.ajax({
            method: "POST",
            url: "http://localhost:8080/swimlanes",
            data: swimlane
        })
        .done(function(swimlane) {
            alert("Swimlane Saved: " + swimlane);
        });
}

function updateSwimlane(id, name){
    $.ajax({
            method: "POST",
            url: "http://localhost:8080/swimlanes/" + id,
            data: {name: name}
        })
        .done(function(swimlane) {
            alert("Swimlane Updated: " + swimlane);
        });
}

function updateCard(id, name){
    $.ajax({
            method: "POST",
            url: "http://localhost:8080/swimlanes/cards/" + id,
            data: {name: name}
        })
        .done(function(card) {
            alert("Card Updated: " + card);
        });
}

function updateCardDescription(id, cardDescription){
    $.ajax({
            method: "POST",
            url: "http://localhost:8080/swimlanes/cards/" + id,
            data: {cardDescription: cardDescription}
        })
        .done(function(card) {
            alert("Card description Updated: " + card);
        });
}

function saveCard(card) {
    $.ajax({
            method: "POST",
            url: "http://localhost:8080/cards",
            data: card
        })
        .done(function(card) {
            alert("Card Saved: " + card);
        });
}