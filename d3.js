$(function() {
	$.getJSON('https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json', (data) => {
		let width = $(document).width() -5;
		let height = $(document).height() -5;
		$('#flags').css('width', width).css('height', height);

		let links = data.links;
		let nodes = data.nodes;

		// parsing links to nodes. the || makes it so if a node by that name already exists, it's not added again
		links.forEach(function(link) {
			link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
			link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
		});

		// add svg to body
		var svg = d3.select('body').append('svg')
			.attr('width', width)
			.attr('height', height);
			// .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink"'); // using svg image instead of img wouldn't work cause we want to apply the styles/size via css classes


		var simulation = d3.forceSimulation()
		.force("link", d3.forceLink().distance(80).strength(0.3).id(function(d) { return d.country; })) //default distance is 30. adding the strength makes it much easier to pull  around
		.force("charge", d3.forceManyBody().strength(-10)) // negative value for repelling force, positive for attracting
		.force("center", d3.forceCenter(width / 2, height / 2))
		.force('collide', d3.forceCollide(10)); // treats each node as a circle with radius 10. Makes it so the flags won't overlap

		var link = svg.selectAll('.link')
			.data(links)
			.enter().append('line')
			.attr('class','link');

		var node = d3.select('#flags').selectAll('.node') //svg can't contain regular img elements so we have to put them somewhere else in the DOM
			.data(nodes)
			.enter().append('img')
			.attr('class', function(d) { return 'node flag flag-' + d.code; })
			.call(d3.drag()
				 .on("start", dragstarted)
				 .on("drag", dragged)
				 .on("end", dragended));

	   simulation
	       .nodes(nodes)
	       .on("tick", ticked);

	   simulation.force("link")
	       .links(links);

		function ticked(e) {
			link
		        .attr("x1", function(d) { return d.source.x; })
		        .attr("y1", function(d) { return d.source.y; })
		        .attr("x2", function(d) { return d.target.x; })
		        .attr("y2", function(d) { return d.target.y; });

		    node // keeps it in the bounds of the screen by forcibly setting its value when it tries to leave
		        .style("left", function(d) { return ( Math.max(0, Math.min(width - 11, d.x))) + 'px'; })
		        .style("top", function(d) { return (Math.max(0, Math.min(height - 8, d.y))) + 'px'; });
		}

		function dragstarted(d) {
		  if (!d3.event.active) simulation.alphaTarget(1).restart(); // affects movespd of the flags
		  d.fx = d.x;
		  d.fy = d.y;
		}

		function dragged(d) {
		  d.fx = d3.event.x;
		  d.fy = d3.event.y;
		}

		function dragended(d) {
		  d.fx = null;
		  d.fy = null;
		}

	});
});
