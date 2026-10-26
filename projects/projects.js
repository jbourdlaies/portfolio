import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

let query = '';
let selectedYear = null;

function getFilteredProjects() {
  const normalizedQuery = query.toLowerCase().trim();

  return projects.filter((project) => {
    const values = Object.values(project)
      .join('\n')
      .toLowerCase();

    const matchesQuery = values.includes(normalizedQuery);
    const matchesYear =
      selectedYear === null || project.year === selectedYear;

    return matchesQuery && matchesYear;
  });
}

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

  rolledData.sort(([yearA], [yearB]) =>
    Number(yearA) - Number(yearB)
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
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');

  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  arcData.forEach((arcDatum, index) => {
    svg.append('path')
      .attr('d', arcGenerator(arcDatum))
      .attr('fill', colors(index))
      .attr('class', () =>
        arcDatum.data.label === selectedYear ? 'selected' : null
      )
      .on('click', () => {
        selectedYear =
          selectedYear === arcDatum.data.label
            ? null
            : arcDatum.data.label;

        updatePage();
      });
  });

  data.forEach((d, index) => {
    legend.append('li')
      .attr('class', () =>
        d.label === selectedYear
          ? 'legend-item selected'
          : 'legend-item'
      )
      .attr('style', `--color: ${colors(index)}`)
      .attr('tabindex', '0')
      .attr('role', 'button')
      .attr('aria-pressed', String(d.label === selectedYear))
      .html(
        `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`
      )
      .on('click', () => {
        selectedYear =
          selectedYear === d.label ? null : d.label;

        updatePage();
      })
      .on('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();

          selectedYear =
            selectedYear === d.label ? null : d.label;

          updatePage();
        }
      });
  });
}

function updatePage() {
  const filteredProjects = getFilteredProjects();

  renderProjectList(filteredProjects);

  const normalizedQuery = query.toLowerCase().trim();

  const searchFilteredProjects = projects.filter((project) =>
    Object.values(project)
      .join('\n')
      .toLowerCase()
      .includes(normalizedQuery)
  );

  renderPieChart(searchFilteredProjects);
}

updatePage();

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  updatePage();
});