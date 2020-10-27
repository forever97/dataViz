const svg = d3.select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

const render = data => {
    const xValue = d => d.population;
    const yValue = d => d.country;
    const margin = {top: 60, right: 40, bottom:70, left:220};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // 比例尺
    const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, xValue)])
    .range([0, innerWidth]);

    const yScale = d3.scaleBand()
        .domain(data.map(yValue))
        .range([0, innerHeight])
        .padding(0.1);

    // 将s标准中的G替换为B来表示billion
    const xAxisTickFormat = number => 
        d3.format('.3s')(number)
        .replace('G', 'B');
    
    // 利用d3.format来控制数字格式
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(xAxisTickFormat)
        .tickSize(-innerHeight); // 把小竖线画长
    
    const yAxis = d3.axisLeft(yScale);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // 删除不需要的线
    // 坐标轴竖线和小横线，可以通过开发者控制台找到其名字
    g.append('g')
        .call(yAxis)
        .selectAll('.domain, .tick line') 
        .remove();

    const XAxisG = g.append('g').call(xAxis)
        .attr('transform', `translate(0, ${innerHeight})`)
        
    XAxisG.selectAll('.domain') 
        .remove();
    
    XAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', 65)
        .attr('x', innerWidth / 2)
        .attr('fill', 'black')
        .text('Population');

    g.selectAll('rect').data(data)
        .enter().append('rect')
        .attr('y', d => yScale(yValue(d)))
        .attr("width", d => xScale(xValue(d)))
        .attr("height", yScale.bandwidth());

    g.append('text')
        .attr('class', 'title')
        .attr('y', -10)
        .text('Top 10 Most Populous Countries');
}

d3.csv('data.csv').then(data => {
    data.forEach(d => {
        d.population = +d.population * 1000;
    });
    render(data);
})