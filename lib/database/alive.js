const { DataTypes } = require('sequelize');
const config = require('../../config');

const AliveDB = config.DATABASE.define('alive', {
    value: { type: DataTypes.TEXT },
    isEnable: { type: DataTypes.BOOLEAN }
});

exports.setAlive = async ({ value, isEnable }) => {
    const alives = await AliveDB.findAll();
    
    if (!alives.length) {
        return await AliveDB.create({
            value: value || '',
            isEnable: typeof isEnable !== 'undefined' ? isEnable : false
        });
    }
    
    const updateData = {};
    if (value !== undefined) {
        updateData.value = value;
    }
    if (isEnable !== undefined) {
        updateData.isEnable = isEnable;
    }
    
    return await alives[0].update(updateData);
};

exports.getAlive = async () => {
    const alives = await AliveDB.findAll();
    if (!alives.length) {
        return { isEnable: false };
    }
    return alives[0].dataValues;
};
