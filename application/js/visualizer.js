/* 	GithubVisualisation Project
/  	Name: Mick Tozer
/ 
/	This .js fully controls the visualisations of the web-page.
/	It makes use of the GitHub API to retrieve any required data about a GitHub Repository and then visualises the data in:
/	- A textual visualisation of matching repositories
/ 	- A bar chart
/	- A line-graph
/	- A force-directed graph
*/

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// Global variables
////////////////////////////////////////////////////////////////////////////////////////

// Max amount of search results allowed
var max_results = 10;
// Parent svg settings
var svgWidth = 960;
var svgHeight = 500;
// Default image size
var imageSize = 256;
// Positions to use for changeTitle();
var titleStandardX = svgWidth / 2.8;
var titleLeftX =  svgWidth / 80;
var titleRightX = (svgWidth / 80) * 60;
// SVG main objects
var parentSvg, svgTitle, initImage;
// Visualisation data
var repositoryData;
// Growth analysis data
var commitData;
var commitDataSize = 52;
var codeFrequencyData;
// Codeflower data
var structureData;
var commitHistory;
var structureRoot;
// Colour scheme
var color = d3.scale.category20()
// Slider variables
var slider;
var sliderValue;
// Used for slider, to check if the user is on the structureView
var codeFlowerBox; 

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// Supporting functions
////////////////////////////////////////////////////////////////////////////////////////

// Changes the title component for every visualisation
function changeTitle(x, text)
{
	svgTitle
		.transition()
			.duration(500)
			.attr('x', x)
			.text(text)
			.style('opacity', 1);
}

// Control (base) components
function changeSubText(text)
{
	svgSubText
		.transition()
			.duration(500)
			.attr('x', (svgWidth / 50) * 35)
			.attr('y', (svgHeight / 15) * 14)
			.text(text)
			.style('opacity', 1);
}

// Makes the github logo dissapear
function shiftImageOut()
{
		parentSvg.selectAll(".init_image").transition()
			.duration(500)
			.style('opacity', 0)
			.attr('x', (svgWidth / 80) * 70);
}

//Makes the github logo appear
function shiftImageIn()
{
	parentSvg.selectAll(".init_image").transition()
		.duration(500)
		.style('opacity', 1)
		.attr('x', (svgWidth / 2 - imageSize/2));
}

// Retrieves the file type for each file of the force-directed graph
function getFileType (name)
{
	var cutOffPoint = 0;
	for (var x = 0, y = name.length; x < y; x++)
	{
		if(name.charAt(x) == ".")
		{
			cutOffPoint = x;
		}
	}
	var type = name.slice(cutOffPoint, name.length);
	return type;
}

// Retrieves the file name for each file of the force-directed graph
function getFileName (name)
{
	var cutOffPoint = 0;
	for (var x = 0, y = name.length; x < y; x++)
	{
		if(name.charAt(x) == "/")
		{
			cutOffPoint = x + 1;
		}
	}
	var result = name.slice(cutOffPoint, name.length);
	return result;
}

// Gets the highest value of the code-frequency data
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

// Gets the lowest value of the code-frequency data
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

