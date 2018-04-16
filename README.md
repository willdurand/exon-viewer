# Exon Viewer demo


## Usage

You will find a `ExonFactory.js` file in `src/`. This file exposes a
`createPlot()` function that should be called to retrieve the `data` and
`layout` variables to use with [plotly.js](https://plot.ly/javascript/).

``` js
const { data, layout } = createPlot({
    exonsByGene,
    exonsColors,
    depthsByNameAndGene,
    depthsColors,
    withoutIntrons,
});

// ...

Plotly.newPlot('myDiv', data, layout);
```

This function is parametrized with an object containing the following parameters:

- `exonsByGene`: a set of exon positions by gene, see the next section for more
    information;
- `exonsColors`: an array of HTML colors for the different exon plots;
- `depthsByGeneAndName`: a set of depth data by gene and depth file name, see
    the next section for more information;
- `depthsColors`: an array of HTML colors for the different depth files;
- `withoutIntrons`: a boolean to remove the introns (if set to `true`) or not
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

The `depthsByGeneAndName` shape is also a hash map with the gene name + depths
file name as key and a set of properties as value (see example below). Each
entry (e.g., `K60451-DDX11L1`) has a gene name (`g`), a depth file ID (`i` that
is used to determine the color), the depth file name (`n`), the positions of the
depths (`x`, same principle as before with `start`, `end` and a `null` value),
and the depth values in `y`.

``` js
{
    "K60451-DDX11L1": {
        "g": "DDX11L1",
        "i": 0,
        "n": "K60451",
        "x": [
            11868,
            11875,
            null,
            11875,
            11885,
            null,
        ],
        "y": [
            4,
            4,
            null,
            3,
            3,
            null,
        ]
    },
    "K60451-SAMD11": {
        "g": "SAMD11",
        "i": 0,
        "n": "K60451",
        "x": [
            11868,
            11875,
            null,
            11875,
            11885,
            null,
        ],
        "y": [
            4,
            4,
            null,
            3,
            3,
            null,
        ]
    },
    ...
}
```
