let countyData;
let educationData;

const canvas = d3.select('#canvas');

d3.json('/data/counties.json').then((data, error) => {
	if (error) {
		console.log(error);
	} else {
		countyData = topojson.feature(data, data.objects.counties).features;
		d3.json('/data/for_user_education.json').then((data, error) => {
			if (error) {
				console.log(error);
			} else {
				educationData = data;
				drawMap();
			}
		});
	}
});

function drawMap() {
	const colors = [ '#202040', '#404080', '#808080', '#B0B0F0', '#ffffff' ];

	canvas
		.selectAll('path')
		.data(countyData)
		.enter()
		.append('path')
		.attr('d', d3.geoPath())
		.attr('class', 'county')
		.attr('fill', (item) => {
			let id = item.id;
			let county = educationData.find((item) => {
				return item['fips'] === id;
			});
			let percentage = county['bachelorsOrHigher'];
			if (percentage <= 15) {
				return colors[0];
			} else if (percentage <= 30) {
				return colors[1];
			} else if (percentage <= 45) {
				return colors[2];
			} else if (percentage <= 70) {
				return colors[3];
			} else {
				return colors[4];
			}
		})
		.attr('data-fips', (data) => {
			return data['id'];
		})
		.attr('data-education', (data) => {
			let id = data.id;
			let county = educationData.find((data) => {
				return data['fips'] === id;
			});
			return county['bachelorsOrHigher'];
		})
		.on('mouseover', activateTooltip)
		.on('mouseout', deactivateTooltip);

		const tooltipsvg = canvas
		.append("svg")
		.attr('id','tooltip')
		.attr('width',180)
		.attr('height', 50)
		.style('opacity', 0)

		const tooltip = tooltipsvg.append('rect')
		.attr('width','100%')
		.attr('height','100%')
		.attr('fill', 'yellow')

		function activateTooltip(d, i) {
			let [x, y] = d3.mouse(this);
			if (x > 730) x -= 180;
			if (y < 100) y += 100;

			county = educationData.find(data => {return data['fips'] === d.id});

			d3.select('#tooltip').attr('x', x).attr('y', y - 80).style('opacity', 1).attr('data-education', county.bachelorsOrHigher)
			d3.select('#tooltip').append('text').text(county.area_name + ' ' + county.state).attr('x', 10).attr('y', 20)
			d3.select('#tooltip').append('text').text('Per cent brainy: ' + county.bachelorsOrHigher + '%').attr('x', 10).attr('y', 40);
		}
		function deactivateTooltip() {
			d3.select('#tooltip').style('opacity', 0)
			d3.select('#tooltip').selectAll('text').remove();
		}

	const legend = canvas
		.append('svg')
		.attr('height', 20)
		.attr('width', 100)
		.attr('id', 'legend')
		.attr('x', 700)
		.attr('y', 50);

	legend
		.selectAll('rect')
		.data([ 15, 30, 45, 70 ])
		.enter()
		.append('rect')
		.attr('width', 25)
		.attr('height', 20)
		.attr('x', (d, i) => i * 25)
		.attr('fill', (d, i) => colors[i]);

	canvas.append('text').text('Dumb').attr('y', 64).attr('x', 640);

	canvas.append('text').text('Brainy').attr('y', 64).attr('x', 820);
}
