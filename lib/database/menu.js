const { DataTypes } = require('sequelize');
const config = require('../../config');

const MenuDB = config.DATABASE.define('menu', {
    value: { type: DataTypes.TEXT }
});

exports.setMenu = async ({ value }) => {
    const menuu = await MenuDB.findAll();
    
    if (!menuu.length) {
        return await MenuDB.create({
            value: value || 'button'          
        });
    }
    
    const updateData = {};
    if (value !== undefined) {
        updateData.value = value;
    }
    
    return await menuu[0].update(updateData);
};

exports.getMenu = async () => {
    const menuu = await MenuDB.findAll();
    if (!menuu.length) {
        return { value : "button" };
    }
    return menuu[0].dataValues;
};
