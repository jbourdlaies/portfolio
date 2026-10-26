import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

function renderProjectList(projectsToRender) {
  renderProjects(projectsToRender, projectsContainer, 'h2');

  if (projectsTitle) {
    projectsTitle.textContent =
      `Projects (${projectsToRender.length})`;
  }
}

function renderPieChart(projectsGiven) {
  const rolledData = d3.rollups(
    projectsGiven,
    (group) => group.length,
    (project) => project.year
  );

  const data = rolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);

  const sliceGenerator = d3.pie()
    .value((d) => d.value);

  const arcData = sliceGenerator(data);
  const arcs = arcData.map((d) => arcGenerator(d));

  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');

  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  arcs.forEach((arc, idx) => {
    svg.append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));
  });

  data.forEach((d, idx) => {
    legend.append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color: ${colors(idx)}`)
      .html(
        `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`
      );
  });
}

function filterProjects(query) {
  const normalizedQuery = query.toLowerCase().trim();

  return projects.filter((project) => {
    const values = Object.values(project)
      .join('\n')
      .toLowerCase();

    return values.includes(normalizedQuery);
  });
}

renderProjectList(projects);
renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  const filteredProjects = filterProjects(event.target.value);

  renderProjectList(filteredProjects);
  renderPieChart(filteredProjects);
});