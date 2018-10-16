import { ipcRenderer } from 'electron';
import store from 'store/index.js';
import saveState from 'utils/saveState.js';
import {
    appQuit,
    openModal,
} from 'actions/index.js';

function quitApplication (event, data) {
    let state = store.getState().present;
    // Check if Define-XML is saved;
    if (state.ui.main.isCurrentDefineSaved === true) {
        saveState('noWrite');
        store.dispatch(appQuit());
        // TODO Rewrite this solution.
        // Without it, a JS error is happening when application is closed. Looks like caused by electron-store writing its state.
        setTimeout( () => {
            ipcRenderer.send('quitConfirmed');
            window.close();
        }, 500);
    } else {
        // Open a modal
        store.dispatch(
            openModal({
                type: 'QUIT',
                props: {
                    defineId: state.odm.defineId,
                    tabs: state.ui.tabs,
                    odm: state.odm,
                }
            })
        );
    }
}

export default quitApplication;
