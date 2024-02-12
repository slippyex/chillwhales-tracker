import blessed from 'blessed';

export function initializeUI(mode: 'wallet' | 'sync' | 'finder') {
    const screen = blessed.screen({
        smartCSR: true,
        title: `ChillWhales Tracker ${mode === 'wallet' ? 'Wallet' : mode === 'finder' ? 'Finder' : 'Sync'}`
    });

    const masterView = blessed.box({
        parent: screen,
        top: 'top',
        left: 'left',
        width: ['wallet', 'finder'].includes(mode) ? '60%' : '70%',
        height: ['wallet', 'finder'].includes(mode) ? '100%' : '80%',
        scrollable: true,
        alwaysScroll: true,
        content: 'Fetching assets...',
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

    const floorPriceBox = ['wallet', 'finder'].includes(mode)
        ? null
        : blessed.box({
              parent: screen,
              top: '80%',
              left: 'center',
              width: '100%',
              height: '20%',
              content: 'Fetching floor prices...',
              border: 'line',
              style: {
                  fg: 'white',
                  bg: 'black',
                  border: {
                      fg: '#f0f0f0'
                  }
              }
          });

    // Create a details box
    const detailsView = blessed.box({
        parent: screen,
        top: 'top',
        left: ['wallet', 'finder'].includes(mode) ? '60%' : '70%',
        width: ['wallet', 'finder'].includes(mode) ? '40%' : '30%',
        height: ['wallet', 'finder'].includes(mode) ? '100%' : '70%',
        content: 'Select an asset to view details...',
        border: 'line',
        style: {
            fg: 'white',
            bg: 'black',
            border: {
                fg: '#f0f0f0'
            }
        }
    });

    const modeView = ['wallet', 'finder'].includes(mode)
        ? null
        : blessed.box({
              parent: screen,
              top: '70%',
              left: '70%',
              width: '30%',
              height: '10%',
              content: '[t] mode: recent listings',
              border: 'line',
              style: {
                  fg: 'white',
                  bg: 'black',
                  border: {
                      fg: '#f0f0f0'
                  }
              }
          });

    return {
        _screen: screen,
        _masterView: masterView,
        _floorPriceBox: floorPriceBox,
        _detailsView: detailsView,
        _modeView: modeView
    };
}
