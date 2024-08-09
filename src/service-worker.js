self.addEventListener('message', (event) => {
    if(event.data && event.data.type === 'INIT') {
        console.debug("Message form foreground", event.data);
    }
});
