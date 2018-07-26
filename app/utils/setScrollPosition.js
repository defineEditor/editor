function setScrollPosition (tabs) {
    // Restore previous tab scroll position;
    if (tabs.settings[tabs.currentTab].windowScrollPosition !== undefined) {
        window.scrollTo(0, tabs.settings[tabs.currentTab].windowScrollPosition);
    }
}

export default setScrollPosition;
