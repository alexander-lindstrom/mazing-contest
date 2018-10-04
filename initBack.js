/* Initialize the grid on the backend */

import * as consts from './constants.js'
import * as path from './path.js'


function posOccupied(array, x, y){
    
    var a, b, c, d ;
    a = array[x][y];
    b = array[x+1][y];
    c = array[x][y+1];
    d = array[x+1][y+1];

    if (!a && !b && !c && !d){
        
        return false;
    }
    return true;
}

/*  Input:
        grid - the grid
        pX, pY - the bottom left square in the towers 2x2 
        value - the tower identifier
        Ouput: -                                                */
function placeTower(grid, pX, pY, value){

    grid[pX][pY] = value;
    grid[pX][pY + 1] = value;
    grid[pX + 1][pY] = value;
    grid[pX + 1][pY + 1] = value;
}

/*  Input:
        hmax - maximum height
        hmin - minumin height
        wmax - maximum width
    Output: - [pX, pY]          */
function randPos(hmax, hmin, wmax){
    
    var pX, pY;
    while(1){
        
        pX = Math.floor((Math.random() * hmax) + hmin);
        pY = Math.floor((Math.random() * wmax) + 0);
        
        /* Dont block the entrance */
        if(pY == 8){
            if (!(pX == 9 || pX == 23)){
               break;
            }
        }
        else{
            break;
        }
    }
    return [pX, pY];
}

/*  Input:
        grid - the grid
        mintower - the minumum number of towers to spawn 
        maxtower - the maximum number of towers to spawn
        value - the value of the towers to place 
    Ouput: -                                                */
function placeTowers(grid, towers, mintower, maxtower, value){

    var num_towers = Math.floor((Math.random() * maxtower) + mintower);
    
    for(var i = 0; i < num_towers; i++){
    
        /* Get a random position which is not occupied */
        while(1){
            
            var p  = randPos(consts.innerHeight + consts.outerHeight -1, consts.outerHeight, consts.width-1);
            var pX = p[0];
            var pY = p[1];
            
            if (!posOccupied(grid, pX, pY)){
                placeTower(grid, pX, pY, value);
                towers.push([pX, pY, value]);
                break;
            }
        }
    }
}

/*  Input: -
    Output: - The initiated grid with a random configuration of towers.
    Note: - It may take a few tries until a valid configuration is found.*/   
export function randomGen(){
    
    /* Might take a few iterations to find a valid starting configuration */
    while(1){
        
        var grid = initGrid();
        var towers = [];
        
        placeTowers(grid, towers, consts.minClap, consts.maxClap, consts.clapTower);
        placeTowers(grid, towers, consts.minBlock, consts.maxBlock, consts.blockTower);
        
        if (path.shortestPath(grid)){
            break;
        }
    }
    
    /* Get random amounts of gold and lumber */
    var gold = Math.floor(Math.random() * (consts.maxGold-consts.minGold) + consts.minGold)
    var lumber = Math.floor(Math.random() * (consts.maxLumber-consts.minLumber) + consts.minLumber)
    
    return [grid, towers, gold, lumber];
}    

/*  Input: -
    Output: - The initiated grid (without towers)
    Note: - There is no reason to call this functin externally */    
export function initGrid(){
    
    var grid = new Array(consts.height);
    var i, j;
    
    for(i = 0; i < consts.height; i++){
        grid[i] = new Array(consts.width);
    }
    
    placeEmptySquares(grid);
    placeGates(grid);
    placeEntrances(grid);

    return grid;
}

function placeEmptySquares(grid){
    
    for (var i = 9; i < 25; i++){  
        for(var j = 0; j < consts.width; j++){
            grid[i][j] = consts.empty;
        }
    }
}

function placeGates(grid){

    /* First gate" */
    for(var j = 0; j < consts.width; j++){
        grid[8][j] = consts.noPassNoBuild;
    }
    grid[8][8] = consts.empty;
    grid[8][9] = consts.empty;
    
    /* Second gate */
    for(var j = 0; j < consts.width; j++){
        grid[25][j] = consts.noPassNoBuild;
    }
    grid[25][8] = consts.empty;
    grid[25][9] = consts.empty;
}

function placeEntrances(grid){
    
    /* Firstt entrance */
    for (var i = 0; i < 8; i++){  
        for(var j = 0; j < 6; j++){
            grid[i][j] = consts.noPassNoBuild;
        }
        for(var j = 6; j < 12; j++){
            grid[i][j] = consts.noBuild;
        } 
        for(var j = 12; j < consts.width; j++){
            grid[i][j] = consts.noPassNoBuild;
        } 
    }
    
    /* Second entrance */
    for (var i = 26; i < consts.height; i++){  
        for(var j = 0; j < 6; j++){
            grid[i][j] = consts.noPassNoBuild;
        }
        for(var j = 6; j < 12; j++){
            grid[i][j] = consts.noBuild;
        } 
        for(var j = 12; j < consts.width; j++){
            grid[i][j] = consts.noPassNoBuild;
        } 
    }
}