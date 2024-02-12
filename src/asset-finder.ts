import chalk from 'chalk';

import { Asset, AssetConfig, RarityLookup } from './@types';
import { readFileContent } from './utils';
import { initializeUI } from './ui';
import {
    assetDetailsFunctions,
    formatAssetWalletListFunctions,
    initializeScores
} from './collection-functions/repository';
import { Widgets } from 'blessed';

const args = process.argv.slice(2);

const assetConfig = JSON.parse(
    readFileContent(
        'configs',
        `${Number.isInteger(parseInt(args[0])) || args[0].startsWith('#') || args[0].startsWith('0x') ? 'chillwhales' : args[0]}.config.json`,
        true
    )
) as AssetConfig;

if (!assetConfig.assetContract) {
    throw new Error(`provided config for collection ${args} is incomplete - no contract address found in the config`);
}

const displayedAssets = new Map<string, string>();
const assetDetailsMap = new Map<string, Asset>();

let focusedAssetTokenId: string;

// global access to UI components
let screen: Widgets.Screen;
let masterView: Widgets.BoxElement;
let detailsView: Widgets.BoxElement;

async function setAssets(assetsByTokenId: string[], assetsByTokenNumber: string[]) {
    await initializeScores[assetConfig.functionsNamespace](assetConfig);
    const collection = JSON.parse(readFileContent('cache', `${assetConfig.collection}Scores.json`)) as RarityLookup;
    const collectedAssets: Asset[] = [];

    // Helper function to update asset details and push to collectedAssets
    const addAssetDetails = (asset: { score: number; rank: number; assetDetails?: Asset }) => {
        asset.assetDetails.rank = asset.rank;
        asset.assetDetails.score = asset.score;
        asset.assetDetails.profile = `${asset.assetDetails.tokenId.slice(0, 4)}....${asset.assetDetails.tokenId.slice(-4)}`;
        collectedAssets.push(asset.assetDetails);
    };

    // Process assets by tokenId
    assetsByTokenId.forEach(tokenId => {
        const asset = collection.rarity[tokenId];
        if (asset) {
            addAssetDetails(asset);
        }
    });

    // Process assets by tokenNumber
    assetsByTokenNumber.forEach(tokenNumber => {
        Object.values(collection.rarity).forEach(asset => {
            const parsedNumber = asset.assetDetails.tokenName.split('#')[1];
            if (tokenNumber === parsedNumber) {
                addAssetDetails(asset);
            }
        });
    });

    // Sort collected assets by rank
    collectedAssets.sort((a, b) => a.rank - b.rank);
    collectedAssets.forEach(ca => {
        assetDetailsMap.set(ca.tokenId, ca);
    });
    // Prepare new assets object
    const newAssets = {
        assets: collectedAssets,
        assetsTotal: collection.assetsTotal
    };

    // Update UI components
    focusedAssetTokenId = newAssets.assets[0].tokenId;
    updateDisplayedAssets(newAssets);
    updateFocus();
    screen.render();
}

(async () => {
    const assetsByTokenId: string[] = [];
    const assetsByNumber: string[] = [];
    const args = process.argv.slice(2);
    const validatedArgs =
        Number.isInteger(parseInt(args[0])) || args[0].startsWith('#') || args[0].startsWith('0x')
            ? args
            : args.slice(1);
    for (const arg of validatedArgs) {
        if (arg.startsWith('0x')) {
            assetsByTokenId.push(arg);
        } else {
            assetsByNumber.push(arg.startsWith('#') ? arg.substring(1) : arg);
        }
    }
    const { _screen, _masterView, _detailsView } = initializeUI('finder');
    screen = _screen;
    masterView = _masterView;
    detailsView = _detailsView;

    screen.render();
    setupKeyBindings();
    await setAssets(assetsByTokenId, assetsByNumber);
    updateFocus();
    screen.render();
})();

function setupKeyBindings() {
    masterView.key(['up', 'down'], handleArrowKeys);
    screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
}

function handleArrowKeys(_: never, key: { name: string }) {
    const tokenIds = Array.from(displayedAssets.keys());
    const currentIndex = tokenIds.findIndex(ti => ti === focusedAssetTokenId);
    if (key.name === 'up' && currentIndex > 0) {
        focusedAssetTokenId = tokenIds[currentIndex - 1];
    } else if (key.name === 'down' && currentIndex < tokenIds.length - 1) {
        focusedAssetTokenId = tokenIds[currentIndex + 1];
    }
    updateFocus();
    screen.render();
}

function updateFocus() {
    const content: string[] = [];
    displayedAssets.forEach((value, tokenId) => {
        if (tokenId === focusedAssetTokenId) {
            content.push(chalk.inverse(value));
            updateDetailsView(tokenId);
        } else {
            content.push(value);
        }
    });
    masterView.setContent(content.join('\n'));
}

function updateDetailsView(assetId: string) {
    const name = assetDetailsMap.get(assetId)?.tokenName || assetDetailsMap.get(assetId).assetName;
    const assetDetails = assetDetailsFunctions[assetConfig.functionsNamespace](assetId, assetDetailsMap);
    detailsView.setContent(`${name}:\n${'-'.repeat(32)}\n${assetDetails}`);
}

function updateDisplayedAssets(newAssets: { assets: Asset[]; assetsTotal: number }) {
    newAssets.assets.forEach(asset => {
        const formattedString = formatAssetWalletListFunctions[assetConfig.functionsNamespace](
            asset,
            newAssets.assetsTotal
        );
        displayedAssets.set(asset.tokenId, formattedString);
    });

    masterView.setContent(Array.from(displayedAssets.values()).join('\n'));
    screen.render();
}
