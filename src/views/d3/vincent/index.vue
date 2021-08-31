<template>
  <div class="vincent">
    <svg class="star-wrap" width="100%" height="100%">
      <g class="diamond-group"></g>
      <g class="meteor-group"></g>
      <g class="path-group">
        <path d="M70,70L530,330L530,70L70,330Z" opacity="0" />
      </g>
    </svg>

    <svg class="force-wrap" width="600" height="400">
      <g class="star-group"></g>
    </svg>
  </div>
</template>

<script setup>
import * as d3 from 'd3'
import { onMounted } from 'vue'

const width = window.innerWidth
const height = window.innerHeight

const rangePoints = (count) => d3
  .range(count)
  .map((i) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2,
    opacity: Math.random()
  }))

// 菱星数量
const diamonds = rangePoints(999)

let diamondDots = null

const radialAreaGenerator = d3
  .radialArea()
  .angle(d => d.angle)
  .outerRadius(d => d.r1)

const points = [
  { angle: 0, r1: 4.5 },
  { angle: Math.PI * 0.25, r1: 1.25 },
  { angle: Math.PI * 0.5, r1: 3.5 },
  { angle: Math.PI * 0.75, r1: 1.25 },
  { angle: Math.PI, r1: 4.5 },
  { angle: Math.PI * 1.25, r1: 1.25 },
  { angle: Math.PI * 1.5, r1: 3.5 },
  { angle: Math.PI * 1.75, r1: 1.25 },
  { angle: Math.PI * 2, r1: 4.5 }
]

function updateDiamond () {
  diamondDots = d3
    .select('.diamond-group')
    .selectAll('path')
    .data(diamonds)
    .join('path')
    .attr('d', radialAreaGenerator(points))
    .attr('transform', d => `translate(${d.x}, ${d.y})`)
    .attr('opacity', 0)

  setTimeout(repeat, 1000)
}

function repeat () {
  diamondDots
    .transition()
    .ease(d3.easeLinear)
    .duration((d, i) => Math.random() * 1500)
    .attr('opacity', 0)
    .transition()
    .ease(d3.easeLinear)
    .duration((d, i) => Math.random() * 1500)
    .attr('opacity', d => d.opacity)
    .on('end', function (d, i) {
      if (i === 0) setTimeout(repeat, 3000)
    })
}

function updateMeteor () {
  // 生成多个圆数据用于渲染流星效果
  const slides = d3
    .range(20)
    .map((i) => ({ r: i * 0.1 }))

  const x = width + Math.random() * 100
  const y = -Math.random() * 100

  d3
    .select('.meteor-group')
    .selectAll('circle')
    .data(slides)
    .join('circle')
    .attr('r', d => d.r)
    .attr('fill', '#fff')
    .attr('cx', x)
    .attr('cy', y)
    .attr('filter', 'url(#glow)') // 添加滤镜模糊效果
    .transition()
    .ease(d3.easeCubicIn)
    .delay(d => Math.round(500 - d.r * 40)) // 添加延迟来模仿流星拖尾效果
    .duration(function () {
      // 根据距离计算持续时间
      const xdiff = x + 20
      const ydiff = y - height - 100
      const distance = Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5)
      return Math.round(distance * 4)
    })
    .attr('cx', -20)
    .attr('cy', height + 100) // 从点(100,100)到点(400,400)
    .remove()
}

function initDefs () {
  // 创建滤镜
  const defs = d3
    .select('.star-wrap')
    .append('defs')

  const filter = defs
    .append('g')
    .append('filter')
    .attr('width', '300%')
    .attr('height', '300%')
    .attr('x', '-150%')
    .attr('y', '-150%')
    .attr('id', 'glow')

  filter
    .append('feGaussianBlur')
    .attr('class', 'blur')
    .attr('stdDeviation', '1')
    .attr('result', 'coloredBlur')
}

const callable = v => typeof v === 'function' ? v : () => v

function createAnimation () {
  const opts = {
    w: 600,
    h: 400,
    count: 300,
    nodePad: 1,
    nodeRadius: 8,
    backgroundColor: '#fff',
    colors: ['#000', '#666', '#aaa'],
    strength: 0.5,
    collideIterations: 3,
    clamp: 10
  }

  const path = d3.select('.path-group path')

  const nodes = Array.from({ length: opts.count }, () => ({ x: 0, y: 0, opacity: Math.random() + 0.2 }))
  const force = pathForce(path, nodes, {
    strength: opts.strength,
    clamp: opts.clamp
  })

  const starGenerator = d3
    .symbol()
    .type(d3.symbolStar)
    .size(20)

  const draw = () => {
    d3.select('.star-group')
      .selectAll('path')
      .data(nodes)
      .join('path')
      .attr('d', starGenerator())
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .attr('fill', '#fff')
      .style('opacity', d => d.opacity)
  }

  d3.forceSimulation(nodes)
    .alphaDecay(0)
    .force('track', force)
    .force('collide', d3.forceCollide(opts.nodeRadius + opts.nodePad).iterations(opts.collideIterations))
    .on('tick', () => {
      draw()
    })
}

function pathForce (path, nodes, {
  strength = 0.1,
  offset = (n, i, nodes) => i / nodes.length,
  initialize = true,
  clamp = Infinity
} = {}) {
  const getStrength = callable(strength)
  const getClamp = callable(clamp)
  const getScale = max => !isFinite(max) ? () => 1 : (dx, dy) => {
    const d = Math.hypot(dx, dy)
    return d ? Math.min(max, d) / d : 0
  }
  const getPoint = (i, l) => path.node().getPointAtLength(offset(nodes[i], i, nodes) * l)
  const getLength = () => path.node().getTotalLength()

  // Initialize node positions along the path.
  if (initialize) {
    const l = getLength()
    for (let i = 0, p; i < nodes.length; i++) {
      p = getPoint(i, l)
      nodes[i].x = p.x
      nodes[i].y = p.y
    }
  }
  // The simulation step callback.
  return () => {
    const l = getLength()
    const s = getStrength()
    const clamp = getScale(getClamp())

    for (let i = 0, p, n, dx, dy, c; i < nodes.length; i++) {
      p = getPoint(i, l)

      n = nodes[i]
      dx = s * (p.x - n.x)
      dy = s * (p.y - n.y)
      c = clamp(dx, dy)
      n.vx += c * dx
      n.vy += c * dy
    }
  }
};

onMounted(() => {
   createAnimation()
  updateDiamond()
  initDefs()

  setInterval(() => {
    updateMeteor()
  }, 1000 * 20)
})

</script>

<style lang="scss">
.vincent {
  width: 100%;
  height: 100vh;
  background: #000;
  position: relative;
  .star-wrap {
    path {
      fill: #fff;
    }
  }

  .force-wrap {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
