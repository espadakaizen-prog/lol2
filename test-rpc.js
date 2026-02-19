const DiscordRPC = require('discord-rpc');
const clientId = '1473422909610655927';

const rpc = new DiscordRPC.Client({ transport: 'ipc' });

rpc.on('ready', () => {
    console.log('✅ RPC Connected!');
    console.log('Authed for user', rpc.user.username);
    
    rpc.setActivity({
        details: 'Testing RPC',
        state: 'It works!',
        startTimestamp: Date.now(),
        instance: false,
    }).then(() => {
        console.log('✅ Activity Set!');
    }).catch(console.error);
});

rpc.on('disconnected', () => {
    console.log('❌ RPC Disconnected');
});

console.log('Attempting to connect to Discord...');
rpc.login({ clientId }).catch(err => {
    console.error('❌ Login Failed:', err);
});
