/* Initialize the grid on the front end */

import * as consts from './constants.js'
import * as path from './path.js'
import * as game from './game.js'

var buildToggle = false;
var buildType;

export function init(grid, towers, svg, gold, lumber){

    for (var i = 0; i < consts.height; i++){
        for(var j = 0; j < consts.width; j++){
            drawSquare(svg, grid[i][j], [j, i])
        }
    }
    
    onHover(svg, grid);
    onClick(grid, towers, svg)
    createButtons();
    setResources(gold, lumber);
}

function hasLumber(){
    var lumber = document.getElementById("displayLumber").innerHTML;
    lumber = Number(lumber.substring(8))
    return lumber > 0;
}

function hasGold(){
    var gold = document.getElementById("displayGold").innerHTML;
    gold = Number(gold.substring(6))
    return gold > 0;
}

/* Use value = -1 to decrement */
function addLumber(value){
    var lumber = document.getElementById("displayLumber").innerHTML;
    lumber = Number(lumber.substring(8)) + value;
    document.getElementById("displayLumber").innerHTML = "Lumber: " + lumber;
}

/* Use value = -1 to decrement */
function addGold(value){
    var gold = document.getElementById("displayGold").innerHTML;
    gold = Number(gold.substring(6)) + value;
    console.log(gold)
    document.getElementById("displayGold").innerHTML = "Gold: " + gold;
}

export function setResources(gold, lumber){
    
    document.getElementById("displayGold").innerHTML = "Gold: " + gold;
    document.getElementById("displayLumber").innerHTML = "Lumber: " + lumber;
}

function toggleBuild(type){

    removeElementsByClass("hoverSquare")
    if(buildToggle){
        if(type == buildType){
            buildToggle = false;
        }
        else{
            buildType = type;
        }
    }
    else{
        buildToggle = true;
        buildType = type;
    }
}

function createButtons(){

    $("#blockTower").button().click(function(){
        toggleBuild(consts.sellableBlockTower);
    }); 
    $("#clapTower").button().click(function(){
        toggleBuild(consts.sellableClapTower);
    }); 
    $("#runButton").button().click(function(){
        removeElementsByClass("hoverSquare")
        game.run();
    }); 
    $("#refreshButton").button().click(function(){
        game.refresh();
    }); 
    $("#exportLink").button().click(function(){
        game.copyLink();
    }); 
}

function onClick(grid, towers, svg){

    svg.on('click', function() {
        var pos = d3.mouse(this);
        handleClick(grid, towers, svg, pos)
    });
}

function onHover(svg, grid){
    
    svg.on('touchmove mousemove', function() {
        var pos = d3.mouse(this);
        handleHover(svg, grid, pos)
    });

}

function handleHover(svg, grid, pix){
    
    if(buildToggle){
        
        //Remove any existing hover square
        removeElementsByClass("hoverSquare")

        //Make a new one
        var pos = pixelToGrid(pix)
        var x = pos[0]
        var y = pos[1]
        var scale = scaleFactor()
        
        var coords = [[x, y], [x+1, y], [x, y+1], [x+1, y+1]];
        for(var i = 0; i < coords.length; i++){
        
            if(coords[i][0] < 0 || coords[i][0] > consts.width-1 || coords[i][1] < 0 
                || coords[i][1] > consts.height-1){
                continue
            }
                
            if (grid[coords[i][1]][coords[i][0]] == consts.empty){
                svg.append('rect')
                .attrs({ x: coords[i][0]*scale, y: coords[i][1]*scale, width: scale, height: scale, 
                    fill: "#99FF44", class: "hoverSquare"})
            }
            else{
            svg.append('rect')
                .attrs({ x: coords[i][0]*scale, y: coords[i][1]*scale, width: scale, height: scale, 
                    fill: "#ff7f50", class: "hoverSquare"})
            }  
        }            
    }
}

