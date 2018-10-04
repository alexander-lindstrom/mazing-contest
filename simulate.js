/* Simulate runner */

import * as consts from './constants.js'

/* Return runner position as a function of time */
/* Also return arrays containing clap information (times, towers) */
export function simulate(grid, towers, path){
    
    var positions = [];
    var times = [];
    var speeds = [];
    var time = 0;
    var currPos = [path[0].pop(), path[1].pop()];
    var targetPos = [path[0].pop(), path[1].pop()];
    var slowTimer = 0;
    var clapTowers = getClapTowers(grid);
    var clapEvents = new Array(clapTowers.length);  //Keep track of every clap for each tower
    for(var i = 0; i < clapTowers.length; i++){
        clapEvents[i] = new Array();
    }
    
    positions.push(currPos);
    times.push(time);
    var direction = getDirection(currPos, targetPos);
    
    
    /* Main loop */
    var index = 0;
    while(1){
        
        if(checkClap(grid, clapTowers, clapEvents, currPos, time)){
            slowTimer = consts.clapDuration;
        }
       
        var speed = getSpeed(slowTimer);
        speeds.push(speed);
        var oldPos = currPos;
        currPos = updatePosition(currPos, direction, speed, consts.dt);
        if (targetReached(oldPos, currPos, targetPos, direction)){
            currPos = targetPos;
            if(path[0].length == 0){
                break;
            }
            else{
                targetPos = [path[0].pop(), path[1].pop()];
                direction = getDirection(currPos, targetPos);
            }
        }
        slowTimer = updateSlowTimer(slowTimer, consts.dt);
        time = updateTime(time, consts.dt);
        index++;
        if(index == consts.maxIter){
            break;
        }
        positions.push(currPos);
        times.push(time);
        
    }
    
    return [times, positions, clapEvents, speeds];
}

function targetReached(oldPos, currPos, targetPos, direction){
    
    /* Positive x direction */
    if (direction[0] == 1){
        if(targetPos[0] >= oldPos[0] && targetPos[0] <= currPos[0]){
            return true;
        }
    }
    /* Negative x direction */
    else if (direction[0] == -1){
        if(targetPos[0] <= oldPos[0] && targetPos[0] >= currPos[0]){
            return true;
        }
    }
    /* Positive y direction */
    else if (direction[1] == 1){
        if(targetPos[1] >= oldPos[1] && targetPos[1] <= currPos[1]){
            return true;
        }
    }
    /* Negative y direction */
    else if (direction[1] == -1){
        if(targetPos[1] <= oldPos[1] && targetPos[1] >= currPos[1]){
            return true;
        }
    }
    
    
}

function updateTime(time, dt){
    return time + dt;
}

function updateSlowTimer(slowTimer, dt){
    return  slowTimer - dt;
}

function getSpeed(slowTimer){
    
    if (slowTimer > 0){
        return consts.clapSpeed;
    }
    return consts.normalSpeed;
}

function updatePosition(currPos, direction, speed, dt){
    return [currPos[0] + direction[0] * speed * dt, currPos[1] + direction[1] * speed * dt]
}

function getDirection(currPos, targetPos){
    var direction = [targetPos[0] - currPos[0], targetPos[1] - currPos[1]];
    direction[0] = direction[0]/Math.sqrt(direction[0]*direction[0] + direction[1]*direction[1]);
    return direction
}

function checkClap(grid, clapTowers, clapEvents, pos, time ){
    
    var clap = false;
    for(var i = 0; i < clapTowers.length; i++){
        if (distance(pos, centerPos(clapTowers[i])) <= consts.clapRange){
            if (clapEvents[i].length == 0 || 
                time - clapEvents[i][clapEvents[i].length-1] > consts.clapCooldown){
                clapEvents[i].push(time);
                clap = true;
            }
        }
    }
    return clap
}

/* Get the center position from the top left position */
function centerPos(pos){
    return [pos[0]+1, pos[1]+1]
}

function getClapTowers(grid){
    
    var clapSquares = [];
    for(var i = 0; i < consts.height; i++){
        for(var j = 0; j < consts.width; j++){
            if (grid[i][j] == consts.clapTower || 
                grid[i][j] == consts.sellableClapTower ||
                grid[i][j] == consts.upgradedBlockTower){
                
                clapSquares.push([i, j])
            }
        }
    }
    //We are guaranteed to find the top left square first
    var clapTowers = [];
    for(var i = 0; i < clapSquares.length; i = i + 4){
        clapTowers.push(clapSquares[i]);
    }
    return clapTowers
}

function distance(p1, p2){

    var a = p2[0] - p1[0];
    var b = p2[1] - p1[1];
    return Math.sqrt(a*a + b*b)
}