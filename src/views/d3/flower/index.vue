<template>
  <div class="flower">
    <div class="inner">
      <svg width="100%" :height="height"></svg>
    </div>
  </div>
</template>

<script setup>
import * as d3 from 'd3'
import * as _ from 'lodash'
import { flowers, svgHeight } from './utils/mapData'

import { ref, onMounted } from 'vue'

const height = ref(svgHeight)
function init () {
  const svg = d3.select('svg')

  const g = svg
    .selectAll('g')
    .data(flowers)
    .enter()
    .append('g')

  g.attr('transform', (d, i) => `translate(${d.translate})`)

  const path = g.selectAll('path')
    .data(d => {
      return _.times(d.numPetals, i => {
        return Object.assign({}, d, { rotate: i * (360 / d.numPetals) })
      })
    })
    .enter()
    .append('path')
    // _.times(n, [iteratee=_.identity])
    // n -- 调用 iteratee n 次，每次调用返回的结果存入到数组中
    // [iteratee=_.identity] -- 每次迭代调用的函数
    // 调用花瓣个数次，均匀旋转角度形成花朵

  path
    .attr('transform', d => `rotate(${d.rotate})scale(${d.scale})`)
    .attr('d', d => d.path)
    .attr('stroke', d => d.color)
    .attr('fill', d => d.color)
    .attr('fill-opacity', 0.5)

  g.append('text').text(d => d.title)
  const text = g.selectAll('text')

  text.attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .style('font-size', '.7em')
    .style('font-style', 'italic')
    .text(d => _.truncate(d.title, { length: 20 }))
}

onMounted(() => {
  init()
})

</script>

<style lang="scss" scoped>
.flower {
  .inner {
    height: 522px;
    overflow-y: scroll;
    overflow-x: hidden;
  }
}
</style>
