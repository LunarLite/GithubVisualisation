var xhr = new XMLHttpRequest();
var max_results = 10;
var delayInMilliseconds = 100; //0.1 second
var svgWidth = 960;
var svgHeight = 500;
var imageSize = 256;
var titleStandardX = svgWidth / 2.8;
var titleLeftX =  svgWidth / 80;
var titleRightX = (svgWidth / 80) * 60;
// SVG main objects
var parentSvg, svgTitle, initImage;
// Visualisation data
var repositoryData;
// Growth analysis data
var commitData;
var codeFrequencyData;
// Codeflower data
var structureData;
var commitHistory;

// Initialize basic view
function init_visualisation()
{
	// Setup the base svg
	parentSvg = d3.select('body').append('svg')
		.attr('width', svgWidth)
		.attr('height', svgHeight)
		.classed("parentSvg", true);
		
	parentSvg = d3.select('.parentSvg');
	
	wipe_screen(function() 
	{
		svgTitle.text("Search for a repository!");
		initImage.style('opacity', 1);
	});
}

// Wipe and start structure view
function structure_visualisation()
{	
	wipe_screen(function()
	{
		change_title(titleLeftX, "Structure view of: " + repositoryData.name);
	
	
		var switchButton = parentSvg.append('svg:image')
			.classed("switchButton", true)
			.attr("x", (svgWidth / 10) * 8.5)
			.attr("y", svgHeight / 200)
			.attr("width", imageSize / 2)
			.attr("height", imageSize / 2)
			.attr("xlink:href", "images/template_button.png")
			.on("click", function(d,i)
			{
				growth_visualisation();
			})	
			
		console.log(commitHistory);
		console.log(structureData);
			
		var graph = {
		  nodes: d3.range(13).map(Object),
		  links: [
			{source:  0, target:  1},
			{source:  1, target:  2},
			{source:  2, target:  0},
			{source:  1, target:  3},
			{source:  3, target:  2},
			{source:  3, target:  4},
			{source:  4, target:  5},
			{source:  5, target:  6},
			{source:  5, target:  7},
			{source:  6, target:  7},
			{source:  6, target:  8},
			{source:  7, target:  8},
			{source:  9, target:  4},
			{source:  9, target: 11},
			{source:  9, target: 10},
			{source: 10, target: 11},
			{source: 11, target: 12},
			{source: 12, target: 10}
		  ]
		};

		var force = d3.layout.force()
			.nodes(graph.nodes)
			.links(graph.links)
			.size([svgWidth, svgHeight])
			.charge(-200)
			.on("tick", tick)
			.start();

		var link = parentSvg.selectAll(".link")
		   .data(graph.links)
		 .enter().append("line")
		   .attr("class", "link");

		var node = parentSvg.selectAll(".node")
		   .data(graph.nodes)
		 .enter().append("circle")
		   .attr("class", "node")
		   .attr("r", 4.5)
		   .style("fill", "blue	");

		function tick() {
		  link.attr("x1", function(d) { return d.source.x; })
			  .attr("y1", function(d) { return d.source.y; })
			  .attr("x2", function(d) { return d.target.x; })
			  .attr("y2", function(d) { return d.target.y; });

		  node.attr("cx", function(d) { return d.x; })
			  .attr("cy", function(d) { return d.y; });
		}
	});

}

