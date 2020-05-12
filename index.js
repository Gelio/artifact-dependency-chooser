const csv = require('csv');
const fs = require('fs');
const { sum, sortBy, negate, compose, uniq } = require('ramda');

const csvPath = process.argv[2];
const tablesNeeded = parseInt(process.argv[3], 10);

const DEPENDENCY_STATUS_ROW_OFFSET = 1;

const rawData = fs.readFileSync(csvPath, { encoding: 'utf-8' });
csv.parse(rawData, { trim: true }, (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const [tableNamesRow, ...featuresAndImplementation] = data;
  const featureNames = featuresAndImplementation.map((x) => x[0]);
  const features = featureNames.map((featureName) => ({
    name: featureName,
    neededIn: [],
    cost: 5,
  }));

  const tableNames = tableNamesRow.slice(DEPENDENCY_STATUS_ROW_OFFSET);

  const tables = tableNames.map((tableName) => ({
    name: tableName,
    dependsUpon: 0,
  }));

  featuresAndImplementation.forEach((row, featureIndex) => {
    const feature = features[featureIndex];
    row
      .slice(DEPENDENCY_STATUS_ROW_OFFSET)
      .forEach((implementationStatus, tableIndex) => {
        if (implementationStatus === 'not done') {
          const table = tables[tableIndex];
          feature.neededIn.push(table);
          table.dependsUpon++;
        }
      });
  });

  const result = step(features, [], 0);

  if (!result) {
    console.log('No solution will allow unlock', tablesNeeded, 'artifacts');
    return;
  }

  console.log(`implementing dependencies (${result.length}):`);
  console.log(result.map((feature) => feature.name));

  const implementableTables = getImplementableTables(result);
  console.log(`will unlock artifacts (${implementableTables.length}):`);
  console.log(implementableTables.map((table) => table.name));
});

function step(featuresLeft, featuresSelected, tablesImplementable) {
  if (tablesImplementable >= tablesNeeded) {
    return featuresSelected;
  }

  const featuresToConsider = sortBy(compose(negate, getFeatureValue))(
    featuresLeft
  );

  for (const feature of featuresToConsider) {
    selectFeature(feature);
    featuresSelected.push(feature);
    const nowImplementable = getImplementableTables([feature]).length;
    const result = step(
      featuresLeft.filter((x) => x !== feature),
      featuresSelected,
      tablesImplementable + nowImplementable
    );
    if (result) {
      return result;
    }

    featuresSelected.pop();
    unselectFeature(feature);
  }
}

function getFeatureValue(feature) {
  return (
    feature.cost +
    sum(feature.neededIn.map((table) => table.dependsUpon)) -
    feature.neededIn.length
  );
}

function selectFeature(feature) {
  feature.neededIn.forEach((table) => table.dependsUpon--);
}

function unselectFeature(feature) {
  feature.neededIn.forEach((table) => table.dependsUpon++);
}

function isTableImplementable(table) {
  return table.dependsUpon === 0;
}

function getImplementableTables(features) {
  return uniq(
    features.flatMap((feature) => feature.neededIn.filter(isTableImplementable))
  );
}
