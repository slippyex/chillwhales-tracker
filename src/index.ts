import chalk from 'chalk';
import config from './config';

import { Asset, AssetConfig, GatherMode } from './@types';
import { openUrl, readFileContent } from './utils';
import { initializeUI } from './ui';
import {
    assetDetailsFunctions,
    assetFetchFunctions,
    assetFloorFunctions,
    formatAssetListFunctions
} from './collection-functions/repository';
import { Widgets } from 'blessed';

const args = process.argv.slice(2);

const assetConfig = JSON.parse(
    readFileContent('configs', `${args.length === 0 ? 'chillwhales' : args[0]}.config.json`, true)
) as AssetConfig;
if (!assetConfig.assetContract) {
    throw new Error(`provided config for collection ${args} is incomplete - no contract address found in the config`);
}

const displayedAssets = new Map<string, string>();
const assetDetailsMap = new Map<string, Asset>();

let gatherMode: GatherMode = 'recently-listed';
let focusedAssetTokenId: string;

// Initialize UI components
let screen: Widgets.Screen;
let masterView: Widgets.BoxElement;
let detailsView: Widgets.BoxElement;
let floorPriceBox: Widgets.BoxElement;
let modeView: Widgets.BoxElement;

async function setAssets() {
    const newAssets = (await assetFetchFunctions[assetConfig.functionsNamespace](
        assetConfig,
        assetDetailsMap,
        gatherMode
    )) as Asset[];
    focusedAssetTokenId = focusedAssetTokenId || newAssets[0].tokenId;
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
    const { _screen, _masterView, _floorPriceBox, _detailsView, _modeView } = initializeUI('sync');
    screen = _screen;
    masterView = _masterView;
    detailsView = _detailsView;
    floorPriceBox = _floorPriceBox;
    modeView = _modeView;

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
    screen.key('s', () => {
        openUrl(
            `${config.universalPageWebsiteCollectionBase}/${assetConfig.assetContract}/${assetDetailsMap.get(focusedAssetTokenId).tokenId}`,
            config.openUrlIn
        );
    });
    screen.key('t', toggleGatherMode);
    screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
}

function handleArrowKeys(_: never, key: { name: string }) {
    const tokenIds = Array.from(displayedAssets.keys());
    const currentIndex = tokenIds.indexOf(focusedAssetTokenId);
    if (key.name === 'up' && currentIndex > 0) {
        focusedAssetTokenId = tokenIds[currentIndex - 1];
    } else if (key.name === 'down' && currentIndex < tokenIds.length - 1) {
        focusedAssetTokenId = tokenIds[currentIndex + 1];
    }
    updateFocus();
    screen.render();
}

async function toggleGatherMode() {
    gatherMode = gatherMode === 'price-low-high' ? 'recently-listed' : 'price-low-high';
    const modeLabel = gatherMode === 'recently-listed' ? 'recent listings' : 'floor prices';
    modeView.setContent(`[t] mode: ${modeLabel}`);
    masterView.setContent(`fetching ${modeLabel} ...`);
    screen.render();
    displayedAssets.clear();
    await setAssets();
}

function updateFocus() {
    let content = '';
    displayedAssets.forEach((value, tokenId) => {
        if (tokenId === focusedAssetTokenId) {
            content += chalk.inverse(value) + '\n';
            updateDetailsView(tokenId);
        } else {
            content += value + '\n';
        }
    });
    masterView.setContent(content);
}

function updateDetailsView(assetId: string) {
    const name = assetDetailsMap.get(assetId)?.tokenName || assetDetailsMap.get(assetId).assetName;
    const assetDetails = assetDetailsFunctions[assetConfig.functionsNamespace](assetId, assetDetailsMap);
    detailsView.setContent(`${name}:\n${'-'.repeat(32)}\n${assetDetails}`);
}

function updateDisplayedAssets(newAssets: Asset[]) {
    newAssets.forEach(asset => {
        const formattedString = formatAssetListFunctions[assetConfig.functionsNamespace](asset);
        displayedAssets.set(asset.tokenId, formattedString);
    });

    masterView.setContent(Array.from(displayedAssets.values()).join('\n'));
    screen.render();
}
