import { fruitBowl } from './fruitBowl.js';

const svg = d3.select('svg');

const height = +svg.attr('height');
const makeFruit = type => ({ 
    type, 
    id: Math.random()
});
const fruits = d3.range(5).map(() => makeFruit('apple'));

let selectedFruit = null;

const onClick = id => {
    selectedFruit = id;
    render();
};

const render = () => {
    fruitBowl(svg, {
        fruits,
        height,
        onClick,
        selectedFruit
    });
};

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



