/* global Plotly:true */

import React, { Component } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import { createPlot } from './ExonFactory';

import exonsByGene from './data/exons-cached-data.json';
import depthsByNameAndGene from './data/depths-cached-data.json';
import tinyDepthsByNameAndGene from './data/tiny-depths-cached-data.json';

/* (Note that Plotly is already defined from loading plotly.js through a <script> tag) */
const Plot = createPlotlyComponent(Plotly);

class App extends Component {
  static defaultProps = {
    removeIntrons: window.location.search.indexOf('downscale=1') !== -1,
    withTinyDataset: window.location.search.indexOf('tiny=1') !== -1,
  };

  constructor(props) {
    super(props);

    this.state = {
      data: null,
      layout: null,
    };
  }

  componentDidMount() {
    const { removeIntrons, withTinyDataset } = this.props;
    const dataset = withTinyDataset ? tinyDepthsByNameAndGene : depthsByNameAndGene;

    const { data, layout } = createPlot({
      exonsByGene,
      depthsByNameAndGene: dataset,
      removeIntrons,
    });

    this.setState({
      data,
      layout,
    });
  }

  render() {
    const { data, layout } = this.state;
    const { removeIntrons, withTinyDataset } = this.props;

    const fullDatasetURL = `?tiny=0&downscale=${removeIntrons ? 1 : 0}`;
    const tinyDatasetURL = `?tiny=1&downscale=${removeIntrons ? 1 : 0}`;
    const originalURL = `?tiny=${withTinyDataset ? 1 : 0}&downscale=0`;
    const downscaleURL = `?tiny=${withTinyDataset ? 1 : 0}&downscale=1`;

    const style = {
      width: '95%',
      height: '100%',
    };

    return (
      <div className="App">
        <p style={{marginLeft: 50}}>
          Built using plotly.js WebGL. Initial load can take as long as 30 seconds.
        </p>
        <p style={{marginLeft: 50}}>
          <span role="img">📊</span>
          {withTinyDataset ? (
            <React.Fragment>
              <span>Tiny dataset loaded</span>
              &nbsp;&mdash;&nbsp;
              <a href={fullDatasetURL}>load full dataset</a>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <span>Full dataset loaded</span>
              &nbsp;&mdash;&nbsp;
              <a href={tinyDatasetURL}>load tiny dataset</a>
            </React.Fragment>
          )}
        </p>
        <p style={{marginLeft: 50}}>
          <span role="img">🔎</span>
          {removeIntrons ? (
            <a href={originalURL}>display introns</a>
          ) : (
            <a href={downscaleURL}>remove introns</a>
          )}
        </p>
        <hr />
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