function removeElementsByClass(className){
    var elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function handleClick(grid, towers, svg, pixPos){
    
    clearDiv("optionDialog")
    createDivAtPosition(pixPos);
    var scale = scaleFactor();
    var gridPos = pixelToGrid(pixPos);
    var value = grid[gridPos[1]][gridPos[0]];
    
    if(buildToggle){
        if(!canBuild(grid, gridPos) || !clearPath(grid, towers, gridPos)){
            return
        }
        if(buildType == consts.sellableBlockTower){
            if(hasGold()){
                buildTower(grid, towers, svg, gridPos, buildType);
            }
        }
        else if (buildType == consts.sellableClapTower){
            if(hasGold() && hasLumber()){
                buildTower(grid, towers, svg, gridPos, buildType);
            }
        }   
    }
    
    else{
    
        switch(value) {
            case consts.empty:
                if (canBuild(grid, gridPos) && clearPath(grid, towers, gridPos)){
                    if(hasLumber() && hasGold()){
                        var options = ["Options", "Build blockTower", "Build clapTower", "Cancel"];
                        displayRollDown(grid, towers, svg, gridPos, options);
                    }
                    else if(hasGold()){
                        var options = ["Options", "Build blockTower", "Cancel"];
                        displayRollDown(grid, towers, svg, gridPos, options);
                    }
                    else{
                        //Dont display rolldown since there is nothing to do
                    }   
                }
            case consts.noBuild:
                //No action can be done
                break;
            case consts.noPassNoBuild:
                //No action can be done
                break;
            case consts.blockTower:
                if (hasLumber()){
                    var options = ["Options", "Upgrade", "Cancel"];
                    displayRollDown(grid, towers, svg, gridPos, options);
                }
                break;
            case consts.sellableBlockTower:
                if (hasLumber()){
                    var options = ["Options", "Sell", "Upgrade", "Cancel"];
                }
                else{
                    var options = ["Options", "Sell", "Cancel"];
                }
                displayRollDown(grid, towers, svg, gridPos, options);
                break;
            case consts.clapTower:
                //No action can be done
                break;
            case consts.sellableClapTower:
                var options = ["Options", "Sell", "Cancel"];
                displayRollDown(grid, towers, svg, gridPos, options);
                break;
            case consts.upgradedBlockTower:
                var options = ["Options", "Revert upgrade", "Cancel"];
                displayRollDown(grid, towers, svg, gridPos, options);
            default:
                console.log("Invalid squareValue!")   
        }
    }
}

function clearDiv(elementId) {

    if(document.getElementById(elementId)){
        var element = document.getElementById(elementId);
        element.parentNode.removeChild(element);
    }
}

function createDivAtPosition(pixPos){

    var div = $('<div id="optionDialog">')
        .css({
            "position": 'absolute',
            "left": pixPos[0] + 'px',
            "top": pixPos[1] + 'px'
        })
        .appendTo(document.body)
}

function displayRollDown(grid, towers, svg, gridPos, options, gold, lumber) {

    var newDiv=document.createElement('div');
    var html = '<select id="select">'
    for(var i = 0; i < options.length; i++) {
        html += "<option value='"+options[i]+"'>"+options[i]+"</option>";
    }
    html += '</select>';
    newDiv.innerHTML = html;
    document.getElementById("optionDialog").appendChild(newDiv);
    $('#select').click(function(){
        handleSelect(grid, towers, svg, gridPos, gold, lumber)
    });
}

function handleSelect(grid, towers, svg, gridPos, gold, lumber){
    
    var value = document.getElementById('select').value;
    console.log(value)
    switch(value) {
    case "Options":
        //Default value
        break;
    case "Build blockTower":
        buildTower(grid, towers, svg, gridPos, consts.sellableBlockTower);
        break;
    case "Build clapTower":
        buildTower(grid, towers, svg, gridPos, consts.sellableClapTower);
        break;
    case "Sell":
        sellTower(grid, towers, svg, gridPos);
        break;
    case "Upgrade":
        upgradeTower(grid, towers, svg, gridPos);
        break;
    case "Cancel":
        clearDiv("optionDialog");
        break;
    case "Revert upgrade":
        revertUpgrade(grid, towers, svg, gridPos);
    default:
        console.log("Invalid selection!");
    }   
}

function revertUpgrade(grid, towers, svg, gridPos){
    
    clearDiv("optionDialog");
    var pos = getTopLeft(towers, gridPos)
    var x = pos[0];
    var y = pos[1];
    
    grid[y][x] = consts.blockTower;
    grid[y+1][x] = consts.blockTower;
    grid[y][x+1] = consts.blockTower;
    grid[y+1][x+1] = consts.blockTower;
    
    for(var i = 0; i < towers.length; i++){
        if (towers[i][0] == x && towers[i][1] == y){
            towers[i][2] = consts.blockTower;
        }
    }
    
    drawBlockTower(svg, [x, y]);
    drawBlockTower(svg, [x+1, y]);
    drawBlockTower(svg, [x, y+1]);
    drawBlockTower(svg, [x+1, y+1]);
    addLumber(1);
}

/* Get the top left tower square which correspond to gridPos */
function getTopLeft(towers, gridPos){
    
    var x = gridPos[1];
    var y = gridPos[0];
    
    for(var i = 0; i < towers.length; i++){
        
        var tx = towers[i][0];
        var ty = towers[i][1];
        if (x == tx && y == ty){
            return [ty, tx]
        }
        else if(x == tx+1 && y == ty){
            return [ty, tx]
        }
        else if(x == tx && y == ty+1){
            return [ty, tx]
        }
        else if(x == tx+1 && y == ty+1){
            return [ty, tx]
        }
    }
    return false;
}

function sellTower(grid, towers, svg, gridPos){
    
    clearDiv("optionDialog");
    var pos = getTopLeft(towers, gridPos)
    var x = pos[0];
    var y = pos[1];
    var towerValue = grid[y][x];
    removeTower(grid, towers, pos);
    
    drawGrass(svg, pos);
    drawGrass(svg, [x+1, y])
    drawGrass(svg, [x, y+1])
    drawGrass(svg, [x+1, y+1])
    
    reDrawSurrounding(grid, svg, pos);
    /*Update gold and lumber */
        
    if(towerValue == consts.sellableBlockTower){
        addGold(1);
    }
    else if(towerValue == consts.sellableClapTower){
        addGold(1);
        addLumber(1);
    }
}

function upgradeTower(grid, towers, svg, gridPos){
    
    clearDiv("optionDialog");
    var pos = getTopLeft(towers, gridPos)
    var x = pos[0];
    var y = pos[1];
    
    if (grid[y][x] == consts.sellableBlockTower){
        updateTower(grid, towers, pos, consts.sellableClapTower);
        drawSellableClapTower(svg, pos);
        drawSellableClapTower(svg, [x+1, y]);
        drawSellableClapTower(svg, [x, y+1]);
        drawSellableClapTower(svg, [x+1, y+1]);
        addLumber(-1);
    }
    else if(grid[y][x] == consts.blockTower){
        updateTower(grid, towers, pos, consts.upgradedBlockTower)
        drawSellableClapTower(svg, pos);
        drawSellableClapTower(svg, [x+1, y]);
        drawSellableClapTower(svg, [x, y+1]);
        drawSellableClapTower(svg, [x+1, y+1]);
        addLumber(-1);
    } 
}

function updateTower(grid, towers, pos, newValue){

    /* Update in grid*/
    var pX = pos[1];
    var pY = pos[0];
    grid[pX][pY] = newValue;
    grid[pX][pY + 1] = newValue;
    grid[pX + 1][pY] = newValue;
    grid[pX + 1][pY + 1] = newValue;
    
    /* Remove from list */
    for(var i = 0; i < towers.length; i++){
        if(pX == towers[i][0] && pY == towers[i][1]){
            towers[i][2] = newValue;
            return
        }
    }  

}

/* Redraw 8 surrounding square to remove the border... */
function reDrawSurrounding(grid, svg, gridPos){
    
    var i = gridPos[1];
    var j = gridPos[0];
    
    //Above
    if (path.onGrid(i-1, j)){
        drawSquare(svg, grid[i-1][j], [j, i-1]);
    }
    if (path.onGrid(i-1, j+1)){
        drawSquare(svg, grid[i-1][j+1], [j+1, i-1]);
    }
    
    //Below
    if (path.onGrid(i+2, j)){
        drawSquare(svg, grid[i+2][j], [j, i+2]);
    }
    if (path.onGrid(i+2, j+1)){
        drawSquare(svg, grid[i+2][j+1], [j+1, i+2]);
    }
    
    //Left
    if (path.onGrid(i, j-1)){
        drawSquare(svg, grid[i][j-1], [j-1, i]);
    }
    if (path.onGrid(i+1, j-1)){
        drawSquare(svg, grid[i+1][j-1], [j-1, i+1]);
    }
    
    //Right
    if (path.onGrid(i, j+2)){
        drawSquare(svg, grid[i][j+2], [j+2, i]);
    }
    if (path.onGrid(i+1, j+2)){
        drawSquare(svg, grid[i+1][j+2], [j+2, i+1]);
    }
}

function canBuild(grid, gridPos){

    var x = gridPos[0];
    var y = gridPos[1];
    
    if (consts.empty == grid[y][x+1] &&
        consts.empty == grid[y+1][x] &&
        consts.empty == grid[y+1][x+1]){
        return true
    }
    return false;
}

/* Check if there is a path after building a tower at gridPos */
function clearPath(grid, towers,  gridPos){

    var x = gridPos[0];
    var y = gridPos[1];
    
    placeTower(grid, gridPos, consts.blockTower);
    towers.push([gridPos[1], gridPos[0], consts.blockTower])
    if(path.shortestPath(grid)){
        removeTower(grid, towers, gridPos)
        return true;
    }
    else{
        removeTower(grid, towers, gridPos)
        return false;
    } 
}

function buildTower(grid, towers, svg, gridPos, towerValue){
    
    clearDiv("optionDialog");
    placeTower(grid, gridPos, towerValue);
    towers.push([gridPos[1], gridPos[0], towerValue]);
    
    var x = gridPos[0];
    var y = gridPos[1];
    
    if (towerValue == consts.sellableBlockTower){
        drawSellableBlockTower(svg, gridPos);
        drawSellableBlockTower(svg, [x+1, y]);
        drawSellableBlockTower(svg, [x, y+1]);
        drawSellableBlockTower(svg, [x+1, y+1]);
        addGold(-1);
    }
    else if(towerValue == consts.sellableClapTower){
    
        drawSellableClapTower(svg, gridPos);
        drawSellableClapTower(svg, [x+1, y]);
        drawSellableClapTower(svg, [x, y+1]);
        drawSellableClapTower(svg, [x+1, y+1]);
        addGold(-1);
        addLumber(-1);
    } 
}

function removeTower(grid, towers, pos){
    
    /* Remove from grid */
    var pX = pos[1];
    var pY = pos[0];
    grid[pX][pY] = consts.empty;
    grid[pX][pY + 1] = consts.empty;
    grid[pX + 1][pY] = consts.empty;
    grid[pX + 1][pY + 1] = consts.empty;
    
    /* Remove from list */
    for(var i = 0; i < towers.length; i++){
        if(pX == towers[i][0] && pY == towers[i][1]){
            towers.splice(i, 1);
            return
        }
    }  
}

function placeTower(grid, pos, value){
    
    var pX = pos[1];
    var pY = pos[0];
    grid[pX][pY] = value;
    grid[pX][pY + 1] = value;
    grid[pX + 1][pY] = value;
    grid[pX + 1][pY + 1] = value;
}

function drawSquare(svg, squareValue, pos){
    
    switch(squareValue) {
    case consts.empty:
        drawGrass(svg, pos)
        break;
    case consts.noBuild:
        drawGrass(svg, pos)
        break;
    case consts.noPassNoBuild:
        drawRock(svg, pos)
        break;
    case consts.blockTower:
        drawBlockTower(svg, pos)
        break;
    case consts.sellableBlockTower:
        drawSellableBlockTower(svg, pos)
        break;
    case consts.clapTower:
        drawClapTower(svg, pos)
        break;
    case consts.sellableClapTower:
        drawSellableClapTower(svg, pos)
        break;
    default:
        console.log("Invalid squareValue!")   
    }
}

function drawGrass(svg, pos){
    var scale = scaleFactor()
    svg.append('rect')
        .attrs({ x: pos[0]*scale, y: pos[1]*scale, width: scale, height: scale, fill: 'green' })
}

function drawRock(svg, pos){
    var scale = scaleFactor()
    svg.append('rect')
        .attrs({ x: pos[0]*scale, y: pos[1]*scale, width: scale, height: scale, fill: '#A8651E' })
}

function drawBlockTower(svg, pos){
    var scale = scaleFactor()
    svg.append('rect')
        .attrs({ x: pos[0]*scale, y: pos[1]*scale, width: scale, height: scale, fill: '#B1B1B1' })
        .style("stroke", "red")
}

function drawSellableBlockTower(svg, pos){
    var scale = scaleFactor()
    svg.append('rect')
        .attrs({ x: pos[0]*scale, y: pos[1]*scale, width: scale, height: scale, fill: '#B1B1B1' })
        .style("stroke", "blue")
}

function drawClapTower(svg, pos){
    var scale = scaleFactor()
    svg.append('rect')
        .attrs({ x: pos[0]*scale, y: pos[1]*scale, width: scale, height: scale, fill: '#593C1F' })
        .style("stroke", "red")
}

function drawSellableClapTower(svg, pos){
    var scale = scaleFactor()
    svg.append('rect')
        .attrs({ x: pos[0]*scale, y: pos[1]*scale, width: scale, height: scale, fill: '#593C1F' })
        .style("stroke", "blue")
}

/* Return number of pixels per square*/
export function scaleFactor(){
    return consts.svgWidth/consts.width
}

/* Convert pixel pos to grid pos */
function pixelToGrid(pos){
    var scale = scaleFactor();
    pos[0] = Math.floor(pos[0]/scale);
    pos[1] = Math.floor(pos[1]/scale);
    return pos
}