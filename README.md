# Artifact dependency chooser

A script that chooses which dependencies will allow implementing the highest number of artifacts.

Each artifact depends on specific dependencies. An artifact is considered **unlocked** when all
dependencies are complete.

## Installation

```sh
npm install
```

## Usage

```sh
node index.js file.csv 5
```

Arguments:

1. `file.csv` is the path to a CSV file that contains dependency status.
2. `5` is a number that should correspond to the required number of artifacts to unblock

## CSV file format

```plain
,Artifact 1,Artifact 2,Artifact 3
dependency 1,n/a,not done,n/a
dependency 2,not done,not done,not done
dependency 3,not done,not done,n/a
```

In this example, there are 3 artifacts and 3 dependencies.

## Example

Each User Story requires various functionalities (dependencies) to be implemented.

Headers in the 1st row would be User Storiese (artifacts), and rows would be functionalities
(dependencies) and their statuses.
