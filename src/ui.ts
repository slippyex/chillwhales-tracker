import blessed from 'blessed';

export function initializeUI() {
    const screen = blessed.screen({
        smartCSR: true,
        title: 'ChillWhales Tracker'
    });

    const masterView = blessed.box({
        parent: screen,
        top: 'top',
        left: 'left',
        width: '75%',
        height: '80%',
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

    const floorPriceBox = blessed.box({
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
        left: '75%',
        width: '25%',
        height: '70%',
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

    const modeView = blessed.box({
        parent: screen,
        top: '70%',
        left: '75%',
        width: '25%',
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

    const modalAssetHistory = blessed.box({
        top: 'center',
        left: 'center',
        width: '50%',
        height: '50%',
        content: 'Fetching asset history ...',
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            bg: 'blue',
            border: {
                fg: '#f0f0f0'
            }
        },
        focusable: true
    });

    return { screen, masterView, floorPriceBox, detailsView, modeView, modalAssetHistory };
}
