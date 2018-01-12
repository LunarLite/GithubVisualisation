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
	
function init_visualisation()
{
	// Setup the base svg
	parentSvg = d3.select('body').append('svg')
		.attr('width', svgWidth)
		.attr('height', svgHeight)
		.classed("parentSvg", true);
		
	parentSvg = d3.select('.parentSvg');
	
	wipe_screen();
	svgTitle.text("Search for a repository!");
	initImage.style('opacity', 1);
}

function structure_visualisation()
{
	wipe_screen();
	console.log(repositoryData);
	change_title(titleLeftX, "Structure view of: " + repositoryData.name);
	
	
	parentSvg.selectAll("rect")
	  .data(["Switch view"])
	  .enter()
	  .append("rect")
		.attr("id", function(d) { return d; })
		.text(d);
}

function growth_visualisation()
{
	wipe_screen();
	console.log(repositoryData);
	change_title(titleLeftX, "Growth analysis of: " + repositoryData.name);
}




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
		// Start search by removing previous results
		wipe_screen();
		// Get results
		setTimeout(function () 
		{
			fetch('https://api.github.com/search/repositories?q=' + query + '&sort=stars&order=desc').then(r => r.json()).then(j => search_results(j.items, query))
		}, 200);
	}	
}

function search_results(data_results, query)
{	
	// Ratelimit/error
	if(!data_results)
	{
		change_title(titleStandardX, "Hit the Github API ratelimit!");
		shift_image_in();
		return;
	}
	// Too many results
	if(data_results.length > max_results)
	{
		data_results = data_results.slice(0, max_results);
	}	
	
	change_title(titleLeftX, "Results for: \"" + query + "\"");
	shift_image_out();

	add_results(data_results);
	add_buttons(data_results);

}

function add_results(data_results)
{
	// Initialize texts and make invisible
	var results = parentSvg.selectAll(".resultText")
		.data(data_results)
		.enter()
		.append("text")
			.style('opacity', 0)
			.classed("resultText", true);
	
	// Add proper text for each result
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
	
	// Set default position
	results
		.attr("x",  10)
		.attr("y", function(d, i) {return (i * ((svgHeight - 75) / 10)) + 75});
		
	// Add tabbed text
	results.append("tspan").style("fill", "black").text(function(d, i)
	{
		return (d.size/1000) + "MB";
	}).attr("x", 350)	
	results.append("tspan").style("fill", "black").text(function(d, i)
	{
		return d.pushed_at;
	}).attr("x", 450)
	
	
	// Make visible
	results
		.transition()
			.duration(function(d, i)
			{
				return i * 100;
			})
			.style('opacity', 1);
}

function add_buttons(data_results)
{
	var results = parentSvg.selectAll(".resultButton")
		.data(data_results)
		.enter()
		.append('svg:image')
			.style('opacity', 0)
			.classed("resultButton", true)
			.attr("x", (svgWidth / 10) * 8)
			.attr("y", function(d, i) {return (i * ((svgHeight - 75) / 10)) + 52})
			.attr("width", imageSize / 7.5)
			.attr("height", imageSize / 7.5)
			.attr({
				'xlink:href': 'images/go_icon.png'
			})
			.on("click", function(d,i)
			{
				repositoryData = d;
				structure_visualisation();
			})
			.transition()
				.duration(function(d, i)
				{
					return i * 100;
				})
				.style('opacity', 1);


}

function wipe_screen()
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
}

function change_title(x, text)
{
	svgTitle
		.transition()
			.duration(500)
			.attr('x', x)
			.text(text);
}

function shift_image_out()
{
		parentSvg.selectAll(".init_image").transition()
			.duration(500)
			.style('opacity', 0)
			.attr('x', (svgWidth / 80) * 70)
			.duration(500);
}

function shift_image_in()
{
		parentSvg.selectAll(".init_image").transition()
			.duration(500)
			.style('opacity', 1)
			.attr('x', (svgWidth / 2 - imageSize/2))
			.duration(500);
}