// Creates a legend for the force-directed graph with colours based on the file types
d3.legend = function createLegend(g) 
{
	g.each(function() {
    var g= d3.select(this),
		items = {},
        svg = d3.select(g.property("nearestViewportElement")),
        legendPadding = g.attr("data-style-padding") || 5,
        lb = g.selectAll(".legend-box").data([true]),
        li = g.selectAll(".legend-items").data([true])

    lb.enter().append("rect").classed("legend-box",true)
    li.enter().append("g").classed("legend-items",true)

    svg.selectAll("[data-legend]").each(function() 
	{
        var self = d3.select(this)
        items[self.attr("data-legend")] = 
		{
			pos : self.attr("data-legend-pos") || this.getBBox().y,
			color : self.attr("data-legend-color") != undefined ? self.attr("data-legend-color") : self.style("fill") != 'none' ? self.style("fill") : self.style("stroke") 
        }
	})

    items = d3.entries(items).sort(function(a,b) { return a.value.pos-b.value.pos})

    
    li.selectAll("text")
        .data(items,function(d) { return d.key})
        .call(function(d) { d.enter().append("text")})
        .call(function(d) { d.exit().remove()})
        .attr("y",function(d,i) { return i+"em"})
        .attr("x","1em")
        .text(function(d) { ;return d.key})
    
    li.selectAll("circle")
        .data(items,function(d) { return d.key})
        .call(function(d) { d.enter().append("circle")})
        .call(function(d) { d.exit().remove()})
        .attr("cy",function(d,i) { return i-0.25+"em"})
        .attr("cx",0)
        .attr("r","0.4em")
        .style("fill",function(d) { return d.value.color})  
    
    // Reposition and resize the box
    var lbbox = li[0][0].getBBox()  
    lb.attr("x",(lbbox.x-legendPadding))
        .attr("y",(lbbox.y-legendPadding))
        .attr("height",(lbbox.height+2*legendPadding))
        .attr("width",(lbbox.width+2*legendPadding))
  })
  return g
}

// Adds a basic description of the line-graph
function addCommitDescript()
{
	var commitDescript = parentSvg.append('text');
		commitDescript
			.append("tspan")
			.attr('x', (svgWidth / 50) * 0.5) 
			.attr('y', (svgHeight / 50) * 9)
			.style("fill", "green")
			.attr("font-family", "sans-serif")
			.attr("font-size", "13px")
			.attr("text-decoration", "underline")
			.text("Amount of commits per week:");
		commitDescript
			.append("tspan")
			.attr('x', (svgWidth / 50) * 0.5) 
			.attr('y', (svgHeight / 50) * 11)
			.style("fill", "black")
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("font-style", "italic")
			.text("This bar chart shows the total amount of commits");
		commitDescript
			.append("tspan")
			.attr('x', (svgWidth / 50) * 0.5) 
			.attr('y', (svgHeight / 50) * 12)
			.style("fill", "black")
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("font-style", "italic")
			.text("per week, from the past year.");
		commitDescript
			.append("tspan")
			.attr('x', (svgWidth / 50) * 0.5) 
			.attr('y', (svgHeight / 50) * 14)
			.style("fill", "black")
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("font-style", "italic")
			.text("Hovering over a bar will show the amount and date.");
}

// Adds a basic description of the bar-chart
function addCodeDescript()
{
	var commitDescript = parentSvg.append('text');
		commitDescript
			.append("tspan")
			.attr('x', (svgWidth / 50) * 0.5) 
			.attr('y', (svgHeight / 50) * 29)
			.style("fill", "green")
			.attr("font-family", "sans-serif")
			.attr("font-size", "13px")
			.attr("text-decoration", "underline")
			.text("CodeFrequency over time");
		commitDescript
			.append("tspan")
			.attr('x', (svgWidth / 50) * 0.5) 
			.attr('y', (svgHeight / 50) * 31)
			.style("fill", "black")
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("font-style", "italic")
			.text("This line-graph shows how many lines of code--");
		commitDescript
			.append("tspan")
			.attr('x', (svgWidth / 50) * 0.5) 
			.attr('y', (svgHeight / 50) * 32)
			.style("fill", "black")
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("font-style", "italic")
			.text("--were removed/added over time.");
		commitDescript
			.append("tspan")
			.attr('x', (svgWidth / 50) * 0.5) 
			.attr('y', (svgHeight / 50) * 34)
			.style("fill", "black")
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("font-style", "italic")
			.text("Green represents addition.");
		commitDescript
			.append("tspan")
			.attr('x', (svgWidth / 50) * 0.5) 
			.attr('y', (svgHeight / 50) * 35)
			.style("fill", "black")
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("font-style", "italic")
			.text("Red represents removal.");
}


