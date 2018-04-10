#!/usr/bin/env node
const d3 = require('d3');
const fs = require('fs');
const path = require('path');

const exons = 'http://127.0.0.1:5000/exons.chrom.start.end.gene-name.txt';
const k1 = 'http://127.0.0.1:5000/depths/K60451.values.txt';
const k2 = 'http://127.0.0.1:5000/depths/K60509.values.txt';
const k3 = 'http://127.0.0.1:5000/depths/K60520.values.txt';
const k4 = 'http://127.0.0.1:5000/depths/K60521.values.txt';
const k5 = 'http://127.0.0.1:5000/depths/K60552.values.txt';
const k6 = 'http://127.0.0.1:5000/depths/K60553.values.txt';
const k7 = 'http://127.0.0.1:5000/depths/K63706.values.txt';
const k8 = 'http://127.0.0.1:5000/depths/K63717.values.txt';
const k9 = 'http://127.0.0.1:5000/depths/K64130.values.txt';
const k10 = 'http://127.0.0.1:5000/depths/K64783.values.txt';
const k11 = 'http://127.0.0.1:5000/depths/K64784.values.txt';
const k12 = 'http://127.0.0.1:5000/depths/K64785.values.txt';
const k13 = 'http://127.0.0.1:5000/depths/K67026.values.txt';
const k14 = 'http://127.0.0.1:5000/depths/K67880.values.txt';
const k15 = 'http://127.0.0.1:5000/depths/K68270.values.txt';

const depths = [k1, k2, k3, k4, k5, k6, k7, k8, k9, k10, k11, k12, k13, k14, k15];
const names = ['K60451', 'K60509', 'K60520', 'K60521', 'K60552', 'K60553', 'K63706', 'K63717', 'K64130', 'K64783', 'K64784', 'K64785', 'K67026', 'K67880', 'K68270'];

const q = d3.queue();

q.defer(d3.tsv, exons);

for (var i = 0; i < depths.length; i++) {
    q.defer(d3.tsv, depths[i]);
}

q.awaitAll(function(err, geneObjects) {
    const exonObj = geneObjects.splice(0, 1);
    const exonPositions = exonObj[0];

    const exons_by_gene = {};
    for (let i = 0; i < exonPositions.length; i++) {
        let start = Number(exonPositions[i].start);
        let end = Number(exonPositions[i].end);
        let text = exonPositions[i].gene;

        const v = exons_by_gene[text] || { x: [], y: [], text: [], start, end };

        v.x.push(start);
        v.x.push(end);

        v.y.push(-36);
        v.y.push(-36);
        //v.text.push(text);
        //v.text.push(text);

        v.x.push(NaN);
        v.y.push(NaN);
        //v.text.push(NaN);

        if (start < v.start) {
            v.start = start;
        }

        if (end > v.end) {
            v.end = end;
        }

        exons_by_gene[text] = v;
    }

    console.time(`compute depths`);
    const geneNames = Object.keys(exons_by_gene);

    const traces = {};
    for (let i = 0; i < geneObjects.length; i++) {
        const name = names[i];
        const sample = geneObjects[i];

        console.time(`compute depths for "${name}"`);

        /*
        .filter((gene) => {
            const { start, end } = exons_by_gene[gene];

            if (Number(sample[0].start) > Number(end) || Number(sample[sample.length - 1].end) < Number(start)) {
                return false;
            }

            return true;
        });
        */

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
                    /*
                    if (
                        (ds >= Number(x[k]) && ds <= Number(x[k + 1])) ||
                        (de >= Number(x[k]) && de <= Number(x[k + 1]))
                    ) {
                        if (ds < Number(x[k])) {
                            ds = Number(x[k]);
                        }

                        if (de > Number(x[k + 1])) {
                            de = Number(x[k + 1]);
                        }
                    */
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

    fs.writeFile(path.join(__dirname, '../src/data/exons-cached-data.json'), JSON.stringify(exons_by_gene), () => console.log('exons: done'));
    fs.writeFile(path.join(__dirname, '../src/data/depths-cached-data.json'), JSON.stringify(traces), () => console.log('depths: done'));
});
