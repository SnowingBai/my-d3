import * as d3 from 'd3'
import * as _ from 'lodash'
import moviesObj from './movies.json'

export const topGenres = ['Action', 'Comedy', 'Animation', 'Drama']

export const petalColors = ['#ffc8f0', '#cbf2bd', '#afe9ff', '#ffb09e']

export const rated = ['G', 'PG', 'PG-13', 'R']

export const petalPaths = [
  'M0 0 C50 50 50 100 0 100 C-50 100 -50 50 0 0',
  'M-35 0 C-25 25 25 25 35 0 C50 25 25 75 0 100 C-25 75 -50 25 -35 0',
  'M0,0 C50,40 50,70 20,100 L0,85 L-20,100 C-50,70 -50,40 0,0',
  'M0 0 C50 25 50 75 0 100 C-50 75 -50 25 0 0'
]

export const pathColors = ['#46e276', '#6e94e7', '#b877e9', '#f25d75']

export const movies = Object.values(moviesObj)
  .map(d => (
    {
      title: d.Title,
      released: new Date(d.Released),
      genres: d.Genre.split(', '),
      rating: +d.imdbRating,
      votes: +(d.imdbVotes.replace(/,/g, '')),
      rated: d.Rated
    }
  ))
  .sort((a, b) => b.released - a.released)

const pathWidth = 120
const perRow = 7
export const svgHeight = (Math.ceil(movies.length / perRow) + 0.5) * pathWidth

export const calculateGridPos = (i) => {
  return [(i % perRow + 0.5) * pathWidth, (Math.floor(i / perRow) + 0.5) * pathWidth]
}

const colorScale = d3.scaleOrdinal()
  .domain(topGenres)
  .range(petalColors)
  .unknown('#fff2b4')

const petalScale = d3.scaleOrdinal()
  .range(petalPaths)

const sizeScale = d3.scaleLinear()
  .domain(d3.extent(movies, d => d.rating))
  .range([0.1, 0.6])

const numPetalScale = d3.scaleQuantize()
  .domain(d3.extent(movies, d => d.votes))
  .range(_.range(5, 10))
  // [5, 6, 7, 8, 9]
  // _.range([start=0], end, [step=1])
  // [start, end)
  // if start 是负数，end 和 step 未指定，则 step 从 -1 开始
  // if end < start 创建一个空数组，除非指定 step

export const flowers = movies.map((d, i) => (
  {
    title: d.title,
    color: colorScale(d.genres[0]),
    path: petalScale(d.rated),
    scale: sizeScale(d.rating),
    numPetals: numPetalScale(d.votes), // 花瓣个数
    translate: calculateGridPos(i)
  }
))
