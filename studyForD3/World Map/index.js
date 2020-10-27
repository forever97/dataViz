const svg = d3.select('svg');

const w = +svg.attr('width');
const h = +svg.attr('height');

// https://github.com/d3/d3-geo
// https://github.com/d3/d3-geo-projection
// const projection = d3.geoMercator();
const projection = d3.geoNaturalEarth1();
const pathGenerator = d3.geoPath().projection(projection);

// 球体部分
svg.append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({type: 'Sphere'}));

d3.json('http://unpkg.com/world-atlas@1.1.4/world/110m.json')
    .then(data =>{
        const countries = topojson.feature(data, data.objects.countries);
        //console.log(countries);
        // 国家部分
        svg.selectAll('path')
            .data(countries.features)
            .enter().append('path')
            .attr('class', 'country')
            //.attr('d', d => pathGenerator(d));
            .attr('d', pathGenerator);
    });

