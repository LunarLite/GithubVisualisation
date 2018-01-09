function init_visualisation()
{
	// Setup the base svg
	var width = 960;
	var height = 500;
	var imageSize = 256;
	 
	var parentSvg = d3.select('body').append('svg')
		.attr('width', width)
		.attr('height', height)
		.classed("parentSvg", true);
		
	var svgTitle = parentSvg.append('text')
		.attr('x', width / 2.8)
		.attr('y', height / 15)
		.attr("font-family", "sans-serif")
		.attr("font-size", "25px")
		.attr("text-decoration", "underline")
		.text("Search for a repository!");
	
	var initImage = parentSvg.append('svg:image')
		.attr({
			'xlink:href': 'images/page_icon.png',  // can also add svg file here
			x: width / 2 - imageSize/2,
			y: height / 2 - imageSize/2,
			width: imageSize,
			height: imageSize
		});
}

function search_repository()
{
	var query = document.getElementById('searchQuery').value;
	if (query)
	{
		console.log("Searching for: " + query);
	}
	else
	{
		console.log("Non-valid search query");
		return;
	}	
}