// Wipe and start growth view
function growth_visualisation()
{	
	wipe_screen(function()
	{
		// Growth analysis as callback
		change_title(titleLeftX, "Growth analysis of: " + repositoryData.name);
		
		var switchButton = parentSvg.append('svg:image')
			.classed("switchButton", true)
			.attr("x", (svgWidth / 10) * 8.5)
			.attr("y", svgHeight / 200)
			.attr("width", imageSize / 2)
			.attr("height", imageSize / 2)
			.attr("xlink:href", "images/template_button.png")
			.on("click", function(d,i)
			{
				structure_visualisation();
			})	
		
		var padding = 60;
		var growthDataWidth = ((svgWidth / 50) * 44) / 1.5 - padding;
		var growthDataHeight = ((svgHeight / 50) * 44) / 2 - padding;
		var growthDataX = 50;
		var growthDataY = ((svgHeight / 50) * 6);

		////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////
		// Actual visualisations for growth analysis - CommitData
		////////////////////////////////////////////////////////////////////////////////////////
		
		var maxCommitValue = d3.max(commitData, function(d) { return d; });
		var commitDataSvg = d3.select('.parentSvg').append('svg')
			.attr('width', growthDataWidth + padding)
			.attr('height', growthDataHeight + padding)
			.attr('x', growthDataX)
			.attr('y', growthDataY)
			.classed("commitDataSvg", true)

		commitDataSvg = d3.select('.commitDataSvg');
		
		var barSelection = commitDataSvg.selectAll("rect")
			.data(commitData);
			
		barSelection.enter().append("rect")
			.classed("bar", true)
			.attr("x",  function(d, i) {return i * ((growthDataWidth) / 52) + padding})
			.attr("y", function(d, i) {return growthDataHeight - ((d / maxCommitValue) * growthDataHeight);})
			.attr("width", growthDataWidth / 52 )
			.attr("height", function(d, i) {return (d / maxCommitValue) * growthDataHeight})

		// define the y scale  (vertical)
        var yCommitScale = d3.scale.linear()
	        .domain([0, Math.ceil(maxCommitValue / 10) * 10])    // values between 0 and i
			.range([growthDataHeight, 0]);
			
		    
		// define the x scale (horizontal)
		var maxDate = new Date();
		var minDate = new Date();
		minDate.setDate(maxDate.getDate() - (7 * 52));
			
		var xCommitScale = d3.time.scale()
			.domain([minDate, maxDate])
			.range([padding, growthDataWidth + padding]);
	
        // define the y axis
        var yCommitAxis = d3.svg.axis()
            .orient("left")
            .scale(yCommitScale);
        
        // define the y axis
        var xCommitAxis = d3.svg.axis()
            .orient("bottom")
            .scale(xCommitScale);
            
        // draw y axis with labels and move in from the size by the amount of padding
        commitDataSvg.append("g")
			.attr("class", "yCommitAxis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yCommitAxis);

        // draw x axis with labels and move to the bottom of the chart area
        commitDataSvg.append("g")
            .attr("class", "xCommitAxis") 
            .attr("transform", "translate(0," + (growthDataHeight) + ")")
            .call(xCommitAxis);
			
		commitDataSvg.selectAll(".xCommitAxis text") 
			.attr("transform", function(d) 
			{
				return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
			});
	
			
		////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////
		// Actual visualisations for growth analysis - CodeFrequency
		////////////////////////////////////////////////////////////////////////////////////////

		var maxCodeValue = d3.max([getTopValue(codeFrequencyData, 1), getBotValue(codeFrequencyData, 2)], function(d) { return d; });
		
		var codeFrequencyDataSvg = d3.select('.parentSvg').append('svg')
			.attr('width', growthDataWidth + padding)
			.attr('height', growthDataHeight + padding)
			.attr('x', growthDataX)
			.attr('y', (growthDataHeight + padding) + growthDataY)
			.classed("codeFrequencyDataSvg", true);
		codeFrequencyDataSvg = d3.select('.codeFrequencyDataSvg');			
			
		// define the y scale  (vertical)
        var yCodeScale = d3.scale.linear()
	        .domain([-maxCodeValue, maxCodeValue])    // values between 0 and i
			.range([growthDataHeight, 0]);
		    
		// define the x scale (horizontal)
		var maxDate = new Date(codeFrequencyData[(codeFrequencyData.length - 1).toString()]["0"]*1000);
		var minDate = new Date(codeFrequencyData["0"]["0"]*1000);
		
		var xCodeScale = d3.time.scale()
			.domain([minDate, maxDate])
			.range([padding, growthDataWidth + padding]);
	
        // define the y axis
        var yCodeAxis = d3.svg.axis()
            .orient("left")
            .scale(yCodeScale);
        
        // define the y axis
        var xCodeAxis = d3.svg.axis()
            .orient("bottom")
            .scale(xCodeScale);
            
        // draw y axis with labels and move in from the size by the amount of padding
        codeFrequencyDataSvg.append("g")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yCodeAxis);

        // draw x axis with labels and move to the bottom of the chart area
        codeFrequencyDataSvg.append("g")
            .attr("class", "xCodeAxis")   // give it a class so it can be used to select only xaxis labels  below
            .attr("transform", "translate(0," + (growthDataHeight) + ")")
            .call(xCodeAxis);
			
		codeFrequencyDataSvg.selectAll(".xCodeAxis text")  // select all the text elements for the xaxis
			.attr("transform", function(d) 
			{
				return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
			});
			
			
		var positiveLine = d3.svg.line()
			.x(function(d, i) { return (i / codeFrequencyData.length) * growthDataWidth + padding;})
			.y(function(d) 
			{ 
				return (-((d["1"] / maxCodeValue) * growthDataHeight / 2) + (growthDataHeight / 2)) - 1; 
			})
			.interpolate('linear');

		var positiveLines = codeFrequencyDataSvg.append("path")
			.attr("d", positiveLine(codeFrequencyData))
			.attr("stroke", "green")
			.attr("stroke-width", 2)
			.attr("fill", "none");
			
		var negativeLine = d3.svg.line()
			.x(function(d, i) { return (i / codeFrequencyData.length) * growthDataWidth + padding;})
			.y(function(d) 
			{ 
				return (-(((d["2"]) / maxCodeValue) * growthDataHeight / 2) + (growthDataHeight / 2)) + 1; 
			})
			.interpolate('linear');

		var negativeLines = codeFrequencyDataSvg.append("path")
			.attr("d", negativeLine(codeFrequencyData))
			.attr("stroke", "red")
			.attr("stroke-width", 2)
			.attr("fill", "none");
	});
}

