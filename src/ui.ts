import blessed from 'blessed';

export function initializeUI(mode: 'wallet' | 'sync') {
    const screen = blessed.screen({
        smartCSR: true,
        title: `ChillWhales Tracker ${mode === 'wallet' ? 'Wallet' : 'Sync'}`
    });

    const masterView = blessed.box({
        parent: screen,
        top: 'top',
        left: 'left',
        width: mode === 'wallet' ? '60%' : '70%',
        height: mode === 'wallet' ? '100%' : '80%',
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

    const floorPriceBox =
        mode === 'wallet'
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
        left: mode === 'wallet' ? '60%' : '70%',
        width: mode === 'wallet' ? '40%' : '30%',
        height: mode === 'wallet' ? '100%' : '70%',
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

    const modeView =
        mode === 'wallet'
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
