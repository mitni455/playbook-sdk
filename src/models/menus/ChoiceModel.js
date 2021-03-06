const inquirer = require('inquirer');

/**
 * Choice Model 
 *
 * @class ChoiceModel
 */
class ChoiceModel{
    
    /**
     * Creates an instance of ChoiceModel.
     * @param {boolean} isSeperator
     * @param {string} varName
     * @param {boolean} isDisabled 
     * @memberof ChoiceModel
     */
    constructor(isSeperator, varName, isDisabled){
        if(isSeperator)
            this.choice = new inquirer.Separator()
        else
            this.choice = {
                name: varName,
                isDisabled: isDisabled || false
            }
    }

}
module.exports = ChoiceModel;