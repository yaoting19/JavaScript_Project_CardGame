//Activate functions when hitting start button
let click = true;
let deckScore;
let score = 0; //Original Score
let correct = 0; //Correct Cards
let current = 0; //Current Card
let skipped = 0; //Skip Time
async function start() {
    if(document.getElementsByName('deck')[0].checked) {
        console.log(document.getElementsByName('deck')[0].value);
        await fullDeck();
        deckScore = 'fullDeck';
    } else if (document.getElementsByName('deck')[1].checked) {
        console.log(document.getElementsByName('deck')[1].value);
        await heartDeck();
        deckScore = 'heartDeck';
    }
    await drawCard();
    if (click) {
        document.getElementById('start').style.backgroundColor = 'grey';
        document.getElementById('start').disabled = true;
        backToZero();
    }
}
//Create Full Deck
let deck_id;
let remaining;
async function fullDeck(){
    await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
    .then(res => res.json())
    .then(full => {
        console.log(full.deck_id);
        deck_id = full.deck_id;
        remaining = full.remaining;
    })
}
//Create Heart Deck
async function heartDeck() {
    await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?cards=AH,2H,3H,4H,5H,6H,7H,8H,9H,0H,JH,QH,KH')
    .then(res => res.json())
    .then(heart => {
        console.log(heart.deck_id);
        deck_id = heart.deck_id;
        remaining = heart.remaining;
    })
    .catch(error => console.log(error));
}
//Draw Cards & Show
async function drawCard() {
    await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${remaining}`)
    .then(res => res.json())
    .then(data => {
        console.log(data);
        showCard(data.cards[0].image);
        document.getElementById('higher').onclick = function() {higher(data)};
        document.getElementById('lower').onclick = function() {lower(data)};
        document.getElementById('skip').onclick = function() {skip(data)}
        document.getElementById('hint').onclick = function() {
            hint(data);
            alert(`The chances of next card being higher is ${higherChance.toFixed(2)}%
The chances of next card being lower is ${lowerChance.toFixed(2)}%`);
            //Did line 59 on purpose, for alert message alignment
        }
    })
}
//Display Card Function
function showCard(pic) {
    return document.getElementById('img').innerHTML = `<img src=${pic}></img>`
}
//Reset All Counting
function backToZero() {
    score = 0; //Reset Original Score
    correct = 0; //Reset Correct Cards
    current = 0; //Reset Current Card
    skipped = 0; //Reset Skip Time
    document.getElementById('score').innerHTML = `Score:${score}`;
}
//Reset Start Button (Also save the highest score)
let fullHighest = 0;
let heartHighest = 0;
function restart() {
    document.getElementById('start').style.backgroundColor = 'beige';
    document.getElementById('start').disabled = false;
    if (deckScore === 'fullDeck' && score > fullHighest) {
        fullHighest = score;
        document.getElementById('fullHighest').innerHTML = fullHighest;
        document.getElementById('fullGuess').innerHTML = correct;
        document.getElementById('fullDate').innerHTML = recordDate();
        Fstorage(fullHighest,correct,recordDate());
    } else if (deckScore === 'heartDeck' && score > heartHighest) {
        heartHighest = score;
        document.getElementById('heartHighest').innerHTML = heartHighest;
        document.getElementById('heartGuess').innerHTML = correct;
        document.getElementById('heartDate').innerHTML = recordDate();
        Hstorage(heartHighest,correct,recordDate());
    }
}
//Quit Button
function quit() {
    alert(`Congratulations QUITTER! You've got ${correct} cards correct!`);
    restart();
}
//Skip Button
async function skip(c1) {
    skipped++;
    current++;
    if (c1.cards[current+1] === undefined && score!==0 && skipped !==0) {
        showCard(c1.cards[current].image);
        alert(`You won! But don't think I didn't know you skipped ${skipped} times!`);
        restart();
    } else if (c1.cards[current+1] === undefined && score===0 && skipped!==0) {
        showCard(c1.cards[current].image);
        alert('This is not how you play! You skipped everything!');
        restart();
    } 
    else {
        showCard(c1.cards[current].image);
    }
}
//Correct the order
let order = ['ACE','2','3','4','5','6','7','8','9','10','JACK','QUEEN','KING']
//Higher Button
function higher(c1) {
    let a = c1.cards[current].value;
    let b = c1.cards[current+1].value;
    if (order.indexOf(a) < order.indexOf(b)) {
        hint(c1);
        scoreScheme();
        correct++;
        current++;
        document.getElementById('score').innerHTML = `Score:${score}`;
        showCard(c1.cards[current].image);
        if (c1.cards[current+1] === undefined) {
            alert(`Congratulations! You have won the game!`)
            restart();
        }
        return [score, current];
    } else {
        alert(`Sorry, game over! You got ${correct} cards correct!`);
        restart();
    }    
}
//Lower Button
function lower(c1) {
    let a = c1.cards[current].value;
    let b = c1.cards[current+1].value;
    if (order.indexOf(a) > order.indexOf(b)) {
        hint(c1);
        scoreScheme();
        correct++;
        current++;
        document.getElementById('score').innerHTML = `Score:${score}`;
        showCard(c1.cards[current].image);
        if (c1.cards[current+1] === undefined) {
            alert(`Congratulations! You have won the game!`)
            restart();
        }
        return [score, current];
    } else {
        alert(`Sorry, game over! You got ${correct} cards correct!`);
        restart();
    }
}
//Hint Button
let higherChance;
let lowerChance;
async function hint(c1) {
    higherChance = 0;
    lowerChance = 0;
    for(let i=current+1; i<c1.cards.length; i++){
        let a = c1.cards[current].value;
        let b = c1.cards[i].value;
        if (order.indexOf(a) < order.indexOf(b)) {
            higherChance++;
        } else if (order.indexOf(a) > order.indexOf(b)) {
            lowerChance++;
        }
    }
    higherChance = higherChance/(c1.cards.length-(current+1))*100;
    lowerChance = lowerChance/(c1.cards.length-(current+1))*100;
}
//Scoring Scheme
function scoreScheme() {
    if (Math.abs(higherChance-lowerChance)<=25){
        score = score+40;
    } else if ((Math.abs(higherChance-lowerChance)>25 && (Math.abs(higherChance-lowerChance)<=50))) {
        score = score+30;
    } else if ((Math.abs(higherChance-lowerChance)>50 && (Math.abs(higherChance-lowerChance)<=75))) {
        score = score+20;
    } else if ((Math.abs(higherChance-lowerChance)>75)) {
        score = score+10;
    }
}
//Record Date
function recordDate() {
    let date = new Date();
    date = `${date.getFullYear()}-0${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    return date;
}
//Store Full Deck Record
function Fstorage(FScore, FGuess, FDate) {
    localStorage.setItem('Fscore', FScore);
    localStorage.setItem('Fguess', FGuess);
    localStorage.setItem('Ftime', FDate);
}
//Store Heart Deck Record
function Hstorage(HScore, HGuess, HDate) {
    localStorage.setItem('Hscore', HScore);
    localStorage.setItem('Hguess', HGuess);
    localStorage.setItem('Htime', HDate);
}
//Keep Full Record on the Webpage
function keepFRecord() {
    if (localStorage.getItem('Fscore') !== null) {
        fullHighest = localStorage.getItem('Fscore') 
        document.getElementById('fullHighest').innerHTML = localStorage.getItem('Fscore');
        document.getElementById('fullGuess').innerHTML = localStorage.getItem('Fguess');
        document.getElementById('fullDate').innerHTML = localStorage.getItem('Ftime');        
    }
}
//Keep Heart Record on the Webpage
function keepHRecord() {
    if (localStorage.getItem('Hscore') !== null) {
        heartHighest = localStorage.getItem('Hscore')
        document.getElementById('heartHighest').innerHTML = localStorage.getItem('Hscore');
        document.getElementById('heartGuess').innerHTML = localStorage.getItem('Hguess');
        document.getElementById('heartDate').innerHTML = localStorage.getItem('Htime');        
    }
}
//Load the record once the webpage is reloaded
window.onload = function() {
    keepHRecord();
    keepFRecord();
}