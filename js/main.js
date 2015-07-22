var id;
var currCard = 0;
var playerTotal = 0;
var dealerTotal = 0;
var blackJack = {};

blackJack.getJSON = function(url, cb) {
    JSONP_PROXY = 'https://jsonp.afeld.me/?url=';
    // THIS WILL ADD THE CROSS ORIGIN HEADERS

    var request = new XMLHttpRequest();

    request.open('GET', JSONP_PROXY + url);

    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            cb(JSON.parse(request.responseText));
        }
    };
    request.send();
};

blackJack.getNewDeck = function() {
    blackJack.getJSON('http://deckofcardsapi.com/api/shuffle/?deck_count=1', function(d) {
        id = d.deck_id;
    });
    return id;
};

blackJack.resetPlayingField = function() {
    currCard = 0;

    $('#game-container-top').empty();
    $('#game-container-bottom').empty();
    $('#hit').removeAttr('enabled');
    $('#stand').removeAttr('enabled');
    $('#deal').removeAttr('disabled');
};

blackJack.dealNewGame = function(startDraw) {
    blackJack.getNewDeck();
    // needs to display and keep track of the cards remaining 
    blackJack.getJSON('http://deckofcardsapi.com/api/draw/' + id + '/?count=' + startDraw, function(d) {
        currCard = 0;
        playerTotal = 0;
        dealerTotal = 0;
        blackJack.resetPlayingField();
        for (var i = 0; i < startDraw - 1; i++) {
            if (i >= 2) {
                if (i === 2) {
                    $('#game-container-bottom').append('<img class = "playing-card" src="http://us.123rf.com/450wm/bobyramone/bobyramone1104/bobyramone110400016/9317966-playing-card-back-side-62x90-mm.jpg">');
                    d.cards[currCard].isPlayerCard = false;
                    currCard++;
                }
                $('#game-container-bottom').append('<img class = "playing-card" src=' + d.cards[currCard].image + '>');
                d.cards[currCard].isPlayerCard = false;
                currCard++;
            } else {
                $('#game-container-top').append('<img class = "playing-card" src=' + d.cards[currCard].image + '>');
                d.cards[currCard].isPlayerCard = true;
                currCard++;
            }
        }
        blackJack.getCardValue(d);
    });
    $('#deal').attr("disabled", true);
    return id;
};

blackJack.hasPlayerBusted = function() {
    if (playerTotal > 21) {
        $('#game-status').html('Game Status: Dealer Wins');
        console.log("The Player Busted");
        // tell the player that they have lost
        // stop the game by disabling the buttons
        $('#hit').attr("disabled", true);
        $('#stand').attr("disabled", true);
        $('#deal').removeAttr("disabled");
        blackJack.resetPlayingField();
    }
};

blackJack.hasDealerBusted = function() {
    if (dealerTotal === 21) {
        $('#game-status').html('Game Status: Dealer Wins');
        console.log("Dealer Wins");
        // tell the player that they have lost
        // stop the game by disabling the buttons
        //$('#hit').attr("disabled", true);
        //$('#stand').attr("disabled", true);
        //$('#deal').removeAttr("disabled");
        blackJack.resetPlayingField();
    }else if (dealerTotal > 21) {
        $('#game-status').html('Game Status: Player Wins');
        console.log("The Dealer Busted");
        blackJack.resetPlayingField();
    }   
};

// reminder what will dealer do when they hit 17

blackJack.getCardValue = function(d) {

    for (var i = 0; i <= d.cards.length - 1; i++) {
        switch (d.cards[i].isPlayerCard) {
            case true:
                switch (d.cards[i].value) {
                    case 'KING':
                        playerTotal += 10;
                        break;
                    case 'JACK':
                        playerTotal += 10;
                        break;
                    case 'QUEEN':
                        playerTotal += 10;
                        break;
                    case 'ACE':
                        if (playerTotal <= 10) {
                            playerTotal += 11;
                        } else {
                            playerTotal += 1;
                        }
                        break;
                    default:
                        var cards = parseInt(d.cards[i].value);
                        playerTotal += cards;
                        break;
                }
                break;
            case false:
                switch (d.cards[i].value) {
                    case 'KING':
                        dealerTotal += 10;
                        break;
                    case 'JACK':
                        dealerTotal += 10;
                        break;
                    case 'QUEEN':
                        dealerTotal += 10;
                        break;
                    case 'ACE':
                        if (dealerTotal <= 10) {
                            dealerTotal += 11;
                        } else {
                            dealerTotal += 1;
                        }
                        break;
                    default:
                        var cards = parseInt(d.cards[i].value);
                        dealerTotal += cards;
                        break;
                }
                break;
                return dealerTotal; 
        }
    }
    $(".top-js-value").html(playerTotal);
    blackJack.hasPlayerBusted();
    debugger;
    blackJack.hasDealerBusted();
};

blackJack.drawCard = function(numOfCardsToDraw, isPlayer) {
    blackJack.getJSON('http://deckofcardsapi.com/api/draw/' + id + '/?count=' + numOfCardsToDraw, function(d) {

        for (var i = 0; i < numOfCardsToDraw; i++) {
            if (isPlayer) {
                $('#game-container-top').append('<img class = "playing-card" src=' + d.cards[0].image + '>');
                d.cards[0].isPlayerCard = isPlayer;
                currCard++;
            }else {
                $('#game-container-bottom').append('<img class = "playing-card" src=' + d.cards[0].image + '>');
                d.cards[0].isPlayerCard = false;
                currCard++;
            }
        }

        blackJack.getCardValue(d);
    });
    return id;
};

$(document).ready(function() {
    blackJack.getNewDeck();
    $('#hit').attr("disabled", true);
    $('#stand').attr("disabled", true);
});

$('#deal').click(function() {
    // deal out the first cards to player and dealer
    blackJack.dealNewGame(4);
    $('#hit').removeAttr("disabled");
    $('#stand').removeAttr("disabled");
    $('#deal').attr("disabled", true);
    // callback: get the value of the initial cards delt
    // blackJack.getCardValue();

});

$('#hit').click(function() {
    blackJack.drawCard(1, true);
});

$('#stand').click(function() {
    // ??? 
    blackJack.hasDealerBusted();
    blackJack.drawCard(1, false);
});