import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');

if (projectsTitle) {
  projectsTitle.textContent = `Projects (${projects.length})`;
}

const data = [1, 2, 3, 4, 5, 5];

const arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(50);

const sliceGenerator = d3.pie();

const arcData = sliceGenerator(data);

const arcs = arcData.map((d) => arcGenerator(d));

const colors = d3.scaleOrdinal(d3.schemeTableau10);

const svg = d3.select('#projects-pie-plot');

arcs.forEach((arc, idx) => {
  svg.append('path')
    .attr('d', arc)
    .attr('fill', colors(idx));
});