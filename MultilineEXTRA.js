//Define Margins
var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//Parse the year from file
var parseDate = d3.time.format("%Y").parse;
var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

//Create the axis's

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .innerTickSize(-height)
    .outerTickSize(0)
    .tickPadding(10);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .innerTickSize(-width)
    .outerTickSize(0)
    .tickPadding(10);

//Define the parameters of line
var line = d3.svg.line()
    .interpolate("cardinal")
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.EPC); });

//Define svg body
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Input data file
 d3.csv("EPC_2000_2010_new.csv", function(error, data) {
  //Color domain to distinguish from each country
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "year"; }));

 //Parse the year
  data.forEach(function(d) {
    d.year = parseDate(d.year);
  });

//Input the countries and its values and give each country a name
  var countries = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {year: d.year, EPC: +d[name]};
      })
    };
  });

//Define the domains
  x.domain(d3.extent(data, function(d) { return d.year; }));

  y.domain([
    d3.min(countries, function(c) { return d3.min(c.values, function(v) { return v.EPC; }); }),
    d3.max(countries, function(c) { return d3.max(c.values, function(v) { return v.EPC; }); })
  ]);
//Call both axis's
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x",-150)
      .attr("y", -50)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Million BTUS per Person");
    
//Bring in the data for countries
  var country = svg.selectAll(".country")
      .data(countries)
    .enter().append("g")
      .attr("class", "path");
//Create the paths
   var path = country.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); })
   
//Add the name of the country at the end of each line
  country.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.EPC) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });
     
//Get the length of the node
    var totalLength = path.node().getTotalLength();
//Create the animation of the line in the form of drawing dashes
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(2000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);
    
    
    //This code is based off of bl.ocks.org https://bl.ocks.org/mbostock/3902569
    
    
    // Append all of g to do mouseovers
     var mouseG = svg.append("g")
      .attr("class", "mouse-over-effects");
    //Create the black vertical line so that you can line up the period of time
    
    mouseG.append("path") 
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", ".5px")
      .style("opacity", "0");
    
    //all lines
    var lines = document.getElementsByClassName('line');

    //Specific hover effect for each line
    var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(countries)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");
    
    
    //Circle to pinpoint part on line
    mousePerLine.append("circle")
      .attr("r", 7)
      .style("stroke", function(d) {
        return color(d.name);
      })
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    //Value at that point
    mousePerLine.append("text")
      .attr("transform", "translate(10,3)");

    //Captures mouse movement
    mouseG.append('svg:rect') 
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
    // Hide everything when mouse is not hovering
      .on('mouseout', function() { 
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
      })
    //Show everything when mouse is hovering
      .on('mouseover', function() {
        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
    //Track mouse movement over page
      .on('mousemove', function() {
        var mouse = d3.mouse(this);
        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + mouse[0] + "," + height;
            d += " " + mouse[0] + "," + 0;
            return d;
          });
    //Position of the circle/text
        d3.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {
            console.log(width/mouse[0])
            var xDate = x.invert(mouse[0]),
                bisect = d3.bisector(function(d) { return d.year; }).right;
                idx = bisect(d.values, xDate);
            
    //http://bl.ocks.org/duopixel/3824661 help point follow the curve and find its position
            var beginning = 0,
                end = lines[i].getTotalLength(),
                target = null;

            while (true){
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
              }
              if (pos.x > mouse[0])      end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }
            
            d3.select(this).select('text')
              .text(y.invert(pos.y).toFixed(2));
            
            //return position
            return "translate(" + mouse[0] + "," + pos.y +")";
          });


});
          });