////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// Main functions
////////////////////////////////////////////////////////////////////////////////////////

// Creates the base SVG and basic components utilitize wipeScreen()
function initVisualisation()
{
	// Setup the base svg
	parentSvg = d3.select('body').append('svg')
		.attr('width', svgWidth)
		.attr('height', svgHeight)
		.classed("parentSvg", true);
		
	parentSvg = d3.select('.parentSvg');

	
	wipeScreen(function() 
	{
		svgTitle.text("Search for a repository!");
		initImage.style('opacity', 1);
	});
}

// Slowly fades out all items in the base SVG, removes them, and re-initilizes the basic components.
function wipeScreen(callback)
{
	codeFlowerBox = null;
	
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
		
	svgSubText = parentSvg.append('text')
		.attr('x', (svgWidth / 50) * 35)
		.attr('y', (svgHeight / 15) * 14)
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

// Using the search query the user gave, it searches the github API and returns said results to searchResults().
function searchRepository()
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
		fetch('https://api.github.com/search/repositories?q=' + query + '&sort=name&order=desc').then(r => r.json()).then(j => searchResults(j.items, query));
	}	
}

// Checks the validity of given results (checks for a ratelimit!) and limits the amount of results to 10 before sending them to addResults()
function searchResults(dataResults, query)
{	
	// Ratelimit/error
	if(!dataResults)
	{
		wipeScreen(function()
		{
			changeTitle(titleStandardX, "Hit the Github API ratelimit!");
			shiftImageIn();
		});
		return;
	}
	// Too many results
	if(dataResults.length > max_results)
	{
		dataResults = dataResults.slice(0, max_results);
	}	
	
	wipeScreen(function()
	{
		// Shift&Change main components
		changeTitle(titleLeftX, "Results for: \"" + query + "\"");
		shiftImageOut();
		// Add&Update buttons and results.
		addResults(dataResults);
	});
}

