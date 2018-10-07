import * as consts from './constants.js'
import * as initBack from './initBack.js'
import * as front from './front.js'  
import * as sim from './simulate.js'  
import * as sp from './path.js' 
import * as animate from './animate.js'


game()

function game(){
    
    var grid, towers, path, times, gold, lumber, towerString, goldString, lumberString, timer
    var svg = d3.select('body')
        .append('svg')
        .attrs({width: consts.svgWidth, height: consts.svgHeight});

    [towerString, goldString, lumberString] = getArgs();
    
        
    if(towerString && goldString && lumberString){
        var gr, to, go, lu
        [gr, to, go, lu] = load(towerString, goldString, lumberString)
        
        // Note sure why this is needed
        grid = gr;
        towers = to;
        gold = go;
        lumber = lu;
    }
    else{
        [grid, towers, gold, lumber] = initBack.randomGen();
    }
    
    timer = countdown(grid, towers, svg)
    front.init(grid, towers, svg, gold, lumber, timer)
    
}
    
function load(towerString, goldString, lumberString){
    
    var gr, to, go, lu
    
    [gr, to] = gridRepr(towerString)
    go = Number(goldString)
    lu = Number(lumberString)
    return [gr, to, go, lu]
}

function getExportLink(towers, gold, lumber){
    
    var base = "http://dota2sweden.com/mazing-contest/index.html?";
    base = base + "t=" + stringRepr(towers);
    base = base + "&g=" + gold;
    base = base + "&l=" + lumber;
    return base;
}

function getArgs(){
    
    var url_string = window.location.href;
    var url = new URL(url_string);
    var towerString = url.searchParams.get("t");
    var goldString = url.searchParams.get("g");
    var lumberString = url.searchParams.get("l");
    
    return [towerString, goldString, lumberString]
}


function countdown(grid, towers, svg){
    var count = consts.timer
    var clock = setInterval(function() {
        document.getElementById("displayTime").innerHTML = "Time: " + count--;
        if(count == 0){
            clearInterval(clock);
            run(grid, towers, svg, clock);
        } 
    }, 1000);
    return clock
}

export function run(grid, towers, svg, timer){
    
    var times, positions, clapEvents, speeds
    front.setResources(0, 0);
    console.log(timer)
    clearInterval(timer);
    var path = sp.shortestPath(grid);
    [times, positions, clapEvents, speeds] = sim.simulate(grid, towers, path)
    animate.animate(svg, times, positions, clapEvents, speeds)
}

export function refresh(){
    window.location.reload()
}

/* Get grid representation from string representation */
function gridRepr(gridString){
    
    /* Get grid without towers */
    var gr = initBack.initGrid();
    var to = [];
    var res = gridString.split(",");
    for(var i = 0; i < res.length; i = i + 3){
        var x = Number(res[i])
        var y = Number(res[i+1])
        var value = Number(res[i+2])
        gr[x][y] = value;
        gr[x+1][y] = value;
        gr[x][y+1] = value;
        gr[x+1][y+1] = value;
        to.push([Number(res[i]), Number(res[i+1]), Number(res[i+2])])
    }
    return [gr, to]
}

/*  Return a string representation of the grid
    Use the tower list representation */
function stringRepr(towers){
    
    var str = "";
    for(var i = 0; i < towers.length; i++){
        str = str + towers[i][0] + "," + towers[i][1] + "," + towers[i][2] + ","
    }
    str = str.substring(0, str.length-1);
    return str
}

export function copyLink(towers, gold, lumber){

    var value = getExportLink(towers, gold, lumber)
    setClipboard(value)
}

function setClipboard(value) {
    var tempInput = document.createElement("input");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}


    
