#!/usr/bin/env node
const d3 = require('d3');
const fs = require('fs-extra');
const path = require('path');
const request = require('request-promise-native');

const exons = 'src/data/exons.chrom.start.end.gene-name.txt';
const names = ['K60451', 'K60509', 'K60520', 'K60521', 'K60552', 'K60553', 'K63706', 'K63717', 'K64130', 'K64783', 'K64784', 'K64785', 'K67026', 'K67880', 'K68270'];

const promises = [];

promises.push(async () => {
  try {
    const content = await fs.readFile(path.join(__dirname, '..', exons), { encoding: 'utf8' });
    return d3.tsvParse(content);
  } catch (e) {
    console.log({ e });
    throw e;
  }
});

for (let i = 0; i < names.length; i++) {
  promises.push(async () => {
    try {
      const options = {
        uri: `http://home.chpc.utah.edu/~u6000771/example-plotly-data/${names[i]}-tiny.json`,
        json: true,
      };
      const content = await request(options);
      return content;
    } catch (e) {
      console.log({ e });
      throw e;
    }
  });
}

const build = async () => {
  let geneObjects;

  try {
    geneObjects = await Promise.all(promises.map(async (f) => await f()));
  } catch (e) {
    console.log({ e });
    throw e;
  }

  const exonObj = geneObjects.splice(0, 1);
  const exonPositions = exonObj[0];

  const exons_by_gene = {};
  for (let i = 0; i < exonPositions.length; i++) {
    let start = Number(exonPositions[i].start);
    let end = Number(exonPositions[i].end);
    let gene = exonPositions[i].gene;

    const v = exons_by_gene[gene] || { x: [], start, end };

    v.x.push(start);
    v.x.push(end);

    if (start < v.start) {
      v.start = start;
    }

    if (end > v.end) {
      v.end = end;
    }

    exons_by_gene[gene] = v;
  }

  console.time(`compute depths`);
  const geneNames = Object.keys(exons_by_gene);

  const traces = {};
  for (let i = 0; i < geneObjects.length; i++) {
    const name = names[i];
    const sample = geneObjects[i];

    console.time(`compute depths for "${name}"`);

    for (let j = 0; j < sample.x.length; j++) {
      const depthX = Number(sample.x[j]);
      const depthY = Number(sample.y[j]);

      geneNames.forEach((gene) => {
        const { x } = exons_by_gene[gene];

        const trace = traces[`${name}-${gene}`] || {
          n: name,
          g: gene,
          x: [],
          y: [],
        };

        let ds = Number(depthX);
        let de = Number(depthX);

        for (let k = 0; k < x.length; k += 2) {
          if (ds >= Number(x[k]) && de <= Number(x[k + 1])) {
            trace.x.push(Number(ds));
            trace.x.push(Number(de));

            trace.y.push(Number(depthY));
            trace.y.push(Number(depthY));
          }
        }

        traces[`${name}-${gene}`] = trace;
      });
    }

    console.timeEnd(`compute depths for "${name}"`);
  }

  console.timeEnd(`compute depths`);

  fs.writeFile(
    path.join(__dirname, '../src/data/tiny-depths-cached-data.json'),
    JSON.stringify(traces),
    () => console.log('pre-depths: done')
  );
};

build();