// Adds the results to the parent Svg, accompanied by relevant information and fades them in one by one.
function addResults(dataResults)
{
	// Add results
	var results = parentSvg.selectAll(".resultText")
		.data(dataResults);
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
		.data(dataResults);
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

// Once a given result is chosen by the user, setData retrieves all required data from the chosen repository,
// has the data manipulated into shape by formStructure() and calls growthVisualistion() when done.
async function setData()
{
	// Set weekly commit data from last year
    const commitResponse = await fetch('https://api.github.com/repos/' + repositoryData.owner.login + '/' + repositoryData.name +'/stats/participation');
    const commitJson = await commitResponse.json();
    commitData = commitJson.all;
	
	commitDataSize = 52;
	var commitDataStart = 0;
	var commitDataEnd = true;
	commitData.every(function(element, index) 
	{
		if (element == 0 ){ commitDataStart += 1; }
		if (element != 0) return false
		else return true
	});
	commitData = commitData.splice(commitDataStart, commitData.length);
	commitDataSize -= commitDataStart;
	
	while(commitDataEnd)
	{
		if(commitData[commitData.length - 1] == 0)
		{
			commitData = commitData.splice(0, commitData.length - 1);
			commitDataSize -= 1;
		}
		else
		{
			commitDataEnd = false;
		}
	}

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
	
	
	structureVisualisation();
}

//Makes sure that the structure of the force-directed graph is properly built and contains all neccesary data.
async function formStructure(structureJson)
{
	var nodeCount = structureJson.length + 1;
	var graph = {
		nodes: 0,
		links: []};

	var fileCount = 1;
	
	graph.nodes = d3.range(structureJson.length + 1).map(Object);

	graph.links.push({source:  0, target:  0, id: 0 ,type: "root", name: "root"});
	graph.nodes[0]["type"] = "root";
	graph.nodes[0]["name"] = "root";
	

	
	structureJson.forEach(function(entry)
	{
		//console.log(entry);
		var name = entry.path;
		if(!entry.path.includes("/"))
		{
			// Is a folder
			if(entry.type == "blob")
			{
				graph.links.push({source:  0, target:  fileCount, id: fileCount , type: getFileType(name), name: entry.path});
				graph.nodes[fileCount]["type"] = getFileType(name);
				graph.nodes[fileCount]["name"] = getFileName(name);
			}
			// Is a file
			else
			{
				graph.links.push({source:  0, target:  fileCount, id: fileCount , type: "folder", name: entry.path});
				graph.nodes[fileCount]["type"] = "folder";
				graph.nodes[fileCount]["name"] = getFileName(name);
			}
		}
		else
		{
			// Check for last '/'
			var cutOffPoint = 0;
			for (var x = 0, y = entry.path.length; x < y; x++)
			{
				if(entry.path.charAt(x) == "/")
				{
					cutOffPoint = x;
				}
			}
			// Get name of folder it's ment to be placed in
			var path = entry.path.slice(0, cutOffPoint);
			var type = entry.type;
			// Check all links for their path
			graph.links.forEach(function(entry)
			{
				if(entry.name == path)
				{
					// Is a file
					if(type == "blob")
					{
						graph.links.push({source:  entry.target, target:  fileCount, id: fileCount , type: getFileType(name), name: name});
						graph.nodes[fileCount]["type"] = getFileType(name);
						graph.nodes[fileCount]["name"] = getFileName(name);
					}
					// Is a folder
					else
					{
						graph.links.push({source:  entry.target, target:  fileCount, id: fileCount , type: "folder", name: name});
						graph.nodes[fileCount]["type"] = "folder";
						graph.nodes[fileCount]["name"] = getFileName(name);
					}
				}
			});
			
		}
		fileCount += 1;
		
	});
	
	
	return graph;
}

// Clears the screen using wipeScreen() and creates the force-directed graph.
async function structureVisualisation()
{	
	await wipeScreen(async function()
	{
		changeTitle(titleLeftX, "Structure view of: " + repositoryData.name);
		// zoom stuff		
		var zoom = d3.behavior.zoom()
			.scaleExtent([0.5, 2])
			.on("zoom", zoomed);
			
		function zoomed() 
		{
			codeFlowerBox.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		}
		
		
		var switchButton = parentSvg.append('svg:image')
			.classed("switchButton", true)
			.attr("x", (svgWidth / 10) * 8.5)
			.attr("y", svgHeight / 200)
			.attr("width", imageSize / 2)
			.attr("height", imageSize / 2)
			.attr("xlink:href", "images/template_button.png")
			.on("click", function(d,i)
			{
				growthVisualisation();
			})	
			
		var graph = await formStructure(structureData["tree"]);
		var force = d3.layout.force()
			.nodes(graph.nodes)
			.links(graph.links)
			.size([svgWidth, svgHeight])
			.charge(-200)
			.on("tick", tick)
			.start();
			
		parentSvg.call(zoom)
			.on("mousedown.zoom", null)
			.on("touchstart.zoom", null)
			.on("touchmove.zoom", null)
			.on("touchend.zoom", null);;
		
		codeFlowerBox = parentSvg.append("g")
			.attr("class", "codeFlowerBox");


		var link = codeFlowerBox.selectAll(".link")
		   .data(graph.links)
		 .enter().append("line")
		   .attr("class", "link");
		   
		var g = codeFlowerBox.selectAll(".container")
		   .data(graph.nodes)
				.enter().append("g")
				.attr("class", "container")
				.on("mouseover", function(i)
				{
					d3.select(this)
						.style("opacity", 1);
					d3.select(this).selectAll(".nodeText")
						.style("opacity", 1);
				})
				.on("mouseout", function()
				{
					g.style("opacity", 1);
					nodeText.style("opacity", 0.1)
				});
		   
	   var node = g.append("circle")
			.attr("class", "node")
			.attr("r", 4.5)
			.attr('fill', function(d) {return color(d.type);})
			.attr("data-legend",function(d) { return d.type})
			.call(force.drag);

		   
		var nodeText = g.append("text")
			.attr("class", "nodeText")
			.text(function(d){return d.name})
			.attr("pointer-events", "none");
			
		nodeText.style("opacity", 0.1);
			
		
		function tick() 
		{
			link.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });

			node.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; });
			nodeText.attr("x", function(d) { return d.x - 10; })
				.attr("y", function(d) { return d.y - 12; });
		}
		
		var legend = parentSvg.append("g")
			.attr("class","legend")
			.attr("transform","translate(50, 100)")
			.style("font-size","12px")
			.call(d3.legend)
		
		

	});

}

