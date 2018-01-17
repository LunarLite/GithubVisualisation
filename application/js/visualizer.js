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
var repositoryStateData;

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
	
	});

}

// Wipe and start growth view
function growth_visualisation()
{	
	wipe_screen(function()
	{
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
				growth_visualisation();
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
}