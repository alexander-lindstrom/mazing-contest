/* Animate runner */

import * as consts from './constants.js'
import * as front from './front.js'

export async function animate(svg, times, positions, clapEvents, speeds){


    
    drawCircle(svg, positions[0])
   
    for(var i = 1; i < positions.length; i++){
    
        moveCircle(svg, positions[i])
        /* Check for change in speed */
        if(speeds[i] != speeds[i-1]){
            updateCircleColor();
        }
        updateDisplayTime(times[i]);
        await sleep(consts.dt*1000);
    }
    removeCircle();
}

function removeCircle(){
    var element = document.getElementById("runner");
    element.parentNode.removeChild(element);
}


function updateDisplayTime(time){
    document.getElementById("displayTime").innerHTML = "Time: " + Number(time.toFixed(2));
}

function updateCircleColor(){
    
    var fill = document.getElementById("runner").getAttribute('fill');
    if (fill == "red"){
        document.getElementById("runner").setAttribute('fill', "blue")  
    }
    else{
        document.getElementById("runner").setAttribute('fill', "red")
    }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function posAtTime(times, positions, time){

    for(var i = 0; i < times.length; i++){
        if (times[i] == time){
            return positions[i];
        }
    }
}

function drawCircle(svg, pos){
    
    var scale = front.scaleFactor();
    var centPos = centerPos(pos, scale)
    svg.append('circle')
        .attrs({cx: centPos[1], cy: centPos[0], r: consts.circleRadius, fill: "red", id: "runner"})
        
    
}

function moveCircle(svg, pos){
    
    var scale = front.scaleFactor();
    var centPos = centerPos(pos, scale);
    document.getElementById("runner").setAttribute('cx', centPos[1])    
    document.getElementById("runner").setAttribute('cy', centPos[0])   
}

/* Return the pixel position of the squares center */
function centerPos(pos, scale){
    return [pos[0]*scale + scale/2, pos[1]*scale + scale/2]
}

function getRandomOffset() {
    var offset = 2;
  return (Math.random() * 2 * offset) - offset;
}