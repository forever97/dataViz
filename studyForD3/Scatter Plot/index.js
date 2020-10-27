const svg = d3.select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

/*
    xValue和yValue的可选值：
    d.mpg 
    d.cylinders 
    d.displacement 
    d.horsepower 
    d.weight 
    d.acceleration 
    d.year 
*/

const render = data => {
    const title = 'Cars: Horsepower vs. Weight';
    
    const xValue = d => d.weight;
    const xAxisLabel = 'Weight';

    const yValue = d => d.horsepower;
    const yAxisLabel = 'Horsepower';

    const circleRadius = 10; 
    const margin = {top: 60, right: 40, bottom:100, left:220};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // 比例尺
    const xScale = d3.scaleLinear()
        //.domain([d3.min(data, xValue), d3.max(data, xValue)])
        .domain(d3.extent(data, xValue))
        .range([0, innerWidth])
        .nice(); // 加上边界线

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, yValue))
        .range([0, innerHeight])
        .nice()
    
    // 利用d3.format来控制数字格式
    const xAxis = d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickPadding(20);
    
    const yAxis = d3.axisLeft(yScale)
        .tickSize(-innerWidth);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    const yAxisG = g.append('g')
        .call(yAxis)
    
    yAxisG.selectAll('.domain') 
        .remove();

    yAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', -100)
        .attr('x', - innerHeight / 2)
        .style('text-anchor', 'middle')
        .attr('fill', 'black')
        .attr('transform', `rotate(-90)`)
        .text(yAxisLabel);

    const xAxisG = g.append('g').call(xAxis)
        .attr('transform', `translate(0, ${innerHeight})`)
        
    xAxisG.selectAll('.domain') 
        .remove();
    
    xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', 90)
        .attr('x', innerWidth / 2)
        .attr('fill', 'black')
        .text(xAxisLabel);

    g.selectAll('circle').data(data)
        .enter().append('circle')
        .attr('cy', d => yScale(yValue(d)))
        .attr("cx", d => xScale(xValue(d)))
        .attr("r", circleRadius);

    g.append('text')
        .attr('class', 'title')
        .attr('y', -10)
        .text(title);
}

d3.csv('auto-mpg.csv').then(data => {
    data.forEach(d => {
        d.mpg = +d.mpg;
        d.cylinders = +d.cylinders;
        d.displacement = +d.displacement;
        d.horsepower = +d.horsepower;
        d.weight = +d.weight;
        d.acceleration = +d.acceleration;
        d.year = +d.year;
    });
    render(data);
})