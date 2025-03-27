const { DataTypes } = require('sequelize');
const config = require('../../config');

const BanBotDB = config.DATABASE.define('banbot', {
    jids: { 
        type: DataTypes.TEXT, 
        defaultValue: '[]', 
        get() {
            return JSON.parse(this.getDataValue('jids'));
        },
        set(value) {
            this.setDataValue('jids', JSON.stringify(value));
        }
    }
});

exports.getBan = async () => {
    const banBots = await BanBotDB.findAll();
    if (!banBots.length) {
        return [];
    }
    return banBots[0].dataValues.jids;
};

exports.updateBan = async (jid, action) => {
    const banBots = await BanBotDB.findAll();
    
    if (!banBots.length) {
        if (action === 'add') {
            await BanBotDB.create({
                jids: [jid]
            });
        }
        return;
    }
    
    const banBot = banBots[0];
    let jids = banBot.jids || [];
    
    if (action === 'add' && !jids.includes(jid)) {
        jids.push(jid);
    } else if (action === 'remove') {
        jids = jids.filter(existingJid => existingJid !== jid);
    }
    
    await banBot.update({ jids });
};

exports.getBanStatus = async (groupJid) => {
    const jids = await exports.getBan();
    if (jids.includes(groupJid)) {
        return 'off';
    } else {
        return 'on';
    }
};
