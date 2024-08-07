module.exports = {
    $ionicPlatform: {
        ready: () => {},
        registerBackButtonAction: () => {},
        on: () => {}
    },
    $ionicLoading: {
        hide: () => {},
        show: () => {}
    },
    $ionicHistory: {},
    $ionicViewService: {}
};

window.lodash = {
    includes: (a, f) => (a ?? []).includes(f),
    filter: (a, f) => (a ?? []).filter(f),
    map: (a, f) => (a ?? []).map(f),
    find: (a, f) => (a ?? []).find(f),
    forEach: (a, f) => (a ?? []).forEach(f),
};
