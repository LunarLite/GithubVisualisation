var xhr = new XMLHttpRequest();
var max_results = 10;
var svgWidth = 960;
var svgHeight = 500;
// SVG main objects
var parentSvg, svgTitle;

	
function init_visualisation()
{
	// Setup the base svg

	var imageSize = 256;
	 
	parentSvg = d3.select('body').append('svg')
		.attr('width', svgWidth)
		.attr('height', svgHeight)
		.classed("parentSvg", true);
		
	svgTitle = parentSvg.append('text')
		.attr('x', svgWidth / 2.8)
		.attr('y', svgHeight / 15)
		.attr("font-family", "sans-serif")
		.attr("font-size", "25px")
		.attr("text-decoration", "underline")
		.text("Search for a repository!");
	
	var initImage = parentSvg.append('svg:image')
		.attr({
			'xlink:href': 'images/page_icon.png',  // can also add svg file here
			x: svgWidth / 2 - imageSize/2,
			y: svgHeight / 2 - imageSize/2,
			width: imageSize,
			height: imageSize
		});
		
	parentSvg = d3.select('.parentSvg');
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
		// Start search
		console.log("Searching for: " + query);
		fetch('https://api.github.com/search/repositories?q=' + query + '&sort=stars&order=desc').then(r => r.json()).then(j => search_results(j.items))
	}	
}

function search_results(data_results)
{	
	if(data_results.length > max_results)
	{
		data_results = data_results.slice(0, max_results);
	}
	console.log(data_results);
	
	svgTitle
		.transition()
			.attr('x', svgWidth / 80)
			.attr('y', svgHeight / 15)
			.text("Results:");
	parentSvg.selectAll("image").remove();
		
	var results = parentSvg.selectAll(".resultText")
		.data(data_results)
		.enter()
		.append("text")
			.classed("resultText", true)
			.text(function(d, i)
			{
				return (i+1) + ". " + d.owner.login + "/" + d.name + "		" + d.pushed_at;
			})
			.attr("x",  10)
			.attr("y", function(d, i) {return (i * ((svgHeight - 75) / 10)) + 75});
}



