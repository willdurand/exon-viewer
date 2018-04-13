#!/usr/bin/env node
const d3 = require('d3');
const fs = require('fs-extra');
const path = require('path');

const exons = 'src/data/exons.chrom.start.end.gene-name.txt';
const k1 = 'src/data/depths/K60451.values.txt';
const k2 = 'src/data/depths/K60509.values.txt';
const k3 = 'src/data/depths/K60520.values.txt';
const k4 = 'src/data/depths/K60521.values.txt';
const k5 = 'src/data/depths/K60552.values.txt';
const k6 = 'src/data/depths/K60553.values.txt';
const k7 = 'src/data/depths/K63706.values.txt';
const k8 = 'src/data/depths/K63717.values.txt';
const k9 = 'src/data/depths/K64130.values.txt';
const k10 = 'src/data/depths/K64783.values.txt';
const k11 = 'src/data/depths/K64784.values.txt';
const k12 = 'src/data/depths/K64785.values.txt';
const k13 = 'src/data/depths/K67026.values.txt';
const k14 = 'src/data/depths/K67880.values.txt';
const k15 = 'src/data/depths/K68270.values.txt';

const depths = [k1, k2, k3, k4, k5, k6, k7, k8, k9, k10, k11, k12, k13, k14, k15];
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

for (let i = 0; i < depths.length; i++) {
  promises.push(async () => {
    try {
      const filename = path.join(__dirname, '..', depths[i]);
      const content = await fs.readFile(filename, { encoding: 'utf8' });
      return d3.tsvParse(content);
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

    const v = exons_by_gene[gene] || { x: [], y: [], start, end };

    v.x.push(start);
    v.x.push(end);

    v.y.push(-36);
    v.y.push(-36);

    v.x.push(NaN);
    v.y.push(NaN);

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

    for (let j = 0; j < sample.length; j++) {
      const depth = sample[j];

      geneNames.forEach((gene) => {
        const { x } = exons_by_gene[gene];

        const trace = traces[`${name}-${gene}`] || {
          n: name,
          g: gene,
          i,
          x: [],
          y: [],
        };

        let ds = Number(depth.start);
        let de = Number(depth.end);

        for (let k = 0; k < x.length; k += 3) {
          if (ds >= Number(x[k]) && de <= Number(x[k + 1])) {
            trace.x.push(Number(ds));
            trace.x.push(Number(de));
            trace.x.push(NaN);

            trace.y.push(Number(depth.depth));
            trace.y.push(Number(depth.depth));
            trace.y.push(NaN);
          }
        }

        traces[`${name}-${gene}`] = trace;
      });
    }

    console.timeEnd(`compute depths for "${name}"`);
  }

  console.timeEnd(`compute depths`);

  Object.keys(exons_by_gene).forEach((gene) => {
    delete exons_by_gene[gene].start;
    delete exons_by_gene[gene].end;
  });

  fs.writeFile(
    path.join(__dirname, '../src/data/exons-cached-data.json'),
    JSON.stringify(exons_by_gene),
    () => console.log('pre-generate exons: done')
  );
  fs.writeFile(
    path.join(__dirname, '../src/data/depths-cached-data.json'),
    JSON.stringify(traces),
    () => console.log('pre-depths: done')
  );
};

build();
