// **** Example of how to create padding and spacing for trellis plot****
var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
// This will space out the trellis subplots
var padding = {t: 20, r: 20, b: 60, l: 60};

// Compute the dimensions of the trellis plots, assuming a 2x2 layout matrix.
trellisWidth = svgWidth / 2 - padding.l - padding.r;
trellisHeight = svgHeight / 2 - padding.t - padding.b;

// As an example for how to layout elements with our variables
// Lets create .background rects for the trellis plots
svg.selectAll('.background')
    .data(['A', 'B', 'C', 'C']) // dummy data
    .enter()
    .append('rect') // Append 4 rectangles
    .attr('class', 'background')
    .attr('width', trellisWidth) // Use our trellis dimensions
    .attr('height', trellisHeight)
    .attr('transform', function(d, i) {
        // Position based on the matrix array indices.
        // i = 1 for column 1, row 0)
        var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
        return 'translate('+[tx, ty]+')';
    });

var parseDate = d3.timeParse('%b %Y');
// To speed things up, we have already computed the domains for your scales
var dateDomain = [new Date(2000, 0), new Date(2010, 2)];
var priceDomain = [0, 223.02];

// **** How to properly load data ****

d3.csv('stock_prices.csv').then(function(dataset) {

// **** Your JavaScript code goes here ****

dataset.forEach(function (d){
    d.date = parseDate(d.date);
})

var nested = d3.nest()
    .key(function(d) {return d.company})
    .entries(dataset);
    
console.log(nested);

// create placeholders for group on SVG canvas 
var gPlace = d3.select('svg')
            .selectAll('.trellis')
            .data(nested)
            .enter();

// append group elements to placeholders, add class .trellis, transform using rect setup
var companyG = gPlace.append('g')
            .attr('class', 'trellis')
            .attr('transform', function(d, i) {
                // Position based on the matrix array indices.
                // i = 1 for column 1, row 0)
                var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
                var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
                return 'translate('+[tx, ty]+')';
            });

// part 2 ask ta about how different things are working

var xScale = d3.scaleTime().domain(dateDomain).range([0,trellisWidth]);

var yScale = d3.scaleLinear().domain(priceDomain).range([trellisHeight, 0]);


// when passed array of d values d3 converts to the correct values for the scaled bar chart
var interpolator = d3.line()
                    .x(function(d,i) { return xScale(d.date)})
                    .y(function(d,i) { return yScale(d.price)});


var allKeys = nested.map(function(d) {return d.key});

var colorScale = d3.scaleOrdinal()
            .domain(allKeys)
            .range(d3.schemeCategory10)


var xGrid = d3.axisTop(xScale)
            .tickSize(-trellisHeight, 0, 0)
            .tickFormat('');
        
var yGrid = d3.axisLeft(yScale)
            .tickSize(-trellisWidth, 0, 0)
            .tickFormat('')
    
companyG.append('g')
            .attr('class', 'x axis grid')
            .call(xGrid);
    
companyG.append('g')
            .attr('class', 'y axis grid')
            .call(yGrid);       
        

var path = companyG.append('path')
                .attr('class','line-plot')
                .attr('d', function(d) {
                    return interpolator(d.values)})
                .style('stroke', function(d) { return colorScale(d.key)})


var xAxis = d3.axisBottom(xScale);

var yAxis = d3.axisLeft(yScale);    


companyG.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + trellisHeight + ')')
        .call(xAxis);

companyG.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

companyG.append('text')
        .attr('class', 'company-label')
        .attr('transform', 'translate(' +[trellisWidth/2, trellisHeight/2] + ')')
        .text(function(d) {
            return d.key;
        })
        .style('fill', function(d) { return colorScale(d.key)});

companyG.append('text')
        .attr('class', 'x axis-label')
        .attr('transform', 'translate(' + [trellisWidth / 2, trellisHeight + 34] + ')')
        .text('Date (by Month)')
        .style("font-size", "12px");

companyG.append('text')
        .attr('class', 'y axis-label')
        .attr('transform', 'translate(' + [-30, trellisHeight / 2] + ') rotate (-90)')
        .text('Stock Price (USD)')
        .style("font-size", "12px");




});



// Remember code outside of the data callback function will run before the data loads