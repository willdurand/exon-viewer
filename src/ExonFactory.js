const PADDING = 70;
const COLORS = ['green', 'blue', 'darkred', 'purple', 'orange', 'brown',
                'pink', 'lightgreen', 'lightblue', 'magenta', 'darkgreen',
                'coral', 'aliceblue', 'gold', 'red',];

function exonFactory(exonsByGene, downScale) {
  const axes = {};
  const exons = Object.keys(exonsByGene).map((gene, index) => {
    const positions = exonsByGene[gene];

    const xValues = [];
    const yValues = [];
    const textValues = [];

    if (downScale) {
      let sum = 0;
      for (let i = 0; i < positions.length; i += 2) {
        const len = Number(positions[i + 1]) - Number(positions[i]);

        xValues.push(Number(sum));
        xValues.push(Number(sum) + len);
        xValues.push(NaN);

        yValues.push(-36);
        yValues.push(-36);
        yValues.push(NaN);

        textValues.push(Number(positions[i]));
        textValues.push(Number(positions[i + 1]));
        textValues.push(NaN);

        sum = sum + len + PADDING;
      }
    } else {
      for (let i = 0; i < positions.length; i += 2) {
        xValues.push(Number(positions[i]));
        xValues.push(Number(positions[i + 1]));
        xValues.push(NaN);

        yValues.push(-36);
        yValues.push(-36);
        yValues.push(NaN);

        textValues.push(Number(positions[i]));
        textValues.push(Number(positions[i + 1]));
        textValues.push(NaN);
      }
    }

    axes[gene] = {
      xaxis: index === 0 ? undefined : `x${index + 1}`,
      yaxis: index === 0 ? undefined : `y${index + 1}`,
    };

    return {
      ...axes[gene],
      x: xValues,
      y: yValues,
      text: textValues,
      type: 'scattergl',
      connectgaps: false,
      hoverinfo: 'text',
      name: gene,
      showlegend: false,
      line: {
        width: 8,
        color: COLORS[index],
      },
    };
  });

  return {
    axes,
    exons,
  };
}

function depthFactory(depthsByNameAndGene, exonsByGene, axes, downScale) {
  const exonPairs = {};

  if (downScale) {
    Object.keys(exonsByGene).forEach((key) => {
      const positions = exonsByGene[key];

      const pairs = [];
      let sum = 0;
      for (let i = 0; i < positions.length; i += 2) {
        const len = Number(positions[i + 1]) - Number(positions[i]);

        pairs.push({
          start: Number(positions[i]),
          end: Number(positions[i + 1]),
          len,
          startAt: Number(sum),
        });

        sum = sum + len + PADDING;
      }

      exonPairs[key] = pairs;
    });
  }

  const depths = Object.keys(depthsByNameAndGene).reduce((acc, k) => {
    const name = depthsByNameAndGene[k]['n'];

    if (!acc.includes(name)) {
      acc.push(name);
    }

    return acc;
  }, []);

  const showLegends = {};
  const traces = Object.keys(depthsByNameAndGene).map((k) => {
    const { x, y, g: gene, n: name } = depthsByNameAndGene[k];

    const depthId = depths.findIndex((n) => n === name);
    const xValues = [];
    const yValues = [];
    const textValues = [];

    if (downScale) {
      for (let i = 0; i < x.length; i += 2) {
        const start = Number(x[i]);
        const end = Number(x[i + 1]);
        const len = Number(end - start);

        exonPairs[gene].forEach((pair) => {
          if (start >= pair.start && end <= pair.end) {
            xValues.push(start - pair.start + pair.startAt);
            xValues.push(start - pair.start + pair.startAt + len);
            xValues.push(NaN);

            yValues.push(Number(y[i]));
            yValues.push(Number(y[i + 1]));
            yValues.push(NaN);

            textValues.push(start);
            textValues.push(end);
            textValues.push(NaN);
          }
        });
      }
    } else {
      for (let i = 0; i < x.length; i += 2) {
        const start = Number(x[i]);
        const end = Number(x[i + 1]);

        xValues.push(start);
        xValues.push(end);
        xValues.push(NaN);

        yValues.push(Number(y[i]));
        yValues.push(Number(y[i + 1]));
        yValues.push(NaN);

        textValues.push(start);
        textValues.push(end);
        textValues.push(NaN);
      }
    }

    const showLegend = showLegends[name] || false;
    showLegends[name] = true;

    return {
      ...axes[gene],
      x: xValues,
      y: yValues,
      text: textValues,
      mode: 'markers',
      type: 'scattergl',
      connectgaps: false,
      line: {
        width: 1,
        color: COLORS[depthId],
      },
      marker: {
        size: 2,
        color: COLORS[depthId],
      },
      name,
      legendgroup: name,
      showlegend: !showLegend,
      hoverinfo: 'text+y+name',
    };
  });

  return Object.values(traces);
}

export const createPlot = ({
  exonsByGene,
  depthsByNameAndGene,
  removeIntrons = false,
}) => {
  const { axes, exons } = exonFactory(exonsByGene, removeIntrons);

  const depths = depthFactory(
    depthsByNameAndGene,
    exonsByGene,
    axes,
    removeIntrons,
  );

  let data = exons;

  const nbPlots = data.length;
  const step = 1./nbPlots;

  data = data.concat(depths);

  const layout = {
    hovermode: 'closest',
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

  return {
    data,
    layout,
  };
};
