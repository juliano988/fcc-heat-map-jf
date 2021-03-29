import React, { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { DataRes } from '../customInterfaces';
import * as d3 from "d3";

export default function Home(props: { data: DataRes }) {

  const minYear = Math.min(...props.data.monthlyVariance.map(function (arg) { return arg.year }));
  const maxYear = Math.max(...props.data.monthlyVariance.map(function (arg) { return arg.year }));

  return (
    <div className={styles.container}>
      <Head>
        <title>FCC Heat Map</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Monthly Global Land-Surface Temperature</h1>
      <h3>{minYear} - {maxYear}: base temperature {props.data.baseTemperature}℃</h3>
      <div style={{ width: '70vw', height: '70vh', margin: 'auto' }}>
        <Graphic data={props.data} />
      </div>
    </div>
  )
}

function Graphic(props: { data: DataRes }) {

  const yAxisDivRef = useRef<HTMLDivElement>(null);
  const graphicDivRef = useRef<HTMLDivElement>(null);

  const yearArr = props.data.monthlyVariance.map(function (arg) { return arg.year }).filter(function (arg, i, arr) { return arg !== arr[i + 1] });
  const blockWidth = 10;
  const scrollBarHeightOffset = 4;
  const leftLabelDivWidth = 75;
  const minYear = Math.min(...props.data.monthlyVariance.map(function (arg) { return arg.year }));
  const maxYear = Math.max(...props.data.monthlyVariance.map(function (arg) { return arg.year }));

  useEffect(function () {

    const svgWidth = yearArr.length * blockWidth;
    const svgHeight = graphicDivRef.current.clientHeight;

    const svg = d3.select(graphicDivRef.current)
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight)

    const blocks = svg.append('g')
      .selectAll('rect')
      .data(props.data.monthlyVariance)
      .enter().append('rect')
      .style('fill', (d) => {
        const temp = props.data.baseTemperature + d.variance;
        if (temp <= 3.9) { return 'rgb(69, 117, 180)' }
        else if (temp <= 5) { return 'rgb(116, 173, 209)' }
        else if (temp <= 6.1) { return 'rgb(171, 217, 233)' }
        else if (temp <= 7.2) { return 'rgb(224, 243, 248)' }
        else if (temp <= 8.3) { return 'rgb(255, 255, 191)' }
        else if (temp <= 9.5) { return 'rgb(254, 224, 144)' }
        else if (temp <= 10.6) { return 'rgb(253, 174, 97)' }
        else if (temp <= 11.7) { return 'rgb(244, 109, 67)' }
        else if (temp <= 12.8) { return 'rgb(215, 48, 39)' }
        else { return 'rgb(165, 0, 38)' }
      })
      .attr('height', (svgHeight / 12) - scrollBarHeightOffset)
      .attr('width', blockWidth)
      .attr('y', (d) => (d.month - 1) * ((svgHeight / 12) - scrollBarHeightOffset))
      .attr('x', (d) => yearArr.indexOf(d.year) * blockWidth)

    const xAxis = svg.append('g')
      .call(d3.axisBottom(d3.scaleTime().domain([new Date(minYear, null), new Date(maxYear, null)]).range([0, svgWidth]))
        .ticks(d3.timeYear.every(10)))
      .attr('transform', 'translate(0,' + (svgHeight - scrollBarHeightOffset * 12) + ')')
      .selectAll('text')
      .style('font-size', 16)

    const yAxis = d3.select(yAxisDivRef.current)
      .append('svg')
      .attr('height', '100%')
      .attr('width', leftLabelDivWidth + 'px')
      .append('g')
      .call(d3.axisLeft(d3.scaleLinear().domain([0, 11]).range([0, (svgHeight - scrollBarHeightOffset * 12 - svgHeight / 12)]))
        .tickFormat((d) => { return new Date(null, d).toLocaleString(undefined, { month: 'long' }).replace(/./, (d) => d.toUpperCase()) })
        .tickSize(0))
      .attr('transform', 'translate(' + leftLabelDivWidth + ','+svgHeight/12/2+')')

    yAxis.selectAll('text')
      .style('font-size', 16)

    yAxis.select('path').remove()

    console.log(props.data.monthlyVariance)

    return (function () {
      d3.select(yAxisDivRef.current).select('svg').remove();
      d3.select(graphicDivRef.current).select('svg').remove();
    })

  }, [])

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', margin: 'auto', }}>
      <div ref={yAxisDivRef} style={{ width: leftLabelDivWidth + 'px' }} />
      <div ref={graphicDivRef} style={{ height: '100%', width: '100%', margin: 'auto', overflowX: 'auto', overflowY: 'hidden' }} />
    </div>
  )
}

export async function getStaticProps(context) {
  const res = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
  const data = await res.json()

  return {
    props: { data }, // will be passed to the page component as props
  }
}
