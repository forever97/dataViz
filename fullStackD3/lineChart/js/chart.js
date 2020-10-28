async function drawLineChart() {
    const dataset = await d3.json("./data/nyc_weather_data.json")
    console.table(dataset[0])
    const dateParser = d3.timeParse("%Y-%m-%d")
    const yAccessor = d => d.temperatureMax
    const yAccessor2 = d => d.temperatureMin
    const xAccessor = d => dateParser(d.date)

    let dimensions = {
        width: window.innerWidth * 0.9,
        height: 400,
        margin: {
            top: 15,
            right: 15,
            bottom: 40,
            left: 60,
        },
    }
    dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
    dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom 

    // 创建SVG元素
    const wrapper = d3.select("#wrapper")
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

    // 创建组
    const bounds = wrapper.append("g")  
        .style("transform", `translate(${
          dimensions.margin.left
        }px, ${
          dimensions.margin.top
        }px)`)

    // 创建坐标轴比例尺
    const yScale = d3.scaleLinear()
        .domain([d3.min(dataset, yAccessor2),d3.max(dataset, yAccessor)]) 
        .range([dimensions.boundedHeight, 0])
    const xScale = d3.scaleTime()
        .domain(d3.extent(dataset, xAccessor))  
        .range([0, dimensions.boundedWidth])
    
    // 创建低温区域
    const freezingTemperaturePlacement = yScale(32)
    const freezingTemperatures = bounds.append("rect")
        .attr("x", 0)
        .attr("width", dimensions.boundedWidth)
        .attr("y", freezingTemperaturePlacement)
        .attr("height", dimensions.boundedHeight - freezingTemperaturePlacement)
        .attr("fill", "#e0f3f3")
    
    // 线生成器
    const lineGenerator = d3.line() 
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yAccessor(d)))
    const lineGenerator2 = d3.line() 
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yAccessor2(d)))
    
    // 画折线
    const line = bounds.append("path")
        .attr("d", lineGenerator(dataset))
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
    const line2 = bounds.append("path")
        .attr("d", lineGenerator2(dataset))
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
    
    // y坐标轴
    const yAxisGenerator = d3.axisLeft()  
        .scale(yScale)
    const yAxis = bounds.call(yAxisGenerator)
    
    // x坐标轴
    const xAxisGenerator = d3.axisBottom()  
        .scale(xScale)
    const xAxis = bounds.append("g")
        .call(xAxisGenerator)
        .style("transform", `translateY(${
            dimensions.boundedHeight
            }px)`)
}

drawLineChart();

