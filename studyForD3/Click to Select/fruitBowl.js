const colorScale = d3.scaleOrdinal()
    .domain(['apple', 'lemon'])
    .range(['#c11d1d', '#eae600']);

const radiusScale = d3.scaleOrdinal()
    .domain(['apple', 'lemon'])
    .range([50, 30]);

const xPosition = (d, i) => i * 120 + 60;

export const fruitBowl = (selection, props) => {
    const {
        fruits, 
        height, 
        onClick, 
        selectedFruit
    } = props;
    const circles = selection.selectAll('circle')
        .data(fruits) // 将数据和图像建立连接
    
    circles.enter() // 选中未绑定图像的数据
        .append('circle') 
        .attr('cx', xPosition)
        .attr('cy', height / 2)
        .attr('r', 0)
        .merge(circles)
        .attr('fill', d => colorScale(d.type))
        .attr('stroke-width', 5)
        .attr('stroke', d => d.id==selectedFruit?"black":"none")
        .on('click', d => onClick(d.id))
        .transition().duration(1000)
        .attr('cx', xPosition)
        .attr('r', d => radiusScale(d.type));

    circles.exit() // 选中未绑定数据的图像
        .attr('r', 0)
        .remove();
}