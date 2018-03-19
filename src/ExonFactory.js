function exonFactory(exonPositions) {

  let exons_x = [];
  let exons_y = [];
  let exons_text = [];

  for(let i=0; i<exonPositions.length; i++) {
    let start = exonPositions[i].start;
    let end = exonPositions[i].end;
    let text = exonPositions[i].gene;

    exons_x.push(Number(start));
    exons_x.push(Number(end));
    exons_y.push(-36);
    exons_y.push(-36);
    exons_text.push(text);
    exons_text.push(text);

    exons_x.push(NaN);
    exons_y.push(NaN);
    exons_text.push(NaN);
  }

  const exons = [{
    x: exons_x,
    y: exons_y,
    type: 'scattergl',
    text: exons_text,
    connectgaps: false,
    name: 'Exon markers',
    showlegend: false,
    line: {width: 8, color: 'red'}
  }];

  return exons;
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
