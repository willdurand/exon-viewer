// generate random colors
const colors = Array(30).map(() => {
  return '#'+'0123456789abcdef'.split('').map((v, i, a) => {
    return i > 5 ? null : a[Math.floor(Math.random()*16)];
  }).join('');
});

function exonFactory(exonPositions) {
  const exons_by_gene = {};

  for (let i = 0; i < exonPositions.length; i++) {
    let start = exonPositions[i].start;
    let end = exonPositions[i].end;
    let text = exonPositions[i].gene;

    const v = exons_by_gene[text] || { x: [], y: [], text: [], start, end };

    //v.x.push(Number(end) - Number(start));
    //v.x.push(0);
    v.x.push(Number(start));
    v.x.push(Number(end));

    v.y.push(-36);
    v.y.push(-36);
    v.text.push(text);
    v.text.push(text);

    v.x.push(NaN);
    v.y.push(NaN);
    v.text.push(NaN);

    if (start < v.start) {
      v.start = start;
    }

    if (end > v.end) {
      v.end = end;
    }

    exons_by_gene[text] = v;
  }

  const axes = {};
  const exons = Object.keys(exons_by_gene).map((gene, index) => {
    const { x, y, text } = exons_by_gene[gene];

    const downscaledX = x;

    /*
    let sum = 0;
    for (let i = 0; i < x.length; i += 3) {
      const len = x[i + 1] - x[i];

      //console.log({gene, s: x[i], e: x[i + 1], len})

      downscaledX.push(sum);
      downscaledX.push(sum + len);
      downscaledX.push(x[i + 2]);

      sum = sum + len + 10;
    }
    */

    axes[gene] = {
      xaxis: index === 0 ? undefined : `x${index + 1}`,
      yaxis: index === 0 ? undefined : `y${index + 1}`,
    };

    return {
      ...axes[gene],
      x: downscaledX,
      y,
      type: 'scattergl',
      text,
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

  return {
    axes,
    exons,
    exons_by_gene,
  };
}

function depthFactory(depths, names, exons_by_gene, axes) {

  if (depths.length !== names.length) {
    let e = new Error('# of depth measurements unequal to # of measurement names');
    throw(e);
  }

  const allTraces = [];
  const depths_by_name = {};

  for (let i = 0; i < depths.length; i++) {
    const name = names[i];
    const depths_by_gene = {};

    for (let j = 0; j < depths[i].length; j++) {
      const depth = depths[i][j];

      Object.keys(exons_by_gene).forEach((gene) => {
        const { start, end } = exons_by_gene[gene];
        const v = depths_by_gene[gene] || new Set();

        if (depth.start >= start && depth.end <= end) {
          v.add(depth);
        }

        depths_by_gene[gene] = v;
      });
    }

    depths_by_name[name] = depths_by_gene;
  }

  Object.keys(depths_by_name).forEach((name, index) => {
    const depths_by_gene = depths_by_name[name];

    let showlegend = true;
    Object.keys(depths_by_gene).forEach((gene) => {
      const trace = {
        ...axes[gene],
        mode: 'markers',
        type: 'scattergl',
        connectgaps: false,
        line: {
          width: 1,
          color: colors[index],
        },
        marker: {
          size: 2,
          color: colors[index],
        },
        name,
        legendgroup: name,
        showlegend,
        x: [],
        y: [],
        text: [],
      };

      // show legend only for the first trace for each depth name
      showlegend = false;

      depths_by_gene[gene].forEach((depth) => {
        trace.x.push(depth.start);
        trace.x.push(depth.end);
        trace.x.push(NaN);

        trace.y.push(depth.depth);
        trace.y.push(depth.depth);
        trace.y.push(NaN);

        trace.text.push(depth.chromosome);
        trace.text.push(depth.chromosome);
        trace.text.push(NaN);
      });

      allTraces.push(trace);
    });
  });

  return allTraces;
}

export {exonFactory, depthFactory}
