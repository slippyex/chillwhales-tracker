import chalk from 'chalk';

import { Asset, AssetConfig, UniversalProfile } from './@types';
import { readFileContent } from './utils';
import { initializeUI } from './ui';
import {
    assetDetailsFunctions,
    formatAssetWalletListFunctions,
    initializeScores
} from './collection-functions/repository';
import { getTokensByContract } from './requests/onchain';
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

let focusedAssetTokenId: string;
let profiles: UniversalProfile[] = [];

// global access to UI components
let screen: Widgets.Screen;
let masterView: Widgets.BoxElement;
let detailsView: Widgets.BoxElement;

async function getAssetsInWallet(
    assetConfig: AssetConfig,
    assetDetailsMap: Map<string, Asset>,
    profileAddresses: UniversalProfile[]
): Promise<{ assets: Asset[]; assetsTotal: number }> {
    const contract = assetConfig.assetContract;
    const assetCollection = JSON.parse(readFileContent('cache', `${assetConfig.collection}Scores.json`)) as {
        rarity: Record<
            string,
            {
                rank: number;
                score: number;
                assetDetails: Asset;
            }
        >;
    };
    const assets: Asset[] = [];
    for (const profileAddress of profileAddresses) {
        try {
            const res = await getTokensByContract(contract, profileAddress.walletAddress);
            for (const entry of res) {
                const picked = assetCollection.rarity[entry];
                picked.assetDetails.rank = picked.rank;
                picked.assetDetails.score = picked.score;
                picked.assetDetails.profile = profileAddress.walletName;
                assets.push(picked.assetDetails);
                assetDetailsMap.set(picked.assetDetails.tokenId, picked.assetDetails);
            }
        } catch (err) {
            return { assets: [], assetsTotal: 0 };
        }
    }
    assets.sort((a, b) => a.rank - b.rank);
    await initializeScores[assetConfig.functionsNamespace](assetConfig);
    return { assets, assetsTotal: Object.keys(assetCollection.rarity).length };
}

async function setAssets() {
    const newAssets = await getAssetsInWallet(assetConfig, assetDetailsMap, profiles);
    focusedAssetTokenId = newAssets.assets[0].tokenId;
    updateDisplayedAssets(newAssets);
    updateFocus();
    screen.render();
}

// async function enterWallets() {
//     let finished = false;
//     profiles.length = 0;
//     while (!finished) {
//         const walletAddress = await input({ message: 'Enter wallet address: ' });
//         const optionalName = await input({
//             message: 'Enter optional name for that wallet: ',q
//             default: `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
//         });
//         const correct = await confirm({ message: `Is your input correct?`, default: true });
//         if (correct) {
//             profiles.push({ walletAddress: walletAddress.trim(), walletName: optionalName.trim() });
//         }
//         const continueEntering = await confirm({ message: `Do you want to enter another wallet?`, default: false });
//         finished = !continueEntering;
//     }
//     writeFileContent('cache', 'profileWallets.json', JSON.stringify(profiles, null, 2));
// }

(async () => {
    const args = process.argv.slice(3);
    if (args.length > 0 && args.every(a => a.startsWith('0x'))) {
        profiles = args.map(a => {
            return {
                walletAddress: a,
                walletName: `${a.slice(0, 4)}...${a.slice(-4)}`
            };
        }) as UniversalProfile[];
    } else {
        const previousProfileWallets = readFileContent('cache', 'profileWallets.json');
        profiles = JSON.parse(previousProfileWallets);
        if (Object.keys(profiles).length === 0) {
            throw new Error('either provide a valid profile address or a file profileWallets.json in /cache');
        }
    }

    // if (Object.keys(profiles).length > 0) {
    //     profiles = JSON.parse(previousProfileWallets);
    //     console.log(profiles);
    //     const answer = await confirm({ message: 'Do you want to use these wallets?', default: true });
    //     if (!answer) {
    //         profiles = [];
    //         await enterWallets();
    //     }
    // } else {
    //     profiles = [];
    //     await enterWallets();
    // }
    //
    // // After inquirer has been used
    // process.stdin.removeAllListeners('keypress');

    const { _screen, _masterView, _detailsView } = initializeUI('wallet');
    screen = _screen;
    masterView = _masterView;
    detailsView = _detailsView;

    screen.render();
    setupKeyBindings();
    await setAssets();
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
