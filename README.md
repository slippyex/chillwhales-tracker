# ChillWhale Tracker 🐳

ChillWhale Tracker is a real-time asset tracking and analytics tool for the ChillWhale NFT collection. 
It provides live updates on asset listings, floor prices, and whale scores, enhancing the experience of NFT enthusiasts and traders.

## Features

- Real-time tracking of ChillWhale NFT assets.
- Display of assets based on price (low to high) and recent listings.
- Live updates on floor prices in the ChillWhale collection.
- Whale score analytics for better insight into asset value.
- Interactive UI with scrolling and mode toggling capabilities.

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

## Key Bindings

    UP/DOWN arrows: Scroll through the asset list.
    T: Toggle between 'price-low-high' and 'recently-listed' modes.
    ESC, Q, or Ctrl + C: Exit the application.

## Configuration

Modify the config.js file to set parameters like chain endpoint, contract address, and polling intervals.
Dependencies

   * axios: For HTTP requests.
   * blessed: For building the interactive UI.
   * dayjs: For date formatting.
   * chalk: For text styling in the console.
   *  web3: For Ethereum blockchain interaction.

## Contributing

Contributions to the ChillWhale Tracker are welcome! Please read our contributing guidelines for details on how to contribute.

## License

This project is licensed under the MIT License.

## Acknowledgements

The ChillWhale community for their continuous support. Contributors who have helped in enhancing this tool.

🚀 Happy Tracking with ChillWhale Tracker! 🐳
