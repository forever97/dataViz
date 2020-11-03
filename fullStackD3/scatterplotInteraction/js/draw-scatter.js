async function drawScatter () {
    const dataset = await d3.json("./data/nyc_weather_data.json")

    const xAccessor = d => d.dewPoint
    const yAccessor = d => d.humidity

    const width = d3.min([
        window.innerWidth * 0.9, 
        window.innerHeight * 0.9,
    ])

    let dimensions = {
        width: width,
        height: width,
        margin: {
            top: 10,
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

    const wrapper = d3.select("#wrapper")
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

    const bounds = wrapper.append("g")
        .style("transform", `translate(${
          dimensions.margin.left
        }px, ${
          dimensions.margin.top
        }px)`)

    // 带舍入的比例尺
    const xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, xAccessor))  
        .range([0, dimensions.boundedWidth])
        .nice()
    const yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, yAccessor))  
        .range([dimensions.boundedHeight, 0])
        .nice()
    
    // 创建一个颜色比例尺
    const colorAccessor = d => d.cloudCover
    const colorScale = d3.scaleLinear()
        .domain(d3.extent(dataset, colorAccessor))
        .range(["skyblue", "darkslategrey"])

    const tooltip = d3.select("#tooltip")
    function onMouseEnter(datum, index) {
        const dayDot = bounds.append("circle")
            .attr("class", "tooltipDot")
            .attr("cx", d => xScale(xAccessor(datum)))
            .attr("cy", d => yScale(yAccessor(datum)))
            .attr("r", 7)
            .style("fill", "maroon")
            .style("pointer-events", "none")

        const formatDewPoint = d3.format(".2f")
        tooltip.select("#dew-point").text(formatDewPoint(xAccessor(datum)))
        const formatHumidity = d3.format(".2f")
        tooltip.select("#humidity").text(formatHumidity(yAccessor(datum)))

        const dateParser = d3.timeParse("%Y-%m-%d")
        const formatDate = d3.timeFormat("%A, %B %d, %Y") 

        tooltip.select("#date").text(formatDate(dateParser(datum.date)))

        const x = xScale(xAccessor(datum)) + dimensions.margin.left
        const y = yScale(yAccessor(datum)) + dimensions.margin.top

        tooltip.style("transform", `translate(calc(-50% + ${x}px), calc(-100% + ${y}px))`)
        tooltip.style("opacity", 1)
    }
    function onMouseLeave(datum, index) {
        tooltip.style("opacity", 0) 
        d3.selectAll(".tooltipDot").remove()  
    }
    function drawDots(dataset) {
        const dots = bounds.selectAll("circle").data(dataset)
        dots.join("circle")
            .attr("cx", d => xScale(xAccessor(d)))
            .attr("cy", d => yScale(yAccessor(d)))
            .attr("r", 8)
            .attr("fill", d => colorScale(colorAccessor(d)))  
            .attr("opacity", 0.5)
            .on("mouseenter", onMouseEnter)
            .on("mouseleave", onMouseLeave)
    }
    drawDots(dataset)

    // 创建坐标轴
    const xAxisGenerator = d3.axisBottom()
        .scale(xScale)
        .ticks(25)
        .tickSize(-dimensions.height)
    const xAxis = bounds.append("g")
        .call(xAxisGenerator)
        .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    const yAxisGenerator = d3.axisLeft()
        .scale(yScale)
        .ticks(22) // 指定刻度数量
        .tickSize(-dimensions.width)
    const yAxis = bounds.append("g")
        .call(yAxisGenerator)

    // 坐标轴标签
    const xAxisLabel = xAxis.append("text") 
        .attr("x", dimensions.boundedWidth / 2) 
        .attr("y", dimensions.margin.bottom - 10)
        .attr("fill", "black")
        // html中有些使用属性没效果，要用样式，svg都可
        .style("font-size", "1.4em") 
        .html("Dew point (&deg;F)")
    const yAxisLabel = yAxis.append("text")
        .attr("x", -dimensions.boundedHeight / 2)
        .attr("y", -dimensions.margin.left + 10)
        .attr("fill", "black")
        .style("font-size", "1.4em")
        .text("Relative humidity")
        .style("transform", "rotate(-90deg)")
        .style("text-anchor", "middle")
    
    xAxis.selectAll('.domain') 
        .remove()
    yAxis.selectAll('.domain') 
        .remove()
    
}

drawScatter ()