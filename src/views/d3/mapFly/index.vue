<template>
  <div class="map-fly">
    <svg width="1000" height="1000">
      <defs>
        <mask id="Mask">
          <circle id="circle" r="150" fill="url(#grad)" />
        </mask>

        <radialGradient id="grad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stop-color="#fff" stop-opacity="1" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
      </defs>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { defineComponent, onMounted } from 'vue'
import ZJJson from './utils/ZJ.json'
export default defineComponent({
  name: 'MapFly',
  setup () {
    // const color = d3.schemeCategory10
    let projection
    let svg, lineGroups

    const dataset = [
      {
        name: '宁波市',
        centroid: [121.479174, 29.733017],
        num: 15
      }, {
        name: '温州市',
        centroid: [120.463943, 27.89471],
        num: 13
      }, {
        name: '嘉兴市',
        centroid: [120.78354, 30.620057],
        num: 6
      }, {
        name: '湖州市',
        centroid: [119.873716, 30.743051],
        num: 2
      }, {
        name: '绍兴市',
        centroid: [120.640942, 29.732872],
        num: 8
      }, {
        name: '金华市',
        centroid: [119.957007, 29.115117],
        num: 7
      }, {
        name: '衢州市',
        centroid: [118.679569, 28.932446],
        num: 3
      }, {
        name: '舟山市',
        centroid: [122.146626, 30.056537],
        num: 1
      }, {
        name: '台州市',
        centroid: [121.136679, 28.757098],
        num: 9
      }, {
        name: '丽水市',
        centroid: [119.517145, 28.197644],
        num: 4
      }
    ]

    function initMap () {
      svg = d3.select('svg')
      const width = svg.attr('width')
      const height = svg.attr('height')
      // 定义地图投影
      projection = d3.geoMercator().center([120.372256, 29.106157]).scale(8000).translate([width / 2, height / 2])
      // 定义地理路径生成器
      const path = d3.geoPath(projection)

      // 生成地图
      const mapGroups = svg.append('g').attr('class', 'mapGroups')
      mapGroups
        .selectAll('path')
        .data(ZJJson.features)
        .enter()
        .append('path')
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .attr('stroke', 'DarkGrey')
        .attr('d', path)

      const textGroups = svg.append('g').attr('class', 'textGroups')
      textGroups
        .selectAll('text')
        .data(ZJJson.features)
        .enter()
        .append('text')
        .attr('font-size', 14)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('x', (d, i) => {
          const position = projection(d.properties.center)
          return position[0]
        })
        .attr('y', (d, i) => {
          const position = projection(d.properties.center)
          return position[1]
        })
        .text((d, i) => d.properties.name)
    }

    // 绘制弧线
    function initBaseLine () {
      const pointData = []

      for (let i = 0; i < dataset.length; i++) {
        // 计算飞线点坐标
        const startPoint = projection([120.153576, 30.287459])
        const endPoint = projection(dataset[i].centroid)
        pointData.push({
          startPoint,
          endPoint,
          controlPoint: computeControlPoint(startPoint, endPoint, 0.5)
        })

        // 创建基础线
        const baseLineGroups = svg.append('g').attr('class', 'baseLineGroups')
        baseLineGroups
          .append('path')
          .attr('stroke', 'none')
          .attr('fill', 'none')
          .attr('class', `line-path${i}`)
          .attr('d', () => transPath(pointData[i]))

        // 创建飞线
        lineGroups = svg.append('g').attr('class', 'lineGroups')

        // 添加蒙版
        const defs = svg.select('defs')
        defs
          .append('mask')
          .attr('id', `Mask${i}`)
          .append('circle')
          .attr('id', `circle${i}`)
          .attr('r', 150)
          .attr('fill', 'url(#grad)')
      }
    }

    function transPath ({ startPoint, controlPoint, endPoint }) {
      return `M${startPoint[0]},${startPoint[1]} Q${controlPoint[0]},${controlPoint[1]} ${endPoint[0]},${endPoint[1]}`
    }

    // 计算二阶贝塞尔曲线控制点
    function computeControlPoint (ps, pe, arc = 0.5) {
      const deltaX = pe[0] - ps[0]
      const deltaY = pe[1] - ps[1]
      const theta = Math.atan(deltaY / deltaX)
      const len = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY)) / 2 * arc
      const newTheta = theta - Math.PI / 2
      return [
        (ps[0] + pe[0]) / 2 + len * Math.cos(newTheta),
        (ps[1] + pe[1]) / 2 + len * Math.sin(newTheta)
      ]
    }

    const scale = d3.scaleLinear()
      .domain([d3.min(dataset, (d) => d.num), d3.max(dataset, (d) => d.num)])
      .range([1, 10])

    function animate () {
      for (let i = 0; i < dataset.length; i++) {
        lineGroups.select(`#flyline-path${i}`).remove()
        lineGroups
          .append('path')
          .attr('id', `#flyline-path${i}`)
          .attr('stroke', '#FFCE00')
          .attr('stroke-width', scale(dataset[i].num))
          .attr('fill', 'none')
          .attr('mask', `url(#Mask${i})`)
          .transition()
          .duration(2500) // 动画时长
          .ease(d3.easeLinear)
          .delay(1200)
          .attrTween('d', () => {
            const $path = d3.select(`.line-path${i}`).node()
            const l = $path.getTotalLength()
            const coord = $path.getAttribute('d').replace(/(M|Q)/g, '').match(/((\d|\.)+)/g)
            const x1 = +coord[0]
            const y1 = +coord[1] // 起点
            const x2 = +coord[2]
            const y2 = +coord[3] // 控制点
            return function (t) {
              const p = $path.getPointAtLength(t * l) // 新的终点
              const x = ((1 - t) * x1) + (t * x2)
              const y = ((1 - t) * y1) + (t * y2)
              d3.select(`#circle${i}`)
                .attr('cx', p.x) // 蒙版坐标
                .attr('cy', p.y)
                .attr('r', l / 2) // 设置蒙版半径随路径长度变化
              return `M${x1},${y1} Q${x},${y} ${p.x},${p.y}`
            }
          })
          .transition()
          .duration(2400)
          .style('opacity', 0)
      }
    }

    onMounted(() => {
      initMap()
      initBaseLine()
      animate()
      setInterval(animate, 5000)
    })
    return {}
  }
})
</script>

<style lang="scss" scoped>
.map-fly {
  background: #1d2a43;
}
</style>
