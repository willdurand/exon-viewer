/* global Plotly:true */

import React, { Component } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import { createPlot } from './ExonFactory';

import exonsByGene from './data/exons-cached-data.json';
import depthsByNameAndGene from './data/depths-cached-data.json';

/* (Note that Plotly is already defined from loading plotly.js through a <script> tag) */
const Plot = createPlotlyComponent(Plotly);

class App extends Component {
  static defaultProps = {
    withoutIntrons: window.location.search.indexOf('downscale=1') !== -1,
  };

  constructor(props) {
    super(props);

    this.colors = ['green', 'blue', 'darkred', 'purple', 'orange', 'brown', 'pink', 'lightgreen', 'lightblue', 'magenta', 'darkgreen', 'coral', 'aliceblue', 'gold', 'red',];

    this.state = {
      data: null,
      layout: null,
    };
  }

  componentDidMount() {
    const { withoutIntrons } = this.props;

    this.setState(createPlot({
      exonsByGene,
      exonsColors: this.colors,
      depthsByNameAndGene,
      depthsColors: this.colors,
      withoutIntrons,
    }));
  }

  render() {
    const { data, layout } = this.state;

    const style = {
      width: '95%',
      height: '100%',
    };

    return (
      <div className="App">
        <p style={{marginLeft: 50}}>Built using plotly.js WebGL. Initial load can take as long as 30 seconds.</p>
        <p style={{marginLeft: 50}}>
          {this.props.withoutIntrons ? (
            <a href="?downscale=0">with introns</a>
          ) : (
            <a href="?downscale=1">with introns removed</a>
          )}
        </p>
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
