import axios from 'axios';
import blessed from 'blessed';
import dayjs from 'dayjs';
import chalk from 'chalk';
import { Web3 } from 'web3';
import config from './config';

import { Asset, StaticStats } from './@types';
import { readFileContent, writeFileContent, padRight } from './utils';

const contractABI = readFileContent('resources', 'ChillContractABI.json');
const chillClaimedCache = JSON.parse(readFileContent('cache', 'chillClaimed.json')) as Record<string, boolean>;
const web3 = new Web3(config.chainEndpoint);
const contract = new web3.eth.Contract(JSON.parse(contractABI), config.contractAddress);
const seenListingIds = new Set<string>();
const displayedAssets = new Map<string, string>();
let scores: Record<number, number>;
let gatherMode: 'price-low-high' | 'recently-listed' = 'recently-listed';

// Initialize UI components
const { screen, mainBox, floorPriceBox } = initializeUI();

(async () => {
    mainBox.key(['up', 'down'], (ch, key) => {
        if (key.name === 'up') {
            mainBox.scroll(-1);
        } else if (key.name === 'down') {
            mainBox.scroll(1);
        }
        screen.render();
    });

    screen.key('t', async () => {
        gatherMode = gatherMode === 'price-low-high' ? 'recently-listed' : 'price-low-high';
        displayedAssets.clear();
        seenListingIds.clear();
        await fetchAssets();
        screen.render();
    });
    screen.render();
    // Exit on Escape, q, or Control-C.
    screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

    // Render the screen.
    screen.render();
    await fetchStaticStats();
    await fetchAssets();
    setInterval(fetchAssets, config.periodToFetch); // Poll every 30 seconds
    await fetchFloorPrice();
    setInterval(fetchFloorPrice, config.periodToFetch); // Update floor price every 30 seconds
})();

async function fetchStaticStats() {
    const stats = readFileContent('cache', 'whaleScores.json');
    if (stats.indexOf('{}') !== -1) {
        try {
            const response = await axios.get<StaticStats>(config.chillWhalesScoresUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0'
                }
            });
            scores = response.data.whalesScores;
            writeFileContent('cache', 'whaleScores.json', JSON.stringify(scores, null, 2));
        } catch (err) {
            console.log(err);
        }
    } else {
        scores = JSON.parse(stats) as Record<number, number>;
    }
}

async function fetchFloorPrice() {
    try {
        const floorPriceUrl = config.universalPageCollectionBase + '?page=0&perPage=1&sortBy=price-low-high';
        const response = await axios.get(floorPriceUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0'
            }
        });
        const asset: Asset = response.data[0];
        const floorPrice = parseFloat(asset.listingItemPrice) / 1e18;
        floorPriceBox.setContent(
            `Floor Price: ${floorPrice.toFixed(2)} LYX - last sync: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
        );
        screen.render();
    } catch (error) {
        floorPriceBox.setContent(`Error fetching floor price: ${error}`);
        screen.render();
    }
}

function formatAssetString(asset: Asset): string {
    const tokenNumber = parseInt(asset.tokenName.split('#')[1], 10);
    const rank = Object.keys(scores)
        .sort((a, b) => scores[parseInt(b, 10)] - scores[parseInt(a, 10)])
        .map((mapTokenId, index) => (parseInt(mapTokenId, 10) === tokenNumber ? index + 1 : undefined))
        .filter(elem => elem);
    const timestamp = dayjs(asset.listingStartAt).format('YYYY-MM-DD HH:mm:ss');
    const skin = asset.tokenAttributes.find(ta => ta.key === 'Skin')?.value || 'N/A';
    const tokenNamePadded = padRight(asset.tokenName, 20);
    const skinPadded = padRight(`${skin}`, 15);
    const rankPadded = padRight(`Rank: ${rank[0]}`, 15);
    const price = parseFloat(asset.listingItemPrice) / 1e18;
    const pricePadded = `Price: ${price.toFixed(2)} LYX`;

    return `${timestamp}\t${tokenNamePadded} (${
        asset.chillClaimed ? '+' : '-'
    } $CHILL) skin: ${skinPadded}${rankPadded}${pricePadded}`;
}

function updateDisplayedAssets(newAssets: Asset[]) {
    const currentAssets = new Set(newAssets.map(a => a.listingId));

    // Update the displayedAssets map
    newAssets.forEach(asset => {
        const formattedString = formatAssetString(asset);
        const isNew = !seenListingIds.has(asset.listingId);
        seenListingIds.add(asset.listingId);

        // Apply chalk styles
        const styledString = isNew ? chalk.green.bold(formattedString) : chalk.white(formattedString);
        displayedAssets.set(asset.listingId, styledString);
    });

    // Dim assets that are no longer present
    displayedAssets.forEach((value, id) => {
        if (!currentAssets.has(id)) {
            displayedAssets.set(id, chalk.grey.strikethrough.dim(value));
        }
    });

    // Reverse the order of items so newest are at the top
    const reversedContent = Array.from(displayedAssets.values()).join('\n');
    mainBox.setContent(reversedContent);
    screen.render();
}

async function fetchAssets() {
    try {
        const url = config.universalPageCollectionBase + `?page=0&perPage=${config.amountToFetch}&sortBy=${gatherMode}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0'
            }
        });
        const assets: Asset[] = response.data;

        for (const asset of assets) {
            if (chillClaimedCache[asset.tokenId]) {
                asset.chillClaimed = chillClaimedCache[asset.tokenId];
            }
            {
                asset.chillClaimed = await getClaimedStatusFor(asset.tokenId);
                if (asset.chillClaimed) {
                    chillClaimedCache[asset.tokenId] = true;
                    writeFileContent('cache', 'chillClaimed.json', JSON.stringify(chillClaimedCache, null, 2));
                }
            }
        }
        const newAssets = assets.filter(asset => !seenListingIds.has(asset.listingId));
        updateDisplayedAssets(newAssets);
    } catch (error) {
        console.error(`Error fetching assets: ${error}`);
    }
}

async function getClaimedStatusFor(tokenId: string): Promise<boolean> {
    try {
        return (await contract.methods.getClaimedStatusFor(tokenId).call()) as boolean;
    } catch (error) {
        console.error('Error:', error);
    }
}

function initializeUI() {
    const screen = blessed.screen({
        smartCSR: true,
        title: 'ChillWhale Tracker'
    });

    const mainBox = blessed.box({
        parent: screen,
        top: 'top',
        left: 'left',
        width: '100%',
        height: '90%', // Set height to 90% to leave space for the floor price box
        scrollable: true,
        alwaysScroll: true,
        keys: true,
        vi: true,
        mouse: true,
        scrollbar: {
            ch: ' '
        },
        border: 'line',
        style: {
            fg: 'white',
            bg: 'black',
            border: {
                fg: '#f0f0f0'
            },
            scrollbar: {
                bg: 'blue'
            }
        }
    });

    // Position the floor price box at the bottom
    const floorPriceBox = blessed.box({
        parent: screen,
        top: '90%', // Position at 90% from the top
        left: 'center',
        width: '50%',
        height: '10%', // Height is 10% of the screen
        content: 'Fetching floor price...',
        border: 'line',
        style: {
            fg: 'white',
            bg: 'black',
            border: {
                fg: '#f0f0f0'
            }
        }
    });
    return { screen, mainBox, floorPriceBox };
}
