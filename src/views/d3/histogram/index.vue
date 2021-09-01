<template>
  <div class="histogram-wrap">
    <svg />
  </div>
</template>
<script setup>
import * as d3 from 'd3'
import { onMounted } from 'vue'

async function init() {
  let data = []
  await d3.csv('/datas/data.csv').then(res => {
    data = res
  })

  const colors = ['#ffc34a','#ff894a','#ff4a4a']

  const legend = ['Light Duty', 'Medium Duty', 'Heavy Duty']

  const margin = ({ top: 20, right: 30, bottom: 50, left: 40 })

  const width = 1000
  const height = 600

  const line0 = d3
    .line()
    .x(d => x(d.bus) + x.bandwidth() / 2)
    .y(d => y(d.total))

  const x = d3
    .scaleBand()
    .domain(data.map(d => d.bus))
    .rangeRound([margin.left, width - margin.right])
    .padding(0.1)

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.total)])
    .rangeRound([height - margin.bottom, margin.top])

  const xAxis = g => g
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0).tickFormat(d => `${d} 路`))
    .style('color','#999')

  const yAxis = g => g
    .attr('transform', `translate(${margin.left},0)`)
    .style('color', '#999')
    .call(d3.axisLeft(y).ticks(null, 's'))
    .call(g => g.select('.domain').remove())
    .call(g => g.append('text')
      .attr('x', -margin.left)
      .attr('y', 10)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'start')
      .text(data.y1))

  const svg = d3
    .select('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('width', width)
    .attr('height', height)

  svg
    .append('g')
    .attr('fill', '#8cc1ff')
    .attr('fill-opacity', 0.8)
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', d => x(d.bus))
    .attr('width', x.bandwidth())
    .attr('y', d => y(d.total))
    .attr('height', d => y(0) - y(d.total))

    svg
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', colors[1])
    .attr('stroke-miterlimit', 1)
    .attr('stroke-width', 3)
    .attr('d', line0(data))

  svg
    .append('g')
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', d => x(d.bus))
    .attr('width', x.bandwidth())
    .attr('y', 0)
    .attr('height', height)
    .append('title')
    .text(d => `${d.bus} 路\n周里程 ${d.total.toLocaleString('en')} km`)

  svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .selectAll('text')
    .attr('y', 0)
    .attr('x', 9)
    .attr('dy', '.35em')
    .attr('transform', 'rotate(90)')
    .style('text-anchor', 'start')
    .attr('stroke','#999')

  svg
    .append('g')
    .call(yAxis)
    .attr('stroke','#999')
}

onMounted(() => {
  init()
})
</script>
