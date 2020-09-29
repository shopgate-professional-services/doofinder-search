# Shopgate Connect - Extension Doofinder Search

[![GitHub license](http://dmlc.github.io/img/apache2.svg)](LICENSE)

Product search implementation using Doofinder.
This extension will replace the Shopgate default search with the Doofinder service.
It provides search suggestions, results and result filters from Doofinder.
It does not provide filters for regular product listings in the catalog.

## Configuration

| key | type | description | example |
|---|---|---|---|
| zone | string | zone from search index | eu1 |
| authKey | string | API auth key | d85760z8098f80049d3cd8fe63c2c63c725b78e2 |
| hashId | string | hash ID from search index | dxc1e25c88d929572f347d53c65e3953 |
| productIdKey | string | search result key representing the product ID | fallback_reference_id |
| filterMap | object | map labels to filter keys | {"brand": "Marke", "categories": "Kategorie", "g:baugruppe": "Baugruppe", "price": "Preis"} |
| useSearchSuggestions | boolean | Flag if search suggestions should be used or not | `true` |


#### productIdKey

Value of this key is evaluated using (jexl)[https://www.npmjs.com/package/jexl] library. 
It means any of these are valid:

- plain product property, eg. `fallback_reference_id`
- concatenation expression, eg. `fallback_reference_id + '-' + id`
- logical expression, eg.
```
df_grouping_id ? fallback_reference_id + '-' + id : fallback_reference_id 
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) file for more information.

## About Shopgate

Shopgate is the leading mobile commerce platform.

Shopgate offers everything online retailers need to be successful in mobile. Our leading
software-as-a-service (SaaS) enables online stores to easily create, maintain and optimize native
apps and mobile websites for the iPhone, iPad, Android smartphones and tablets.

## License

Shopgate Cloud - Extension Boilerplate is available under the Apache License, Version 2.0.

See the [LICENSE](./LICENSE) file for more information.
