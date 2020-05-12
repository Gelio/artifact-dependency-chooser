const csv = require('csv');
const fs = require('fs');
const { sum, sortBy, negate, compose, uniq } = require('ramda');

const { parseDependencies } = require('./parse-dependencies');

const csvPath = process.argv[2];
const artifactsNeeded = parseInt(process.argv[3], 10);

if (!csvPath || !artifactsNeeded) {
  console.log('Invalid parameters. Please see README.md');
  return;
}

const rawData = fs.readFileSync(csvPath, { encoding: 'utf-8' });
csv.parse(rawData, { trim: true }, (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const dependencies = parseDependencies(data);

  const dependenciesResult = step(dependencies, [], 0);

  if (!dependenciesResult) {
    console.log('No solution will allow unlock', artifactsNeeded, 'artifacts');
    return;
  }

  console.log(`implementing dependencies (${dependenciesResult.length}):`);
  console.log(dependenciesResult.map((dependency) => dependency.name));

  const unlockedArtifacts = getUnlockedArtifacts(dependenciesResult);
  console.log(`will unlock artifacts (${unlockedArtifacts.length}):`);
  console.log(unlockedArtifacts.map((artifact) => artifact.name));
});

/**
 * Depth-first search
 *
 * @param {object[]} dependenciesLeft
 * @param {object[]} dependenciesSelected
 * @param {number} artifactsUnlockedCount
 */
function step(dependenciesLeft, dependenciesSelected, artifactsUnlockedCount) {
  if (artifactsUnlockedCount >= artifactsNeeded) {
    return dependenciesSelected;
  }

  const dependenciesToConsider = sortBy(compose(negate, getDependencyValue))(
    dependenciesLeft
  );

  for (const dependency of dependenciesToConsider) {
    selectDependency(dependency);
    dependenciesSelected.push(dependency);
    const unlockedBySelecting = getUnlockedArtifacts([dependency]).length;
    const result = step(
      dependenciesLeft.filter((x) => x !== dependency),
      dependenciesSelected,
      artifactsUnlockedCount + unlockedBySelecting
    );
    if (result) {
      return result;
    }

    dependenciesSelected.pop();
    unselectDependency(dependency);
  }
}

function getDependencyValue(dependency) {
  return (
    sum(dependency.neededIn.map((artifact) => artifact.dependsUpon)) -
    dependency.neededIn.length
  );
}

function selectDependency(dependency) {
  dependency.neededIn.forEach((artifact) => artifact.dependsUpon--);
}

function unselectDependency(dependency) {
  dependency.neededIn.forEach((artifact) => artifact.dependsUpon++);
}

function isArtifactUnlocked(artifact) {
  return artifact.dependsUpon === 0;
}

function getUnlockedArtifacts(features) {
  return uniq(
    features.flatMap((feature) => feature.neededIn.filter(isArtifactUnlocked))
  );
}
