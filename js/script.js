if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js')
        .then(()=>console.log('registered SW'))
        .catch(()=>console.log('didn\'t register SW'))
}

const fieldEl = document.getElementById('field')
const menuEl = document.getElementById('menu')
const newBtn = document.getElementById('new')
const flagCountEl = document.getElementById('bomb')
const digBtn = document.getElementById('flag-dig')

var firstClick = true
var flagging = false
var width = 15
var height = 25
var level = 0
var bombProportion = [0.05,.1,.15,.2,.3]
var currBombs = 0
var usedFlags = 0
var colors = ['#000','#04c','#0c4','#c40','#84c','#fc4','#4fc','#ff0']
var iBomb = '<i class="fa-solid fa-bomb"></i>'.repeat(level+1) 

newGame()

digBtn.addEventListener('click',()=>{
    flagging = !flagging
    digBtn.innerHTML = flagging ? `<i class="fa-solid fa-flag"></i>` : `<i class="fa-solid fa-spoon"></i>`
    if(flagging) digBtn.classList.remove('dig')
    else digBtn.classList.add('dig')
})

newBtn.addEventListener('click',()=>{
    newGame()
})

flagCountEl.addEventListener('click',()=>{
    level = (level+1)%bombProportion.length
    var iBomb = '<i class="fa-solid fa-bomb"></i>'.repeat(level+1)
    currBombs = Math.floor(width*height*bombProportion[level])
    usedFlags = currBombs
    flagCountEl.innerHTML = iBomb + ' ' + usedFlags
})

//https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
const sleep = ms => new Promise(r => setTimeout(r, ms));

function newGame() {
    firstClick = true
    usedFlags = 0
    let board = []
    currBombs = Math.floor(width*height*bombProportion[level])
    usedFlags = currBombs
    iBomb = '<i class="fa-solid fa-bomb"></i>'.repeat(level+1) 
    flagCountEl.innerHTML = iBomb + ' ' + usedFlags

    fieldEl.innerHTML = ''
    fieldEl.style.aspectRatio = width/height
    //create board and cell elements
    for (let y = 0; y < height; y++) {
        board[y] = []

        let rowEl = document.createElement('div')
        rowEl.classList.add('row')
        for (let x = 0; x < width; x++) {
            board[y][x] = ''

            let cellEl = document.createElement('div')
            cellEl.classList.add('cell')
            cellEl.classList.add('x'+x+'y'+y)
            cellEl.classList.add('grass'+(x+y)%2)

            cellEl.addEventListener('click',()=>{clickCell(x,y,board)})

            cellEl.innerText = ''
            rowEl.appendChild(cellEl)
        }
        fieldEl.appendChild(rowEl)
    }
}

function placeBombs(board) {
    //create bombs based on difficulty
    for (let b = 0; b < currBombs; b++) {
        let randX = Math.floor(Math.random()*width)
        let randY = Math.floor(Math.random()*height)
        if(board[randY][randX]=='b'||board[randY][randX]=='_') b--
        else {
            board[randY][randX] =  'b'
            let cell = fieldEl.querySelector('.x'+randX+'y'+randY)
            if(cell) cell.classList.add('b')
        }
    }
}

function updateBoard(board) {
    //update board numbers
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            //count bomb neighbors
            let nBors = 0
            for (let j = -1+(y<=0); j <= 1-(y>=height-1); j++) {
                for (let i = -1+(x<=0); i <= 1-(x>=width-1); i++) {
                    if(board[y+j][x+i]=='b') nBors++
                }
            }
            if(board[y][x]!='b') board[y][x] = '' + nBors
            let cell = fieldEl.querySelector('.x'+x+'y'+y)
            if(cell) cell.classList.add('n'+nBors)
        }
    }
}

async function clickCell(x,y,board) {
    let cellEl = fieldEl.querySelector('.x'+x+'y'+y)
    if(cellEl==undefined) return
    let dug = cellEl.classList.contains('dug0') || cellEl.classList.contains('dug1')
    if(dug) return

    if(firstClick) {
        board[y][x] = '_'
        placeBombs(board)
        updateBoard(board)
        firstClick = false
        console.table(board)
    }

    cellEl.classList.add('dug'+(x+y)%2)

    let num = board[y][x]
    //if flagging in covered spot
    if(flagging) {
        cellEl.classList.remove('dug'+(x+y)%2)
        cellEl.style.color = '#f20'

        //if cell is not flagged
        if(cellEl.innerHTML != `<i class="fa-solid fa-flag"></i>`){
            cellEl.innerHTML = `<i class="fa-solid fa-flag"></i>`
            usedFlags--
            currBombs -= (num=='b')
        }
        else {
            cellEl.innerHTML = ''
            usedFlags++
            currBombs += (num=='b')
        }
        flagCountEl.innerHTML = iBomb + ' ' + usedFlags
    }
    else {
        switch(num) {
            case '0':
                digNear(x,y,board)
                updateBoard(board)
                break
            case ' ':
                break
            case 'b': 
                cellEl.classList.remove('dug'+(x+y)%2)
                cellEl.innerHTML = `<i class="fa-solid fa-bomb"></i>`
                
                showBomb()
                break
            default: 
                cellEl.innerHTML = num
                cellEl.style.color = colors[num]
                break
        }
    }
    if(usedFlags==0 && currBombs==0) {
        showBomb('win')
    }
}

async function showBomb(win) {
    let bomb = fieldEl.querySelector('.b')
    if(bomb==null&&win!='win') {
        setTimeout(newGame,3000)
        return
    }
    bomb.innerHTML = `<i class="fa-solid fa-bomb"></i>`
    if(win=='win') {
        let randC = Math.floor(Math.random()*colors.length-1)
        bomb.style.color = colors[randC]
    }
    bomb.classList.remove('b')
    await sleep(100)
    win=='win' ? showBomb('win') : showBomb()
}

function digNear(x,y,board) {
    board[y][x] = ' '
    for (let j = -1+(y<=0); j <= 1-(y>=height-1); j++) {
        for (let i = -1+(x<=0); i <= 1-(x>=width-1); i++) {
            if(board[y+j][x+i]=='0') digNear(x+i,y+j,board)
            else {
                let cellEl = fieldEl.querySelector('.x'+(x+i)+'y'+(y+j))
                cellEl.classList.add('dug'+(x+i+y+j)%2)
                let num = board[y+j][x+i]
                cellEl.innerHTML = num=='0' ? '' : num
                cellEl.style.color = colors[num]
            }
        }
    }
}
