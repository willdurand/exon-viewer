import exonsByGene from './data/exons-cached-data.json';
import depthsByNameAndGene from './data/depths-cached-data.json';

function exonFactory(exonPositions, colors, downScale) {
  const axes = {};
  const exons_by_gene = exonsByGene;

  console.time(`create exon traces`);

  const exons = Object.keys(exons_by_gene).map((gene, index) => {
    const { x, y } = exons_by_gene[gene];

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
      //text,
      connectgaps: false,
      hoverinfo: 'none',
      name: gene,
      showlegend: false,
      line: {
        width: 8,
        color: colors[index],
      }
    };
  });

  console.timeEnd(`create exon traces`);

  return {
    axes,
    exons,
    exons_by_gene,
  };
}

function depthFactory(depths, names, exons_by_gene, axes, colors, downScale) {
  if (depths.length !== names.length) {
    let e = new Error('# of depth measurements unequal to # of measurement names');
    throw(e);
  }

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
        width: .5,
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
    console.time(`downscale depths`);

    const exonPairs = {};
    Object.keys(exons_by_gene).forEach((key) => {
      const { x } = exons_by_gene[key];

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

    console.timeEnd(`downscale depths`);
  }

  return Object.values(traces);
}

export {exonFactory, depthFactory}
