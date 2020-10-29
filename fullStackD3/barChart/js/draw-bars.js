async function drawBars() {
    const pathToJSON = "./data/nyc_weather_data.json"
    const dataset = await d3.json(pathToJSON)

    const width = 600
    let dimensions = {
        width: width,
        height: width * 0.9,
        margin: {
           top: 30,
           right: 10,
           bottom: 50,
           left: 50,
        },
    }
    dimensions.boundedWidth = dimensions.width 
        - dimensions.margin.left 
        - dimensions.margin.right
    dimensions.boundedHeight = dimensions.height 
        - dimensions.margin.top 
        - dimensions.margin.bottom
    const drawHistogram = metric => {
        const metricAccessor = d => d[metric]
    
        const wrapper = d3
            .select('#wrapper')
            .append('svg')
            .attr('width', dimensions.width)
            .attr('height', dimensions.height)
    
        const bounds = wrapper
            .append('g')
            .style(
            'transform',
            `translate(${dimensions.margin.left}px, ${dimensions.margin.top})`
            )
    
        // x比例尺
        const xScale = d3
            .scaleLinear()
            .domain(d3.extent(dataset, metricAccessor))
            .range([0, dimensions.boundedWidth])
            .nice()

        // 组生成器
        const binsGenerator = d3.histogram()
            .domain(xScale.domain())
            .value(metricAccessor)
            .thresholds(12)
        
        // 分组
        const bins = binsGenerator(dataset)
        console.log(bins)

        // y比例尺
        const yAccessor = d => d.length
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(bins, yAccessor)])
            .range([dimensions.boundedHeight, 0])
            .nice()
        
        // 生成柱子的组
        const binsGroup = bounds.append("g")
        const binGroups = binsGroup.selectAll("g")
            .data(bins)
            .enter().append("g")
    
        // 绘制柱子
        // x0和x1是bin中的下限和上限，length是数量
        const barPadding = 1 // 柱子间距
        const barRects = binGroups.append("rect")
            .attr("x", d => xScale(d.x0) + barPadding / 2)
            .attr("y", d => yScale(yAccessor(d)))
            .attr("width", d => d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]))
            .attr("height", d => dimensions.boundedHeight - yScale(yAccessor(d)))
            .attr("fill", "cornflowerblue")
    
        // 给柱子填上数字
        const barText = binGroups.filter(yAccessor)
            .append("text")
            .attr("x", d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
            .attr("y", d => yScale(yAccessor(d)) - 5)
            .text(yAccessor)
            .style("text-anchor", "middle")
            .attr("fill", "darkgrey")
            .style("font-size", "12px")
            .style("font-family", "sans-serif")
    
        // 均值线
        const mean = d3.mean(dataset, metricAccessor)
        const meanLine = bounds.append("line")
            .attr("x1", xScale(mean))
            .attr("x2", xScale(mean))
            .attr("y1", -15)
            .attr("y2", dimensions.boundedHeight)
            .attr("stroke", "maroon")
            .attr("stroke-dasharray", "2px 4px")
    
        // 均值标注
        const meanLabel = bounds
            .append('text')
            .attr('x', xScale(mean))
            .attr('y', 15)
            .text('mean')
            .attr('fill', 'maroon')
            .style('font-size', '12px')
            .style('text-anchor', 'middle')
    
        // x轴和标注
        const xAxisGenerator = d3.axisBottom()
            .scale(xScale)
        const xAxis = bounds.append("g")
            .call(xAxisGenerator)
            .style("transform", `translateY(${dimensions.boundedHeight}px)`)
        const xAxisLabel = xAxis.append("text")
            .attr("x", dimensions.boundedWidth / 2)
            .attr("y", dimensions.margin.bottom - 10)
            .attr("fill", "black")
            .style("font-size", "1.4em")
            .text(metric)
            // 大小写转换
            .style("text-transform", "capitalize") 
    }
    const metrics = [
        "windSpeed",
        "moonPhase",
        "dewPoint",
        "humidity",
        "uvIndex",
        "windBearing",
        "temperatureMin",
        "temperatureMax",
    ]
    metrics.forEach(drawHistogram)
}

drawBars()