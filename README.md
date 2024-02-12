# ChillWhale Tracker - not JUST any more 🐳🆙

Initially started solely for the ChillWhales NFT 2.0 collection on the LUKSO blockchain, the tool evolved over the last couple of days ... 


ChillWhale Tracker is a real-time asset tracking and analytics tool for any LSP8 NFT2.0 collection. 
It provides live updates on asset listings, floor prices, and rarity rankings, enhancing the experience of NFT enthusiasts and traders.

## Features

- Real-time tracking of any LSP8 NFT assets.
- Display of assets based on price (low to high) and recent listings.
- Live updates on floor prices in the ChillWhale collection.
- Asset ranking analytics for better insight into asset value.
- Interactive UI with scrolling and (recent listings, floor) mode toggling capabilities.
- Directly "snipe" an attractive asset by pressing "s" on the focused line.

## Wallet Viewer

Instead of watching Universal Page listings / floors, you can also provide one or a list of Universal Profile Wallet Addresses

```
npm run wallet lyxen 0x43242356xxxx 0xa34244xxxxx 
```
(to see your chillwhale holdings in the provided wallets)

or
```
npm run wallet lyxen 0x43242356xxxx 0xa34244xxxxx 
```
(to see your lyxen holdings in the provided wallets)

and so on ... 

Instead of providing wallet addresses all the time, you can also create a file "profileWallets.json" under the `/cache/` folder with content similar to this

```json
[
  {
    "walletAddress": "0xFb4xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx29B8",
    "walletName": "master wallet"
  },
  {
    "walletAddress": "0x3e9xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx4156",
    "walletName": "secondary"
  },
  {
    "walletAddress": "0x46cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxb8b1",
    "walletName": "side wallet"
  }
]
```

![Wallet Insights](/docs/wallet-insights.png)

## Asset finder

In order to find particular asset rankings, just use

```
npm run find [collection-name] assetNumber assetNumber assetNumber assetNumber...
```

## Demonstration of the tool in action

![ChillWhale Tracker Demo](/docs/chillwhale-tracker.gif)

## Installation

Before you begin, ensure you have Node.js installed on your system. Then, follow these steps:

1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```
2. Navigate to the project directory:
   ```bash
   cd chillwhale-tracker
   ```
3. Install the dependencies:

   ```bash
   npm install (or yarn install)
   ```

## Usage

To start the ChillWhale Tracker, run:
   ```
   npm run sync (or yarn sync)
   ```

## Usage for any other collection

Under the `./configs` directory, you will find a few already added collections. If you want to use one of them, run:

   ```
   npm run sync [name of collection] (or yarn sync)
   ```
For instance, you will find
- /configs/chillWhales.config.json
- /configs/pxyls.config.json
- ...

In order to run the PXYLS collection, your command looks like this `npm run sync pxyls` (or `yarn sync pyxls`)

When you want to add a new collection on your own, create a new file with your desired name under the `./configs` folder
with the following mandatory entries:

```json
{
  "collection": "PXYLS",
  "assetContract": "0xf651b88925c0b6c81ad6f658a2f104226d837f60",
  "functionsNamespace": "generic"
}
```

- _collection_: name of the collection - you can choose on your own
- _assetContract_: needs to be picked from the universal.page (I am sure, you'll spot it in the url when browsing)
- _functionNamespace_: should generally be set to `generic` since it follows the generic approach to list items
- _realtimeRanking_: recalculates the ranking lookups during the start (true/false)
- _nonUniqueRanking_: assigns the same rank to an asset when the score is similar, otherwise it will be unique and assets with the same traits get a sequenced rank (true/false)


However, the `functionNamespace` can be set to something specific, but in that case you need to study the code and follow the rules to implement a tailored display for a collection


## Key Bindings

    UP/DOWN arrows: Scroll through the asset list.
    T: Toggle between 'price-low-high' and 'recently-listed' modes.
    S: "Sniper" mode - opens a web browser with your selected item (focused) so that you can directly buy it from there
    ESC, Q, or Ctrl + C: Exit the application.


## Generic Rarity calculations 

For all collections which don't offer a direct rarity score/ranking, I implemented a generic way to derive the actual ranks based on traits and their rarity.

Given an NFT collection, the rarity score for an individual NFT is calculated using the following steps:

### Trait Frequency: 

For each trait (i) and its value (j), calculate the frequency of that value within the collection.

### Trait Rarity:

The rarity of a trait value is the inverse of its frequency, calculated as 

   ![Rarity Score Calculation - 2](/docs/eq-2.png)

### Inclusion of Trait Count as Artificial Trait: 

The count of traits for each NFT is treated as an artificial trait. 
The frequency of each possible trait count is calculated, and its rarity is determined in the same manner as other traits.

### Rarity Score Calculation: 

The final rarity score for an NFT is the sum of the rarities of all its traits, 
including the artificial trait representing the trait count. 
If (T) is the set of traits for the NFT, and (n) is the number of traits (including the artificial trait count), then the rarity score (S) is given by:

   ![Rarity Score Calculation - 4](/docs/eq-4.png)

### Ranking: 

NFTs are then ranked based on their calculated rarity scores (S), with a higher score indicating a rarer NFT. 
The NFT with the highest rarity score is ranked first, and so on, with each NFT receiving a unique rank.

### Ranking Disclaimer:

As this is a generic approach to calculate rarities, you will use that information at your own risk. I will not be responsibility when you put all your salary into 
an NFT with a (potentially) high rank ... #NFA ... #DYOR

## Configuration

Modify the config.ts file to set parameters like chain endpoint, contract address, and polling intervals.
Dependencies

   * axios: For HTTP requests.
   * blessed: For building the interactive UI.
   * dayjs: For date formatting.
   * chalk: For text styling in the console.
   * web3: For LUKSO blockchain interaction.

## Contributing

Contributions to the ChillWhale Tracker are welcome! Please read our contributing guidelines for details on how to contribute.

## License

This project is licensed under the MIT License.

## Acknowledgements

The ChillWhale community for their continuous support. Contributors who have helped in enhancing this tool.

🚀 Happy Tracking with ChillWhale Tracker! 🆙🐳
