export default function persists(store) {
    let state = localStorage.getItem('MINI_VUEX_STATE')
    if (state) {
        store.replaceState(JSON.parse(state))
    }
    store.subscribe(function (mutation, state) {
        localStorage.setItem('MINI_VUEX_STATE', JSON.stringify(state))
    })
}
