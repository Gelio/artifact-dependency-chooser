const DEPENDENCY_STATUS_ROW_OFFSET = 1;

/**
 * Parses dependencies from CSV file
 *
 * @param {object[]} data
 */
function parseDependencies(data) {
  const [artifactNamesRow, ...dependenciesAndStatuses] = data;
  const dependencyNames = dependenciesAndStatuses.map((x) => x[0]);
  const dependencies = dependencyNames.map((dependencyName) => ({
    name: dependencyName,
    neededIn: [],
    cost: 5,
  }));

  const artifactNames = artifactNamesRow.slice(DEPENDENCY_STATUS_ROW_OFFSET);

  const artifacts = artifactNames.map((artifactName) => ({
    name: artifactName,
    dependsUpon: 0,
  }));

  dependenciesAndStatuses.forEach((row, dependencyIndex) => {
    const dependency = dependencies[dependencyIndex];

    row
      .slice(DEPENDENCY_STATUS_ROW_OFFSET)
      .forEach((implementationStatus, tableIndex) => {
        if (implementationStatus === 'not done') {
          const artifact = artifacts[tableIndex];
          dependency.neededIn.push(artifact);
          artifact.dependsUpon++;
        }
      });
  });

  return dependencies;
}

module.exports = {
  parseDependencies,
};