// Triggered by clicking `search` button, fetches GH API data, sends it to #search_results()
function search_repository()
{
	var query = document.getElementById('searchQuery').value;
	if (!query)
	{
		// Invalid search query
		console.log("Non-valid search query");
		return;
		
	}
	else
	{	
		// Get results
		fetch('https://api.github.com/search/repositories?q=' + query + '&sort=name&order=desc').then(r => r.json()).then(j => search_results(j.items, query));
	}	
}

// Checks if valid data, returns ratelimit if not valid. Shortens amount of results to a maximum of 10.
// Changes title accordingly and shifts away image.
function search_results(data_results, query)
{	
	// Ratelimit/error
	if(!data_results)
	{
		wipe_screen(function()
		{
			change_title(titleStandardX, "Hit the Github API ratelimit!");
			shift_image_in();
		});
		return;
	}
	// Too many results
	if(data_results.length > max_results)
	{
		data_results = data_results.slice(0, max_results);
	}	
	
	wipe_screen(function()
	{
		// Shift&Change main components
		change_title(titleLeftX, "Results for: \"" + query + "\"");
		shift_image_out();
		// Add&Update buttons and results.
		add_results(data_results);
	});
}

// Add/Update search results
function add_results(data_results)
{
	// Add results
	var results = parentSvg.selectAll(".resultText")
		.data(data_results);
	results.enter()
		.append("text")
		.attr("x",  10)
		.attr("y", function(d, i) {return (i * ((svgHeight - 75) / 10)) + 75})
		.classed("resultText", true);
	// Remove previous textual descriptions
	results.selectAll("tspan").remove();
	// Textual descriptions
	results.append("tspan").text(function(d, i)
	{
			return (i+1) + ". ";
		});
	results.append("tspan").style("fill", "green").text(function(d, i)
	{
			return d.owner.login + "/";
		});
	results.append("tspan").style("fill", "black").text(function(d, i)
	{
			return d.name;
		});	
	results.append("tspan").style("fill", "black").text(function(d, i)
	{
		return (d.size/1000) + "MB";
	}).attr("x", 350);
	results.append("tspan").style("fill", "black").text(function(d, i)
	{
		return d.created_at;
	}).attr("x", 450);
	// Remove excess results based on data
	results.exit().remove();
	
	// Add buttons
	var resultButtons = parentSvg.selectAll(".resultButton")
		.data(data_results);
	resultButtons
		.enter()
		.append('svg:image')
			.classed("resultButton", true)
			.attr("x", (svgWidth / 10) * 8)
			.attr("y", function(d, i) {return (i * ((svgHeight - 75) / 10)) + 52})
			.attr("width", imageSize / 7.5)
			.attr("height", imageSize / 7.5)
			.attr("xlink:href", "images/go_icon.png")
			.on("click", function(d,i)
			{
				repositoryData = d;
				setData();
			})	
			
	// Remove excess buttons based on data
	resultButtons.exit().remove();
	
	// Fade results in neatly
	results
	.style('opacity', 0)
	.transition()
		.duration(function(d,i){return i * 150})
		.style('opacity', 1);
	resultButtons
	.style('opacity', 0)
	.transition()
		.duration(function(d,i){return i * 150})
		.style('opacity', 1);
	
}

