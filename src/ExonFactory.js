function exonFactory(exonsByGene, colors, downScale) {
  const axes = {};
  const exons = Object.keys(exonsByGene).map((gene, index) => {
    const { x, y } = exonsByGene[gene];

    const downscaledX = downScale ? [] : x;

    if (downScale) {
      let sum = 0;
      for (let i = 0; i < x.length; i += 3) {
        const len = Number(x[i + 1]) - Number(x[i]);

        downscaledX.push(Number(sum));
        downscaledX.push(Number(sum) + len);
        downscaledX.push(x[i + 2]); // should be NaN

        sum = sum + len + 10;
      }
    }

    axes[gene] = {
      xaxis: index === 0 ? undefined : `x${index + 1}`,
      yaxis: index === 0 ? undefined : `y${index + 1}`,
    };

    return {
      ...axes[gene],
      x: downscaledX,
      y,
      type: 'scattergl',
      connectgaps: false,
      hoverinfo: 'none',
      name: gene,
      showlegend: false,
      line: {
        width: 8,
        color: colors[index],
      },
    };
  });

  return {
    axes,
    exons,
  };
}

function depthFactory(depthsByNameAndGene, exonsByGene, axes, colors, downScale) {
  const showLegends = {};
  const traces = Object.keys(depthsByNameAndGene).map((k) => {
    const entry = depthsByNameAndGene[k];
    const { g: gene, i: depthId, n: name } = entry;
    delete entry.i;
    delete entry.n;

    const showLegend = showLegends[name] || false;
    showLegends[name] = true;

    return {
      ...axes[gene],
      ...entry,
      mode: 'markers',
      type: 'scattergl',
      connectgaps: false,
      line: {
        width: 1,
        color: colors[depthId],
      },
      marker: {
        size: 2,
        color: colors[depthId],
      },
      name,
      legendgroup: name,
      showlegend: !showLegend,
      hoverinfo: 'none',
    };
  });

  if (downScale) {
    const exonPairs = {};
    Object.keys(exonsByGene).forEach((key) => {
      const { x } = exonsByGene[key];

      const pairs = [];
      let sum = 0;
      for (let i = 0; i < x.length; i += 3) {
        const len = Number(x[i + 1]) - Number(x[i]);

        pairs.push({
          start: Number(x[i]),
          end: Number(x[i + 1]),
          len,
          startAt: Number(sum),
        });

        sum = sum + len + 10;
      }

      exonPairs[key] = pairs;
    });

    Object.keys(traces).forEach((key) => {
      const downscaledX = [];
      const { g: gene, x } = traces[key];

      for (let i = 0; i < x.length; i += 3) {
        const start = Number(x[i]);
        const end = Number(x[i + 1]);
        const len = Number(end - start);

        exonPairs[gene].forEach((pair) => {
          if (start >= Number(pair.start) && end <= Number(pair.end)) {
            downscaledX.push(start - Number(pair.start) + pair.startAt);
            downscaledX.push(Number(len));
            downscaledX.push(x[i + 2]); // should be NaN
          }
        });
      }

      traces[key].x = downscaledX;
    });
  }

  return Object.values(traces);
}

export const createPlot = ({
  exonsByGene,
  exonsColors,
  depthsByNameAndGene,
  depthsColors,
  withoutIntrons = false,
}) => {
  const { axes, exons } = exonFactory(exonsByGene, exonsColors, withoutIntrons);

  const depths = depthFactory(
    depthsByNameAndGene,
    exonsByGene,
    axes,
    depthsColors,
    withoutIntrons,
  );

  let data = exons;

  const nbPlots = data.length;
  const step = 1./nbPlots;

  data = data.concat(depths);

  const layout = {
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
