import dayjs from 'dayjs';
import chalk from 'chalk';
import config from './config';

import { Asset, GatherMode } from './@types';
import { readFileContent, writeFileContent, padRight } from './utils';
import { initializeUI } from './ui';
import { fetchAssets, fetchFloorPricePer } from './requests/universalpage';
import { fetchStaticStats } from './requests/chillwhales';
import { getClaimedStatusFor } from './requests/onchain';

const chillClaimedCache = JSON.parse(readFileContent('cache', 'chillClaimed.json')) as Record<string, boolean>;

const seenListingIds = new Set<string>();
const displayedAssets = new Map<string, string>();
const assetDetailsMap = new Map<string, Asset>();

let scores: Record<number, number>;
let gatherMode: GatherMode = 'recently-listed';
let focusedLine = 0; // Variable to keep track of the focused line

// Initialize UI components
const { screen, masterView, floorPriceBox, detailsView, modeView } = initializeUI();

(async () => {
    setupKeyBindings();
    screen.render();
    scores = await fetchStaticStats();
    await fetchChillWhales();
    await fetchFloorPrice();
    setInterval(fetchChillWhales, config.periodToFetchAssets);
    setInterval(fetchFloorPrice, config.periodToFetchFloor);
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
    seenListingIds.clear();
    await fetchChillWhales();
    screen.render();
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
    // Fetch and display details of the selected asset
    const assetDetails = getAssetDetails(assetId); // Implement this function based on your data structure
    detailsView.setContent(`Details for Whale #${assetId}:\n========================\n${assetDetails}`);
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getAssetDetails(assetId: string): string {
    const asset = assetDetailsMap.get(assetId);
    return asset.tokenAttributes.map(attr => `${padRight(attr.key, 12)}: ${padRight(attr.value, 12)}`).join('\n');
}

async function fetchChillWhales() {
    try {
        const assets = await fetchAssets(gatherMode);

        for (const asset of assets) {
            if (chillClaimedCache[asset.tokenId]) {
                asset.chillClaimed = chillClaimedCache[asset.tokenId];
            }
            asset.chillClaimed = await getClaimedStatusFor(asset.tokenId);
            if (asset.chillClaimed) {
                chillClaimedCache[asset.tokenId] = true;
                writeFileContent('cache', 'chillClaimed.json', JSON.stringify(chillClaimedCache, null, 2));
            }
            assetDetailsMap.set(asset.tokenName.split('#')[1], asset);
        }
        const newAssets = assets.filter(asset => !seenListingIds.has(asset.listingId));
        updateDisplayedAssets(newAssets);
        updateFocus();
    } catch (error) {
        console.error(`Error fetching assets: ${error}`);
    }
}

async function fetchFloorPrice() {
    const skins = ['Orca', 'Chrome', 'E.T.', 'Yatted', 'XRay', 'Gold', 'Cypher', 'Pink', 'Zombie', 'Chilly', 'Reptile'];
    const mappedPrice = new Map<string, number>();
    try {
        for (const skin of skins) {
            const price = await fetchFloorPricePer(skin);
            if (price !== -1) {
                mappedPrice.set(skin, price);
            }
        }
        // Convert the map into an array and sort it
        const sortedArray = Array.from(mappedPrice).sort((a, b) => a[1] - b[1]);
        // Format the sorted array into rows with three items each
        const rows: string[] = [];
        for (let i = 0; i < sortedArray.length; i += 4) {
            rows.push(
                sortedArray
                    .slice(i, i + 4)
                    .map(pair => `${padRight(pair[0] + ':', 15)} ${padRight(pair[1] + '', 10)}`)
                    .join('') + '\n'
            );
        }

        floorPriceBox.setContent(
            `Floor Prices (last sync: ${dayjs().format('YYYY-MM-DD HH:mm:ss')})\n${rows.join('')}`
        );
        screen.render();
    } catch (error) {
        floorPriceBox.setContent(`Error fetching floor price: ${error}`);
        screen.render();
    }
}

function getRank(tokenNumber: number) {
    return Object.keys(scores)
        .sort((a, b) => scores[parseInt(b, 10)] - scores[parseInt(a, 10)])
        .map((mapTokenId, index) => (parseInt(mapTokenId, 10) === tokenNumber ? index + 1 : undefined))
        .find(elem => elem);
}

function getColorByRank(rank: number) {
    if (rank <= 500) return chalk.red;
    if (rank <= 1000) return chalk.yellow;
    if (rank <= 3000) return chalk.green;
    if (rank <= 5000) return chalk.blue;
    if (rank <= 7000) return chalk.white;
    return chalk.grey;
}

function formatAssetString(asset: Asset): string {
    const tokenNumber = parseInt(asset.tokenName.split('#')[1], 10);
    const rank = getRank(tokenNumber);
    const timestamp = dayjs(asset.listingStartAt).format('YYYY-MM-DD HH:mm:ss');
    const tokenNamePadded = padRight(asset.tokenName, 20);
    const rankPadded = padRight(` Rank: ${rank}`, 15);
    const price = parseFloat(asset.listingItemPrice) / 1e18;
    const pricePadded = `Price ${price.toFixed(2)} LYX`;

    return `${timestamp}\t${tokenNamePadded} (${asset.chillClaimed ? '+' : '-'} $CHILL)${rankPadded}${pricePadded}`;
}

function updateDisplayedAssets(newAssets: Asset[]) {
    newAssets.forEach(asset => {
        const formattedString = formatAssetString(asset);
        const isNew = !seenListingIds.has(asset.listingId);
        seenListingIds.add(asset.listingId);

        const rank = getRank(parseInt(asset.tokenName.split('#')[1], 10));
        const color = getColorByRank(rank);
        const styledString = isNew ? color.bold(formattedString) : color(formattedString);

        displayedAssets.set(asset.listingId, styledString);
    });

    masterView.setContent(Array.from(displayedAssets.values()).join('\n'));
    screen.render();
}
