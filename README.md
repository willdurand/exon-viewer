# Exon Viewer demo


## Usage

This section describes how to use the exon viewer outside of this demo project.
Please follow the different steps below:

1. Copy `ExonFactory.js` into your folder of JavaScript assets and import it
   with a `<script>` tag, for instance after the plotly.js tag:

   ```html
   <script src="plotly-latest.min.js"></script>

   <!-- add the `script` tag below -->
   <script src="/js/ExonFactory.js"></script>
   ```

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

2. Call this `createPlot()` function with your data and pass it to
   [plotly.js](https://plot.ly/javascript/reference/):

    ```html
    <div id="myDiv"></div>

    <script>
      // the exon positions (start/end) by gene
      const exonsByGene = {
        DDX11L1: [
          11868,
          12227,
        ],
      };

      // the depth positions by depth file and gene
      const depthsByGeneAndName = {
        'K60451-DDX11L1': {
          g: 'DDX11L1',
          n: 'K60451',
          x: [
            11868,
            11875,
            11875,
            11885,
          ],
          y: [
            4,
            4,
            3,
            3,
          ]
        },
      };

      const { data, layout } = createPlot({
        exonsByGene,
        depthsByGeneAndName,
        removeIntrons: false, // set to `true` to remove the introns
      });

      Plotly.newPlot('myDiv', data, layout);
    </script>
    ```

3. See the [plotly.js documentation](https://plot.ly/javascript/reference/) for
   more information about how to tweak the plots. For example, you can modify
   some keys in the `data` object to customize a sub-plot:

   ```js
   data[1]['type'] = 'histogram';
   ```

   This will change the first depth reading to a histogram instead of a scatter
   plot.

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


## Playing with this demo

You need [Node.js](https://nodejs.org/en/) 8.11+. After having cloned this
repository, follow the instructions below:

1. Install the project dependencies using [Yarn](https://yarnpkg.com/en/):

   ```
   $ yarn install
   ```

2. Build the pre-generated datasets:

   ```
   $ bin/build-data.js && bin/build-tiny-data.js
   ```

3. Start the demo project:

   ```
   $ yarn start
   ```


## License

exon-viewer is released under the MIT License. See the bundled
[LICENSE](LICENSE) file for details.
