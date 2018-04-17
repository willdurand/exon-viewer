# Exon Viewer demo


## Usage

You will find a `ExonFactory.js` file in `src/`. This file exposes a
`createPlot()` function that should be called to retrieve the `data` and
`layout` variables to use with [plotly.js](https://plot.ly/javascript/).

``` js
const { data, layout } = createPlot({
    exonsByGene,
    depthsByNameAndGene,
    removeIntrons,
});

// ...

Plotly.newPlot('myDiv', data, layout);
```

This function is parametrized with an object containing the following parameters:

- `exonsByGene`: a set of exon positions by gene, see the next section for more
   information;
- `depthsByGeneAndName`: a set of depth data by gene and depth file name, see
   the next section for more information;
- `removeIntrons`: a boolean to remove the introns (if set to `true`) or not
   (default)

### About the data

The `createPlot()` function takes two datasets as input: `exonsByGene` and
`depthsByGeneAndName` (both are JavaScript objects).

The `exonsByGene` shape is a hash map with the gene name as key and an array of
exon positions as value, as shown below:

``` js
const exonsByGene = {
    "DDX11L1": [
        11868,
        12227,
        12612,
        12721,
        13220,
        14409,
    ],
    "SAMD11": [
        860259,
        860328,
        860529,
        860569,
        861117,
        861180,
    ]
};
```

The `depthsByGeneAndName` shape is also a hash map with a unique key for each
gene + depth couple and a set of properties as value (see example below). Each
entry (e.g., `K60451-DDX11L1`) has a gene name (`g`), the depth file name (`n`),
the positions of the depths in `x`, and the depth values in `y`. The lengths of
`x` and `y` must be equal.

``` js
{
    "K60451-DDX11L1": {
        "g": "DDX11L1",
        "n": "K60451",
        "x": [
            11868,
            11875,
            11875,
            11885,
        ],
        "y": [
            4,
            4,
            3,
            3,
        ]
    },
    "K60451-SAMD11": {
        "g": "SAMD11",
        "n": "K60451",
        "x": [
            11868,
            11875,
            11875,
            11885,
        ],
        "y": [
            4,
            4,
            3,
            3,
        ]
    },
    ...
}
```
