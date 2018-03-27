function exonFactory(exonPositions) {
  const exons_by_gene = {};


  for (let i = 0; i < exonPositions.length; i++) {
    let start = exonPositions[i].start;
    let end = exonPositions[i].end;
    let text = exonPositions[i].gene;

    const v = exons_by_gene[text] || { x: [], y: [], text: [] };

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

    exons_by_gene[text] = v;
  }

  return Object.keys(exons_by_gene).map((gene, index) => {
    const { x, y, text } = exons_by_gene[gene];

    const downscaledX = [];

    let sum = 0;
    for (let i = 0; i < x.length; i += 3) {
      const len = x[i + 1] - x[i];

      //console.log({gene, s: x[i], e: x[i + 1], len})

      downscaledX.push(sum);
      downscaledX.push(sum + len);
      downscaledX.push(x[i + 2]);

      sum = sum + len + 10;
    }

    return {
      x: downscaledX,
      y,
      xaxis: index === 0 ? undefined : `x${index + 1}`,
      yaxis: index === 0 ? undefined : `y${index + 1}`,
      type: 'scattergl',
      text,
      connectgaps: false,
      hoverinfo: 'none',
      name: gene,
      showlegend: false,
      line: {
        width: 8,
      }
    };
  });
}

function depthFactory(depths, names) {

  if (depths.length !== names.length) {
      let e = new Error('# of depth measurements unequal to # of measurement names');
      throw(e);
  }

  let allTraces = [];

  for(let i=0; i<depths.length; i++) {

    let depth = depths[i];
    let trace = {
      mode: 'lines+markers',
      type: 'scattergl',
      connectgaps: false,
      line: {width: 0.5},
      marker: {size: 2},
      name: names[i]
    };
    let x = [];
    let y = [];
    let text = [];

    for(let j=0; j<depth.length; j++) {
      // if(j % 1000 == 0) {
        let d = depth[j];

        x.push(d.start);
        x.push(d.end);
        x.push(NaN);

        y.push(d.depth);
        y.push(d.depth);
        y.push(NaN);

        text.push(d.chromosome);
        text.push(d.chromosome);
        text.push(NaN);
      // }
    }

    trace.x = x;
    trace.y = y;
    trace.text = text;

    allTraces.push(trace);
  }

  return allTraces;
}

export {exonFactory, depthFactory}
