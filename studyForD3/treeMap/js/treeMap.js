
async function treeMap() {
    const pathToJSON = "./data/coffeeUncertainty.json"
    const dataset = await d3.json(pathToJSON)
    
    var root, node
    
    node = root = dataset

    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    function size(d) {
        return d.size;
    }
      
    function count(d) {
        return 1;
    }

    var treemap = d3.layout.treemap()
            .round(false)
            .size([width, height])
            .sticky(true)
            // 根据分配面积的值
            .value(size);

    var nodes = treemap.nodes(root)
        .filter(function(d) { return !d.children; })
    
    console.log(node)

    var cell = svg.selectAll("g")
        .data(nodes)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })

    function render(method) {
        cell.append("rect")
            .attr("width", function(d) { return d.dx - 1; })
            .attr("height", function(d) { return d.dy - 1; })
            .attr("fill", function(d) { return "rgb(" + d.colorRed + "," + d.colorGreen + "," + d.colorBlue + ")"; })

        cell.append("text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function(d) { return d.title; })
            .attr("x", function(d) { return d.dx / 2; })
            .attr("y", function(d) { return d.dy / 2; })
            .style("opacity", function(d){
                let w = this.getComputedTextLength();
                return w < (d.dx) ? 1 : 0;
            })
    }

    render(size);

    function change(){
        cell.transition()
            .duration(750)
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .select("rect")
            .attr("width", function(d) { return d.dx - 1; })
            .attr("height", function(d) { return d.dy - 1; })
            
        cell.select("text")
            .transition()
            .duration(750)
            .attr("x", function(d) { return d.dx / 2; })
            .attr("y", function(d) { return d.dy / 2; })
            .style("opacity", function(d){
                let w = this.getComputedTextLength();
                return w < (d.dx) ? 1 : 0;
            })
    }

    d3.select("select").on("change", function() {
        treemap.value(this.value == "size" ? size : count).nodes(root);
        change();  
    });
}

treeMap()

