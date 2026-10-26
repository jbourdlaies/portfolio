import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');

if (projectsTitle) {
  projectsTitle.textContent = `Projects (${projects.length})`;
}

const rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year
);

const data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});

const arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(50);

const sliceGenerator = d3.pie()
  .value((d) => d.value);

const arcData = sliceGenerator(data);
const arcs = arcData.map((d) => arcGenerator(d));

const colors = d3.scaleOrdinal(d3.schemeTableau10);

const svg = d3.select('#projects-pie-plot');

arcs.forEach((arc, idx) => {
  svg.append('path')
    .attr('d', arc)
    .attr('fill', colors(idx));
});

const legend = d3.select('.legend');

data.forEach((d, idx) => {
  legend.append('li')
    .attr('class', 'legend-item')
    .attr('style', `--color: ${colors(idx)}`)
    .html(
      `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`
    );
});