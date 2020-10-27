const colorScale = d3.scaleOrdinal()
    .domain(['apple', 'lemon'])
    .range(['#c11d1d', '#eae600']);

const radiusScale = d3.scaleOrdinal()
    .domain(['apple', 'lemon'])
    .range([50, 30]);

export const fruitBowl = (selection, props) => {
    const {fruits, height} = props;
    const circles = selection.selectAll('circle')
        .data(fruits) // 将数据和图像建立连接
    
    circles.enter() // 选中未绑定图像的数据
        .append('circle') 
        .attr('cx', (d, i) => i * 120 + 60)
        .attr('cy', height / 2)
        .merge(circles)
        .attr('fill', d => colorScale(d.type))
        //.attr('opacity', 0.5)
        .attr('r', d => radiusScale(d.type));

    circles.exit() // 选中未绑定数据的图像
        .remove();
}