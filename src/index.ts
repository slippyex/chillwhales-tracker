import chalk from 'chalk';
import config from './config';

import { Asset, AssetConfig, GatherMode } from './@types';
import { readFileContent } from './utils';
import { initializeUI } from './ui';
import { assetFloorFunctions } from './collection-functions/fetchFloorPrices';
import { assetFetchFunctions } from './collection-functions/fetchAssets';
import { assetDetailsFunctions } from './collection-functions/assetDetails';
import { formatAssetListFunctions } from './collection-functions/formatAssetList';

const args = process.argv.slice(2);

const assetConfig = JSON.parse(
    readFileContent('configs', `${args.length === 0 ? 'chillwhales' : args[0]}.config.json`, true)
) as AssetConfig;
if (!assetConfig.assetContract) {
    throw new Error(`provided config for collection ${args} is incomplete - no contract address found in the config`);
}

const displayedAssets = new Map<string, string>();
const assetDetailsMap = new Map<string, Asset>();

//let scores: StaticStats;
let gatherMode: GatherMode = 'recently-listed';
let focusedLine = 0; // Variable to keep track of the focused line

// Initialize UI components
const { screen, masterView, floorPriceBox, detailsView, modeView } = initializeUI();

async function setAssets() {
    const newAssets = (await assetFetchFunctions[assetConfig.functionsNamespace](
        assetConfig,
        assetDetailsMap,
        gatherMode
    )) as Asset[];
    updateDisplayedAssets(newAssets);
    updateFocus();
    screen.render();
}
async function setFloor() {
    const floorContent = (await assetFloorFunctions[assetConfig.functionsNamespace](assetConfig)) as string;
    floorPriceBox.setContent(floorContent);
    screen.render();
}

(async () => {
    setupKeyBindings();
    screen.render();

    await setAssets();
    await setFloor();
    setInterval(async () => {
        await setAssets();
    }, config.periodToFetchAssets);
    setInterval(async () => {
        await setFloor();
    }, config.periodToFetchFloor);
})();

function setupKeyBindings() {
    masterView.key(['up', 'down'], handleArrowKeys);
    screen.key('t', toggleGatherMode);
    screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
}

function handleArrowKeys(_: never, key: { name: string }) {
    if (key.name === 'up' && focusedLine > 0) focusedLine--;
    else if (key.name === 'down' && focusedLine < displayedAssets.size - 1) focusedLine++;
    updateFocus();
    screen.render();
}

async function toggleGatherMode() {
    gatherMode = gatherMode === 'price-low-high' ? 'recently-listed' : 'price-low-high';
    const modeLabel = gatherMode === 'recently-listed' ? 'recent listings' : 'floor whales';
    modeView.setContent(`[t] mode: ${modeLabel}`);
    masterView.setContent(`fetching ${modeLabel} ...`);
    screen.render();
    displayedAssets.clear();
    await setAssets();
}

function updateFocus() {
    let content = '';
    let line = 0;
    displayedAssets.forEach(value => {
        const tokenId = value.match(/#(\d+)/)[1];
        if (line === focusedLine) {
            content += chalk.inverse(value) + '\n'; // Invert the color of the focused line
            updateDetailsView(tokenId); // Update the details box with the selected asset
        } else {
            content += value + '\n';
        }
        line++;
    });
    masterView.setContent(content);
}

function updateDetailsView(assetId: string) {
    const assetDetails = assetDetailsFunctions[assetConfig.functionsNamespace](assetId, assetDetailsMap);
    detailsView.setContent(`Details for Asset #${assetId}:\n========================\n${assetDetails}`);
}

function updateDisplayedAssets(newAssets: Asset[]) {
    newAssets.forEach(asset => {
        const formattedString = formatAssetListFunctions[assetConfig.functionsNamespace](asset);
        displayedAssets.set(asset.listingId, formattedString);
    });

    masterView.setContent(Array.from(displayedAssets.values()).join('\n'));
    screen.render();
}