// Wipe the entire screen and initialize base components. (Title/Image)
function wipe_screen(callback)
{
	parentSvg.selectAll("*")
		.transition()
			.duration(500)
			.style('opacity', 0)	
			.duration(500)
			.remove();
			
	svgTitle = parentSvg.append('text')
		.attr('x', svgWidth / 2.8)
		.attr('y', svgHeight / 15)
		.attr("font-family", "sans-serif")
		.attr("font-size", "25px")
		.attr("text-decoration", "underline")
		.text("");
	initImage = parentSvg.append('svg:image')
		.classed("init_image", true)
		.style('opacity', 0)
		.attr({
			'xlink:href': 'images/page_icon.png',  // can also add svg file here
			x: svgWidth / 2 - imageSize/2,
			y: svgHeight / 2 - imageSize/2,
			width: imageSize,
			height: imageSize
		});
	callback();
}

// Control (base) components
function change_title(x, text)
{
	svgTitle
		.transition()
			.duration(500)
			.attr('x', x)
			.text(text)
			.style('opacity', 1);
}

function shift_image_out()
{
		parentSvg.selectAll(".init_image").transition()
			.duration(500)
			.style('opacity', 0)
			.attr('x', (svgWidth / 80) * 70);
}

function shift_image_in()
{
	parentSvg.selectAll(".init_image").transition()
		.duration(500)
		.style('opacity', 1)
		.attr('x', (svgWidth / 2 - imageSize/2));
}

const setData = async () => {
	// Set weekly commit data from last year
    const commitResponse = await fetch('https://api.github.com/repos/' + repositoryData.owner.login + '/' + repositoryData.name +'/stats/participation');
    const commitJson = await commitResponse.json();
    commitData = commitJson.all;
	// Set codeFrequencyData
	const codeFrequencyResponse = await fetch('https://api.github.com/repos/' + repositoryData.owner.login + '/' + repositoryData.name +'/stats/code_frequency');
    const codeFrequencyJson = await codeFrequencyResponse.json();
    codeFrequencyData = codeFrequencyJson;
	
	
	// Set structureData
	const commitHistoryResponse = await fetch('https://api.github.com/repos/' + repositoryData.owner.login + '/' + repositoryData.name +'/commits');
	const commitHistoryJson = await commitHistoryResponse.json();
	commitHistory = commitHistoryJson;
	
	const structureResponse = await fetch ('https://api.github.com/repos/' + repositoryData.owner.login + '/' + repositoryData.name + '/git/trees/' + commitHistory[0]["sha"] + '?recursive=1');
	const structureJson = await structureResponse.json();
	structureData = structureJson;
	
	
	growth_visualisation();
}

function getTopValue(arr, prop) 
{
	// clone before sorting, to preserve the original array
	var clone = arr.slice(0); 

	// sort descending
	clone.sort(function(x, y) {
		if (x[prop] == y[prop]) return 0;
		else if (parseInt(x[prop]) < parseInt(y[prop])) return 1;
		else return -1;
	});
	var maxValue = clone.slice(0, 1);
	return maxValue[0][prop];
}

function getBotValue(arr, prop) 
{
	// clone before sorting, to preserve the original array
	var clone = arr.slice(0); 

	// sort descending
	clone.sort(function(y, x) {
		if (x[prop] == y[prop]) return 0;
		else if (parseInt(x[prop]) < parseInt(y[prop])) return 1;
		else return -1;
	});
	var minValue = clone.slice(0, 1);
	return minValue[0][prop];
}