/* Shortest path functions*/
import * as consts from './constants.js'


export function onGrid(i, j){

    if (i >= 0 && j >= 0 && i < consts.height && j < consts.width){
        return 1;
    }
    return 0;
}

/* Use backpropagion to find the shortest path. Should never be called directly */
function backTrace(mirror){
    
    var pathX = new Array(consts.pathmax);
    var pathY = new Array(consts.pathmax);
    var value = new Array(consts.pathmax);
    var tempX, tempY, a, b;
    var index = 0;
    
    pathX[index] = consts.stopX;
    pathY[index] = consts.stopY;
    
    while(1){
    
        a = pathX[index];
        b = pathY[index];
        value[index] = mirror[a][b];
        
        /* Check neighboors */
        
        /* Up */
        if (onGrid(a+1, b) && (mirror[a+1][b] < value[index]) && (mirror[a+1][b] != -1)){
            
            
            tempX = a+1;
            tempY = b;
            pathX[index + 1] = tempX;
            pathY[index + 1] = tempY;
            value[index+1] = mirror[a+1][b];  
            index++;
        }
                    
        /* Down */
        else if (onGrid(a-1, b) && (mirror[a-1][b] < value[index]) && (mirror[a-1][b] != -1)){
            
            tempX = a-1;
            tempY = b;
            pathX[index + 1] = tempX;
            pathY[index + 1] = tempY;
            value[index+1] = mirror[a-1][b];  
            index++;
        }
                    
        /* Left */
        else if (onGrid(a, b-1) && (mirror[a][b-1] < value[index]) && (mirror[a][b-1] != -1)){
            
            tempX = a;
            tempY = b-1;
            pathX[index + 1] = tempX;
            pathY[index + 1] = tempY;
            value[index+1] = mirror[a][b-1];  
            index++;
        }
                    
        /* Right */
        else if (onGrid(a, b+1) && (mirror[a][b+1] < value[index]) && (mirror[a][b+1] != -1)){
            
            tempX = a;
            tempY = b+1;
            pathX[index + 1] = tempX;
            pathY[index + 1] = tempY;
            value[index+1] = mirror[a][b+1];  
            index++;
        }
        else{
            console.log("Fatal error in backtrace\n");
            return false;
        }
        
        if(pathX[index] == consts.startX && pathY[index] == consts.startY){
            break;
        }
    }
    
    return [pathX, pathY];

}

/*  Input: the grid 
    Output: Array containing the shortest path from start to goal 
    Note: Returns false on failure */
export function shortestPath(array){

    var i, a, b, marked;
    /* Create a blank matrix to write in */
    var mirror = new Array(consts.height);
    for(a = 0; a < consts.height; a++){
        mirror[a] = new Array(consts.width);
        for(b = 0; b < consts.width; b++){
            mirror[a][b] = -1;
        }
    }
    
    /* Mark the starting point */
    i = 0;
    mirror[consts.startX][consts.startY] = i;
    
    
    while(1){
        
        marked = 0;
        
        /* Iterate over the grid */
        for(a = 0; a < consts.height; a++){
            for(b = 0; b < consts.width; b++){
            
                if (mirror[a][b] == i){
                
                /* Label neighboors */
                
                    /* up */
                    if (onGrid(a+1, b) && (array[a+1][b] == consts.empty || array[a+1][b] == consts.noBuild) 
                        && mirror[a+1][b] == -1){
                        mirror[a+1][b] = i+1;
                        marked++;
                    }
                    
                    /* down */
                    if (onGrid(a-1, b) && (array[a-1][b] == consts.empty || array[a-1][b] == consts.noBuild) 
                        && mirror[a-1][b] == -1){
                        mirror[a-1][b] = i+1;
                        marked++;
                    }
                    
                    /* left */
                    if (onGrid(a, b-1) && (array[a][b-1] == consts.empty|| array[a][b-1] == consts.noBuild) 
                        && mirror[a][b-1] == -1){
                        mirror[a][b-1] = i+1;
                        marked++;
                    }
                    
                    /* right */
                    if (onGrid(a, b+1) && (array[a][b+1] == consts.empty || array[a][b+1] == consts.noBuild)
                        && mirror[a][b+1] == -1){
                        mirror[a][b+1] = i+1;
                        marked++;
                    }
                }
            }  
        }
        
        /* Check if the target was reached */
        if (mirror[consts.stopX][consts.stopY] != -1){
            //console.log("Target reached\n");
            break;
        }
        
        /* Verify that at least one mark was made */
        if(marked == 0){
            return false;
        }
        i++;
        
    }
    var path = backTrace(mirror);
    
    
    while(1){
        if (!path[0][path[0].length-2]){
            path[0].pop()
            path[1].pop()
        }
        else{
            break;
        }
    }
    while(typeof path[0][path[0].length-1] === "undefined"){
        path[0].pop();   
        path[1].pop();         
    }
        
    return path;
}