// Clears the screen using wipeScreen() and creates the bar-chart and line-graph.
function growthVisualisation()
{	
	wipeScreen(function()
	{
		// Growth analysis as callback
		changeTitle(titleLeftX, "Growth analysis of: " + repositoryData.name);
		
		var switchButton = parentSvg.append('svg:image')
			.classed("switchButton", true)
			.attr("x", (svgWidth / 10) * 8.5)
			.attr("y", svgHeight / 200)
			.attr("width", imageSize / 2)
			.attr("height", imageSize / 2)
			.attr("xlink:href", "images/template_button.png")
			.on("click", function(d,i)
			{
				slider.value = 100;
				structureVisualisation();
			})	
		
		var topPadding = 30;
		var padding = 60;
		var growthDataWidth = ((svgWidth / 50) * 44) / 1.5 - padding;
		var growthDataHeight = ((svgHeight / 50) * 44) / 2 - padding - topPadding;
		var growthDataX = ((svgWidth / 50) * 13);
		var growthDataY = ((svgHeight / 50) * 6);

		////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////
		// Actual visualisations for growth analysis - CommitData
		////////////////////////////////////////////////////////////////////////////////////////
		addCommitDescript();
		
		var tip = d3.tip()
			.attr('class', 'd3-tip')
			.offset([-10, 0])
			.html(function(d) 
			{
				return "<strong>Commits:</strong> <span style='color:red'>" + d + "</span>";
			})
		
		var maxCommitValue = d3.max(commitData, function(d) { return d; });
		var commitDataSvg = d3.select('.parentSvg').append('svg')
			.attr('width', growthDataWidth + padding)
			.attr('height', growthDataHeight + padding + topPadding)
			.attr('x', growthDataX)
			.attr('y', growthDataY)
			.classed("commitDataSvg", true)

		commitDataSvg.call(tip);
		commitDataSvg = d3.select('.commitDataSvg');
		
		var barSelection = commitDataSvg.selectAll("rect")
			.data(commitData);
			
		barSelection.enter().append("rect")
			.classed("bar", true)
			.attr("x",  function(d, i) {return i * ((growthDataWidth) / commitDataSize) + padding})
			.attr("y", function(d, i) {return growthDataHeight - ((d / maxCommitValue) * growthDataHeight) + topPadding;})
			.attr("width", growthDataWidth / commitDataSize )
			.attr("height", function(d, i) {return (d / maxCommitValue) * growthDataHeight})
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);

		// define the y scale  (vertical)
        var yCommitScale = d3.scale.linear()
	        .domain([0, Math.ceil(maxCommitValue / 10) * 10])    // values between 0 and i
			.range([growthDataHeight, 0]);
			
		    
		// define the x scale (horizontal)
		var maxDate = new Date();
		var minDate = new Date();
		minDate.setDate(maxDate.getDate() - (7 * commitDataSize));
			
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
            .attr("transform", "translate(" + padding + "," + topPadding + ")")
            .call(yCommitAxis);

        // draw x axis with labels and move to the bottom of the chart area
        commitDataSvg.append("g")
            .attr("class", "xCommitAxis") 
            .attr("transform", "translate(0," + (growthDataHeight + topPadding) + ")")
            .call(xCommitAxis);
			
		commitDataSvg.selectAll(".xCommitAxis text") 
			.attr("transform", function(d) 
			{
				return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-35)";
			});
	
			
		////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////
		// Actual visualisations for growth analysis - CodeFrequency
		////////////////////////////////////////////////////////////////////////////////////////
		addCodeDescript();
		
		var maxCodeValue = d3.max([getTopValue(codeFrequencyData, 1), getBotValue(codeFrequencyData, 2)], function(d) { return d; });
		
		var codeFrequencyDataSvg = d3.select('.parentSvg').append('svg')
			.attr('width', growthDataWidth + padding)
			.attr('height', growthDataHeight + padding + topPadding)
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
            .attr("transform", "translate(" + padding + "," + topPadding + ")")
            .call(yCodeAxis);

        // draw x axis with labels and move to the bottom of the chart area
        codeFrequencyDataSvg.append("g")
            .attr("class", "xCodeAxis")   // give it a class so it can be used to select only xaxis labels  below
            .attr("transform", "translate(0," + (growthDataHeight + topPadding) + ")")
            .call(xCodeAxis);
			
		codeFrequencyDataSvg.selectAll(".xCodeAxis text")  // select all the text elements for the xaxis
			.attr("transform", function(d) 
			{
				return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-35)";
			});
			
			
		var positiveLine = d3.svg.line()
			.x(function(d, i) { return (i / codeFrequencyData.length) * growthDataWidth + padding;})
			.y(function(d) 
			{ 
				return (-((d["1"] / maxCodeValue) * growthDataHeight / 2) + (growthDataHeight / 2))+ topPadding; 
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
				return (-(((d["2"]) / maxCodeValue) * growthDataHeight / 2) + (growthDataHeight / 2))+ topPadding; 
			})
			.interpolate('linear');

		var negativeLines = codeFrequencyDataSvg.append("path")
			.attr("d", negativeLine(codeFrequencyData))
			.attr("stroke", "red")
			.attr("stroke-width", 2)
			.attr("fill", "none");
		
		var neutralLine = d3.svg.line()
			.x(function(d, i) { return (i / codeFrequencyData.length) * growthDataWidth + padding;})
			.y(function(d) 
			{ 
				return (growthDataHeight / 2)+ topPadding; 
			})
			.interpolate('linear');
			
		var neutralLines = codeFrequencyDataSvg.append("path")
			.attr("d", neutralLine(codeFrequencyData))
			.attr("stroke", "black")
			.attr("stroke-width", 2)
			.attr("fill", "none");
	});
}

// Links the slider from index.html to the .js file and makes sure it only works while the user is looking at the force-directed graph.
window.onload = function  initializeSlider() 
{
    slider = document.getElementById("slider");
	slider.value = 100;
	sliderValue = slider.value;
	
	slider.oninput = function() 
	{
		if(codeFlowerBox == null)
		{
			slider.value = 100;
			return;
		}
		var commitPos = Math.floor(commitHistory.length - (sliderValue / 100 * commitHistory.length));
		changeSubText(commitHistory[commitPos].commit.author.date);
		sliderValue = slider.value;
		
	}
	slider.onmouseup = async function()
	{
		if(codeFlowerBox == null)
		{
			slider.value = 100;
			return;
		}
		var commitPos = Math.floor(commitHistory.length - (sliderValue / 100 * commitHistory.length));
		
		const structureResponse = await fetch ('https://api.github.com/repos/' + repositoryData.owner.login + '/' + repositoryData.name + '/git/trees/' + commitHistory[commitPos]["sha"] + '?recursive=1');
		const structureJson = await structureResponse.json();
		structureData = structureJson;
		structureVisualisation();
	}
};