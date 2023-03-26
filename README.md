* Export data to `raw/VERSION/`
* Change `version` in `basic.js`
* Run `node basic.js` -> creates `basic.json` + `datatables.json`
* Run `node items.js` -> create `docs/items.json`
* Adapt version in `docs/items.html`
* Run `node strucutes.js` -> create `docs/strucutes.json`
* Adapt version in `docs/strucutes.html`

## basic.json

This is a file parsed from all jsons of the raw data.

It has merged all jsons from raw to one file and normalized all data into a flat
json. Inheritance is merged as well.

## datatables.json

All the datatables in one file, but in theory all data should be merged in basic.json as well

## items.json

A json file with all items and some cleaner data as basic.json
