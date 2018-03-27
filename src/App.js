/* global Plotly:true */

import React, { Component } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import {exonFactory, depthFactory} from './ExonFactory';
import * as d3 from "d3";
import exons from './data/exons.chrom.start.end.gene-name.txt';

import k1 from './data/depths/K60451.values.txt';
import k2 from './data/depths/K60509.values.txt';
import k3 from './data/depths/K60520.values.txt';
import k4 from './data/depths/K60521.values.txt';
import k5 from './data/depths/K60552.values.txt';
import k6 from './data/depths/K60553.values.txt';

import k7 from './data/depths/K63706.values.txt';
import k8 from './data/depths/K63717.values.txt';

import k9 from './data/depths/K64130.values.txt';
import k10 from './data/depths/K64783.values.txt';
import k11 from './data/depths/K64784.values.txt';
import k12 from './data/depths/K64785.values.txt';

import k13 from './data/depths/K67026.values.txt';
import k14 from './data/depths/K67880.values.txt';

import k15 from './data/depths/K68270.values.txt';

/* (Note that Plotly is already defined from loading plotly.js through a <script> tag) */
const Plot = createPlotlyComponent(Plotly);

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      exonMarkers: [],
      depths: []
    }
  }

  componentDidMount() {
    let that = this;
    const q = d3.queue();

    const depths = [k1, k2, k3, k4, k5, k6, k7, k8, k9, k10, k11, k12, k13, k14, k15];
    const names = ['K60451', 'K60509', 'K60520', 'K60521', 'K60552', 'K60553', 'K63706', 'K63717', 'K64130', 'K64783', 'K64784', 'K64785', 'K67026', 'K67880', 'K68270'];

    q.defer(d3.tsv, exons);

    for (var i = 0; i < depths.length; i++) {
      q.defer(d3.tsv, depths[i]);
    }

    q.awaitAll(function(err, geneObjects) {

      const exonObj = geneObjects.splice(0, 1);

      //console.warn(exonObj[0]);

      const {
        axes,
        exons: exonMarkers,
        exons_by_gene,
      } = exonFactory(exonObj[0]);

      let traceCollection = depthFactory(
        geneObjects,
        names,
        exons_by_gene,
        axes,
      );

      //console.warn(traceCollection);

      that.setState({
        exonMarkers: exonMarkers,
        depths: traceCollection
      });
    });

  }

  render() {
    let data = this.state.exonMarkers;

    const nbPlots = data.length;
    const step = 1./nbPlots;

    data = data.concat(this.state.depths);

    let layout = {
      xaxis: {
        showgrid: false,
        showlines: false,
        showticklabels: false,
        ticks: '',
        zeroline: false,
      },
      yaxis: {
        domain: [0, step],
        fixedrange: true,
        showgrid: false,
        showticklabels: false,
        ticks: '',
        title: data[0] ? data[0].name : null,
        zeroline: false,
      },
      margin: {
        t: 0,
        r: 0,
        b: 0,
      },
      height: nbPlots * 150,
      hovermode: 'x',
    };

    let inf = step;
    for (let i = 1; i < nbPlots; i++) {
      layout[`xaxis${i+1}`] = {
        anchor: `y${i+1}`,
        showgrid: false,
        showlines: false,
        showticklabels: false,
        ticks: '',
        zeroline: false,
      };
      layout[`yaxis${i+1}`] = {
        fixedrange: true,
        zeroline: false,
        ticks: '',
        showgrid: false,
        showticklabels: false,
        domain: [inf, inf + step],
        title: data[i].name,
      };
      inf += step;
    }

    const style = {
      width: '95%',
      height: '100%',
    };

    return (
      <div className="App">
        <p style={{marginLeft: 50}}>Built using plotly.js WebGL. Initial load can take as long as 30 seconds.</p>
        <Plot
          data={data}
          layout={layout}
          style={style}
          useResizeHandler
          config={{
            doubleClick: false
          }}
        />
      </div>
    );
  }
}

export default App;
