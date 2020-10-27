import { fruitBowl } from './fruitBowl.js';

const svg = d3.select('svg');

const height = +svg.attr('height');

const render = () => {
    fruitBowl(svg, {
        fruits,
        height
    })
}

const makeFruit = type => ({ type });
const fruits = d3.range(5).map(() => makeFruit('apple'));

render();

// Eat an apple
setTimeout(() =>{
    fruits.pop();
    render();
}, 1000)

// Replacing an apple with a lemon
setTimeout(() =>{
    // update
    fruits[2].type = 'lemon';
    // show
    render();
}, 2000)



