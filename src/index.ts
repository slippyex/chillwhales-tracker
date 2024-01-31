import dayjs from 'dayjs';
import chalk from 'chalk';
import config, { colorMapping, rankColorConfig } from './config';

import { Asset, GatherMode } from './@types';
import { readFileContent, writeFileContent, padRight } from './utils';
import { initializeUI } from './ui';
import { fetchAssets, fetchFloorPricePer } from './requests/universalpage';
import { fetchStaticStats } from './requests/chillwhales';
import { isBurntWhaleClaimed, isChillClaimed } from './requests/onchain';

const chillClaimedCache = JSON.parse(readFileContent('cache', 'chillClaimed.json')) as Record<string, boolean>;
const burntWhalesCache = JSON.parse(readFileContent('cache', 'burntWhaleClaimed.json')) as Record<string, boolean>;

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
    const assetDetails = getAssetDetails(assetId);
    detailsView.setContent(`Details for Whale #${assetId}:\n========================\n${assetDetails}`);
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getAssetDetails(assetId: string): string {
    const asset = assetDetailsMap.get(assetId);
    const chillClaimed = `${padRight('$CHILL', 12)}: ${padRight(asset.chillClaimed ? 'claimed' : 'unclaimed', 12)}\n`;
    const burntWhaleClaimed = `${padRight('BurntWhale', 12)}: ${padRight(asset.burntWhaleClaimed ? 'claimed' : 'unclaimed', 12)}\n`;
    return (
        chillClaimed +
        burntWhaleClaimed +
        '========================\n' +
        asset.tokenAttributes.map(attr => `${padRight(attr.key, 12)}: ${padRight(attr.value, 12)}`).join('\n')
    );
}

async function updateClaimStatus(
    asset: Asset,
    tokenId: string,
    cache: Record<string, boolean>,
    claimType: 'chillClaimed' | 'burntWhaleClaimed',
    checkClaimStatus: (tokenId: string) => Promise<boolean>
) {
    if (cache[tokenId]) {
        asset[claimType] = cache[tokenId];
    } else {
        asset[claimType] = await checkClaimStatus(tokenId);
        if (asset[claimType]) {
            cache[tokenId] = true;
            writeFileContent('cache', `${claimType}.json`, JSON.stringify(cache, null, 2));
        }
    }
}

async function fetchChillWhales() {
    try {
        const assets = await fetchAssets(gatherMode);

        for (const asset of assets) {
            await updateClaimStatus(asset, asset.tokenId, burntWhalesCache, 'burntWhaleClaimed', isBurntWhaleClaimed);
            await updateClaimStatus(asset, asset.tokenId, chillClaimedCache, 'chillClaimed', isChillClaimed);
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

function getColorByRank(rank: number, config = rankColorConfig) {
    const colorConfig = config.find(configItem => rank <= configItem.maxRank);
    const color = colorConfig ? colorConfig.color : 'grey';
    return colorMapping[color] || chalk.grey; // Default to grey if color not found
}

function formatAssetString(asset: Asset, typicalPrices: Map<number, number>): string {
    const tokenNumber = parseInt(asset.tokenName.split('#')[1], 10);
    const rank = getRank(tokenNumber);
    const typicalPrice = typicalPrices.get(rank) || 0;
    const price = parseFloat(asset.listingItemPrice) / 1e18;

    // Mark as cheap if price is less than 25% of the typical price
    const isCheap = price < typicalPrice * 0.25;

    const timestamp = dayjs(asset.listingStartAt).format('YYYY-MM-DD HH:mm:ss');
    const tokenNamePadded = padRight(asset.tokenName, 20);
    const rankPadded = padRight(` Rank: ${rank}`, 13);
    const pricePadded = `Price ${price.toFixed(2)} LYX ${isCheap ? '**' : ''}`;

    return `${timestamp}\t${tokenNamePadded} (${asset.chillClaimed ? '-' : '+'} $CHILL)${rankPadded}${pricePadded}`;
}

function calculateTypicalPricesByRank(assets: Asset[]): Map<number, number> {
    const rankPrices = new Map<number, number[]>();

    // Group prices by rank
    assets.forEach(asset => {
        const rank = getRank(parseInt(asset.tokenName.split('#')[1], 10));
        const price = parseFloat(asset.listingItemPrice) / 1e18;

        if (!rankPrices.has(rank)) {
            rankPrices.set(rank, []);
        }
        rankPrices.get(rank).push(price);
    });

    // Calculate average or median price for each rank
    const typicalPrices = new Map<number, number>();
    rankPrices.forEach((prices, rank) => {
        const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        typicalPrices.set(rank, averagePrice);
    });

    return typicalPrices;
}

function updateDisplayedAssets(newAssets: Asset[]) {
    newAssets.forEach(asset => {
        const typicalPrices = calculateTypicalPricesByRank(newAssets);

        const formattedString = formatAssetString(asset, typicalPrices);
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
