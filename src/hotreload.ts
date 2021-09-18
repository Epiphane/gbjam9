if (window.location.host.indexOf('localhost') >= 0) {
    const socket = new WebSocket('ws://localhost:8081');
    socket.addEventListener('close', () => {
        window.location.reload();
    });
}
else if (fetch) {
    let start: any;
    const test = () =>
        fetch(`./version.js?${Date.now()}`)
            .then(d => d.text())
            .then(s => {
                if (!start) {
                    start = s;
                }
                else if (start !== s) {
                    clearInterval(interval);
                    document.getElementById('update')!.style.display = 'block';
                }
            });

    test();
    const interval = setInterval(test, 5000);
}
//# sourceMappingURL=hotreload.js.map